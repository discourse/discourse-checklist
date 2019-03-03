import { withPluginApi } from "discourse/lib/plugin-api";
import AjaxLib from "discourse/lib/ajax";
import TextLib from "discourse/lib/text";
import { iconHTML } from "discourse-common/lib/icon-library";

function initializePlugin(api) {
  const siteSettings = api.container.lookup("site-settings:main");

  if (siteSettings.checklist_enabled) {
    api.decorateCooked(checklistSyntax);
  }
}

export function checklistSyntax($elem, post) {
  if (!post) {
    return;
  }

  const $boxes = $elem.find(".chcklst-box");
  const postModel = post.getModel();

  if (!postModel.can_edit) {
    return;
  }

  $boxes.each((idx, val) => {
    $(val).click(ev => {
      const $box = $(ev.currentTarget);
      const newValue = $box.hasClass("checked") ? "[ ]" : "[\\*]";

      $box.after(iconHTML("spinner", { class: "fa-spin" })).hide();

      const endpoint = Discourse.getURL(`/posts/${postModel.id}`);
      AjaxLib.ajax(endpoint, { type: "GET", cache: false }).then(result => {
        // make the first run go to index = 0
        let nth = -1;
        const newRaw = result.raw.replace(
          /\[(\s|\_|\-|\x|\\?\*)?\]/gi,
          match => {
            nth += 1;
            return nth === idx ? newValue : match;
          }
        );

        const props = {
          raw: newRaw,
          edit_reason: I18n.t("checklist.edit_reason")
        };

        if (TextLib.cookAsync) {
          TextLib.cookAsync(newRaw).then(cooked => {
            props.cooked = cooked.string;
            postModel.save(props);
          });
        } else {
          props.cooked = TextLib.cook(newRaw).string;
          postModel.save(props);
        }
      });
    });
  });

  // confirm the feature is enabled by showing the click-ability
  $boxes.css({ cursor: "pointer" });
}

export default {
  name: "checklist",
  initialize: function() {
    withPluginApi("0.1", api => initializePlugin(api));
  }
};
