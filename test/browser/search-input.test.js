import { test, after } from "node:test";
import assert from "node:assert/strict";
import { renderPage, closeBrowser } from "../helpers/browser.js";

after(closeBrowser);

const MARKUP = `
  <input id="a" type="search" placeholder="search" class="topcoat-search-input">
  <input id="b" type="search" placeholder="search" class="topcoat-search-input--large">
  <input id="d" type="search" placeholder="search" class="topcoat-search-input" disabled>`;

/**
 * Icon end edge minus text start edge, in px, both measured from the inline-start edge of the padding box.
 * Positive means the text starts underneath the icon.
 */
function overlap(page, sel) {
  return page.$eval(sel, (el) => {
    const cs = getComputedStyle(el);
    const toPx = (v) => {
      const probe = document.createElement("span");
      probe.style.cssText = `position:absolute;visibility:hidden;width:${v.trim()}`;
      el.parentElement.appendChild(probe);
      const w = probe.getBoundingClientRect().width;
      probe.remove();
      return w;
    };
    const textStart = parseFloat(cs.direction === "rtl" ? cs.paddingRight : cs.paddingLeft);
    const iconEnd = toPx(cs.getPropertyValue("--tc-search-icon-offset")) + toPx(cs.getPropertyValue("--tc-search-icon-size"));
    return iconEnd - textStart;
  });
}

for (const scheme of ["light", "dark"]) {
  for (const scale of ["desktop", "mobile"]) {
    const label = `${scheme}/${scale}`;

    test(`[${label}] text starts at or after the icon's end edge, with a gap`, async () => {
      const { page, close } = await renderPage(MARKUP, { scheme, scale });
      for (const sel of ["#a", "#b"]) assert.ok((await overlap(page, sel)) <= -1, `${sel} overlaps the icon`);
      await close();
    });

    test(`[${label}] long typed text scrolls instead of changing padding`, async () => {
      const { page, close } = await renderPage(MARKUP, { scheme, scale });
      const before = await page.$eval("#a", (el) => getComputedStyle(el).paddingLeft);
      await page.fill("#a", "x".repeat(60));
      assert.equal(await page.$eval("#a", (el) => getComputedStyle(el).paddingLeft), before);
      assert.ok(await page.$eval("#a", (el) => el.scrollWidth > el.clientWidth), "text should overflow-scroll");
      await close();
    });
  }
}

test("rtl mirrors icon and padding", async () => {
  const { page, close } = await renderPage(MARKUP, { dir: "rtl" });
  const r = await page.$eval("#a", (el) => {
    const cs = getComputedStyle(el);
    return { left: parseFloat(cs.paddingLeft), right: parseFloat(cs.paddingRight), pos: cs.backgroundPositionX };
  });
  assert.ok(r.right > r.left, "inline-start padding must be on the right in rtl");
  assert.match(r.pos, /100%|right/, "icon must be anchored to the right in rtl");
  assert.ok((await overlap(page, "#a")) <= -1, "no overlap in rtl");
  await close();
});

test("disabled search input is dimmed and ignores pointer events", async () => {
  const { page, close } = await renderPage(MARKUP);
  const s = await page.$eval("#d", (el) => ({ o: getComputedStyle(el).opacity, pe: getComputedStyle(el).pointerEvents }));
  assert.equal(s.o, "0.3");
  assert.equal(s.pe, "none");
  await close();
});

test("detector sanity: Topcoat 0.8.0's original geometry is reported as overlapping", async () => {
  const html = `<input id="o" type="search" class="topcoat-search-input" style="--tc-search-icon-offset:1rem;--tc-search-icon-size:12px;padding-left:1.3rem;padding-right:0">`;
  const { page, close } = await renderPage(html);
  assert.ok((await overlap(page, "#o")) > 0, "original geometry should overlap");
  await close();
});
