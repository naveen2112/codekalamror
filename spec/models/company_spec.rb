require 'rails_helper'

RSpec.describe Company, type: :model do

  it { should validate_presence_of(:name) }
  it { should validate_uniqueness_of(:name).ignoring_case_sensitivity }
  it { should have_many(:users).dependent(:destroy) }
end