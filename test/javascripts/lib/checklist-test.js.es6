import { cookAsync } from "discourse/lib/text";
import Post from "discourse/models/post";
import { checklistSyntax } from "discourse/plugins/discourse-checklist/discourse/initializers/checklist";
import { Promise } from "rsvp";

QUnit.module("initializer:checklist");

async function prepare(raw) {
  const cooked = await cookAsync(raw, {
    siteSettings: { checklist_enabled: true }
  });
  const model = Post.create({ id: 42, can_edit: true });
  const decoratorHelper = { getModel: () => model };

  // eslint-disable-next-line no-undef
  server.get("/posts/42", () => [
    200,
    { "Content-Type": "application/json" },
    { raw }
  ]);

  const $elem = $(cooked.string);
  checklistSyntax($elem, decoratorHelper);

  const updated = new Promise(resolve => {
    model.save = fields => resolve(fields.raw);
  });

  return [$elem, updated];
}

QUnit.test("checkbox before a code block", async assert => {
  const [$elem, updated] = await prepare(`
[ ] first
[*] actual
\`[x] nope\`
  `);

  $elem.find(".chcklst-box:nth(1)").click();

  const output = await updated;
  assert.ok(output.includes("[ ] first"));
  assert.ok(output.includes("[ ] actual"));
  assert.ok(output.includes("[x] nope"));
});

QUnit.test("checkbox before a multiline code block", async assert => {
  const [$elem, updated] = await prepare(`
[ ] first
[*] actual
\`\`\`
[x] nope
[x] neither
\`\`\`
  `);

  $elem.find(".chcklst-box:nth(1)").click();

  const output = await updated;
  assert.ok(output.includes("[ ] first"));
  assert.ok(output.includes("[ ] actual"));
  assert.ok(output.includes("[x] nope"));
});

QUnit.test("checkbox before italic/bold sequence", async assert => {
  const [$elem, updated] = await prepare(`
[*] *test*
  `);

  $elem.find(".chcklst-box:nth(0)").click();

  const output = await updated;
  assert.ok(output.includes("[ ] *test*"));
});

QUnit.test("checkboxes in an unordered list", async assert => {
  const [$elem, updated] = await prepare(`
* [*] checked
* [] test
* [] two
`);

  $elem.find(".chcklst-box:nth(1)").click();

  const output = await updated;
  assert.ok(output.includes("* [*] checked"));
  assert.ok(output.includes("* [\\*] test"));
  assert.ok(output.includes("* [] two"));
});

QUnit.test("checkboxes in italic/bold-like blocks", async assert => {
  const [$elem, updated] = await prepare(`
*[\*
*a [*] \*]*
[*\*]
~~[*]~~

* []* 0

~~[] ~~ 1

~~ [*]~~ 2

* [*] 3
`);

// Doesn't work properly:
// *[\*] * 4

  $elem.find(".chcklst-box:nth(3)").click();

  const output = await updated;
  assert.ok(output.includes("* [] 3"));
});

QUnit.test("correct checkbox is selected", async assert => {
  const [$elem, updated] = await prepare(`
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
  `);

  $elem.find(".chcklst-box:nth(2)").click();

  const output = await updated;
  assert.ok(output.includes("[ ] third"));
});
