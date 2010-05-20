require 'spec_helper'

describe SwfAsset do
  it "belongs to a zone" do
    zone = Factory.create :zone, :label => 'foo'
    asset = Factory.create :swf_asset, :zone_id => 1
    asset.zone_id.should == 1
    asset.zone.id.should == 1
    asset.zone.label.should == 'foo'
  end
  
  it "delegates depth to zone" do
    zone = Factory.create :zone, :depth => 12
    asset = Factory.create :swf_asset, :zone_id => 1
    asset.depth.should == 12
  end
  
  it "converts neopets URL to impress URL" do
    asset = Factory.create :swf_asset, :url => 'http://images.neopets.com/cp/items/swf/000/000/012/12211_9969430b3a.swf'
    asset.local_url.should == 'http://impress.openneo.net/assets/swf/outfit/items/000/000/012/12211_9969430b3a.swf'
  end
  
  it "should contain id, depth, and local_url as JSON" do
    zone = Factory.create :zone, :depth => 12
    asset = Factory.create :swf_asset,
      :id => 123,
      :zone_id => 1,
      :url => 'http://images.neopets.com/cp/items/swf/000/000/012/12211_9969430b3a.swf'
    asset.as_json.should == {
      :id => 123,
      :depth => 12,
      :local_url => 'http://impress.openneo.net/assets/swf/outfit/items/000/000/012/12211_9969430b3a.swf'
    }
  end
end
