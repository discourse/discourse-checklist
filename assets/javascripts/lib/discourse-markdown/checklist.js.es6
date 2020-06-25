const REGEX = /\[(\s?|_|-|x|\*)\]/i;

function getClasses(str) {
  switch (str.toLowerCase()) {
    case "x":
      return "checked fa fa-check-square fa-fw";
    case "*":
      return "checked fa fa-check-square-o fa-fw";
    case "-":
      return "fa fa-minus-square-o fa-fw";
    case "_":
      return "fa fa-square fa-fw";
    default:
      return "fa fa-square-o fa-fw";
  }
}

function addCheckbox(match, state) {
  const classes = getClasses(match[1]);

  const checkOpenToken = state.push("check_open", "span", 1);
  checkOpenToken.attrs = [["class", `chcklst-box ${classes}`]];

  state.push("check_close", "span", -1);
}

function processChecklist(state) {
  const start = state.pos;
  const slice = state.src.slice(start, start + 3);
  const match = REGEX.exec(slice);

  if (match) {
    addCheckbox(match, state);

    state.pos += match[0].length;
    return true;
  }
}

export function setup(helper) {
  helper.registerOptions((opts, siteSettings) => {
    opts.features["checklist"] = !!siteSettings.checklist_enabled;
  });

  helper.whiteList([
    "span.chcklst-stroked",
    "span.chcklst-box fa fa-square-o fa-fw",
    "span.chcklst-box fa fa-square fa-fw",
    "span.chcklst-box fa fa-minus-square-o fa-fw",
    "span.chcklst-box checked fa fa-check-square fa-fw",
    "span.chcklst-box checked fa fa-check-square-o fa-fw"
  ]);

  helper.registerPlugin((md) => {
    md.inline.ruler.before("text", "checklist", processChecklist);
  });
}
