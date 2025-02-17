class ParentSwfAssetRelationship < ApplicationRecord
  self.table_name = 'parents_swf_assets'
  
  belongs_to :parent, :polymorphic => true
  
  belongs_to :swf_asset
  
  def item=(replacement)
    self.parent = replacement
  end
  
  def pet_state
    PetState.find(parent_id)
  end
  
  def pet_state=(replacement)
    self.parent = replacement
  end
end
