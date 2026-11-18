import { test, after } from "node:test";
import assert from "node:assert/strict";
import { renderPage, closeBrowser } from "../helpers/browser.js";
import { contrast, parseRgb } from "../helpers/color.js";

after(closeBrowser);

const MATRIX = [["light", "desktop"], ["dark", "desktop"], ["light", "mobile"], ["dark", "mobile"]];
const DIALOG = `
  <button id="outside" class="topcoat-button">Outside</button>
  <dialog id="d" class="topcoat-dialog" aria-labelledby="t" aria-describedby="b">
    <h2 class="topcoat-dialog__title" id="t">Remove bar 2?</h2>
    <p class="topcoat-dialog__body" id="b">Bar 2 has 7 steps. Removing it deletes them.</p>
    <div class="topcoat-dialog__actions" id="a">
      <button class="topcoat-button" type="button" id="cancel">Cancel</button>
      <button class="topcoat-button--cta" type="button" id="ok">Remove bar</button>
    </div>
  </dialog>
  <span id="tip" class="topcoat-tooltip">x</span>
  <p id="ctl" class="text-topcoat-control">c</p><p id="ctlL" class="text-topcoat-control-large">c</p>`;

const css = (page, sel, props, pseudo) => page.$eval(sel, (el, [ps, p]) => Object.fromEntries(p.map((k) => [k, getComputedStyle(el, ps || null)[k]])), [pseudo, props]);
const token = (page, name) => page.evaluate((n) => { const p = document.createElement("div"); p.style.cssText = `position:absolute;background:var(${n})`; document.getElementById("root").appendChild(p); const c = getComputedStyle(p).backgroundColor; p.remove(); return c; }, name);
const open = (page) => page.evaluate(() => document.getElementById("d").showModal());

test("a closed dialog is not displayed", async () => {
  const { page, close } = await renderPage(DIALOG);
  assert.equal((await css(page, "#d", ["display"])).display, "none");
  await close();
});

test("showModal opens it as a modal, makes the page inert, and Escape closes it", async () => {
  const { page, close } = await renderPage(DIALOG);
  await open(page);
  assert.equal(await page.$eval("#d", (d) => d.open && d.matches(":modal")), true);
  assert.notEqual((await css(page, "#d", ["display"])).display, "none");
  assert.equal(await page.$eval("#outside", (b) => b.matches(":focus") || !!b.closest("[inert]")), false);
  await page.keyboard.press("Escape");
  assert.equal(await page.$eval("#d", (d) => d.open), false, "Escape must close a modal dialog");
  await close();
});

for (const [scheme, scale] of MATRIX) {
  const label = `${scheme}/${scale}`;

  test(`[${label}] surface, border, radius, shadow, padding and reset come from tokens`, async () => {
    const { page, close } = await renderPage(DIALOG, { scheme, scale });
    await open(page);
    const d = await css(page, "#d", ["backgroundColor", "color", "borderTopWidth", "borderTopStyle", "borderTopColor", "borderTopLeftRadius", "boxShadow", "paddingTop", "paddingLeft"]);
    assert.equal(d.backgroundColor, await token(page, "--tc-surface"));
    assert.equal(d.color, await token(page, "--tc-text"), "must not keep the UA's CanvasText");
    assert.deepEqual([d.borderTopWidth, d.borderTopStyle], ["1px", "solid"]);
    assert.equal(d.borderTopColor, await token(page, "--tc-border"), "must not keep the UA's black border");
    assert.equal(d.borderTopLeftRadius, await page.evaluate(() => { const p = document.createElement("div"); p.style.borderTopLeftRadius = "var(--tc-radius)"; document.getElementById("root").appendChild(p); const r = getComputedStyle(p).borderTopLeftRadius; p.remove(); return r; }), "radius token");
    assert.equal(d.boxShadow, (await css(page, "#tip", ["boxShadow"])).boxShadow, "same raised shadow as the tooltip");
    assert.equal(d.paddingTop + d.paddingLeft, "16px16px", "fixed 1rem padding on both scales");
    await close();
  });

  test(`[${label}] title, body and actions: sizes, colors, contrast and the action row`, async () => {
    const { page, close } = await renderPage(DIALOG, { scheme, scale });
    await open(page);
    const surface = (await css(page, "#d", ["backgroundColor"])).backgroundColor;
    const title = await css(page, "#t", ["fontSize", "color", "fontWeight", "marginTop", "marginBottom"]);
    const body = await css(page, "#b", ["fontSize", "color", "marginTop"]);
    assert.equal(title.fontSize, (await css(page, "#ctlL", ["fontSize"])).fontSize, "title uses the scale's large size");
    assert.equal(body.fontSize, (await css(page, "#ctl", ["fontSize"])).fontSize, "body uses the normal size");
    assert.equal(title.color, await token(page, "--tc-text-strong"));
    assert.equal(body.color, await token(page, "--tc-text"));
    assert.ok(Number(title.fontWeight) >= 600, "title is strong");
    assert.equal(title.marginTop, "0px");
    for (const [name, c] of [["title", title.color], ["body", body.color]]) {
      const ratio = contrast(c, surface);
      assert.ok(ratio >= 4.5, `${name} text on the surface: ${ratio.toFixed(2)}:1`);
    }
    const a = await css(page, "#a", ["display", "justifyContent", "flexWrap", "columnGap", "rowGap", "marginTop"]);
    assert.deepEqual([a.display, a.flexWrap], ["flex", "wrap"]);
    assert.match(a.justifyContent, /^(flex|flow)-end$/, "end-aligned (Chromium serializes flex-end as flow-end)");
    assert.ok(parseFloat(a.columnGap) >= 4 && a.columnGap === a.rowGap, `fixed gap, got ${a.columnGap}/${a.rowGap}`);
    const okRight = await page.$eval("#ok", (b) => b.getBoundingClientRect().right);
    const dialogInner = await page.$eval("#a", (el) => el.getBoundingClientRect().right);
    assert.ok(Math.abs(okRight - dialogInner) < 1, "the last action is pushed to the end of the row");
    await close();
  });

  test(`[${label}] the backdrop dims the page enough to see in this scheme`, async () => {
    const { page, close } = await renderPage(DIALOG, { scheme, scale });
    await open(page);
    const b = (await css(page, "#d", ["backgroundColor"], "::backdrop")).backgroundColor;
    const [r, g, bl] = parseRgb(b);
    const alpha = Number((b.match(/,\s*([\d.]+)\)$/) ?? [])[1] ?? 1);
    assert.ok(alpha >= 0.3 && alpha <= 0.8, `backdrop alpha ${alpha} (${b})`);
    assert.ok(r + g + bl < 60, `backdrop should be dark, got ${b}`);
    const page_bg = parseRgb(await token(page, "--tc-page-bg"));
    const dimmed = page_bg.map((v) => v * (1 - alpha));
    assert.ok(contrast(`rgb(${page_bg})`, `rgb(${dimmed})`) >= 1.5, "the dimmed page must be visibly darker than the page");
    assert.ok(contrast(await token(page, "--tc-surface"), `rgb(${dimmed})`) >= 1.5, "the dialog surface must stand out from the dimmed page");
    await close();
  });
}

test("max-width fits a phone: at most 24rem, and never wider than the viewport minus 2rem", async () => {
  const wide = await renderPage(DIALOG, { width: 1000 });
  await open(wide.page);
  assert.ok((await wide.page.$eval("#d", (d) => d.getBoundingClientRect().width)) <= 384.5, "24rem cap");
  await wide.close();
  const narrow = await renderPage(DIALOG, { width: 320 });
  await open(narrow.page);
  assert.ok((await narrow.page.$eval("#d", (d) => d.getBoundingClientRect().width)) <= 320 - 32 + 0.5, "viewport minus 2rem");
  await narrow.close();
});

test("actions wrap on a narrow screen without overflowing the dialog", async () => {
  const html = DIALOG.replace('<button class="topcoat-button--cta" type="button" id="ok">Remove bar</button>', '<button class="topcoat-button--cta" type="button" id="ok">Remove bar permanently</button><button class="topcoat-button" type="button">Keep both copies</button>');
  const { page, close } = await renderPage(html, { width: 300 });
  await open(page);
  const m = await page.$eval("#a", (el) => ({ h: el.getBoundingClientRect().height, sw: el.scrollWidth, cw: el.clientWidth, bh: el.querySelector("button").getBoundingClientRect().height }));
  assert.ok(m.h > m.bh * 1.5, `actions should wrap onto a second row (row ${m.h}px, button ${m.bh}px)`);
  assert.ok(m.sw <= m.cw, "wrapped actions must not overflow");
  await close();
});

for (const [width, scale] of [[1000, "desktop"], [360, "mobile"]]) {
  test(`[${scale}] a modal dialog is centered in the viewport (Tailwind's preflight must not cancel the browser's margin:auto)`, async () => {
    const { page, close } = await renderPage(DIALOG, { width, scale });
    await open(page);
    const c = await page.$eval("#d", (d) => { const r = d.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, vw: innerWidth, vh: innerHeight }; });
    assert.ok(Math.abs(c.x - c.vw / 2) <= 1, `horizontal center ${c.x} vs ${c.vw / 2}`);
    assert.ok(Math.abs(c.y - c.vh / 2) <= 1, `vertical center ${c.y} vs ${c.vh / 2}`);
    await close();
  });
}
