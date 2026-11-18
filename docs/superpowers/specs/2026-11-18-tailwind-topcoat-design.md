# tailwind-topcoat: design

Status: approved (the owner waived review of this doc and delegated it to the builder).
Date: 2026-11-18

## Intent and why

Recreate the look of [Topcoat](https://github.com/topcoat/topcoat) (a clean, slightly
"web 2.0" CSS framework, v0.8.0, Apache-2.0, dormant since 2018) as a Tailwind CSS
plugin. The owner will use it for a demo web application and wants that aesthetic
available as Tailwind-native primitives. Afterwards they want to build more complex
primitives on top, so the foundation (tokens, structure) matters as much as the first
14 components.

It is a clean-room-style port, not a fork: new repo `tadger/tailwind-topcoat`
(private for now), local folder `/Volumes/dev/tailwind-topcoat/`. Topcoat's compiled
CSS is the visual reference only; short Apache-2.0 attribution in `NOTICE`/README.

## Goals

- A Tailwind v4 plugin (JS plugin API, loaded via `@plugin`) that provides:
  - design tokens (colors, gradients, shadows, radii, sizes) for desktop and mobile
    scales in light and dark;
  - one `topcoat-*` component class per Topcoat component, built from Tailwind
    utilities and theme tokens where practical.
- Components (from Topcoat's package.json): button, icon-button, button-bar, checkbox,
  radio-button, switch, range, text-input, textarea, search-input, list,
  navigation-bar, tab-bar, notification. Class names and modifiers follow Topcoat's
  (`topcoat-button--cta`, `--quiet`, `--large`, ...) so the original docs transfer.
- Fix known defects, starting with the search input where the magnifier icon overlaps
  the placeholder/text.
- A demo page rendering every component in all four theme combinations, used as the
  visual check.
- Components can be overridden with ordinary Tailwind utilities
  (`topcoat-button px-6`).

## Non-goals

- Pixel-identical output to Topcoat 0.8.0. The target is the same look and feel;
  deliberate fixes may differ.
- Supporting Tailwind v3 or Topcoat's old browser matrix (IE, old WebKit prefixes).
- Publishing to npm, a docs site, or the "more complex primitives" (next phase).
- Forking, vendoring or republishing Topcoat's source/CSS as the deliverable.

## Anti-goals (failure even if it technically works)

- A prebuilt Topcoat stylesheet with Tailwind bolted on: tokens must be real Tailwind
  theme values so the owner's own utilities and future primitives share them.
- Long unreadable per-element class strings required in markup.
- Light/dark or desktop/mobile requiring separate stylesheets.

## Constraints

- Tailwind CSS 4.3.x; Node 26 available locally; pnpm store exists on the volume.
- Topcoat source repo contains only compiled CSS (4 builds, ~3,400 lines each) plus a
  demo; component sources live in separate `topcoat-*` packages. We read the compiled
  CSS/demo as the reference.
- GitHub account `tadger` is authenticated with `repo` scope; the repo is created
  private.

## Approaches considered

- **A. Tailwind plugin package (chosen, agreed by the owner).** Tokens as theme
  values plus `topcoat-*` component classes registered by the plugin. Overridable with
  utilities; best base for future primitives. Costs some up-front structure.
- **B. Copy-paste utility recipes.** Purest Tailwind, but repeated class strings, no
  central theming, nothing shared for later primitives.
- **C. Prebuilt compiled stylesheet.** Easiest to consume, but is just Topcoat again;
  utilities can't mix with it.

## Design (decisions)

**Theming.** Light/dark follows Tailwind's `dark:` variant (media by default,
overridable to a class). Desktop vs mobile is scale, selected by
`data-topcoat="mobile"` on any ancestor (default desktop). Both are implemented by
CSS custom properties (`--tc-*`) set at the root/ancestor, so a component rule is
written once and reads variables rather than being duplicated per theme.

**Tokens.** Colors, gradients, shadows and radii are exposed to Tailwind's theme under
a `topcoat` namespace (e.g. `bg-topcoat-surface`) so they are usable in the owner's
own markup.

**Components.** Each component is defined by the plugin with `addComponents`, using
`@apply` of utilities where it stays readable and raw CSS (gradients, inset
highlights, glows) where it doesn't. Web 2.0 flavour (gradients, inset highlights,
soft focus glow) is kept as in Topcoat. Modifiers and `:disabled`/`:focus`/`:active`
states follow Topcoat.

**Search input fix (reference defect).** In Topcoat the icon is a 12px background
image at `1rem` left, ending at ~28px, while `padding-left` is `1.3rem` (~21px), so
text starts ~6px inside the icon. We expose `--tc-search-icon-size` and
`--tc-search-icon-offset` and compute `padding-left` as
`offset + size + gap`, so overlap cannot reappear. The icon is an inline SVG data URI
colored per theme. Cancel/clear button gets spacing so it doesn't collide with text.
The demo includes a visual regression check for this.

**Layout of the repo.**

```
tailwind-topcoat/
  package.json, README.md, LICENSE (Apache-2.0), NOTICE (Topcoat attribution)
  src/
    index.js            plugin entry
    tokens/             light/dark and desktop/mobile variable sets
    components/         one file per component
  demo/                 index.html + css entry, built with Tailwind CLI
  test/                 plugin output checks + search-input overlap check
  docs/superpowers/specs/
```

**Verification.** Unit-level: build CSS with the plugin and assert expected classes and
variables exist. Visual: demo page built and screenshotted in all four themes; the
search-input overlap is asserted by measuring in a real browser that the text box's
left edge is at or beyond the icon's right edge.

## Left to the builder

Exact color/shadow values (read from Topcoat's compiled CSS), SVG icon artwork for
checkbox/radio/switch/search, file naming, test runner choice, how the demo is served,
and whether to use `@apply` vs raw CSS per component.

## Calls made by the builder (owner may revisit)

- Tailwind v4 only, JS plugin API.
- `data-topcoat="mobile"` as the scale switch.
- Private repo `tadger/tailwind-topcoat`, `main` branch, Apache-2.0.
- Keep Topcoat class names and modifiers.
