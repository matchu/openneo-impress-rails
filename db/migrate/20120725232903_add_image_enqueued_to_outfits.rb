class AddImageEnqueuedToOutfits < ActiveRecord::Migration[3.2]
  def self.up
    add_column :outfits, :image_enqueued, :boolean, :null => false, :default => false
  end

  def self.down
    remove_column :outfits, :image_enqueued
  end
end
