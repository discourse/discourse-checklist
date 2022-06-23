import { withPluginApi } from "discourse/lib/plugin-api";
import { ajax } from "discourse/lib/ajax";
import { iconHTML } from "discourse-common/lib/icon-library";
import I18n from "I18n";

function initializePlugin(api) {
  const siteSettings = api.container.lookup("site-settings:main");

  if (siteSettings.checklist_enabled) {
    api.decorateCookedElement(checklistSyntax, { id: "checklist" });
  }
}

function removeReadonlyClass(boxes) {
  boxes.forEach((e) => e.classList.remove("readonly"));
}

export function checklistSyntax(elem, postDecorator) {
  if (!postDecorator) {
    return;
  }

  const boxes = [...elem.getElementsByClassName("chcklst-box")];
  const postWidget = postDecorator.widget;
  const postModel = postDecorator.getModel();

  if (!postModel.can_edit) {
    return;
  }

  boxes.forEach((val, idx) => {
    val.onclick = function (ev) {
      const box = ev.currentTarget;
      const classList = box.classList;

      if (classList.contains("permanent") || classList.contains("readonly")) {
        return;
      }

      const newValue = classList.contains("checked") ? "[ ]" : "[x]";
      const template = document.createElement('template');

      template.innerHTML = iconHTML("spinner", { class: "fa-spin" });
      box.insertAdjacentElement('afterend', template.content.firstChild);
      box.classList.add("hidden");
      boxes.forEach((e) => e.classList.add("readonly"));

      ajax(`/posts/${postModel.id}`, { type: "GET", cache: false })
        .then((result) => {
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
            save
              .then(() => {
                postWidget.attrs.isSaving = false;
                postWidget.scheduleRerender();
              })
              .finally(() => removeReadonlyClass(boxes));
          } else {
            removeReadonlyClass(boxes);
          }
        })
        .catch(() => removeReadonlyClass(boxes));
    };
  });
}

export default {
  name: "checklist",
  initialize: function () {
    withPluginApi("0.1", (api) => initializePlugin(api));
  },
};
