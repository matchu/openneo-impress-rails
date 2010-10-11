class SwfAssetsController < ApplicationController
  caches_page :index
  
  def index
    if params[:item_id]
      @swf_assets = Item.find(params[:item_id]).swf_assets
      if params[:body_id]
        @swf_assets = @swf_assets.fitting_body_id(params[:body_id])
      else
        @swf_assets = @swf_assets.fitting_standard_body_ids
        json = @swf_assets.all.group_by(&:body_id)
      end
    elsif params[:body_id]
      swf_assets = SwfAsset.arel_table
      rels = ParentSwfAssetRelationship.arel_table
      @swf_assets = SwfAsset.select('swf_assets.*, parents_swf_assets.parent_id').
        fitting_body_id(params[:body_id]).
        joins(:object_asset_relationships).
        where(rels[:parent_id].in(params[:item_ids]))
      json = @swf_assets.map { |a| a.as_json(:parent_id => a.parent_id.to_i, :for => 'wardrobe') }
    elsif params[:pet_state_id]
      @swf_assets = PetState.find(params[:pet_state_id]).swf_assets.all
      pet_state_id = params[:pet_state_id].to_i
      json = @swf_assets.map { |a| a.as_json(:parent_id => pet_state_id, :for => 'wardrobe') }
    elsif params[:pet_type_id]
      @swf_assets = PetType.find(params[:pet_type_id]).pet_states.first.swf_assets
    end
    json ||= @swf_assets.all
    render :json => json
  end
end
