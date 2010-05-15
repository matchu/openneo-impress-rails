class ItemsController < ApplicationController
  def index
    if params.has_key?(:q)
      @query = params[:q]
      begin
        @results = Item.search(@query).alphabetize.all
      rescue
        flash[:alert] = $!.message
      end
    end
  end
end
