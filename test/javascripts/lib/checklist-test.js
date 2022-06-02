import { acceptance } from "discourse/tests/helpers/qunit-helpers";
import { test } from "qunit";
import { cookAsync } from "discourse/lib/text";
import Post from "discourse/models/post";
import { checklistSyntax } from "discourse/plugins/discourse-checklist/discourse/initializers/checklist";
import { Promise } from "rsvp";

let currentRaw;

async function prepare(raw) {
  const cooked = await cookAsync(raw, {
    siteSettings: { checklist_enabled: true },
  });
  const model = Post.create({ id: 42, can_edit: true });
  const decoratorHelper = { getModel: () => model };

  const $elem = $(cooked.string);
  checklistSyntax($elem, decoratorHelper);

  currentRaw = raw;

  const updated = new Promise((resolve) => {
    model.save = (fields) => resolve(fields.raw);
  });

  return [$elem, updated];
}

acceptance("discourse-checklist | checklist", function (needs) {
  needs.pretender((server) => {
    server.get("/posts/42", () => [
      200,
      { "Content-Type": "application/json" },
      { raw: currentRaw },
    ]);
  });

  test("make checkboxes readonly while updating", async function (assert) {
    const [$elem, updated] = await prepare(`
[ ] first
[x] second
    `);

    const $checklist = $elem.find(".chcklst-box");
    $checklist.get(0).click();
    const checkbox = $checklist.get(1);
    assert.ok(checkbox.classList.contains("readonly"));
    checkbox.click();

    const output = await updated;
    assert.ok(output.includes("[x] first"));
    assert.ok(output.includes("[x] second"));
  });

  test("checkbox before a code block", async function (assert) {
    const [$elem, updated] = await prepare(`
[ ] first
[x] actual
\`[x] nope\`
    `);

    assert.equal($elem.find(".chcklst-box").length, 2);
    $elem.find(".chcklst-box")[1].click();

    const output = await updated;
    assert.ok(output.includes("[ ] first"));
    assert.ok(output.includes("[ ] actual"));
    assert.ok(output.includes("[x] nope"));
  });

  test("permanently checked checkbox", async function (assert) {
    const [$elem, updated] = await prepare(`
[X] perma
[x] not perma
    `);

    assert.equal($elem.find(".chcklst-box").length, 2);
    $elem.find(".chcklst-box")[0].click();
    $elem.find(".chcklst-box")[1].click();

    const output = await updated;
    assert.ok(output.includes("[X] perma"));
    assert.ok(output.includes("[ ] not perma"));
  });

  test("checkbox before a multiline code block", async function (assert) {
    const [$elem, updated] = await prepare(`
[ ] first
[x] actual
\`\`\`
[x] nope
[x] neither
\`\`\`
    `);

    assert.equal($elem.find(".chcklst-box").length, 2);
    $elem.find(".chcklst-box")[1].click();

    const output = await updated;
    assert.ok(output.includes("[ ] first"));
    assert.ok(output.includes("[ ] actual"));
    assert.ok(output.includes("[x] nope"));
  });

  test("checkbox before italic/bold sequence", async function (assert) {
    const [$elem, updated] = await prepare(` [x] *test*
    `);

    assert.equal($elem.find(".chcklst-box").length, 1);
    $elem.find(".chcklst-box")[0].click();

    const output = await updated;
    assert.ok(output.includes("[ ] *test*"));
  });

  test("checkboxes in an unordered list", async function (assert) {
    const [$elem, updated] = await prepare(`
* [x] checked
* [] test
* [] two
  `);

    assert.equal($elem.find(".chcklst-box").length, 3);
    $elem.find(".chcklst-box")[1].click();

    const output = await updated;
    assert.ok(output.includes("* [x] checked"));
    assert.ok(output.includes("* [x] test"));
    assert.ok(output.includes("* [] two"));
  });

  test("checkboxes in italic/bold-like blocks", async function (assert) {
    const [$elem, updated] = await prepare(`
*[x
*a [*] x]*
[*x]
~~[*]~~

* []* 0

~~[] ~~ 1

~~ [x]~~ 2

* [x] 3
  `);

    assert.equal($elem.find(".chcklst-box").length, 4);
    $elem.find(".chcklst-box")[3].click();

    const output = await updated;
    assert.ok(output.includes("* [ ] 3"));
  });

  test("correct checkbox is selected", async function (assert) {
    const [$elem, updated] = await prepare(`
\`[x]\`
*[x]*
**[x]**
_[x]_
__[x]__
~~[x]~~

[code]
[x]
[ ]
[ ]
[x]
[/code]

\`\`\`
[x]
[ ]
[ ]
[x]
\`\`\`

Actual checkboxes:
[] first
[x] second
* test[x]*thrid*
[x] fourth
[x] fifth
    `);

    assert.equal($elem.find(".chcklst-box").length, 5);
    $elem.find(".chcklst-box")[3].click();

    const output = await updated;
    assert.ok(output.includes("[ ] fourth"));
  });
});
