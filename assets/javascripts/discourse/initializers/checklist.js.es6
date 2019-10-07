import { withPluginApi } from "discourse/lib/plugin-api";
import { ajax } from "discourse/lib/ajax";
import { cookAsync } from "discourse/lib/text";
import { iconHTML } from "discourse-common/lib/icon-library";
import { REGEX } from "../../lib/discourse-markdown/checklist";

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

  $boxes.each((_, val) => {
    $(val).click(ev => {
      const box = ev.currentTarget;
      const newValue = box.classList.contains("checked") ? "[ ]" : "[\\*]";
      const index = box.getAttribute('data-text-index');

      $(box).after(iconHTML("spinner", { class: "fa-spin" })).hide();

      ajax(`/posts/${postModel.id}`, { type: "GET", cache: false }).then(({ raw }) => {
        const newRaw =
          raw.substr(0, index) +
          raw.substr(index, 3).replace(REGEX, () => newValue) +
          raw.substr(index + 3);

        cookAsync(newRaw).then(cooked =>
          postModel.save({
            cooked: cooked.string,
            raw: newRaw,
            edit_reason: I18n.t("checklist.edit_reason")
          })
        );
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
