import { withPluginApi } from "discourse/lib/plugin-api";
import { ajax } from "discourse/lib/ajax";
import { iconHTML } from "discourse-common/lib/icon-library";
import I18n from "I18n";

function initializePlugin(api) {
  const siteSettings = api.container.lookup("site-settings:main");

  if (siteSettings.checklist_enabled) {
    api.decorateCooked(checklistSyntax, { id: "checklist" });
  }
}

export function checklistSyntax($elem, postDecorator) {
  if (!postDecorator) {
    return;
  }

  const $boxes = $elem.find(".chcklst-box");
  const postWidget = postDecorator.widget;
  const postModel = postDecorator.getModel();

  if (!postModel.can_edit) {
    return;
  }

  $boxes.each((idx, val) => {
    $(val).click((ev) => {
      const $box = $(ev.currentTarget);

      if ($box.hasClass("permanent")) return;

      const newValue = $box.hasClass("checked") ? "[ ]" : "[x]";

      $box.after(iconHTML("spinner", { class: "fa-spin" })).hide();

      ajax(`/posts/${postModel.id}`, { type: "GET", cache: false }).then(
        (result) => {
          const blocks = [];

          // Computing offsets where checkbox are not evaluated (i.e. inside
          // code blocks).
          [
            // inline code
            /`[^`\n]*\n?[^`\n]*`/gm,
            // multi-line code
            /^```[^]*?^```/gm,
            // bbcode
            /\[code\][^]*?\[\/code\]/gm,
            // italic/bold
            /_(?=\S).*?\S_/gm,
            // strikethrough
            /~~(?=\S).*?\S~~/gm,
          ].forEach((regex) => {
            let match;
            while ((match = regex.exec(result.raw)) != null) {
              blocks.push([match.index, match.index + match[0].length]);
            }
          });

          [
            // italic/bold
            /([^\[\n]|^)\*\S.+?\S\*(?=[^\]\n]|$)/gm,
          ].forEach((regex) => {
            let match;
            while ((match = regex.exec(result.raw)) != null) {
              // Simulate lookbehind - skip the first character
              blocks.push([match.index + 1, match.index + match[0].length]);
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

              nth += blocks.every(
                (b) => b[0] >= off + match.length || off > b[1]
              );

              if (nth === idx) {
                found = true; // Do not replace any further matches
                return newValue;
              }

              return match;
            }
          );

          const save = postModel.save({
            raw: newRaw,
            edit_reason: I18n.t("checklist.edit_reason"),
          });

          if (save && save.then) {
            save.then(() => {
              postWidget.attrs.isSaving = false;
              postWidget.scheduleRerender();
            });
          }
        }
      );
    });
  });

  // confirm the feature is enabled by showing the click-ability
  $boxes.css({ cursor: "pointer" });
}

export default {
  name: "checklist",
  initialize: function () {
    withPluginApi("0.1", (api) => initializePlugin(api));
  },
};
