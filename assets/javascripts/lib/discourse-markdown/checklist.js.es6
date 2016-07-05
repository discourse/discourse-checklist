import { registerOption } from 'pretty-text/pretty-text';

registerOption((siteSettings, opts) => {
  opts.features['checklist'] = !!siteSettings.checklist_enabled;
});

function replaceChecklist(text) {
  text = text || "";
  text = text.replace(/\[\s?\]/ig, '<span class="chcklst-box fa fa-square-o"></span>');
  text = text.replace(/\[_\]/ig, '<span class="chcklst-box fa fa-square"></span>');
  text = text.replace(/\[-\]/ig, '<span class="chcklst-box fa fa-minus-square-o"></span>');
  text = text.replace(/\[x\]/ig, '<span class="chcklst-box checked fa fa-check-square"></span>');
  text = text.replace(/\[\*\]/ig, '<span class="chcklst-box checked fa fa-check-square-o"></span>');
  text = text.replace(/!<span class="chcklst-box (checked )?(fa fa-(square-o|square|minus-square-o|check-square|check-square-o))"><\/span>\(/ig, "![](");
  return text;
}

export function setup(helper) {
  helper.inlineBetween({
    between: "--",
    emitter: function(contents) {
      return ["span", {"class": "chcklst-stroked"}].concat(contents);
    }
  });
  helper.whiteList([ 'span.chcklst-stroked',
                     'span.chcklst-box fa fa-square-o',
                     'span.chcklst-box fa fa-square',
                     'span.chcklst-box fa fa-minus-square-o',
                     'span.chcklst-box fa fa-check-square',
                     'span.chcklst-box fa fa-check-square-o' ]);
  helper.addPreProcessor(replaceChecklist);
}