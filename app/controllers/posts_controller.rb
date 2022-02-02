include LinkedinAuthentication
class PostsController < ApplicationController
  load_and_authorize_resource
  before_action :set_post, only: [:edit, :update, :destroy, :send_email_notification, :show, :share, :validate_tag]
  before_action :set_tags, only: [:new, :create, :edit, :update]

  def index
    @posts = current_company.posts.order("posts.updated_at DESC").with_includes

    if params[:search].present? || params[:tag_ids].present?
      @posts = @posts.joins(:tags).where(tags: { id: params[:tag_ids] }).distinct unless params[:tag_ids].reject(&:blank?).empty? if params[:tag_ids].present?

      if params[:search].present?
        @posts = @posts.joins(:commentries).where("title ILIKE :search OR main_url ILIKE :search OR
                                                     commentries.description ILIKE :search", {search: "%#{params[:search]}%"}).distinct
      end
    else
      @posts = @posts.all
    end
  end

  def share
    response = share_post(@post.id, current_user.id, params[:commentry].strip)
    @post.increment!(:shared_count) if response["id"].present?
    redirect_to posts_path
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
    @post.update(status: "live") if params["commit"]  == "Update Post"

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

  def send_email_notification
    @post.send_email
  end

  private

  def set_post
    @post = current_company.posts.find(params[:id])
  end

  def set_tags
    @tags = current_company.tags.all
  end

  def posts_params
    params.require(:post).permit(:title, :main_url, :notification, :status, :image, platform_name: [], commentries_attributes:
      [:id, :description], tag_ids: [], tags_attributes: [:name, :company_id])
  end
end
