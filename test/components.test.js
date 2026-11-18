import { test, before } from "node:test";
import assert from "node:assert/strict";
import postcss from "postcss";
import { buildCss } from "./helpers/build.js";
import { topdocClasses } from "./helpers/topdoc.js";

// Tailwind v4 emits plugin components only for classes found in content, so feed it every topdoc class.
const COMPONENTS = ["Button", "Icon Button", "Button Bar"];

const OVERRIDES = ["px-6", "p-2", "py-1", "rounded-none", "bg-red-500", "text-lg"];

let css;
before(async () => {
  const candidates = COMPONENTS.flatMap((n) => [...topdocClasses(n)]);
  css = await buildCss({ candidates: [...candidates, ...OVERRIDES] });
});

/** Fails listing every topdoc class of `componentName` that has no selector in `css`. */
export function assertCovers(componentName, css) {
  const wanted = [...topdocClasses(componentName)];
  assert.ok(wanted.length > 0, `no topdoc classes found for "${componentName}"`);
  const missing = wanted.filter((c) => !new RegExp(`\\.${c}(?![\\w-])`).test(css));
  assert.deepEqual(missing, [], `${componentName}: classes without a rule`);
}

const hexIn = (rules) => {
  const hits = [];
  postcss.parse(css).walkRules((rule) => {
    if (!rules.test(rule.selector)) return;
    rule.walkDecls((d) => /#[0-9a-f]{3,8}\b/i.test(d.value) && hits.push(`${rule.selector} { ${d.prop}: ${d.value} }`));
  });
  return hits;
};

for (const name of COMPONENTS) {
  test(`covers every ${name} class`, () => assertCovers(name, css));
}

test("button rules use tokens only (no hex literals)", () => {
  assert.deepEqual(hexIn(/\.topcoat-(button|icon-button)/), []);
});

test("utilities override components (they are emitted after every topcoat rule)", () => {
  const lastTopcoat = css.lastIndexOf(".topcoat-");
  assert.ok(lastTopcoat !== -1, "components not emitted");
  for (const u of OVERRIDES) {
    const at = css.indexOf(`.${u} {`);
    assert.ok(at !== -1, `.${u} not emitted`);
    assert.ok(at > lastTopcoat, `.${u} must come after component rules`);
  }
});
