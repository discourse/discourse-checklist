import { cook } from "discourse/lib/text";
import Post from "discourse/models/post";
import { checklistSyntax } from "discourse/plugins/discourse-checklist/discourse/initializers/checklist";

QUnit.module("initializer:checklist");

QUnit.test("checkbox before a code block", assert => {
  const raw = `
[ ] first
[*] actual
\`[x] nope\`
  `;

  const cooked = cook(raw, { siteSettings: { checklist_enabled: true } });
  const $elem = $(cooked.string);
  const model = Post.create({ id: 42, can_edit: true });
  const decoratorHelper = { getModel: () => model };

  // eslint-disable-next-line no-undef
  server.get("/posts/42", () => [
    200,
    { "Content-Type": "application/json" },
    { raw }
  ]);

  checklistSyntax($elem, decoratorHelper);

  const done = assert.async();
  model.save = fields => {
    assert.ok(fields.raw.includes("[ ] first"));
    assert.ok(fields.raw.includes("[ ] actual"));
    assert.ok(fields.raw.includes("[x] nope"));
    done();
  };

  $elem.find(".chcklst-box:nth(1)").click();
});

QUnit.test("checkbox before a multiline code block", assert => {
  const raw = `
[ ] first
[*] actual
\`\`\`
[x] nope
[x] neither
\`\`\`
  `;

  const cooked = cook(raw, { siteSettings: { checklist_enabled: true } });
  const $elem = $(cooked.string);
  const model = Post.create({ id: 42, can_edit: true });
  const decoratorHelper = { getModel: () => model };

  // eslint-disable-next-line no-undef
  server.get("/posts/42", () => [
    200,
    { "Content-Type": "application/json" },
    { raw }
  ]);

  checklistSyntax($elem, decoratorHelper);

  const done = assert.async();
  model.save = fields => {
    assert.ok(fields.raw.includes("[ ] first"));
    assert.ok(fields.raw.includes("[ ] actual"));
    assert.ok(fields.raw.includes("[x] nope"));
    done();
  };

  $elem.find(".chcklst-box:nth(1)").click();
});

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

  const cooked = cook(raw, { siteSettings: { checklist_enabled: true } });
  const $elem = $(cooked.string);
  const model = Post.create({ id: 42, can_edit: true });
  const decoratorHelper = { getModel: () => model };

  // eslint-disable-next-line no-undef
  server.get("/posts/42", () => [
    200,
    { "Content-Type": "application/json" },
    { raw }
  ]);

  checklistSyntax($elem, decoratorHelper);

  const done = assert.async();
  model.save = fields => {
    assert.ok(fields.raw.includes("[ ] third"));
    done();
  };

  $elem.find(".chcklst-box:nth(2)").click();
});
