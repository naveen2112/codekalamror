require 'rails_helper'

RSpec.describe "PostUserShares", type: :request do
  describe "GET /show" do
    it "returns http success" do
      get "/post_user_shares/show"
      expect(response).to have_http_status(:success)
    end
  end

end
