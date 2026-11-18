# tailwind-topcoat

[Topcoat](https://github.com/topcoat/topcoat)'s clean, slightly web 2.0 look as a **Tailwind CSS v4** plugin.
Class names match Topcoat's (`topcoat-button--cta`, `topcoat-list__item`, ...), the colors, sizes and
shadows are `--tc-*` CSS variables, and light/dark and desktop/mobile are switchable per page.

## Use it

```css
/* app.css */
@import "tailwindcss";
@import "tailwind-topcoat";
```

```html
<button class="topcoat-button--cta px-6">Save</button>
<input class="topcoat-search-input" type="search" placeholder="search">
```

Install from a local path or git while the repo is private, for example `pnpm add ../tailwind-topcoat`.

Components are emitted in Tailwind's base layer, so every utility beats them (`topcoat-button px-6`,
`topcoat-button bg-red-500` even on hover, `topcoat-button absolute`). The trade-off: all `topcoat-*` rules are
always in your CSS (about 7 KB gzipped) and Tailwind's `prefix()` option is not supported.

### Light / dark

Dark follows Tailwind's `dark` variant, so it is `prefers-color-scheme` by default. To drive it with a
class instead, add `@custom-variant dark (&:where(.dark, .dark *));` to your CSS and put `class="dark"` on
`<html>`. To make a dark *subtree* inside a light page, put the class on a wrapper that also has a
`data-topcoat` attribute (for example `<div class="dark" data-topcoat="desktop">`), because that attribute is
what re-applies the dark tokens there. A light island inside a dark page is not supported.

Components use `font: inherit`; add `font-topcoat bg-topcoat-page` (and `text-topcoat-text`) to `<body>` for
Topcoat's font and page color.

### Desktop / mobile

Desktop sizes are the default. Add `data-topcoat="mobile"` to any ancestor to switch its subtree to the
larger touch sizes (`data-topcoat="desktop"` switches back inside a mobile region).

### Tokens

`theme.css` defines the `--tc-*` variables (scale tokens per desktop/mobile, color tokens per light/dark)
and exposes a few as Tailwind utilities: `bg-topcoat-surface`, `bg-topcoat-page`, `text-topcoat-text`,
`border-topcoat-border`, `rounded-topcoat`, `shadow-topcoat-inset`, `font-topcoat`, ...

## Components

Button (`--quiet`, `--large`, `--large--quiet`, `--cta`, `--large--cta`), icon button (+ `topcoat-icon`),
button bar, checkbox, radio button, switch, range, text input (`--large`, `:invalid`), textarea,
search input (`--large`), list, navigation bar, tab bar, notification. Markup is the same as Topcoat's;
open `demo/` for every component. Radio-driven tab bars and button bars (`<label><input type="radio"><button>`)
work by mouse and keyboard; give the inner `<button>` `tabindex="-1"` (or use a `<span>`) so it isn't a second tab stop.
Bars and the navigation bar need a width (`w-full`) for long labels to ellipsize.

List and navigation bar only existed in Topcoat's mobile builds; here they also have desktop sizes.

## Fixes over Topcoat 0.8.0

- **Search input icon no longer overlaps the text or placeholder.** Topcoat placed a 12px icon 16px from
  the left but padded the text only ~21px. The icon's offset, size and gap are variables
  (`--tc-search-icon-*`) and the start padding is computed from them, so they can't drift apart. It also
  mirrors in right-to-left layouts and the clear button is styled so it doesn't collide with the text.
- Radio-driven tab bars and button bars are clickable on the whole segment (Topcoat's only responded to a
  click on a 13px hidden input), and the switch's focus ring is no longer clipped and works in `dir="rtl"`.
- Long button labels ellipsize instead of overflowing; tab bar buttons fill their cells; button bar
  segments touch; form controls keep native keyboard focus with a visible ring.

## Develop

```sh
pnpm install
pnpm run reference        # downloads Topcoat 0.8.0's CSS into reference/ (gitignored, test-only)
pnpm exec playwright install chromium
pnpm test                 # CSS output tests
pnpm test:browser         # Chromium checks (search overlap, focus, scopes, demo)
pnpm build:demo           # builds demo/dist; open demo/dist/index.html
```

Add a component: create `src/components/<name>.js` (a CSS-in-JS object that reads only `--tc-*` variables)
and add one import and spread in `src/components/index.js`. Add any new variables to **both** the light and
dark blocks (and desktop and mobile) in `theme.css`; the token tests enforce this.

## License

Apache-2.0. See `LICENSE` and `NOTICE` for Topcoat attribution.
