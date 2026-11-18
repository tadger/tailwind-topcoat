# tailwind-topcoat Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A Tailwind CSS v4 plugin that reproduces Topcoat's look (14 components, light/dark, desktop/mobile) with a fixed search input, plus a demo page.

**Architecture:** Design tokens are `--tc-*` CSS custom properties in a CSS file (`@layer base`), switched by Tailwind's `dark` variant and a `data-topcoat="mobile"` attribute, and exposed to Tailwind utilities via `@theme inline`. Components are CSS-in-JS objects (one file each) registered with `addComponents` that read only the variables, so each rule is written once for all four themes.

**Tech Stack:** Tailwind CSS 4.3.x, Node 26 (ESM), pnpm, `node:test`, postcss (test parsing), Playwright/Chromium (browser checks).

**Spec:** `docs/superpowers/specs/2026-11-18-tailwind-topcoat-design.md`

## Global Constraints

- Tailwind v4 only, loaded as `@plugin`; no v3 support, no old-browser prefixes.
- Topcoat class names and modifiers are kept verbatim (`topcoat-button--cta`, `topcoat-list__item`, ...). The authoritative list is the `topdoc` markup comments in the reference CSS.
- Light/dark follows Tailwind's `dark` variant (`@variant dark`), never a hard-coded `prefers-color-scheme` rule, so a `@custom-variant dark` override works.
- Desktop vs mobile is `data-topcoat="mobile"` on any ancestor; desktop is the default.
- Components live in Tailwind's components layer, so ordinary utilities (`topcoat-button px-6`) override them.
- Reference is Topcoat 0.8.0 compiled CSS (`css/topcoat-{desktop,mobile}-{light,dark}.css` in `topcoat/topcoat`), fetched into a gitignored `reference/`; it is never committed or shipped.
- Keep Topcoat's gradients, inset highlights and focus glow. Target is same look, not pixel identity.
- Repo is private `tadger/tailwind-topcoat`, branch `main`; Apache-2.0 with a Topcoat attribution in `NOTICE`.

## Review Focus

- Keyboard focus on checkbox/radio/switch: the native input stays focusable (not `display:none`) and a focus ring appears on the visible control.
- Disabled controls ignore hover/active/focus styling and pointer events (button, inputs, range, switch).
- Right-to-left (`dir="rtl"`): search icon and text padding flip, no overlap.
- Nested scopes: `data-topcoat="mobile"` inside a desktop page (and the reverse) applies only to its subtree.
- Long or wrapping content: button text, list items, notification text, and search text longer than the box don't overlap icons or overflow their container.

## File Structure

```
package.json, .gitignore, LICENSE, NOTICE, README.md
index.css                 public entry: @import theme, @plugin src/index.js
theme.css                 --tc-* tokens (@layer base) + @theme inline mapping
src/index.js              plugin: registers components via addComponents
src/components/<name>.js  one CSS-in-JS object per component
src/components/index.js   merges all component objects
scripts/fetch-reference.sh  downloads Topcoat CSS into reference/
test/helpers/build.js     buildCss(); test/helpers/topdoc.js; test/helpers/browser.js
test/*.test.js, test/browser/*.test.js
demo/index.html, demo/demo.css, scripts/build-demo.sh -> demo/dist/
```

---

### Task 1: Scaffold, plugin skeleton, build/test helpers

**Files:**
- Create: `package.json`, `.gitignore` (ignores `node_modules`, `reference/`, `demo/dist/`, `test/screenshots/`), `index.css`, `theme.css` (empty `@layer base {}` for now), `src/index.js`, `src/components/index.js`, `scripts/fetch-reference.sh`, `test/helpers/build.js`, `test/helpers/topdoc.js`, `test/plugin.test.js`

**Interfaces:**
- Produces:
  - `src/components/index.js`: `export default {}` (object of CSS-in-JS rules; later tasks add one spread per component file).
  - `src/index.js`: `export default plugin(({ addComponents }) => addComponents(components))`.
  - `test/helpers/build.js`: `buildCss({ candidates?: string[] }): Promise<string>` compiles a stylesheet equal to `@import "tailwindcss"; @import "../../index.css";` and returns CSS text.
  - `test/helpers/topdoc.js`: `topdocClasses(component: string): Set<string>` returns every `topcoat-*` class used in the topdoc `markup:` blocks for that component in `reference/topcoat-desktop-light.css` (component = section `name`, e.g. `"Search Input"`).
  - `package.json` scripts: `reference` (runs fetch script), `test` (`node --test test/*.test.js`), `test:browser` (`node --test test/browser/*.test.js`), `build:demo`. `index.css` is exposed via `exports` as `.`.
- Consumes: nothing.

- [ ] **Step 1: Write the failing test** `test/plugin.test.js` — `"plugin loads and builds"`: `buildCss({})` resolves to a string and does not throw. Also `"index.css is the package entry"`: `package.json` `exports["."]` is `./index.css`.
- [ ] **Step 2:** Run `pnpm test` → FAIL (nothing exists).
- [ ] **Step 3:** `pnpm init`, add `tailwindcss@4.3`, `@tailwindcss/node`, `postcss`, `playwright` as dev deps. Implement files above. `scripts/fetch-reference.sh` fetches the four Topcoat CSS files with `gh api repos/topcoat/topcoat/contents/css/<file> --jq .content | base64 -d` into `reference/`. `index.css` contains `@import "./theme.css"; @plugin "./src/index.js";` — verify that `@plugin` with a relative path resolves when `index.css` is imported from another directory; if it does not, ship `index.css` as the plugin entry through the `exports` map and note the exact usage line in the README.
- [ ] **Step 4:** `pnpm run reference && pnpm test` → PASS.
- [ ] **Step 5:** Commit `chore: scaffold plugin and test helpers`.

### Task 2: Design tokens (four themes)

**Files:**
- Modify: `theme.css`
- Test: `test/tokens.test.js`

**Interfaces:**
- Consumes: `buildCss`.
- Produces: the `--tc-*` contract every component relies on. Light values on `:root`; dark values inside `@variant dark { :root { ... } }`; mobile scale in `[data-topcoat="mobile"] { ... }` (and the same selector nested under `@variant dark` for any mobile color differences). Roles to cover (names fixed, values read from the four reference files): `--tc-font-family`, `--tc-text`, `--tc-text-muted`, `--tc-text-on-accent`, `--tc-surface`, `--tc-surface-raised`, `--tc-border`, `--tc-accent`, `--tc-cta-bg`/`--tc-cta-border`, `--tc-focus-border`, `--tc-focus-ring`, `--tc-shadow-inset`, `--tc-disabled-opacity`, and for sizes `--tc-control-height`, `--tc-control-height-large`, `--tc-font-size`, `--tc-font-size-large`, `--tc-padding-x`, `--tc-radius`, `--tc-radius-pill`. Add further roles as components need them (gradients as `--tc-*-gradient`), always in both light and dark.
- `[data-topcoat="desktop"]` restores the desktop size tokens (explicit reset, so a desktop subtree can sit inside a mobile one); the desktop values are shared with `:root` via a combined selector, not duplicated.
- `@theme inline` maps a subset to utilities: `--color-topcoat-surface`, `--color-topcoat-text`, `--color-topcoat-accent`, `--color-topcoat-border`, `--radius-topcoat`, `--shadow-topcoat-inset`, each `var(--tc-…)`.

- [ ] **Step 1: Write failing tests** `test/tokens.test.js` using postcss on `buildCss({ candidates: ["bg-topcoat-surface"] })`:
  - `"light and dark define the same --tc-* keys"` (names set in `:root` equals names set inside the dark media rule; dark ⊆ light is not enough).
  - `"mobile scale redefines size tokens"`: a `[data-topcoat="mobile"]` rule exists and sets `--tc-control-height` to a value different from desktop's.
  - `"theme utilities exist"`: output contains `.bg-topcoat-surface` referencing `var(--tc-surface)`.
- [ ] **Step 2:** `pnpm test` → FAIL.
- [ ] **Step 3:** Fill `theme.css` by diffing the four reference builds (desktop-light is the base; record what dark and mobile change).
- [ ] **Step 4:** `pnpm test` → PASS.
- [ ] **Step 5:** Commit `feat: design tokens for light/dark and desktop/mobile`.

### Task 3: Component test harness + buttons (button, icon-button, button-bar)

**Files:**
- Create: `src/components/button.js`, `icon-button.js`, `button-bar.js`, `test/components.test.js`
- Modify: `src/components/index.js`

**Interfaces:**
- Each `src/components/<name>.js`: `export default { ".topcoat-…": { …declarations using var(--tc-*) }, … }` (nested CSS-in-JS accepted by `addComponents`). Selectors cover every class in the topdoc markup for the component(s).
- `test/components.test.js` exports nothing; it defines `assertCovers(componentName: string, css: string): void` used by later tasks' test blocks in the same file — fails listing missing selectors, computed from `topdocClasses(componentName)`.

- [ ] **Step 1: Failing tests:** for each of `"Button"`, `"Icon Button"`, `"Button Bar"`: built CSS contains a rule for every `topdocClasses` class. Plus `"button uses tokens only"`: the `.topcoat-button` rule contains no hex color literals (only `var(--tc-*)`). Plus override test `"utilities override components"`: `buildCss({candidates:["px-6"]})` places `.px-6` after `.topcoat-button` in output order.
- [ ] **Step 2:** `pnpm test` → FAIL.
- [ ] **Step 3:** Implement the three files from the reference rules (default, `:hover`, `:active`, `:focus`, `:disabled`, `--quiet`, `--large`, `--cta`, button-bar item joining with shared borders/radii at ends).
- [ ] **Step 4:** `pnpm test` → PASS.
- [ ] **Step 5:** Commit `feat: buttons`.

### Task 4: Text inputs with the search-input fix

**Files:**
- Create: `src/components/text-input.js`, `textarea.js`, `search-input.js`, `test/helpers/browser.js`, `test/browser/search-input.test.js`
- Modify: `src/components/index.js`, `test/components.test.js`

**Interfaces:**
- `test/helpers/browser.js`: `renderPage(html: string, opts?: { scheme?: "light" | "dark"; scale?: "desktop" | "mobile"; dir?: "ltr" | "rtl"; width?: number }): Promise<{ page: Page; close(): Promise<void> }>`; builds CSS with the plugin (reuse `buildCss` with candidates derived from the classes in `html`), sets `colorScheme`, wraps `html` with the `data-topcoat` / `dir` attributes.
- Search input contract: custom properties `--tc-search-icon-size`, `--tc-search-icon-offset`, `--tc-search-icon-gap`; `padding-inline-start = offset + size + gap` (computed with `calc`); icon is an inline SVG data URI placed with `background-position: left var(--tc-search-icon-offset) center` (flipped in RTL via `:dir(rtl)` or `[dir=rtl]`), `background-size: var(--tc-search-icon-size)`. The webkit cancel button is styled with an end margin so it never overlaps text.

- [ ] **Step 1: Failing tests.** `components.test.js`: coverage for `"Text Input"`, `"Textarea"`, `"Search Input"`. `search-input.test.js` (browser), for desktop and mobile and light and dark, using `<input type="search" placeholder="search" class="topcoat-search-input">` and `--large`:
  - `"text starts at or after the icon's right edge"`: measure the input's computed `padding-inline-start` + border + input left, assert `>= iconOffset + iconSize` read from the computed custom properties.
  - `"placeholder and typed text do not overlap the icon"`: type a 60-character string; the text start x (from a `Range` or from the computed padding) stays right of the icon and the input's `scrollWidth` grows rather than the padding changing.
  - `"rtl mirrors the icon"` (`dir="rtl"`): padding-inline-start is applied on the right side; icon is on the right.
  - `"keeps the cancel button clear of the text"` (Chromium): after typing, the cancel button's left edge is >= text end when the text fits.
  - `"disabled search input ignores pointer events and is dimmed"`.
  Also a regression guard: `"search icon geometry is derived, not hard-coded"` — build CSS and assert the `padding-inline-start` declaration contains `var(--tc-search-icon-offset)`.
- [ ] **Step 2:** `pnpm exec playwright install chromium`, then `pnpm test && pnpm test:browser` → FAIL.
- [ ] **Step 3:** Implement the three components (text input has `--large`, `--invalid`; `:focus` uses `--tc-focus-border`/`--tc-focus-ring`; placeholder colors per reference).
- [ ] **Step 4:** Both test suites → PASS.
- [ ] **Step 5:** Commit `feat: text inputs and fixed search input`.

### Task 5: Toggles and range (checkbox, radio-button, switch, range)

**Files:**
- Create: `src/components/checkbox.js`, `radio-button.js`, `switch.js`, `range.js`, `test/browser/toggles.test.js`
- Modify: `src/components/index.js`, `test/components.test.js`

**Interfaces:** Markup follows the topdoc markup for each. The native `<input>` is visually hidden with `opacity: 0; position: absolute;` (never `display:none`), and the visible control reacts via `input:checked + …`, `input:focus-visible + …`, `input:disabled + …`.

- [ ] **Step 1: Failing tests.** Coverage for `"Checkbox"`, `"Radio Button"`, `"Switch"`, `"Range"`. Browser tests: `"checkbox is keyboard focusable and shows a focus ring"` (Tab to it; computed `box-shadow` of `.topcoat-checkbox__checkmark` is not `none`), same for radio and switch; `"checked state changes the checkmark"` (click label, `:checked` styles apply); `"disabled toggles do not change on click"`.
- [ ] **Step 2:** `pnpm test && pnpm test:browser` → FAIL.
- [ ] **Step 3:** Implement the four files; checkmark and radio dot are pure CSS (no images). Range styles `::-webkit-slider-thumb`/`::-moz-range-thumb` and tracks.
- [ ] **Step 4:** → PASS.
- [ ] **Step 5:** Commit `feat: checkbox, radio, switch, range`.

### Task 6: Containers (list, navigation-bar, tab-bar, notification)

**Files:**
- Create: `src/components/list.js`, `navigation-bar.js`, `tab-bar.js`, `notification.js`, `test/browser/containers.test.js`
- Modify: `src/components/index.js`, `test/components.test.js`

- [ ] **Step 1: Failing tests.** Coverage for `"List"`, `"Navigation Bar"`, `"Tab Bar"`, `"Notification"`. Browser: `"long list item text wraps or ellipsizes inside the item"` (item `scrollWidth <= clientWidth`), `"notification with long text does not overflow"`, `"tab bar items share width"`, and `"nested mobile scope applies only to its subtree"`: a `[data-topcoat="mobile"]` wrapper inside a desktop page renders a `topcoat-button` taller than a sibling outside it (and the reverse for a desktop wrapper inside mobile via `data-topcoat="desktop"`, defined as the explicit reset in `theme.css`).
- [ ] **Step 2:** `pnpm test && pnpm test:browser` → FAIL.
- [ ] **Step 3:** Implement the four files (list header/items with borders and `--large`; nav bar with title and items; tab bar active state; notification).
- [ ] **Step 4:** → PASS.
- [ ] **Step 5:** Commit `feat: list, navigation bar, tab bar, notification`.

### Task 7: Demo page and visual check

**Files:**
- Create: `demo/index.html`, `demo/demo.css`, `scripts/build-demo.sh`, `test/browser/demo.test.js`

**Interfaces:** `demo/demo.css` is `@import "tailwindcss"; @import "../index.css";`. `scripts/build-demo.sh` runs the Tailwind CLI to `demo/dist/demo.css` and copies `index.html`. The page has four sections (desktop-light, desktop-dark, mobile-light, mobile-dark), each rendering every component, using `data-topcoat` and a `.dark` wrapper with `@custom-variant dark (&:where(.dark, .dark *));` in `demo.css` so all four show at once.

- [ ] **Step 1: Failing test** `demo.test.js`: build the demo, open it in Chromium, assert no console errors, every `topcoat-*` class from all topdoc markups appears in the page DOM, and write a full-page screenshot per theme section to `test/screenshots/`.
- [ ] **Step 2:** `pnpm test:browser` → FAIL.
- [ ] **Step 3:** Write the page and build script. Open the screenshots and compare with the Topcoat docs look; fix visible discrepancies in the components.
- [ ] **Step 4:** `pnpm test && pnpm test:browser` → PASS.
- [ ] **Step 5:** Commit `feat: demo page`.

### Task 8: Docs, attribution, publish

**Files:**
- Create: `README.md`, `LICENSE`, `NOTICE`

- [ ] **Step 1:** `README.md`: install/usage (the exact line(s) verified in Task 1), theme switching (`dark:` variant, `data-topcoat="mobile"`), component list with modifiers, the search-input fix, how to run tests/demo, and how to add a component (file + one spread in `src/components/index.js`).
- [ ] **Step 2:** `LICENSE` Apache-2.0; `NOTICE` credits Topcoat (Adobe, Apache-2.0) as the visual reference.
- [ ] **Step 3:** `pnpm test && pnpm test:browser` pass; commit `docs: readme, license, notice`.
- [ ] **Step 4:** `git push origin main`; confirm the repo is still private with `gh repo view tadger/tailwind-topcoat --json visibility`.
