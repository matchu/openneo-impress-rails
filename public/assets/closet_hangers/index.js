(function(){function t(t){e[e.length]=t}function n(){for(var t=0;t<e.length;t++)e[t]()}function u(e,t){try{var n=$.parseJSON(e.responseText)}catch(r){var n={}}typeof n.errors!="undefined"?$.jGrowl("Error "+t+": "+n.errors.join(", ")):$.jGrowl("We had trouble "+t+" just now. Try again?")}function a(e){e.hide(250,$.proxy(e,"remove"))}function f(e,t){return e.find("span.name").text().localeCompare(t.find("span.name").text())}function l(e,t,n){return t?$("#closet-list-"+t):$("div.closet-hangers-group[data-owned="+e+"] div.closet-list.unlisted")}function c(e){e.attr("data-hangers-count",e.find("div.object").length)}function h(e,t,n){var r=l(t,n,e),i=e.closest("div.closet-list"),s=r.find("div.closet-list-hangers");e.insertIntoSortedList(s,f),c(i),c(r)}function p(e){if(e.data("loading"))return!1;var t=e.children("input[name=closet_hanger[quantity]]"),n=e.children("input[name=closet_hanger[owned]]"),r=e.children("input[name=closet_hanger[list_id]]"),i=n.hasChanged()||r.hasChanged();if(i||t.hasChanged()){var s=e.closest(".object").addClass("loading"),o=t.val(),f=s.find(".quantity span").text(o);s.attr("data-quantity",o);var c=e.serialize();s.disableForms(),e.data("loading",!0),i&&h(s,n.val(),r.val()),$.ajax({url:e.attr("action")+".json",type:"post",data:c,dataType:"json",complete:function(n){t.val()==0?a(s):s.removeClass("loading").enableForms(),e.data("loading",!1)},success:function(){var e=s.attr("data-item-id"),i=l(n.val(),r.val(),s).find("div[data-item-id="+e+"]").not(s);if(i.length){var u=parseInt(i.attr("data-quantity"),10),a=parseInt(o,10),c=u+a;f.text(c),t.val(c),s.attr("data-quantity",c),i.remove()}t.storeValue(),n.storeValue(),r.storeValue()},error:function(e){t.revertValue(),n.revertValue(),r.revertValue(),i&&h(s,n.val(),r.val()),f.text(t.val()),u(e,"updating the quantity")}})}}function d(){return $(i).find("input[name=closet_hanger[quantity]], input[name=closet_hanger[owned]], input[name=closet_hanger[list_id]]")}function T(){y.removeClass("editing")}function N(){var e=$(this).closest(".visibility-form").find("ul.visibility-descriptions");e.children("li.current").removeClass("current"),e.children("li[data-id="+$(this).val()+"]").addClass("current")}function C(){return $("form.visibility-form select")}var e=[],r=[];$("div.closet-hangers-group").each(function(){var e=$(this),t=[];e.find("div.closet-list").each(function(){var e=$(this),n=e.attr("data-id");n&&(t[t.length]={id:parseInt(n,10),label:e.find("h4").text()})}),r[r.length]={label:e.find("h3").text(),lists:t,owned:e.attr("data-owned")=="true"}}),$("div.closet-hangers-group span.toggle").live("click",function(){$(this).closest(".closet-hangers-group").toggleClass("hidden")});var i="#closet-hangers",s=$(i);$("#toggle-compare").click(function(){s.toggleClass("comparing")}),$.fn.liveDraggable=function(e){this.live("mouseover",function(){$(this).data("init")||$(this).data("init",!0).draggable(e)})};var o=$(document.body).addClass("js");if(!o.hasClass("current-user"))return!1;$.fn.disableForms=function(){return this.data("formsDisabled",!0).find("input").attr("disabled","disabled").end()},$.fn.enableForms=function(){return this.data("formsDisabled",!1).find("input").removeAttr("disabled").end()},$.fn.hasChanged=function(){return this.attr("data-previous-value")!=this.val()},$.fn.revertValue=function(){return this.each(function(){var e=$(this);e.val(e.attr("data-previous-value"))})},$.fn.storeValue=function(){return this.each(function(){var e=$(this);e.attr("data-previous-value",e.val())})},$.fn.insertIntoSortedList=function(e,t){var n=this,r=!1;return e.children().each(function(){if(t(n,$(this))<1)return n.insertBefore(this),r=!0,!1}),r||n.appendTo(e),this},$(i+" form.closet-hanger-update").live("submit",function(e){e.preventDefault(),p($(this))}),$(i+"input[name=closet_hanger[quantity]]").live("change",function(){p($(this).parent())}).storeValue(),t(function(){d().storeValue()}),$(i+" div.object").live("mouseleave",function(){p($(this).find("form.closet-hanger-update"))}).liveDraggable({appendTo:"#closet-hangers",distance:20,helper:"clone",revert:"invalid"}),$(i+" form.closet-hanger-destroy").live("submit",function(e){e.preventDefault();var t=$(this),n=t.children("input[type=submit]").val("Removing…"),r=t.closest(".object").addClass("loading"),i=t.serialize();r.addClass("loading").disableForms(),$.ajax({url:t.attr("action")+".json",type:"post",data:i,dataType:"json",complete:function(){n.val("Remove")},success:function(){a(r)},error:function(){r.removeClass("loading").enableForms(),$.jGrowl("Error removing item. Try again?")}})}),$("input, textarea").placeholder();var v=$("#closet-hangers-items-search[data-current-user-id]"),m=v.children("input[name=q]");m.autocomplete({select:function(e,t){if(t.item.is_item)setTimeout(function(){m.autocomplete("search",t.item)},0);else{var r=t.item.item,i=t.item.group;m.addClass("loading");var o={owned:i.owned,list_id:t.item.list?t.item.list.id:""};r.hasHanger||(o.quantity=1),$.ajax({url:"/user/"+v.data("current-user-id")+"/items/"+r.id+"/closet_hangers",type:"post",data:{closet_hanger:o,return_to:window.location.pathname+window.location.search},complete:function(){m.removeClass("loading")},success:function(e){var t=$(e);s.html(t.find("#closet-hangers").html()),n(),t.find(".flash").hide().insertBefore(s).show(500).delay(5e3).hide(250),m.val("")},error:function(e){u(e,"adding the item")}})}},source:function(e,t){if(typeof e.term=="string")$.getJSON("/items.json?q="+e.term,function(e){var n=[],r=e.items;for(var i in r)r[i].label=r[i].name,r[i].is_item=!0,n[n.length]=r[i];t(n)});else{var n=[],i,s=e.term,o,u,a;for(var f in r){i=r[f],o=$("div.closet-hangers-group[data-owned="+i.owned+"] div.object[data-item-id="+s.id+"]"),u=o.closest(".closet-list"),a=u.filter(".unlisted").length>0,n[n.length]={group:i,item:s,label:s.label,hasHanger:a};for(var f=0;f<i.lists.length;f++)a=u.filter("[data-id="+i.lists[f].id+"]").length>0,n[n.length]={group:i,item:s,label:s.label,list:i.lists[f],hasHanger:a}}t(n)}}});var g=m.data("autocomplete");g._renderItem=function(e,t){var n=$("<li></li>").data("item.autocomplete",t);if(t.is_item)$("#autocomplete-item-tmpl").tmpl({item_name:t.label}).appendTo(n);else if(t.list){var r=t.list.label;t.hasHanger?$("#autocomplete-already-in-collection-tmpl").tmpl({collection_name:r}).appendTo(n):$("#autocomplete-add-to-list-tmpl").tmpl({list_name:r}).appendTo(n),n.addClass("closet-list-autocomplete-item")}else{var i=t.group.label;t.hasHanger?$("#autocomplete-already-in-collection-tmpl").tmpl({collection_name:i}).appendTo(n):$("#autocomplete-add-to-group-tmpl").tmpl({group_name:i.replace(/\s+$/,"")}).appendTo(n),n.addClass("closet-hangers-group-autocomplete-item")}return n.appendTo(e)};var y=$("#closet-hangers-contact"),b=$(".edit-contact-link"),w=y.children("form"),E=$("#cancel-contact-link"),S=w.children("input[type=text]"),x=$("#contact-link-has-value span");b.click(function(){y.addClass("editing"),S.focus()}),E.click(T),w.submit(function(e){var t=w.serialize();w.disableForms(),$.ajax({url:w.attr("action")+".json",type:"post",data:t,dataType:"json",complete:function(){w.enableForms()},success:function(){var e=S.val();e.length>0?(b.addClass("has-value"),x.text(e)):b.removeClass("has-value"),T()},error:function(e){u(e,"saving Neopets username")}}),e.preventDefault()}),$("input[type=submit][data-confirm]").live("click",function(e){confirm(this.getAttribute("data-confirm"))||e.preventDefault()}),t(function(){$("div.closet-list").droppable({accept:"div.object",activate:function(){$(this).find(".closet-list-content").animate({opacity:0,height:100},250)},activeClass:"droppable-active",deactivate:function(){$(this).find(".closet-list-content").css("height","auto").animate({opacity:1},250)},drop:function(e,t){var n=t.draggable.find("form.closet-hanger-update");n.find("input[name=closet_hanger[list_id]]").val(this.getAttribute("data-id")),n.find("input[name=closet_hanger[owned]]").val($(this).closest(".closet-hangers-group").attr("data-owned")),p(n)}})}),C().live("change",N),t(function(){C().each(N)}),$("#toggle-help").click(function(){$("#closet-hangers-help").toggleClass("hidden")}),$("#closet-hangers-share-box").mouseover(function(){$(this).focus()}).mouseout(function(){$(this).blur()}),n()})();