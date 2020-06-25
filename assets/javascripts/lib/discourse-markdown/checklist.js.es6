export const REGEX = /\[\\?(\s?|_|-|x|\*)\]/i;

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

function rangesToReject(delimiters) {
  return delimiters
    .filter((delimiter) => delimiter.end !== -1) // Ignore endless ranges
    .filter(
      (delimiter) =>
        delimiter.marker === 0x5f /* _ */ ||
        delimiter.marker === 0x2a /* * */ ||
        delimiter.marker === 0x7e /* ~ */
    )
    .map((delimiter) => [
      delimiter.token, // Start of the range
      delimiters[delimiter.end].token, // End of the range
    ]);
}

function inAnyRange(i, ranges) {
  for (const [start, end] of ranges) {
    if (i > start && i < end) {
      return true;
    }
  }

  return false;
}

function postProcessChecklist(state) {
  let ranges = rangesToReject(state.delimiters);

  for (const meta of state.tokens_meta) {
    if (!meta || !meta.delimiters) {
      continue;
    }

    ranges = ranges.concat(rangesToReject(meta.delimiters));
  }

  let processedTokens = [];

  state.tokens.forEach((token, i) => {
    if (token.type !== "check_placeholder") {
      processedTokens.push(token);
      return;
    }

    if (inAnyRange(i, ranges)) {
      const textToken = new state.Token("text", "", 0);
      textToken.content = token.content;
      textToken.level = token.level;

      processedTokens.push(textToken);
    } else {
      const classes = getClasses(token.meta.character);
      const checkOpenToken = new state.Token("check_open", "span", 1);
      checkOpenToken.attrs = [["class", `chcklst-box ${classes}`]];
      checkOpenToken.level = token.level;

      const checkCloseToken = new state.Token("check_close", "span", -1);
      checkCloseToken.level = token.level;

      processedTokens.push(checkOpenToken, checkCloseToken);
    }
  });

  state.tokens.splice(0, state.tokens.length, ...processedTokens); // Replace all tokens
}

function processChecklist(state, silent) {
  const slice = state.src.slice(state.pos, state.pos + 4);
  const match = REGEX.exec(slice);

  if (match && match.index === 0) {
    if (!silent) {
      const token = state.push("check_placeholder", "", 0);
      token.content = match[0];
      token.meta = { character: match[1] };
    }

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
    md.inline.ruler2.before("text_collapse", "checklist", postProcessChecklist);
  });
}
