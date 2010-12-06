// FIXME: pick a consistent javascript style! underscores for vars or camelCase?

var PREVIEW_SWF_ID = 'item-preview-swf',
  PREVIEW_SWF = document.getElementById(PREVIEW_SWF_ID),
  speciesList = $('#item-preview a'),
  customize_more_el = $('#customize-more'),
  MainWardrobe;

if(typeof console == 'undefined' || typeof console.log == 'undefined') {
  function log() {}
} else {
  log = $.proxy(console, 'log');
}

String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.substr(1);
}

String.prototype.article = function () {
  return 'aeiou'.indexOf(this.charAt(0).toLowerCase()) == -1 ? 'a' : 'an'
}

function LoadError(base_msg) {
  this.render = function (args) {
    var msg = base_msg, token, article_token;
    for(var i in args) {
      token = "$" + i;
      article_token = token + "_article";
      if(msg.indexOf(article_token) != -1) {
        msg = msg.replace(article_token, args[i].article());
      }
      msg = msg.replace(token, args[i]);
    }
    return "Whoops - we've never seen " + msg + " before! If you have, please " +
    "<a href='/'>submit that pet's name</a> as soon as you " +
    "get the chance! Thanks!";
  }
}

function PetType() {
  var pet_type = this, loaded_data = false, loaded_assets = false;
  
  this.activated = true;
  this.assets = [];
  
  this.deactivate = function (error, args) {
    var msg;
    this.activated = false;
    if(typeof args == 'undefined') args = {};
    args.color = this.color_name.capitalize();
    args.species = this.species_name.capitalize();
    this.deactivation_msg = error.render(args);
    if(this == PetType.current) showDeactivationMsg();
    var img = this.link.children('img').get(0);
    this.link.addClass('deactivated');
    img.src = img.src.replace('/1/', '/2/');
  }
  
  this.deactivateWithItem = function (item) {
    pet_type.deactivate(Item.LOAD_ERROR, {
      item: item.name
    });
  }
  
  this.load = function () {
    Item.current.load(this);
    loadAssets();
  }

  this.setAsCurrent = function () {
    PetType.current = this;
    speciesList.filter('.current').removeClass('current');
    this.link.addClass('current');
    customize_more_el.attr('href',
      '/wardrobe#species=' + this.species_id + 
      '&color=' + this.color_id + '&objects[]=' + Item.current.id);
    if(this.activated) {
      Preview.enable();
      this.load();
    } else {
      showDeactivationMsg();
    }
  }
  
  this.onUpdate = function () {
    if(pet_type == PetType.current) Preview.update()
  }
  
  function loadAssets() {
    if(loaded_assets) {
      pet_type.onUpdate();
    } else {
      $.getJSON('/pet_types/' + pet_type.id + '/swf_assets.json', function (assets) {
        pet_type.assets = assets;
        loaded_assets = true;
        pet_type.onUpdate();
      });
    }
  }
  
  function showDeactivationMsg() {
    Preview.disable(pet_type.deactivation_msg);
  }
}

PetType.all = [];

PetType.LOAD_ERROR = new LoadError("$color_article $color $species");
PetType.DASH_REGEX = /-/g;

PetType.createFromLink = function (link) {
  var pet_type = new PetType();
  $.each(link.get(0).attributes, function () {
    if(this.name.substr(0, 5) == 'data-') {
      pet_type[this.name.substr(5).replace(PetType.DASH_REGEX, '_')] = this.value;
    }
  });
  pet_type.link = link;
  PetType.all.push(pet_type);
  return pet_type;
}

function Item(id) {
  this.assets_by_body_id = {};
  this.id = id;
  
  this.load = function (pet_type) {
    var url = '/items/' + id + '/bodies/' + pet_type.body_id + '/swf_assets.json',
      item = this;
    if(this.getAssetsForPetType(pet_type).length) {
      pet_type.onUpdate();
    } else {
      $.getJSON(url, function (data) {
        item.setAssetsForPetType(data, pet_type);
      });
    }
  }
  
  this.loadAllStandard = function () {
    var item = this;
    $.getJSON('/items/' + id + '/swf_assets.json', function (assets_by_body_id) {
      $.each(assets_by_body_id, function (i) {
        item.assets_by_body_id[parseInt(i)] = this;
      });
      $.each(PetType.all, function () {
        if(item.getAssetsForPetType(this).length == 0) {
          this.deactivateWithItem(item);
        }
      });
    });
  }
  
  this.getAssetsForPetType = function (pet_type) {
    return this.assets_by_body_id[pet_type.body_id] || this.assets_by_body_id[0] || [];
  }
  
  this.setAsCurrent = function () {
    Item.current = this;
  }
  
  this.setAssetsForPetType = function (assets, pet_type) {
    if(assets.length) {
      this.assets_by_body_id[pet_type.body_id] = assets;
      pet_type.onUpdate();
    } else {
      pet_type.deactivateWithItem(this);
    }
  }
}

Item.LOAD_ERROR = new LoadError("$species_article $species wear a $item");

Item.createFromLocation = function () {
  var item = new Item(parseInt(document.location.pathname.substr(7), 10)),
    z = CURRENT_ITEM_ZONES_RESTRICT, zl = z.length;
  item.restricted_zones = [];
  for(i = 0; i < zl; i++) {
    if(z.charAt(i) == '1') {
      item.restricted_zones.push(i + 1);
    }
  }
  return item;
}

Preview = new function Preview() {
  var preview = this, swf_id, swf, update_when_swf_ready = false;
  
  window.previewSWFIsReady = function () {
    log('preview SWF is ready');
    swf = document.getElementById(swf_id);
    if(update_when_swf_ready) preview.update();
  }
  
  this.update = function (assets) {
    var assets;
    if(swf) {
      log('now doing update');
      assets = PetType.current.assets.concat(
        Item.current.getAssetsForPetType(PetType.current)
      );
      assets = $.grep(assets, function (asset) {
        var visible = $.inArray(asset.zone_id, Item.current.restricted_zones) == -1;
        if(visible) asset.local_path = asset.local_url;
        return visible;
      });
      swf.setAssets(assets);
    } else {
      log('putting off update');
      update_when_swf_ready = true;
    }
  }
  
  this.embed = function (id) {
    swf_id = id;
    swfobject.embedSWF(
      '/swfs/preview.swf?v=2', // URL
      id, // ID
      '100%', // width
      '100%', // height
      '9', // required version
      null, // express install URL
      {}, // flashvars
      {'wmode': 'transparent', 'allowscriptaccess': 'always'} // params
    );
  }
  
  this.disable = function (msg) {
    $('#' + swf_id).hide();
    $('#item-preview-error').html(msg).show();
  }
  
  this.enable = function () {
    $('#item-preview-error').hide();
    $('#' + swf_id).show();
  }
}

Preview.embed(PREVIEW_SWF_ID);

Item.createFromLocation().setAsCurrent();
Item.current.name = $('#item-name').text();

PetType.createFromLink(speciesList.eq(Math.floor(Math.random()*speciesList.length))).setAsCurrent();

speciesList.each(function () {
  var el = $(this);
  el.data('pet_type', PetType.createFromLink(el));
}).live('click', function (e) {
  e.preventDefault();
  $(this).data('pet_type').setAsCurrent();
});

setTimeout($.proxy(Item.current, 'loadAllStandard'), 5000);

window.MainWardrobe = {View: {Outfit: {setFlashIsReady: previewSWFIsReady}}}

var SWFLog = $.noop;
