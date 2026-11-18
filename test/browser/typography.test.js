import { test, after } from "node:test";
import assert from "node:assert/strict";
import { renderPage, closeBrowser } from "../helpers/browser.js";

after(closeBrowser);

const ROLES = ["caption", "control", "control-large", "body", "title", "display"];
const SAMPLE = ROLES.map((r) => `<p id="${r}" class="text-topcoat-${r}">Sample</p>`).join("");
const style = (page, sel, p) => page.$eval(sel, (el, prop) => getComputedStyle(el)[prop], p);
const size = async (page, role) => parseFloat(await style(page, `#${role}`, "fontSize"));

for (const scale of ["desktop", "mobile"]) {
  test(`[${scale}] type scale is ordered and every role carries a proportional line-height`, async () => {
    const { page, close } = await renderPage(SAMPLE, { scale });
    const s = Object.fromEntries(await Promise.all(ROLES.map(async (r) => [r, await size(page, r)])));
    assert.ok(s.caption < s.control && s.control < s["control-large"], `control sizes out of order: ${JSON.stringify(s)}`);
    assert.ok(s.caption < s.body && s.body < s.title && s.title < s.display, `prose sizes out of order: ${JSON.stringify(s)}`);
    for (const r of ROLES) {
      const lh = parseFloat(await style(page, `#${r}`, "lineHeight"));
      assert.ok(lh >= s[r] * 1.1 && lh <= s[r] * 1.6, `${r}: line-height ${lh}px for ${s[r]}px text`);
    }
    assert.equal(parseFloat(await style(page, "#body", "lineHeight")) / s.body, 1.5, "body is 1.5");
    await close();
  });
}

test("prose roles are larger on mobile; control roles follow the control font size", async () => {
  const d = await renderPage(SAMPLE, { scale: "desktop" });
  const m = await renderPage(SAMPLE, { scale: "mobile" });
  for (const r of ["body", "title", "display"]) assert.ok((await size(m.page, r)) > (await size(d.page, r)), `${r} should grow on mobile`);
  assert.equal(await size(d.page, "control"), 12);
  assert.equal(await size(m.page, "control"), 16);
  await d.close(); await m.close();
});

test("weights, families and leading utilities resolve to the defined tokens", async () => {
  const html = `<p id="r" class="font-topcoat-regular">r</p><p id="md" class="font-topcoat-medium">m</p><p id="st" class="font-topcoat-strong">s</p>
    <p id="fam" class="font-topcoat">f</p><p id="mono" class="font-topcoat-mono">m</p>
    <p id="lt" class="text-topcoat-body leading-topcoat-tight">t</p>`;
  const { page, close } = await renderPage(html);
  assert.deepEqual(await Promise.all(["#r", "#md", "#st"].map((s) => style(page, s, "fontWeight"))), ["400", "500", "600"]);
  assert.match(await style(page, "#fam", "fontFamily"), /^"Source Sans 3", "Source Sans Pro"/);
  assert.match(await style(page, "#mono", "fontFamily"), /monospace/);
  const lt = parseFloat(await style(page, "#lt", "lineHeight")) / parseFloat(await style(page, "#lt", "fontSize"));
  assert.ok(Math.abs(lt - 1.2) < 0.01, `leading-topcoat-tight should be 1.2, got ${lt}`);
  await close();
});

test("components inherit the page font: the theme never forces a family on controls", async () => {
  const html = `<div class="font-topcoat-mono"><button id="b" class="topcoat-button">b</button><input id="i" class="topcoat-text-input">
    <select id="s" class="topcoat-select"><option>a</option></select><textarea id="t" class="topcoat-textarea"></textarea>
    <label id="l" class="topcoat-field__label">l</label><span id="tt" class="topcoat-tooltip">t</span></div>`;
  const { page, close } = await renderPage(html);
  const host = await style(page, ".font-topcoat-mono", "fontFamily");
  for (const id of ["#b", "#i", "#s", "#t", "#l", "#tt"]) assert.equal(await style(page, id, "fontFamily"), host, `${id} must inherit the page font`);
  await close();
});

for (const scale of ["desktop", "mobile"]) {
  test(`[${scale}] textarea text follows the scale (body, and title when large) instead of fixed rem values`, async () => {
    const html = `<textarea id="t" class="topcoat-textarea"></textarea><textarea id="tl" class="topcoat-textarea--large"></textarea><p id="body" class="text-topcoat-body">b</p><p id="title" class="text-topcoat-title">t</p>`;
    const { page, close } = await renderPage(html, { scale });
    assert.equal(await style(page, "#t", "fontSize"), await style(page, "#body", "fontSize"));
    assert.equal(await style(page, "#tl", "fontSize"), await style(page, "#title", "fontSize"));
    await close();
  });
}
