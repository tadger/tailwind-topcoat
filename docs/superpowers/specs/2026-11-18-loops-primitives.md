# Loops drum machine primitives (requests 1 to 5)

Source: `loops/docs/superpowers/specs/2026-11-18-topcoat-primitive-requests.md` (the app's request doc).
Status: implemented. The "Undecided" items in that doc (panel, toggle tile, dial) were intentionally not built.

## Names, exactly as requested

`aria-pressed="true"` on `topcoat-button` / `topcoat-button-bar__button`; `topcoat-select`, `topcoat-select--large`;
`topcoat-field`, `topcoat-field__label`, `topcoat-field__message`, `topcoat-field__message--invalid`;
`--tc-highlight`, `bg-topcoat-highlight`, `ring-topcoat-highlight`; `topcoat-tooltip`.

## Deviations and additions

- **`--tc-invalid-text`** (and `text-topcoat-invalid-text`) is new. `--tc-invalid` (#ec514e) is only about 2.9:1 against
  the light page, so `--invalid` field messages use a text-safe red (light #a61e15, dark #ffcdca; at least 4.5:1 on the
  page, surface, raised, input and focused-input backgrounds). The control's own invalid border still uses `--tc-invalid`.
- **`--tc-highlight`** is #b35c00 (light) and #fbbf24 (dark). Both are at least 3:1 against page, surface, raised, sunken,
  active, hover, input and list backgrounds in their scheme, and at least 90 degrees of hue from the focus blue. The one
  exception is `--tc-cta-bg` (CTA blue): a highlight touching a CTA-blue fill separates by hue, not luminance. Opacity
  modifiers (`bg-topcoat-highlight/50`) lower the contrast below 3:1. The app's stopgap light amber (#f59e0b) is only
  1.65:1 against the light page, so `--pad-playhead` will look darker (burnt orange) in light mode after migrating.
- **`--tc-text-on-highlight`** (#fff light, #1a1a1a dark; `text-topcoat-on-highlight`) is new, for text on a highlight fill.
- **Pressed look** also applies to `--quiet`, `--large` and `--large--quiet` buttons and to icon buttons (not `--cta`; `mixed` is
  unpressed). A pressed button stays pressed on hover, keeps the pressed shadow when quiet, and keeps the focus glow while focused.
- **Select** chevron is two gradient half-squares coloured from `--tc-text-muted`, sized by new scale tokens
  `--tc-select-arrow-size|offset|gap`. `<select multiple>` and `size>1` (listboxes) get natural height and no chevron. It shows
  the same invalid border as the text input for `:invalid` and `[aria-invalid="true"]` (also added to text input and textarea),
  and returns to the native arrow in forced-colors mode. The chevron follows `--tc-text-muted` as requested, which is faint
  (about 1.7:1 on white); a dedicated `--tc-select-arrow` token would be the fix if the app wants it stronger.
- **Field** wrapper is a flex column with `align-items: flex-start`, so controls keep their natural width (add `w-full` to stretch),
  and a fixed `0.25rem` gap (same on desktop and mobile). For a label beside the control use utilities (`flex-row items-center`).
  Help text uses `--tc-text` (not muted) so it passes 4.5:1 on the page background; message text is 0.9 of the control font size.
- **Tooltip** uses `--tc-surface` (as requested), the scale's control font size (12px on desktop), a soft drop shadow, and a
  border; it sets no `position`, `display`, `z-index` or offsets.
