(function() {
  Discourse.Dialect.inlineBetween({
    between: "--",
    emitter: function(contents) {
      return ["span", {"class": "chcklst-stroked"}].concat(contents);
    }
  });

  function replaceChecklist(text) {
    text = text || "";
    text = text.replace(/\[\s?\]/ig, '<span class="chcklst-box fa fa-square-o"></span>');
    text = text.replace(/\[_\]/ig, '<span class="chcklst-box fa fa-square"></span>');
    text = text.replace(/\[-\]/ig, '<span class="chcklst-box fa fa-minus-square-o"></span>');
    text = text.replace(/\[x\]/ig, '<span class="chcklst-box fa fa-check-square"></span>');
    text = text.replace(/\[\*\]/ig, '<span class="chcklst-box fa fa-check-square-o"></span>');
    return text;
  }

  Discourse.Dialect.addPreProcessor(function(text) {
    if (Discourse.SiteSettings.checklist_enabled) {
      text = replaceChecklist(text);
    }
    return text;
  });

  Discourse.Markdown.whiteListTag('span', 'class', 'chcklst-stroked' );
  Discourse.Markdown.whiteListTag('span', 'class', /^chcklst-.*$/ );
})();
