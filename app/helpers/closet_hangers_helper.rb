require 'cgi'

module ClosetHangersHelper
  def closet_hanger_verb(owned, positive=true)
    ClosetHanger.verb(closet_hanger_subject, owned, positive)
  end

  def send_neomail_url(user)
    "http://www.neopets.com/neomessages.phtml?type=send&recipient=#{CGI.escape @user.neopets_username}"
  end

  def closet_hanger_subject
    public_perspective? ? @user.name : :you
  end

  # Do we have either unlisted hangers that are owned/wanted, or non-empty
  # owned/wanted lists?
  def has_hangers?(owned)
    # If we have unlisted hangers of this type, pass.
    return true if @unlisted_closet_hangers_by_owned.has_key?(owned)

    # Additionally, if we have no lists of this type, fail.
    lists = @closet_lists_by_owned[owned]
    return false unless lists

    # If any of those lists are non-empty, pass.
    lists.each do |list|
      return true unless list.hangers.empty?
    end

    # Otherwise, all of the lists are empty. Fail.
    return false
  end

  def has_lists?(owned)
    @closet_lists_by_owned.has_key?(owned)
  end

  def link_to_add_closet_list(content, options)
    owned = options.delete(:owned)
    path = new_user_closet_list_path current_user,
      :closet_list => {:hangers_owned => owned}
    link_to(content, path, options)
  end

  def public_perspective?
    @public_perspective
  end

  def render_closet_lists(lists)
    if lists
      render :partial => 'closet_lists/closet_list', :collection => lists,
        :locals => {:show_controls => !public_perspective?}
    end
  end

  def render_unlisted_closet_hangers(owned)
    if @unlisted_closet_hangers_by_owned[owned]
      content = render :partial => 'closet_hanger',
        :collection => @unlisted_closet_hangers_by_owned[owned],
        :locals => {:show_controls => !public_perspective?}
      if has_lists?(owned)
        content = content_tag(:header, content_tag(:h4, '(Not in a list)')) + content
      end
      content_tag(:div, content, :class => 'closet-list unlisted')
    end
  end
end

