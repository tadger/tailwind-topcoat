import { test, after } from "node:test";
import assert from "node:assert/strict";
import { renderPage, closeBrowser } from "../helpers/browser.js";
import { contrast, hueDistance } from "../helpers/color.js";

after(closeBrowser);

const RING = "rgb(111, 181, 241)";
const MATRIX = [["light", "desktop"], ["dark", "desktop"], ["light", "mobile"], ["dark", "mobile"]];

/** Resolve a --tc-* color token to a computed rgb() string, via a probe element. */
const tokenColor = (page, name) =>
  page.evaluate((n) => {
    const p = document.createElement("div");
    p.style.cssText = `position:absolute;background:var(${n})`;
    document.getElementById("root").appendChild(p);
    const c = getComputedStyle(p).backgroundColor;
    p.remove();
    return c;
  }, name);
const css = (page, sel, props) => page.$eval(sel, (el, ps) => Object.fromEntries(ps.map((p) => [p, getComputedStyle(el)[p]])), props);
const rect = (page, sel) => page.$eval(sel, (el) => { const r = el.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, h: r.height }; });

// ---------- 1. aria-pressed ----------
const PRESSED = `
  <button id="on" class="topcoat-button" aria-pressed="true">On</button>
  <button id="off" class="topcoat-button" aria-pressed="false">Off</button>
  <button id="none" class="topcoat-button">None</button>
  <button id="hov" class="topcoat-button">Hover</button>
  <div class="topcoat-button-bar">
    <div class="topcoat-button-bar__item"><button id="b1" class="topcoat-button-bar__button" aria-pressed="true">Tree</button></div>
    <div class="topcoat-button-bar__item"><button id="b2" class="topcoat-button-bar__button">Raw</button></div>
  </div>`;
const LOOK = ["backgroundColor", "boxShadow", "borderTopColor"];

for (const [scheme, scale] of MATRIX) {
  const label = `${scheme}/${scale}`;

  test(`[${label}] aria-pressed="true" looks selected; false and absent are unchanged`, async () => {
    const { page, close } = await renderPage(PRESSED, { scheme, scale });
    const [active, raised] = await Promise.all([tokenColor(page, "--tc-surface-active"), tokenColor(page, "--tc-surface-raised")]);
    assert.equal((await css(page, "#on", LOOK)).backgroundColor, active, "pressed button uses --tc-surface-active");
    assert.equal((await css(page, "#off", LOOK)).backgroundColor, raised);
    assert.deepEqual(await css(page, "#off", LOOK), await css(page, "#none", LOOK), "false == absent");
    assert.notEqual((await css(page, "#on", LOOK)).boxShadow, (await css(page, "#none", LOOK)).boxShadow);
    assert.equal((await css(page, "#b1", LOOK)).backgroundColor, active, "bar segment is selected too");
    assert.equal((await css(page, "#b2", LOOK)).backgroundColor, raised);
    await close();
  });

  test(`[${label}] a hovered button reads differently from a pressed one, and focus still glows on a pressed one`, async () => {
    const { page, close } = await renderPage(PRESSED, { scheme, scale });
    const pressedBg = (await css(page, "#on", LOOK)).backgroundColor;
    await page.hover("#hov");
    const hoverBg = (await css(page, "#hov", LOOK)).backgroundColor;
    assert.notEqual(hoverBg, pressedBg, "hover must not look pressed");
    assert.notEqual(hoverBg, await tokenColor(page, "--tc-surface-raised"), "hover differs from rest");
    await page.mouse.move(0, 700);
    await page.focus("#on");
    assert.ok((await css(page, "#on", LOOK)).boxShadow.includes(RING), "focus ring on a pressed button");
    assert.equal((await css(page, "#on", LOOK)).backgroundColor, pressedBg, "still pressed while focused");
    await page.hover("#on");
    assert.equal((await css(page, "#on", LOOK)).backgroundColor, pressedBg, "hovering a pressed button keeps it pressed");
    await close();
  });
}

// ---------- 2. select ----------
const SELECT = `
  <input id="ti" class="topcoat-text-input" value="text">
  <select id="s" class="topcoat-select"><option>One</option><option>Two</option></select>
  <input id="tl" class="topcoat-text-input--large" value="text">
  <select id="sl" class="topcoat-select--large"><option>One</option></select>
  <select id="sd" class="topcoat-select" disabled><option>Off</option></select>
  <input id="td" class="topcoat-text-input" disabled value="off">`;
const BOX = ["height", "paddingLeft", "borderTopWidth", "borderTopStyle", "borderTopColor", "borderTopLeftRadius", "backgroundColor", "color", "fontSize", "boxShadow"];

for (const [scheme, scale] of MATRIX) {
  const label = `${scheme}/${scale}`;

  test(`[${label}] select matches text input height, border, radius and colors (normal, large, disabled)`, async () => {
    const { page, close } = await renderPage(SELECT, { scheme, scale });
    for (const [a, b] of [["#ti", "#s"], ["#tl", "#sl"], ["#td", "#sd"]]) {
      const { height: ha, ...restA } = await css(page, a, BOX);
      const { height: hb, ...restB } = await css(page, b, BOX);
      assert.deepEqual(restB, restA, `${b} differs from ${a}`);
      assert.ok(Math.abs(parseFloat(ha) - parseFloat(hb)) < 0.1, `${b} height ${hb} vs ${a} ${ha}`); // sub-pixel layout rounding only
    }
    await close();
  });

  test(`[${label}] select focus glow and disabled dimming match the text input`, async () => {
    const { page, close } = await renderPage(SELECT, { scheme, scale });
    await page.focus("#ti");
    const inputFocus = await css(page, "#ti", ["boxShadow", "borderTopColor"]);
    await page.focus("#s");
    assert.deepEqual(await css(page, "#s", ["boxShadow", "borderTopColor"]), inputFocus);
    assert.ok(inputFocus.boxShadow.includes(RING));
    assert.equal((await css(page, "#sd", ["opacity"])).opacity, "0.3");
    assert.equal((await css(page, "#sd", ["pointerEvents"])).pointerEvents, "none");
    await close();
  });

  test(`[${label}] select chevron follows --tc-text-muted and the text never runs under it`, async () => {
    const { page, close } = await renderPage(SELECT, { scheme, scale });
    const muted = await tokenColor(page, "--tc-text-muted");
    const { backgroundImage } = await css(page, "#s", ["backgroundImage"]);
    assert.ok(backgroundImage.includes(muted), `chevron should be drawn in ${muted}; got ${backgroundImage}`);
    const clear = await page.$eval("#s", (el) => {
      const cs = getComputedStyle(el);
      const px = (v) => { const p = document.createElement("span"); p.style.cssText = `position:absolute;visibility:hidden;width:${v.trim()}`; el.parentElement.appendChild(p); const w = p.getBoundingClientRect().width; p.remove(); return w; };
      const footprint = px(cs.getPropertyValue("--tc-select-arrow-offset")) + 2 * px(cs.getPropertyValue("--tc-select-arrow-size"));
      return parseFloat(cs.paddingRight) - footprint;
    });
    assert.ok(clear >= 2, `text padding leaves ${clear}px beside the chevron`);
    await close();
  });
}

test("select: right-to-left mirrors the chevron and the padding", async () => {
  const { page, close } = await renderPage(SELECT, { dir: "rtl" });
  const r = await css(page, "#s", ["paddingLeft", "paddingRight", "backgroundPositionX"]);
  assert.ok(parseFloat(r.paddingLeft) > parseFloat(r.paddingRight), "arrow room must be on the left in rtl");
  assert.doesNotMatch(r.backgroundPositionX, /100%/, "chevron anchored to the left in rtl");
  await close();
});

test("select: keyboard and native behavior still work", async () => {
  const { page, close } = await renderPage(SELECT);
  await page.focus("#s");
  await page.keyboard.type("T"); // type-ahead works on a closed select on every platform (ArrowDown opens it on macOS)
  assert.equal(await page.$eval("#s", (el) => el.value), "Two");
  await close();
});

// ---------- 3. field ----------
const FIELD = `
  <div id="f" class="topcoat-field">
    <label id="l" class="topcoat-field__label" for="x">Name</label>
    <input id="x" class="topcoat-text-input" aria-describedby="m">
    <p id="m" class="topcoat-field__message">Shown in the list</p>
  </div>
  <div class="topcoat-field">
    <label class="topcoat-field__label" for="y">Tempo</label>
    <input id="y" class="topcoat-text-input" aria-describedby="e">
    <p id="e" class="topcoat-field__message topcoat-field__message--invalid">Too fast</p>
  </div>
  <div class="topcoat-field">
    <input id="z" class="topcoat-text-input">
    <p id="a" class="topcoat-field__message" role="alert">Alert text</p>
  </div>
  <input id="outside" class="topcoat-text-input">`;

for (const [scheme, scale] of MATRIX) {
  const label = `${scheme}/${scale}`;

  test(`[${label}] field: label above the control, message below, control left unstyled`, async () => {
    const { page, close } = await renderPage(FIELD, { scheme, scale });
    const [l, c, m] = await Promise.all([rect(page, "#l"), rect(page, "#x"), rect(page, "#m")]);
    assert.ok(l.bottom <= c.top + 0.5, "label sits above the control");
    assert.ok(m.top >= c.bottom - 0.5, "message sits below the control");
    assert.deepEqual(await css(page, "#x", BOX), await css(page, "#outside", BOX), "wrapper must not restyle the control");
    assert.equal((await css(page, "#l", ["color"])).color, await tokenColor(page, "--tc-text"));
    assert.ok(parseFloat((await css(page, "#m", ["fontSize"])).fontSize) < parseFloat((await css(page, "#l", ["fontSize"])).fontSize), "message is smaller than the label");
    await close();
  });

  test(`[${label}] field: invalid and role=alert messages render alike and are readable`, async () => {
    const { page, close } = await renderPage(FIELD, { scheme, scale });
    const P = ["color", "fontSize", "fontWeight"];
    const invalid = await css(page, "#e", P);
    assert.deepEqual(await css(page, "#a", P), invalid, "[role=alert] == --invalid");
    assert.equal(invalid.color, await tokenColor(page, "--tc-invalid-text"));
    assert.notEqual((await css(page, "#m", ["color"])).color, invalid.color, "help text is not error-colored");
    for (const bg of ["--tc-page-bg", "--tc-surface"]) {
      const ratio = contrast(invalid.color, await tokenColor(page, bg));
      assert.ok(ratio >= 4.5, `invalid text on ${bg}: ${ratio.toFixed(2)}:1`);
    }
    const help = await css(page, "#m", ["color"]);
    assert.ok(contrast(help.color, await tokenColor(page, "--tc-page-bg")) >= 4.5, "help text readable on the page");
    await close();
  });
}

test("field: spacing between label, control and message is the same on desktop and mobile", async () => {
  const gaps = [];
  for (const scale of ["desktop", "mobile"]) {
    const { page, close } = await renderPage(FIELD, { scale });
    const [l, c, m] = await Promise.all([rect(page, "#l"), rect(page, "#x"), rect(page, "#m")]);
    gaps.push([c.top - l.bottom, m.top - c.bottom]);
    await close();
  }
  assert.ok(Math.abs(gaps[0][0] - gaps[1][0]) < 0.5 && Math.abs(gaps[0][1] - gaps[1][1]) < 0.5, `gaps differ: ${JSON.stringify(gaps)}`);
});

// ---------- 4. highlight ----------
for (const scheme of ["light", "dark"]) {
  test(`[${scheme}] --tc-highlight reads against page and surface, and is not the focus color`, async () => {
    const html = `<div id="u" class="bg-topcoat-highlight ring-2 ring-topcoat-highlight" style="width:10px;height:10px"></div>`;
    const { page, close } = await renderPage(html, { scheme });
    const hl = await tokenColor(page, "--tc-highlight");
    for (const bg of ["--tc-page-bg", "--tc-surface"]) {
      const ratio = contrast(hl, await tokenColor(page, bg));
      assert.ok(ratio >= 3, `highlight on ${bg}: ${ratio.toFixed(2)}:1 (needs 3:1 for UI)`);
    }
    for (const focus of ["--tc-focus-border", "--tc-focus-ring"]) {
      assert.ok(hueDistance(hl, await tokenColor(page, focus)) >= 90, `highlight hue is too close to ${focus}`);
    }
    assert.ok(hueDistance(hl, await tokenColor(page, "--tc-invalid")) >= 20, "highlight must not look like invalid red");
    assert.equal((await css(page, "#u", ["backgroundColor"])).backgroundColor, hl, "bg-topcoat-highlight utility follows the token");
    await close();
  });
}

// ---------- 5. tooltip ----------
for (const [scheme, scale] of MATRIX) {
  test(`[${scheme}/${scale}] tooltip is readable skin only: no wrap, no pointer events, no positioning`, async () => {
    const html = `<div id="host" style="width:40px"><span id="t" class="topcoat-tooltip" role="tooltip">0.8 and a long value</span></div>`;
    const { page, close } = await renderPage(html, { scheme, scale });
    const t = await css(page, "#t", ["color", "backgroundColor", "whiteSpace", "pointerEvents", "position", "borderTopStyle", "borderTopLeftRadius", "fontSize", "zIndex", "top", "left"]);
    assert.equal(t.whiteSpace, "nowrap");
    assert.equal(t.pointerEvents, "none");
    assert.equal(t.position, "static", "the consumer positions the tooltip");
    assert.equal(t.zIndex, "auto");
    assert.equal(t.borderTopStyle, "solid");
    assert.notEqual(t.borderTopLeftRadius, "0px");
    const controlSize = await page.evaluate(() => { const i = document.createElement("input"); i.className = "topcoat-text-input"; document.getElementById("root").appendChild(i); const f = getComputedStyle(i).fontSize; i.remove(); return f; });
    assert.equal(t.fontSize, controlSize, "tooltip text is the scale's small control size (12px desktop), not inherited");
    const more = await css(page, "#t", ["display", "transform", "marginTop", "marginLeft", "backgroundColor"]);
    assert.equal(more.display, "inline");
    assert.equal(more.transform, "none");
    assert.equal(more.marginTop + more.marginLeft, "0px0px");
    assert.equal(t.top + t.left, "autoauto", "no offsets");
    assert.equal(more.backgroundColor, await tokenColor(page, "--tc-surface"), "tooltip uses --tc-surface");
    assert.ok(contrast(t.color, t.backgroundColor) >= 4.5, `tooltip text contrast ${contrast(t.color, t.backgroundColor).toFixed(2)}:1`);
    await close();
  });
}

test("select: a multi-row listbox (multiple or size>1) keeps its natural height and has no chevron", async () => {
  const html = `<select id="m" class="topcoat-select" multiple size="3"><option>a</option><option>b</option><option>c</option></select>
    <select id="z" class="topcoat-select" size="5"><option>a</option><option>b</option><option>c</option></select>
    <select id="one" class="topcoat-select" size="1"><option>a</option></select>`;
  const { page, close } = await renderPage(html);
  const single = (await rect(page, "#one")).h;
  for (const id of ["#m", "#z"]) {
    assert.ok((await rect(page, id)).h > single * 2, `${id} should show several rows`);
    assert.equal((await css(page, id, ["backgroundImage"])).backgroundImage, "none", `${id} must not draw a chevron`);
  }
  assert.notEqual((await css(page, "#one", ["backgroundImage"])).backgroundImage, "none", "size=1 is a drop-down: keeps its chevron");
  await close();
});


// =============== review fixes ===============
const px = (page, sel, varName) => page.$eval(sel, (el, v) => {
  const p = document.createElement("span");
  p.style.cssText = `position:absolute;visibility:hidden;width:${getComputedStyle(el).getPropertyValue(v).trim()}`;
  el.parentElement.appendChild(p);
  const w = p.getBoundingClientRect().width;
  p.remove();
  return w;
}, varName);

test("field: controls keep their natural width (the wrapper must not stretch them)", async () => {
  const html = `<div style="width:500px">
    <div class="topcoat-field"><input id="fi" class="topcoat-text-input"><select id="fs" class="topcoat-select"><option>a</option></select>
      <button id="fb" class="topcoat-button">Go</button><label id="fc" class="topcoat-checkbox"><input type="checkbox"><div class="topcoat-checkbox__checkmark"></div> Yes</label></div>
    <input id="oi" class="topcoat-text-input"><select id="os" class="topcoat-select"><option>a</option></select>
    <button id="ob" class="topcoat-button">Go</button><label id="oc" class="topcoat-checkbox"><input type="checkbox"><div class="topcoat-checkbox__checkmark"></div> Yes</label></div>`;
  const { page, close } = await renderPage(html);
  const w = (sel) => page.$eval(sel, (el) => el.getBoundingClientRect().width);
  for (const [inside, outside] of [["#fi", "#oi"], ["#fs", "#os"], ["#fb", "#ob"], ["#fc", "#oc"]]) {
    assert.ok(Math.abs((await w(inside)) - (await w(outside))) < 1, `${inside} is ${await w(inside)}px inside the field vs ${await w(outside)}px outside`);
  }
  await close();
});

test("field: the label is set at the scale's control font size", async () => {
  for (const scale of ["desktop", "mobile"]) {
    const { page, close } = await renderPage(FIELD, { scale });
    assert.equal((await css(page, "#l", ["fontSize"])).fontSize, (await css(page, "#x", ["fontSize"])).fontSize);
    await close();
  }
});

// highlight / invalid-text: contrast on every surface where they can really appear
const LIGHT_AND_DARK = ["light", "dark"];
for (const scheme of LIGHT_AND_DARK) {
  test(`[${scheme}] highlight holds 3:1 on every surface, and its on-color text holds 4.5:1`, async () => {
    const { page, close } = await renderPage(`<div id="u" class="bg-topcoat-highlight text-topcoat-on-highlight ring-2 ring-topcoat-highlight">x</div>`, { scheme });
    const hl = await tokenColor(page, "--tc-highlight");
    for (const bg of ["--tc-page-bg", "--tc-surface", "--tc-surface-raised", "--tc-surface-sunken", "--tc-surface-active", "--tc-surface-hover", "--tc-input-bg", "--tc-list-bg"]) {
      const ratio = contrast(hl, await tokenColor(page, bg));
      assert.ok(ratio >= 3, `highlight on ${bg}: ${ratio.toFixed(2)}:1`);
    }
    const u = await css(page, "#u", ["color", "backgroundColor", "boxShadow"]);
    assert.equal(u.color, await tokenColor(page, "--tc-text-on-highlight"), "text-topcoat-on-highlight utility");
    assert.ok(contrast(u.color, u.backgroundColor) >= 4.5, `text on a highlight fill: ${contrast(u.color, u.backgroundColor).toFixed(2)}:1`);
    assert.ok(u.boxShadow.includes(hl), `ring-topcoat-highlight must paint the highlight color; got ${u.boxShadow}`);
    await close();
  });

  test(`[${scheme}] --tc-invalid-text holds 4.5:1 on every surface a message can sit on`, async () => {
    const { page, close } = await renderPage(`<p>x</p>`, { scheme });
    const c = await tokenColor(page, "--tc-invalid-text");
    for (const bg of ["--tc-page-bg", "--tc-surface", "--tc-surface-raised", "--tc-input-bg", "--tc-input-bg-focus"]) {
      const ratio = contrast(c, await tokenColor(page, bg));
      assert.ok(ratio >= 4.5, `invalid text on ${bg}: ${ratio.toFixed(2)}:1`);
    }
    await close();
  });
}

// select: geometry of the chevron, hit-testing, validity, forced colors
for (const [scheme, scale] of [["light", "desktop"], ["dark", "mobile"]]) {
  test(`[${scheme}/${scale}] select chevron is drawn at the right edge with the token size and offset`, async () => {
    const { page, close } = await renderPage(SELECT, { scheme, scale });
    const g = await css(page, "#s", ["backgroundSize", "backgroundRepeat", "backgroundPositionX", "backgroundPositionY"]);
    const size = await px(page, "#s", "--tc-select-arrow-size");
    const offset = await px(page, "#s", "--tc-select-arrow-offset");
    assert.equal(g.backgroundRepeat, "no-repeat");
    assert.deepEqual(g.backgroundSize.split(",").map((v) => v.trim()), [`${size}px ${size}px`, `${size}px ${size}px`]);
    const fromRight = [...g.backgroundPositionX.matchAll(/calc\(100% - ([\d.]+)px\)/g)].map((m) => Number(m[1]));
    assert.equal(fromRight.length, 2, `expected two right-anchored halves, got ${g.backgroundPositionX}`);
    assert.ok(Math.abs(fromRight[1] - offset) < 0.1, `right half should end ${offset}px from the edge, got ${fromRight[1]}`);
    assert.ok(Math.abs(fromRight[0] - (offset + size)) < 0.1, `left half should end ${offset + size}px from the edge, got ${fromRight[0]}`);
    assert.equal(g.backgroundPositionY, "50%, 50%");
    await close();
  });
}

test("select: an enabled select receives pointer events at its center", async () => {
  const { page, close } = await renderPage(SELECT);
  const hit = await page.$eval("#s", (el) => { const r = el.getBoundingClientRect(); return document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) === el; });
  assert.equal(hit, true);
  await close();
});

const INVALID = `<select id="sv" class="topcoat-select" required><option value="">Pick</option><option>a</option></select>
  <select id="so" class="topcoat-select"><option>a</option></select>
  <input id="iv" class="topcoat-text-input" required>
  <input id="ia" class="topcoat-text-input" aria-invalid="true" value="x">
  <textarea id="ta" class="topcoat-textarea" aria-invalid="true"></textarea>
  <select id="sa" class="topcoat-select" aria-invalid="true"><option>a</option></select>`;
for (const scheme of LIGHT_AND_DARK) {
  test(`[${scheme}] invalid state: required-empty select, and aria-invalid on inputs, textareas and selects, show the invalid border`, async () => {
    const { page, close } = await renderPage(INVALID, { scheme });
    const red = await tokenColor(page, "--tc-invalid");
    const normal = (await css(page, "#so", ["borderTopColor"])).borderTopColor;
    assert.notEqual(normal, red);
    for (const id of ["#sv", "#iv", "#ia", "#ta", "#sa"]) assert.equal((await css(page, id, ["borderTopColor"])).borderTopColor, red, `${id} border`);
    await close();
  });
}

test("select: forced-colors mode gets the native arrow back (gradients are dropped there)", async () => {
  const { page, close } = await renderPage(SELECT, { forcedColors: "active" });
  assert.equal((await css(page, "#s", ["appearance"])).appearance, "auto");
  await close();
});

// pressed state: variants, exclusions, hover shadow
const PRESS2 = `
  <button id="q" class="topcoat-button--quiet" aria-pressed="true">q</button>
  <button id="qn" class="topcoat-button--quiet">q</button>
  <button id="l" class="topcoat-button--large" aria-pressed="true">l</button>
  <button id="lq" class="topcoat-button--large--quiet" aria-pressed="true">lq</button>
  <button id="c" class="topcoat-button--cta" aria-pressed="true">c</button>
  <button id="cn" class="topcoat-button--cta">c</button>
  <button id="ib" class="topcoat-icon-button" aria-pressed="true"><span class="topcoat-icon"></span></button>
  <button id="ibn" class="topcoat-icon-button"><span class="topcoat-icon"></span></button>
  <button id="ibq" class="topcoat-icon-button--quiet" aria-pressed="true"><span class="topcoat-icon"></span></button>
  <button id="d" class="topcoat-button" aria-pressed="true" disabled>d</button>`;
for (const scheme of LIGHT_AND_DARK) {
  test(`[${scheme}] pressed: quiet, large and icon variants are selected; the CTA keeps its look; disabled stays disabled`, async () => {
    const { page, close } = await renderPage(PRESS2, { scheme });
    const active = await tokenColor(page, "--tc-surface-active");
    for (const id of ["#q", "#l", "#lq", "#ib", "#ibq"]) assert.equal((await css(page, id, LOOK)).backgroundColor, active, `${id} should be selected`);
    assert.equal((await css(page, "#qn", LOOK)).backgroundColor, "rgba(0, 0, 0, 0)", "unpressed quiet stays transparent");
    assert.notEqual((await css(page, "#ibn", LOOK)).backgroundColor, active);
    assert.deepEqual(await css(page, "#c", LOOK), await css(page, "#cn", LOOK), "aria-pressed must not change a CTA");
    assert.equal((await css(page, "#d", ["opacity"])).opacity, "0.3");
    assert.equal((await css(page, "#d", ["pointerEvents"])).pointerEvents, "none");
    await close();
  });

  test(`[${scheme}] a pressed quiet or icon button keeps the pressed shadow while hovered`, async () => {
    const { page, close } = await renderPage(PRESS2, { scheme });
    for (const id of ["#q", "#lq", "#ibq"]) {
      const rest = (await css(page, id, LOOK)).boxShadow;
      await page.hover(id);
      assert.equal((await css(page, id, LOOK)).boxShadow, rest, `${id} shadow changed on hover`);
      await page.mouse.move(0, 700);
    }
    await close();
  });
}
