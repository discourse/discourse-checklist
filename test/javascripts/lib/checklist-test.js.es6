import Post from "discourse/models/post";
import { checklistSyntax } from "discourse/plugins/discourse-checklist/discourse/initializers/checklist";

QUnit.module("initializer:checklist");



QUnit.test("correct checkbox is selected", assert => {
  const raw = `
\`[x]\`
*[x]*
**[x]**
_[x]_
__[x]__
~~[x]~~

[code]
[\*]
[ ]
[ ]
[\*]
[/code]

\`\`\`
[\*]
[ ]
[ ]
[\*]
\`\`\`

Actual checkboxes:
[] first
[*] second
[x] third
[_] fourth
`;

  const cooked = `<div class="cooked">
<pre>[*]</pre>
<em>[*]</em>
<strong>[*]</strong>
<em>[*]</em>
<strong>[*]</strong>
<s>[*]</s>
<pre><code>[\*]
[ ]
[ ]
[\*]
</code></pre>
<pre><code>[\*]
[ ]
[ ]
[\*]
</code></pre>
<p>Actual checkboxes:<br>
<span class="chcklst-box fa fa-square-o fa-fw" style="cursor: pointer;"></span> first<br>
<span class="chcklst-box checked fa fa-check-square-o fa-fw" style="cursor: pointer;"></span> second<br>
<span class="chcklst-box checked fa fa-check-square fa-fw" style="cursor: pointer;"></span> third<br>
<span class="chcklst-box fa fa-square fa-fw" style="cursor: pointer;"></span> fourth</p>
</div>`;

  const model = Post.create({ id: 42, can_edit: true });
  const decoratorHelper = { getModel: () => model };
  const $elem = $(cooked);

  // eslint-disable-next-line no-undef
  server.get("/posts/42", () => [
    200,
    { "Content-Type": "application/json" },
    { raw: raw }
  ]);

  checklistSyntax($elem, decoratorHelper);

  const done = assert.async();
  model.save = fields => {
    assert.ok(fields.raw.includes("[ ] third"));

    done();
  };

  $elem.find(".chcklst-box:nth(2)").click();
});
