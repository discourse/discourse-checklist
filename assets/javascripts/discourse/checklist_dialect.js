(function() {
  Discourse.Dialect.inlineBetween({
    between: "--",
    emitter: function(contents){
      return ["span", {"class": "chcklst-stroked"}].concat(contents);
    }
  });

  Discourse.Dialect.inlineReplace("[ ]", function(text, match, prev){
    return ["span", {"class": "chcklst-box fa fa-square-o"}];
  });

  Discourse.Dialect.inlineReplace("[]", function(text){
    return ["span", {"class": "chcklst-box fa fa-square-o"}];
  });

  Discourse.Dialect.inlineReplace("[_]", function(text, match, prev){
    return ["span", {"class": "chcklst-box fa fa-square"}];
  });

  Discourse.Dialect.inlineReplace("[-]", function(text){
    return ["span", {"class": "chcklst-box fa fa-minus-square-o"}];
  });

  Discourse.Dialect.inlineReplace("[x]", function(text){
    return ["span", {"class": "chcklst-box checked fa fa-check-square"}];
  });

  Discourse.Dialect.inlineReplace("[*]", function(text){
    return ["span", {"class": "chcklst-box checked fa fa-check-square-o"}];
  });

  Discourse.Markdown.whiteListTag('span', 'class', 'chcklst-stroked' );
  Discourse.Markdown.whiteListTag('span', 'class', /^chcklst-.*$/ );
})();
