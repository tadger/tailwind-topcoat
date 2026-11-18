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

Like any Tailwind class, a `topcoat-*` class only appears in your CSS if Tailwind finds it in your
source files. Utilities override components, so `topcoat-button px-6` does what you expect.

### Light / dark

Dark follows Tailwind's `dark` variant, so it is `prefers-color-scheme` by default. To drive it with a
class instead, add `@custom-variant dark (&:where(.dark, .dark *));` to your CSS and put `class="dark"` on
`<html>`. The dark tokens live on `:root`, so apply the class to `<html>`, not to a subtree.

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
open `demo/` for every component.

List and navigation bar only existed in Topcoat's mobile builds; here they also have desktop sizes.

## Fixes over Topcoat 0.8.0

- **Search input icon no longer overlaps the text or placeholder.** Topcoat placed a 12px icon 16px from
  the left but padded the text only ~21px. The icon's offset, size and gap are variables
  (`--tc-search-icon-*`) and the start padding is computed from them, so they can't drift apart. It also
  mirrors in right-to-left layouts and the clear button is styled so it doesn't collide with the text.
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
