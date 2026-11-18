import { test, after } from "node:test";
import assert from "node:assert/strict";
import { renderPage, closeBrowser } from "../helpers/browser.js";

after(closeBrowser);

const FOCUS_RING = "rgb(111, 181, 241)";

const MARKUP = `
  <label id="cb" class="topcoat-checkbox"><input id="cbi" type="checkbox"><div class="topcoat-checkbox__checkmark"></div> Default</label>
  <label id="cbd" class="topcoat-checkbox"><input id="cbdi" type="checkbox" disabled><div class="topcoat-checkbox__checkmark"></div> Disabled</label>
  <label id="rb" class="topcoat-radio-button"><input id="rbi" type="radio" name="r"><div class="topcoat-radio-button__checkmark"></div> One</label>
  <label id="rbd" class="topcoat-radio-button"><input id="rbdi" type="radio" name="r2" disabled><div class="topcoat-radio-button__checkmark"></div> Disabled</label>
  <label id="sw" class="topcoat-switch"><input id="swi" type="checkbox" class="topcoat-switch__input"><div class="topcoat-switch__toggle"></div></label>
  <label id="swd" class="topcoat-switch"><input id="swdi" type="checkbox" class="topcoat-switch__input" disabled><div class="topcoat-switch__toggle"></div></label>
  <input id="rg" type="range" class="topcoat-range">
  <input id="rgd" type="range" class="topcoat-range" disabled>`;

const style = (page, sel, prop, pseudo) =>
  page.$eval(sel, (el, [p, ps]) => getComputedStyle(el, ps || null)[p], [prop, pseudo]);

// [input selector, visible control selector, pseudo carrying the box-shadow]
const CONTROLS = {
  checkbox: ["#cbi", "#cb .topcoat-checkbox__checkmark", "::before"],
  radio: ["#rbi", "#rb .topcoat-radio-button__checkmark", "::before"],
  switch: ["#swi", "#sw .topcoat-switch__toggle", undefined],
};

for (const scheme of ["light", "dark"]) {
  for (const scale of ["desktop", "mobile"]) {
    const label = `${scheme}/${scale}`;

    for (const [name, [input, visible, pseudo]] of Object.entries(CONTROLS)) {
      test(`[${label}] ${name}: keyboard focus shows a ring on the visible control`, async () => {
        const { page, close } = await renderPage(MARKUP, { scheme, scale });
        assert.notEqual(await style(page, visible, "boxShadow", pseudo), "none");
        assert.ok(!(await style(page, visible, "boxShadow", pseudo)).includes(FOCUS_RING), "ring before focus");
        await page.focus(input);
        assert.ok((await style(page, visible, "boxShadow", pseudo)).includes(FOCUS_RING), "no focus ring on the visible control");
        assert.equal(await page.$eval(input, (el) => document.activeElement === el), true);
        await close();
      });

      test(`[${label}] ${name}: space bar toggles it and click toggles it`, async () => {
        const { page, close } = await renderPage(MARKUP, { scheme, scale });
        await page.focus(input);
        await page.keyboard.press("Space");
        assert.equal(await page.$eval(input, (el) => el.checked), true, "space should check");
        if (name !== "radio") {
          await page.click(visible, { force: true }); // the invisible native input sits on top of the mark, like a real click
          assert.equal(await page.$eval(input, (el) => el.checked), false, "click should uncheck");
        }
        await close();
      });
    }

    test(`[${label}] checked checkbox shows its checkmark, radio shows its dot`, async () => {
      const { page, close } = await renderPage(MARKUP, { scheme, scale });
      assert.equal(await style(page, "#cb .topcoat-checkbox__checkmark", "opacity", "::after"), "0");
      await page.click("#cb");
      assert.equal(await style(page, "#cb .topcoat-checkbox__checkmark", "opacity", "::after"), "1");
      await page.click("#rb");
      assert.equal(await style(page, "#rb .topcoat-radio-button__checkmark", "opacity", "::after"), "1");
      await close();
    });

    test(`[${label}] switch thumb moves when checked`, async () => {
      const { page, close } = await renderPage(MARKUP, { scheme, scale });
      const left = () => page.$eval("#sw .topcoat-switch__toggle", (el) => el.getBoundingClientRect().left);
      const off = await left();
      await page.check("#swi", { force: true });
      await page.waitForTimeout(200); // margin-left transition is 50ms
      assert.ok((await left()) - off > 10, "thumb should slide right");
      await close();
    });

    test(`[${label}] disabled toggles ignore clicks and are dimmed`, async () => {
      const { page, close } = await renderPage(MARKUP, { scheme, scale });
      for (const [lbl, input] of [["#cbd", "#cbdi"], ["#rbd", "#rbdi"], ["#swd", "#swdi"]]) {
        await page.click(lbl, { force: true });
        assert.equal(await page.$eval(input, (el) => el.checked), false, `${input} must not change`);
      }
      assert.equal(await style(page, "#cbd .topcoat-checkbox__checkmark", "opacity"), "0.3");
      assert.equal(await style(page, "#swd .topcoat-switch__toggle", "opacity"), "0.3");
      assert.equal(await style(page, "#rgd", "opacity"), "0.3");
      assert.equal(await style(page, "#rgd", "pointerEvents"), "none");
      await close();
    });

    test(`[${label}] checkbox mark follows the scale token`, async () => {
      const { page, close } = await renderPage(MARKUP, { scheme, scale });
      const w = await page.$eval("#cb .topcoat-checkbox__checkmark", (el) => el.getBoundingClientRect().width);
      assert.equal(w, scale === "mobile" ? 32 : 16);
      await close();
    });
  }
}
