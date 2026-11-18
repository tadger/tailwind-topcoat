import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { topdocClasses } from "../helpers/topdoc.js";

const root = fileURLToPath(new URL("../..", import.meta.url));
const COMPONENTS = ["Button", "Icon Button", "Button Bar", "Text input", "Textarea", "Search Input", "Checkbox", "Radio Button", "Switch", "Range", "List", "Navigation Bar", "Tab Bar", "Notification"];

let browser;
before(async () => {
  execFileSync("sh", ["scripts/build-demo.sh"], { cwd: root, stdio: "pipe" });
  browser = await chromium.launch();
});
after(() => browser?.close());

async function open() {
  const page = await browser.newPage({ viewport: { width: 1000, height: 800 } });
  const problems = [];
  page.on("console", (m) => m.type() === "error" && problems.push(m.text()));
  page.on("pageerror", (e) => problems.push(String(e)));
  await page.goto(`file://${root}demo/dist/index.html`);
  return { page, problems };
}

test("demo builds and loads without console errors", async () => {
  assert.ok(existsSync(`${root}demo/dist/demo.css`));
  const { page, problems } = await open();
  assert.deepEqual(problems, []);
  await page.close();
});

test("demo renders every Topcoat class of every component", async () => {
  const { page } = await open();
  const inDom = new Set(await page.$$eval("[class]", (els) => els.flatMap((e) => [...e.classList])));
  const missing = COMPONENTS.flatMap((c) => [...topdocClasses(c)]).filter((c) => !inDom.has(c));
  assert.deepEqual(missing, [], "classes not shown in the demo");
  await page.close();
});

test("demo shows the select, field, tooltip, highlight and toggle-button primitives", async () => {
  const { page } = await open();
  const inDom = new Set(await page.$$eval("[class]", (els) => els.flatMap((e) => [...e.classList])));
  const missing = ["topcoat-select", "topcoat-select--large", "topcoat-field", "topcoat-field__label", "topcoat-field__message", "topcoat-field__message--invalid", "topcoat-tooltip", "bg-topcoat-highlight", "ring-topcoat-highlight"].filter((c) => !inDom.has(c));
  assert.deepEqual(missing, []);
  assert.ok(await page.$('button.topcoat-button[aria-pressed="true"]'), "pressed toggle button");
  assert.ok(await page.$('.topcoat-button-bar__button[aria-pressed="true"]'), "pressed bar segment");
  assert.ok(await page.$('.topcoat-field__message[role="alert"]'), "alert message");
  // Toggle buttons in the demo flip aria-pressed when clicked.
  const before = await page.$eval("[data-demo-toggle]", (el) => el.getAttribute("aria-pressed"));
  await page.click("[data-demo-toggle]");
  assert.notEqual(await page.$eval("[data-demo-toggle]", (el) => el.getAttribute("aria-pressed")), before);
  await page.close();
});

test("demo shows every type role and uses the scale for its own headings", async () => {
  const { page } = await open();
  const inDom = new Set(await page.$$eval("[class]", (els) => els.flatMap((e) => [...e.classList])));
  const roles = ["caption", "control", "control-large", "body", "title", "display"].map((r) => `text-topcoat-${r}`);
  assert.deepEqual(roles.filter((c) => !inDom.has(c)), [], "type roles missing from the demo");
  for (const c of ["font-topcoat-regular", "font-topcoat-medium", "font-topcoat-strong", "font-topcoat-mono"]) assert.ok(inDom.has(c), `${c} missing from the demo`);
  const stray = await page.$$eval("h1, h2", (els) => els.filter((e) => /(^|\s)text-(xs|sm|base|lg|xl|[2-9]xl)(\s|$)/.test(e.className)).map((e) => e.textContent));
  assert.deepEqual(stray, [], "demo headings should use text-topcoat-* roles, not raw Tailwind sizes");
  await page.close();
});

test("demo switches all four theme combinations and screenshots each", async () => {
  mkdirSync(`${root}test/screenshots`, { recursive: true });
  const { page } = await open();
  const bgs = {};
  for (const scheme of ["light", "dark"]) {
    for (const scale of ["desktop", "mobile"]) {
      await page.click(`[data-set-scheme="${scheme}"]`);
      await page.click(`[data-set-scale="${scale}"]`);
      const state = await page.evaluate(() => ({
        dark: document.documentElement.classList.contains("dark"),
        scale: document.documentElement.getAttribute("data-topcoat"),
        bg: getComputedStyle(document.body).backgroundColor,
      }));
      assert.equal(state.dark, scheme === "dark");
      assert.equal(state.scale, scale);
      bgs[scheme] = state.bg;
      await page.waitForTimeout(150);
      await page.screenshot({ path: `${root}test/screenshots/demo-${scheme}-${scale}.png`, fullPage: true });
    }
  }
  assert.notEqual(bgs.light, bgs.dark, "dark page background should differ");
  await page.close();
});
