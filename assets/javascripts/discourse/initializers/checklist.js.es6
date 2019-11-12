import { withPluginApi } from "discourse/lib/plugin-api";
import { ajax } from "discourse/lib/ajax";
import { cookAsync } from "discourse/lib/text";
import { iconHTML } from "discourse-common/lib/icon-library";

function initializePlugin(api) {
  const siteSettings = api.container.lookup("site-settings:main");

  if (siteSettings.checklist_enabled) {
    api.decorateCooked(checklistSyntax, { id: "checklist" });
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

      ajax(`/posts/${postModel.id}`, { type: "GET", cache: false }).then(
        result => {
          const blocks = [];

          // Computing offsets where checkbox are not evaluated (i.e. inside
          // code blocks).
          [
            /`[^`\n]*\n?[^`\n]*`/gm,
            /^```[^]*?^```/gm,
            /\[code\][^]*?\[\/code\]/gm,
            /_(?=[^\s]).*?[^\s]_/gm,
            /\*(?=[^\]\s\[]).*?[^\[\s\\]\*/gm,
            /~~(?=[^\s]).*?[^\s]~~/gm
          ].forEach(regex => {
            let match;
            while ((match = regex.exec(result.raw)) != null) {
              blocks.push([match.index, match.index + match[0].length]);
            }
          });

          // make the first run go to index = 0
          let nth = -1;
          let found = false;
          const newRaw = result.raw.replace(
            /\[(\s|\_|\-|\x|\\?\*)?\]/gi,
            (match, ignored, off) => {
              if (found) {
                return match;
              }

              nth += blocks.every(b => b[0] > off + match.length || off > b[1]);

              if (nth === idx) {
                found = true; // Do not replace any further matches
                return newValue;
              }

              return match;
            }
          );

          cookAsync(newRaw).then(cooked =>
            postModel.save({
              cooked: cooked.string,
              raw: newRaw,
              edit_reason: I18n.t("checklist.edit_reason")
            })
          );
        }
      );
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
