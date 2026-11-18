# Loops drum machine primitives (requests 1 to 5)

Source: `loops/docs/superpowers/specs/2026-11-18-topcoat-primitive-requests.md` (the app's request doc).
Status: implemented. The "Undecided" items in that doc (panel, toggle tile, dial) were intentionally not built.

## Names, exactly as requested

`aria-pressed="true"` on `topcoat-button` / `topcoat-button-bar__button`; `topcoat-select`, `topcoat-select--large`;
`topcoat-field`, `topcoat-field__label`, `topcoat-field__message`, `topcoat-field__message--invalid`;
`--tc-highlight`, `bg-topcoat-highlight`, `ring-topcoat-highlight`; `topcoat-tooltip`.

## Deviations and additions

- **`--tc-invalid-text`** (and `text-topcoat-invalid-text`) is new. `--tc-invalid` (#ec514e) is only about 2.9:1 against
  the light page, so `--invalid` field messages use a text-safe red (light #b42318, dark #ffaca8; both at least 4.5:1
  on the page and surface). The control's own invalid border still uses `--tc-invalid`.
- **`--tc-highlight`** is #c26400 (light) and #fbbf24 (dark). Both are at least 3:1 against `--tc-page-bg` and `--tc-surface`
  in their scheme and are at least 90 degrees of hue away from the focus blue. The app's stopgap light amber (#f59e0b) is only
  1.65:1 against the light page, so the app's `--pad-playhead` will look darker/more orange in light mode after migrating.
- **Pressed look** also applies to `--quiet`, `--large` and `--large--quiet` buttons (not `--cta`). A pressed button stays pressed on
  hover, and keeps the focus glow while focused.
- **Select** chevron is two gradient half-squares coloured from `--tc-text-muted`, sized by new scale tokens
  `--tc-select-arrow-size|offset|gap`. `<select multiple>` and `size>1` (listboxes) get natural height and no chevron.
- **Field** wrapper is a flex column with a fixed `0.25rem` gap (same on desktop and mobile). For a label beside the control use
  utilities (`flex-row items-center`). Help text uses `--tc-text` (not muted) so it passes 4.5:1 on the page background.
- **Tooltip** sets no `position`, `display`, `z-index` or offsets.
