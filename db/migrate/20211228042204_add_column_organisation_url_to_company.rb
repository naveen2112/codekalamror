class AddColumnOrganisationUrlToCompany < ActiveRecord::Migration[6.1]
  def change
    add_column :companies, :url, :string
  end
end
