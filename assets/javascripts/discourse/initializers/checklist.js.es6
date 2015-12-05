import PostView from "discourse/views/post";
import Post from 'discourse/models/post';

export default {
  name: 'checklist',
  initialize: function(container) {
    const siteSettings = container.lookup('site-settings:main');

    if (siteSettings.checklist_enabled) {
      PostView.reopen({
        createChecklistUI: function($post) {
          if (!this.get('post.can_edit')) { return };

          var boxes = $post.find(".chcklst-box"),
            viewPost = this.get('post');

          boxes.each(function(idx, val) {
            $(val).click(function(ev) {
              var elem = $(ev.currentTarget),
                new_value = elem.hasClass("checked") ? "[ ]": "[*]";

              elem.after('<i class="fa fa-spinner fa-spin"></i>');
              elem.hide();

              var postId = viewPost.get('id');
              Discourse.ajax("/posts/" + postId, { type: 'GET', cache: false }).then(function(result) {
                var nth = -1, // make the first run go to index = 0
                  new_raw = result.raw.replace(/\[([\ \_\-\x\*]?)\]/g, function(match, args, offset) {
                    nth += 1;
                    return nth == idx ? new_value : match;
                  });

                var props = {
                  raw: new_raw,
                  edit_reason: 'checklist change',
                  cooked: Discourse.Markdown.cook(new_raw)
                };
                viewPost.save(props);
              });
            });
          });

          // confirm the feature is enabled by showing the click-ability
          boxes.css({"cursor": "pointer"});
        }.on('postViewInserted', 'postViewUpdated'),

        destroyChecklistUI: function() {
        }.on('willClearRender')
      });
    }
  }
};