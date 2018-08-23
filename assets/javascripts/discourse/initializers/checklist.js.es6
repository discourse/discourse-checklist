import { withPluginApi } from 'discourse/lib/plugin-api';
import AjaxLib from 'discourse/lib/ajax';
import TextLib from 'discourse/lib/text';

function initializePlugin(api)
{
  const siteSettings = api.container.lookup('site-settings:main');

  if (siteSettings.checklist_enabled)
  {
    api.decorateCooked(checklistSyntax);
  }
}

export function checklistSyntax($elem, post)
{
  if (!post) { return; }

  var boxes = $elem.find(".chcklst-box"),
    viewPost = post.getModel();

  if (!viewPost.can_edit) { return; }

  boxes.each(function(idx, val)
  {
    $(val).click(function(ev)
    {
      var elem = $(ev.currentTarget),
        new_value = elem.hasClass("checked") ? "[ ]": "[\\*]";

      elem.after('<i class="fa fa-spinner fa-spin"></i>');
      elem.hide();

      var postId = viewPost.id;
      AjaxLib.ajax("/posts/" + postId, { type: 'GET', cache: false }).then(function(result)
      {
        var nth = -1, // make the first run go to index = 0
          new_raw = result.raw.replace(/\[(\s|\_|\-|\x|\\?\*)?\]/ig, function(match)
          {
            nth += 1;
            return nth === idx ? new_value : match;
          });

        var props = {
          raw: new_raw,
          edit_reason: I18n.t("checklist.edit_reason"),
        };

        if (TextLib.cookAsync) {
          TextLib.cookAsync(new_raw).then(cooked => {
            props.cooked = cooked.string;
            viewPost.save(props);
          });
        } else {
          props.cooked = TextLib.cook(new_raw).string;
          viewPost.save(props);
        }

      });
    });
  });

  // confirm the feature is enabled by showing the click-ability
  boxes.css({"cursor": "pointer"});
}

export default {
  name: 'checklist',
  initialize: function()
  {
    withPluginApi('0.1', api => initializePlugin(api));
  }
};
