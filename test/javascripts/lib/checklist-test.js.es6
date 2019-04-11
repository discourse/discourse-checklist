import Post from "discourse/models/post";
import { checklistSyntax } from "discourse/plugins/discourse-checklist/discourse/initializers/checklist";

QUnit.module("initializer:checklist");

QUnit.test("correct checkbox is selected", assert => {
  const raw = `Hi there,

It seems that a code block followed by a checklist breaks things.

\`[x]\`

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
Will create a list like this:
[] first
[*] second
[x] third
[_] fourth

Clicking the boxes will ruin the code block and the list becomes unresponsive.`;

  const cooked = `<div class="cooked">
<p>Hi there,</p>
<p>It seems that a code block followed by a checklist breaks things.</p>
<pre>[*]</pre>
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
<p>Will create a list like this:<br>
<span class="chcklst-box fa fa-square-o fa-fw" style="cursor: pointer;"></span><br>
<span class="chcklst-box checked fa fa-check-square-o fa-fw" style="cursor: pointer;"></span><br>
<span class="chcklst-box checked fa fa-check-square fa-fw" style="cursor: pointer;"></span><br>
<span class="chcklst-box fa fa-square fa-fw" style="cursor: pointer;"></span></p>
<p>Clicking the boxes will ruin the code block and the list becomes unresponsive.</p>
</div>`;

  const model = Post.create({ id: 42, can_edit: true });

  const $elem = $(cooked);
  const decoratorHelper = { getModel: () => model };

  // eslint-disable-next-line no-undef
  server.get("/posts/42", () => [
    200,
    { "Content-Type": "application/json" },
    { raw: raw }
  ]);

  checklistSyntax($elem, decoratorHelper);

  const done = assert.async();
  model.save = fields => {
    assert.ok(fields.raw.indexOf("[ ] third") !== -1);
    done();
  };

  $elem.find(".chcklst-box:nth(2)").click();
});
