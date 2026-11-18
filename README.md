# tailwind-topcoat

A clean, slightly web 2.0 UI kit as a **Tailwind CSS v4** plugin: buttons, inputs, toggles, lists, bars and more,
with light/dark and desktop/mobile sizes built in.

```css
/* app.css */
@import "tailwindcss";
@import "tailwind-topcoat";
```

```html
<body class="bg-topcoat-page font-topcoat text-topcoat-text">
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

Toggle buttons: a `topcoat-button` or button bar segment with `aria-pressed="true"` looks selected.

Components sit in Tailwind's base layer, so any utility overrides them (`topcoat-button bg-red-500 px-6`).
All of them are always in your CSS (about 7 KB gzipped); Tailwind's `prefix()` is not supported.

## Themes

- **Dark** follows Tailwind's `dark` variant (`prefers-color-scheme` by default). For class-based dark mode add
  `@custom-variant dark (&:where(.dark, .dark *));` and put `class="dark"` on `<html>`. For a dark region
  inside a light page, give the wrapper `class="dark"` **and** a `data-topcoat` attribute.
- **Mobile** sizes: add `data-topcoat="mobile"` to any ancestor (`data-topcoat="desktop"` switches back).
- **Tokens** are `--tc-*` variables (see `theme.css`), also exposed as utilities: `bg-topcoat-surface`,
  `text-topcoat-text`, `border-topcoat-border`, `rounded-topcoat`, `shadow-topcoat-inset`, `bg-topcoat-highlight`
  (amber, for "this is happening now"), `text-topcoat-invalid-text`, and so on.

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
