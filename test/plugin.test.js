import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildCss } from "./helpers/build.js";

test("plugin loads and builds", async () => {
  const css = await buildCss({});
  assert.equal(typeof css, "string");
  assert.ok(css.length > 0);
});

test("index.css is the package entry", () => {
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url)));
  assert.equal(pkg.exports["."], "./index.css");
});
