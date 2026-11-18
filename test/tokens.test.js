import { test } from "node:test";
import assert from "node:assert/strict";
import postcss from "postcss";
import { buildCss } from "./helpers/build.js";

const isDark = (node) => {
  for (let p = node.parent; p; p = p.parent) {
    if (p.type === "atrule" && p.name === "media" && /prefers-color-scheme:\s*dark/.test(p.params)) return true;
  }
  return false;
};

/** Collect `--tc-*` declarations: { name -> value } per bucket, keyed by the owning selector. */
async function collect() {
  const css = await buildCss({ candidates: ["bg-topcoat-surface"] });
  const root = postcss.parse(css);
  const buckets = { light: {}, dark: {}, desktop: {}, mobile: {}, mobileDark: {} };
  root.walkDecls(/^--tc-/, (decl) => {
    let rule = decl.parent;
    while (rule && rule.type !== "rule") rule = rule.parent;
    const sel = rule?.selector ?? "";
    const dark = isDark(decl);
    if (sel.includes('[data-topcoat="mobile"]')) buckets[dark ? "mobileDark" : "mobile"][decl.prop] = decl.value;
    else if (sel.includes('[data-topcoat="desktop"]')) buckets.desktop[decl.prop] = decl.value;
    else if (/^:root(,\s*\[data-topcoat\])?$/.test(sel.trim())) buckets[dark ? "dark" : "light"][decl.prop] = decl.value;
  });
  return { css, ...buckets };
}

test("light and dark define the same --tc-* color keys", async () => {
  const { light, dark } = await collect();
  assert.ok(Object.keys(light).length > 10, "expected color tokens on :root");
  assert.deepEqual(Object.keys(dark).sort(), Object.keys(light).sort());
});

test("dark colors differ from light for surface and text", async () => {
  const { light, dark } = await collect();
  assert.notEqual(dark["--tc-surface"], light["--tc-surface"]);
  assert.notEqual(dark["--tc-text"], light["--tc-text"]);
});

test("mobile scale redefines every desktop size token", async () => {
  const { desktop, mobile } = await collect();
  assert.ok(desktop["--tc-control-height"], "desktop size tokens missing");
  assert.deepEqual(Object.keys(mobile).sort(), Object.keys(desktop).sort());
  assert.notEqual(mobile["--tc-control-height"], desktop["--tc-control-height"]);
});

test("theme utilities exist and follow the variables", async () => {
  const { css } = await collect();
  assert.match(css, /\.bg-topcoat-surface\s*\{[^}]*var\(--tc-surface\)/);
});

test("every role token is exposed as a Tailwind utility", async () => {
  const utilities = [
    "bg-topcoat-surface-hover", "bg-topcoat-surface-active", "bg-topcoat-surface-sunken", "bg-topcoat-input",
    "text-topcoat-strong", "text-topcoat-on-accent", "bg-topcoat-cta-hover", "bg-topcoat-cta-active",
    "border-topcoat-cta-border", "border-topcoat-focus", "bg-topcoat-focus-ring", "bg-topcoat-invalid",
    "bg-topcoat-selected", "rounded-topcoat-pill", "shadow-topcoat-input", "shadow-topcoat-search",
    "shadow-topcoat-inset-active", "bg-topcoat-highlight", "ring-topcoat-highlight", "text-topcoat-invalid-text",
  ];
  const css = await buildCss({ candidates: utilities });
  const missing = utilities.filter((u) => !css.includes(`.${u} {`));
  assert.deepEqual(missing, []);
});

test("highlight and invalid-text tokens exist in both light and dark", async () => {
  const { light, dark } = await collect();
  for (const t of ["--tc-highlight", "--tc-invalid-text"]) {
    assert.ok(light[t] && dark[t], `${t} must be defined in light and dark`);
    assert.notEqual(light[t], dark[t], `${t} should differ between schemes`);
  }
});
