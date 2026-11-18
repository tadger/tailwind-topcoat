import { test, after } from "node:test";
import assert from "node:assert/strict";
import { renderPage, closeBrowser } from "../helpers/browser.js";

after(closeBrowser);

const LONG = "Supercalifragilisticexpialidocious".repeat(4);

const MARKUP = `
  <div id="narrow" style="width:160px">
    <div class="topcoat-list" id="list">
      <h3 class="topcoat-list__header">Category</h3>
      <ul class="topcoat-list__container">
        <li class="topcoat-list__item" id="li">${LONG}</li>
        <li class="topcoat-list__item">Item two is a perfectly normal sentence that should wrap across lines</li>
      </ul>
    </div>
    <span class="topcoat-notification" id="note">${LONG}</span>
    <button class="topcoat-button" id="btn">${LONG}</button>
  </div>
  <div class="topcoat-navigation-bar" id="nav"><div class="topcoat-navigation-bar__item" style="width:100%"><h1 class="topcoat-navigation-bar__title">Header</h1></div></div>
  <div class="topcoat-tab-bar" id="tabs" style="width:300px">
    <label class="topcoat-tab-bar__item"><input type="radio" name="t" checked><button class="topcoat-tab-bar__button">A</button></label>
    <label class="topcoat-tab-bar__item"><input type="radio" name="t"><button class="topcoat-tab-bar__button">A much longer tab</button></label>
    <label class="topcoat-tab-bar__item"><input type="radio" name="t"><button class="topcoat-tab-bar__button">C</button></label>
  </div>`;

const box = (page, sel) => page.$eval(sel, (el) => {
  const r = el.getBoundingClientRect();
  return { w: r.width, h: r.height, sw: el.scrollWidth, cw: el.clientWidth };
});

for (const scheme of ["light", "dark"]) {
  for (const scale of ["desktop", "mobile"]) {
    const label = `${scheme}/${scale}`;

    test(`[${label}] long list item text wraps inside the item`, async () => {
      const { page, close } = await renderPage(MARKUP, { scheme, scale });
      const li = await box(page, "#li");
      assert.ok(li.sw <= li.cw, `list item overflows (${li.sw} > ${li.cw})`);
      assert.ok(li.w <= 160, "list item wider than its container");
      await close();
    });

    test(`[${label}] long notification and button stay inside a narrow container`, async () => {
      const { page, close } = await renderPage(MARKUP, { scheme, scale });
      assert.ok((await box(page, "#note")).w <= 160, "notification overflows");
      assert.ok((await box(page, "#btn")).w <= 160, "button overflows");
      await close();
    });

    test(`[${label}] tab bar items share the width equally`, async () => {
      const { page, close } = await renderPage(MARKUP, { scheme, scale });
      const widths = await page.$$eval("#tabs .topcoat-tab-bar__item", (els) => els.map((e) => e.getBoundingClientRect().width));
      assert.equal(widths.length, 3);
      assert.ok(Math.max(...widths) - Math.min(...widths) < 1.5, `unequal tab widths ${widths}`);
      await close();
    });

    test(`[${label}] navigation bar centers its title region at the scale's height`, async () => {
      const { page, close } = await renderPage(MARKUP, { scheme, scale });
      const nav = await box(page, "#nav");
      assert.ok(nav.h >= (scale === "mobile" ? 60 : 30), `nav bar height ${nav.h}`);
      await close();
    });
  }
}

test("nested scopes: mobile inside desktop and desktop inside mobile affect only their subtree", async () => {
  const btn = (id) => `<button class="topcoat-button" id="${id}">Go</button>`;
  const html = `${btn("outer")}<div data-topcoat="mobile">${btn("inM")}</div>`;
  const a = await renderPage(html);
  const outerH = (await box(a.page, "#outer")).h;
  const innerH = (await box(a.page, "#inM")).h;
  assert.ok(innerH > outerH * 1.5, `mobile subtree should be taller (${innerH} vs ${outerH})`);
  await a.close();

  const html2 = `${btn("outer")}<div data-topcoat="desktop">${btn("inD")}</div>`;
  const b = await renderPage(html2, { scale: "mobile" });
  const mobileH = (await box(b.page, "#outer")).h;
  const desktopH = (await box(b.page, "#inD")).h;
  assert.ok(Math.abs(desktopH - outerH) < 1.5, `desktop subtree should match desktop height (${desktopH} vs ${outerH})`);
  assert.ok(mobileH > desktopH * 1.5);
  await b.close();
});

test("button bar buttons touch their neighbours (no gaps between segments)", async () => {
  const html = `<div class="topcoat-button-bar" style="width:300px">
    <div class="topcoat-button-bar__item"><button class="topcoat-button-bar__button">One</button></div>
    <div class="topcoat-button-bar__item"><button class="topcoat-button-bar__button">A longer label</button></div>
    <div class="topcoat-button-bar__item"><button class="topcoat-button-bar__button">C</button></div>
  </div>`;
  const { page, close } = await renderPage(html);
  const rects = await page.$$eval(".topcoat-button-bar__button", (els) => els.map((e) => e.getBoundingClientRect()).map((r) => ({ l: r.left, r: r.right })));
  for (let i = 0; i < rects.length - 1; i++) {
    assert.ok(Math.abs(rects[i].r - rects[i + 1].l) <= 1.5, `gap between segment ${i} and ${i + 1}: ${rects[i + 1].l - rects[i].r}px`);
  }
  await close();
});
