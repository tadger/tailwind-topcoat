# tailwind-topcoat

A clean, slightly web 2.0 UI kit as a **Tailwind CSS v4** plugin: buttons, inputs, toggles, lists, bars and more,
with light/dark and desktop/mobile sizes built in.

```css
/* app.css */
@import "tailwindcss";
@import "tailwind-topcoat";
```

```html
<body class="bg-topcoat-page font-topcoat text-topcoat-body text-topcoat-text">
  <button class="topcoat-button--cta px-6">Save</button>
  <input class="topcoat-search-input" type="search" placeholder="search">
</body>
```

Install from a path or git while the repo is private, e.g. `pnpm add ../tailwind-topcoat`.

## Components

`topcoat-button` (`--quiet`, `--large`, `--large--quiet`, `--cta`, `--large--cta`), `topcoat-icon-button`,
`topcoat-button-bar`, `topcoat-checkbox`, `topcoat-radio-button`, `topcoat-switch`, `topcoat-range`,
`topcoat-text-input`, `topcoat-textarea`, `topcoat-search-input`, `topcoat-list`, `topcoat-navigation-bar`,
`topcoat-tab-bar`, `topcoat-notification`, `topcoat-select` (`--large`), `topcoat-field` (`__label`,
`__message`, `__message--invalid`, or any `[role="alert"]` message), `topcoat-tooltip` (skin only; you position it).
See `demo/` for the markup of each.

Toggle buttons: a button, quiet/large button, icon button or button bar segment with `aria-pressed="true"` looks
selected (`--cta` buttons are not affected; `aria-pressed="mixed"` is treated as unpressed).

Notes: `topcoat-select` and `topcoat-search-input` need the `dir` attribute (not just CSS `direction`) for
right-to-left. Use `ps-*` rather than `px-*` to change a select's text inset, or the chevron loses its clearance.
A `topcoat-field` keeps controls at their natural width; add `w-full` to stretch. If the field is a wrapping
`<label>`, wrap the caption in `<span class="topcoat-field__label">` so it gets the label styling.

Components sit in Tailwind's base layer, so any utility overrides them (`topcoat-button bg-red-500 px-6`).
All of them are always in your CSS (about 5 KB gzipped); Tailwind's `prefix()` is not supported.

## Themes

- **Dark** follows Tailwind's `dark` variant (`prefers-color-scheme` by default). For class-based dark mode add
  `@custom-variant dark (&:where(.dark, .dark *));` and put `class="dark"` on `<html>`. For a dark region
  inside a light page, give the wrapper `class="dark"` **and** a `data-topcoat` attribute.
- **Mobile** sizes: add `data-topcoat="mobile"` to any ancestor (`data-topcoat="desktop"` switches back).
- **Tokens** are `--tc-*` variables (see `theme.css`), also exposed as utilities: `bg-topcoat-surface`,
  `text-topcoat-text`, `border-topcoat-border`, `rounded-topcoat`, `shadow-topcoat-inset`, `bg-topcoat-highlight`
  (amber, for "this is happening now"; put `text-topcoat-on-highlight` on text over a fill), `text-topcoat-invalid-text`, and so on.

## Typography

Components never set a font family; they inherit the page's, so put `font-topcoat` (or your own font) on `<body>`.
The theme does not bundle or load a font. To get the intended look, load Source Sans 3 (SIL OFL; the name Topcoat
used was Source Sans Pro, kept as a fallback in the stack):

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600&display=swap">
```

| Role | Utility | Desktop / mobile | Line-height |
|---|---|---|---|
| Display | `text-topcoat-display` | 32px / 40px | 1.2 |
| Title | `text-topcoat-title` | 20px / 24px | 1.2 |
| Body | `text-topcoat-body` | 16px / 18px | 1.5 |
| Control large | `text-topcoat-control-large` | 14px / 20.8px | 1.3 |
| Control | `text-topcoat-control` | 12px / 16px | 1.3 |
| Caption | `text-topcoat-caption` | 10.8px / 14.4px | 1.3 |

Weights: `font-topcoat-regular` (400), `-medium` (500), `-strong` (600). Families: `font-topcoat`, `font-topcoat-mono`.
Leading: `leading-topcoat-tight` (1.2), `-caption` (1.3), `-body` (1.5). "Control" is the text size inside buttons and inputs;
captions and field messages are derived from it. All of these are `--tc-*` tokens (`--tc-text-*`, `--tc-weight-*`,
`--tc-leading-*`, `--tc-font-family[-mono]`); override them on `:root`. Textareas use the body size (title when large).

## Fixes over the original

- The search icon no longer overlaps the placeholder or text. Its offset, size and gap are variables and the
  text padding is computed from them. It also works right-to-left, and the clear button has proper spacing.
- Tab bars and button bars made of radios respond to a click anywhere on a segment.
- The switch's focus ring is no longer clipped, and it works in right-to-left pages.
- Long button labels ellipsize instead of overflowing.

## Develop

```sh
pnpm install
pnpm run reference                 # fetch the original CSS into reference/ (gitignored, tests only)
pnpm exec playwright install chromium
pnpm test && pnpm test:browser
pnpm build:demo                    # then open demo/dist/index.html
```

To add a component, create `src/components/<name>.js` (CSS-in-JS using only `--tc-*` variables), import it in
`src/components/index.js`, and define any new variables in `theme.css` for both light and dark and both scales.

<sub>Apache-2.0. The look and class names recreate [Topcoat](https://github.com/topcoat/topcoat) 0.8.0
(Apache-2.0, © Adobe Systems Incorporated and contributors); no Topcoat source, images or fonts are included.
See `NOTICE`.</sub>
