include LinkedinAuthentication

class PostsController < ApplicationController
  load_and_authorize_resource param_method: :posts_params, except: [:share, :track_link_click]
  skip_before_action :authenticate_user!, only: :track_link_click
  before_action :set_post, only: [:edit, :update, :destroy, :send_email_notification, :show, :share, :validate_tag,
                                  :destroy_image]
  before_action :set_tags, only: [:new, :create, :edit, :update]

  def index
    @posts = if current_user.admin? || current_user.editor?
               current_company.posts
             else
               current_company.posts.where.not(status: "draft")
             end
    @posts = @posts.order("posts.updated_at DESC").with_includes

    if params[:search].present? || params[:tag_ids].present?
      @posts = @posts.joins(:tags).where(tags: { id: params[:tag_ids] }).distinct unless params[:tag_ids].reject(&:blank?).empty? if params[:tag_ids].present?

      if params[:search].present?
        @posts = @posts.joins(:commentries).where("title ILIKE :search OR main_url ILIKE :search OR
                                                     commentries.description ILIKE :search", { search: "%#{params[:search]}%" }).distinct
      end
    else
      @posts = @posts.all
    end
    @posts = @posts.page(params[:page]).per_page(8)
  end

  def share
    response = share_post(@post.id, current_user.id, params[:commentry].strip)
    response = JSON.parse(response)
    if response["id"].present?
      @post.increment!(:shared_count)
      @post.post_user_shares.create(share_id: response["id"], user_id: current_user.id, company_id: @current_company.id)
      redirect_to posts_path, notice: "Your Post Was Shared Successfully."
    else
      redirect_to posts_path, alert: "Something went wrong."
    end
  end

  def company_tag_list
    @post = current_company.posts.find_by(id: params[:post_id]) if params[:post_id].present?
    respond_to do |format|
      format.js
    end
  end

  def new
    @post = current_company.posts.new
  end

  def show
    session["post_id"] = @post.id
  end

  def create
    @post = current_company.posts.new(posts_params)
    @post.user = current_user
    @post.status = "draft" if params[:commit] == "Save As Draft"

    if @post.save
      redirect_to posts_path
    else
      render :new
    end
  end

  def validate_tag
    return render plain: false unless params[:tag_ids].present?

    @tags = @post.tags.where(id: params[:tag_ids].split(","))
    render json: @tags
  end

  def edit; end

  def update
    if @post.update(posts_params)
      redirect_to posts_path, notice: "Post updated Successfully."
    else
      render :edit
    end
  end

  def destroy
    if @post.destroy
      respond_to do |format|
        format.js
      end
    else
      redirect_to posts_path, alert: "Something went wrong, please try later."
    end
  end

  def validate_title
    return render plain: false unless params[:post][:title].present?

    post = current_company.posts.where("LOWER(title) = ?", params[:post][:title].downcase)
    render plain: post.empty? ? 'true' : 'false'
  end

  def validate_title_except_current
    return render plain: false unless params[:post][:title].present?

    post = current_company.posts.where("LOWER(title) = ? AND id != ?", params[:post][:title].downcase, params[:id])
    render plain: post.empty? ? 'true' : 'false'
  end

  def send_email_notification
    @post.send_email
    flash[:notice] = "Email notification for the post sent successfully"
  end

  def destroy_image
    @post.image.destroy
    head :ok
  end

  def track_link_click
    @post = Post.find_by(id: decode_id(params[:secret]))
    @post.linkedin_social_actions.create(company_id: @post.company.id, action_type: 'link_click', platform: params[:source])
    redirect_to @post.main_url
  end

  # Pulling image and title from given main URL using MetaInspector
  def parse_main_url
    begin
      page = MetaInspector.new(posts_params[:main_url], faraday_options: { ssl: { verify: false } },
                               :connection_timeout => 5, :read_timeout => 5)

      page_title = page.title
      if page.meta_tags['property']['og:image'].present?
        preview_image_url = page.meta_tags['property']['og:image'].first if page.meta_tags['property']['og:image'].first != 'http:/'
      end
    rescue MetaInspector::TimeoutError, MetaInspector::RequestError, MetaInspector::ParserError, MetaInspector::NonHtmlError => e
      preview_image_url, page_title = nil
    end
    render plain: "#{preview_image_url || 'false'},#{page_title || 'false' }"
  end

  def create_tag
    return false if params[:tag_name].blank?

    tags = current_company&.tags.where('lower(name) = ?', params[:tag_name].downcase)
    result = tags.present? ? 'false' : 'true'
    current_company.tags.create(name: params[:tag_name]) if result == 'true'
    render plain: result
  end

  def delete_tag
    return false if params[:tag_name].blank?

    tag = current_company&.tags.find_by(name: params[:tag_name])
    tag.destroy if tag.present?
  end

  private

  def set_post
    @post = current_company.posts.find_by(id: params[:id])
  end

  def decode_id(encoded_id)
    Hashids.new('E/D object id', 8).decode(encoded_id).first
  end

  def set_tags
    @tags = current_company.tags.all
  end

  def posts_params
    param_object = params.require(:post).permit(:title, :main_url, :notification, :image, platform_name: [], commentries_attributes:
      [:id, :description], tag_ids: [], tags_attributes: [:name, :company_id])

    param = if params["commit"] == "Update Post" || params[:commit] == "Create Post"
              param_object.merge(status: "live")
            else
              param_object.merge(status: "draft")
            end
    param
  end
end
