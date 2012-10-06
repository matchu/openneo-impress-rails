class AddExplicitlyBodySpecificToObjects < ActiveRecord::Migration
  def self.up
    add_column :objects, :explicitly_body_specific, :boolean, :null => false, :default => false
  end

  def self.down
    remove_column :objects, :explicitly_body_specific
  end
end
