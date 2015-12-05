import PostView from "discourse/views/post";
import Post from 'discourse/models/post';

export default {
  name: 'checklist',
  initialize: function() {
    PostView.reopen({
      createChecklistUI: function($post) {
        if (!this.post.can_edit) { return };

        var boxes = $post.find(".chcklst-box"),
                    view = this;

        boxes.each(function(idx, val) {
          $(val).click(function(ev) {
            var elem = $(ev.currentTarget),
                       new_value = elem.hasClass("checked") ? "[ ]": "[*]",
                       poller = Post.load(view.post.get("id"));

            elem.after('<i class="fa fa-spinner fa-spin"></i>');
            elem.hide();

            poller.then(function(result) {
              var nth = -1, // make the first run go to index = 0
                  new_raw = result.raw.replace(/\[([\ \_\-\x\*]?)\]/g, function(match, args, offset) {
                              nth += 1;
                              return nth == idx ? new_value : match;
                            });
              view.post.setProperties({
                raw: new_raw,
                editReason: "change checkmark"
              });
              view.post.save(function(result) {
                view.post.updateFromPost(result);
              });
            });
          });
        });

        // confirm the feature is enabled by showing the click-ability
        boxes.css({"cursor": "pointer"});
      }.on('postViewInserted'),

      destroyChecklistUI: function() {
      }.on('willClearRender')
    });
  }
};