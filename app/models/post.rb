class Post < ApplicationRecord

  #================================= Relationships ===============================================================

  belongs_to :company
  belongs_to :created_by, class_name: "User", foreign_key: :created_by
  has_many :commentries, dependent: :destroy
  has_and_belongs_to_many :tags, join_table: :posts_tags
  has_one_attached :image

  #================================ Validations ==================================================================

  validates :title, presence: true
  validates_uniqueness_of :title, scope: :company_id

  #=============================== Nested Attributes =============================================================

  accepts_nested_attributes_for :commentries, reject_if: :all_blank
  accepts_nested_attributes_for :tags

  #============================== Enum ==========================================================================

  enum status: [:posted, :draft]

  #============================== Callbacks ======================================================================

  after_create_commit :send_email, if: -> { notification && status == "posted" }

  #============================== Methods ========================================================================

  def send_email
    PostsNotificationJob.set(wait: 5.seconds).perform_later(id)
  end
end
