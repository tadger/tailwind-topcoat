import { test, before } from "node:test";
import assert from "node:assert/strict";
import postcss from "postcss";
import { buildCss } from "./helpers/build.js";
import { topdocClasses } from "./helpers/topdoc.js";

// Tailwind v4 emits plugin components only for classes found in content, so feed it every topdoc class.
const COMPONENTS = ["Button", "Icon Button", "Button Bar", "Text input", "Textarea", "Search Input", "Checkbox", "Radio Button", "Switch", "Range"];

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

test("search input padding is derived from the icon variables, not hard-coded", () => {
  const m = css.match(/padding-inline-start:\s*([^;]+);/g) ?? [];
  const derived = m.find((d) => d.includes("var(--tc-search-icon-offset)") && d.includes("var(--tc-search-icon-size)") && d.includes("var(--tc-search-icon-gap)"));
  assert.ok(derived, "padding-inline-start must be calc() of offset + size + gap");
});

test("search cancel button is visible and keeps clearance from the text", () => {
  let rule;
  postcss.parse(css).walkRules((r) => {
    if (r.selector.includes("topcoat-search-input") && r.selector.includes("::-webkit-search-cancel-button")) rule = r;
    if (r.selector.trim() === "&::-webkit-search-cancel-button" && r.parent?.selector?.includes("topcoat-search-input")) rule = r;
  });
  assert.ok(rule, "cancel-button rule missing");
  const d = Object.fromEntries(rule.nodes.filter((n) => n.type === "decl").map((n) => [n.prop, n.value]));
  assert.notEqual(d.width, "0");
  assert.match(d["background-image"] ?? "", /svg/, "needs a visible clear icon");
  assert.match(d["margin-inline"] ?? "", /\S+\s+\S*[1-9]/, "needs a non-zero end margin");
});

test("range styles both webkit and moz thumbs and tracks", () => {
  for (const frag of ["::-webkit-slider-thumb", "::-moz-range-thumb", "::-moz-range-track"]) {
    assert.ok(css.includes(frag), `missing ${frag}`);
  }
});

test("toggle inputs are visually hidden by opacity, never display:none", () => {
  assert.doesNotMatch(css, /topcoat-(checkbox|radio-button|switch)[^{]*\{[^}]*display:\s*none/);
});
