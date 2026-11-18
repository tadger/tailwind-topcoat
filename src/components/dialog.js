// A skin for a native <dialog>. The app calls showModal(), so the browser supplies the top layer, focus trap,
// Escape, inert page and ::backdrop; the theme adds no behavior and does not size or position it.
// Never set `display` on the base rule: a closed <dialog> must stay display:none.
export default {
  ".topcoat-dialog": {
    boxSizing: "border-box",
    // reset the UA's CanvasText/Canvas and its 3px black border
    color: "var(--tc-text)",
    backgroundColor: "var(--tc-surface)",
    border: "1px solid var(--tc-border)",
    borderRadius: "var(--tc-radius)",
    boxShadow: "var(--tc-shadow-float)",
    margin: "auto", // restores the UA centering that Tailwind's preflight (`* { margin: 0 }`) cancels
    padding: "1rem", // fixed, not scale-dependent
    maxWidth: "min(24rem, calc(100vw - 2rem))",
    // ::backdrop inherits from the dialog in current browsers (Chrome 122, Firefox 120, Safari 17.4); older ones use the fallback.
    "&::backdrop": { background: "var(--tc-backdrop, rgba(0, 0, 0, 0.4))" },
    "&:focus-visible": {
      outline: "0",
      borderColor: "var(--tc-focus-border)",
      boxShadow: "var(--tc-shadow-float), 0 0 0 2px var(--tc-focus-ring)",
    },
  },
  ".topcoat-dialog__title": {
    margin: "0 0 0.5rem",
    fontSize: "var(--tc-font-size-large)",
    fontWeight: "var(--tc-weight-strong)",
    lineHeight: "var(--tc-leading-tight)",
    color: "var(--tc-text-strong)",
  },
  ".topcoat-dialog__body": {
    margin: "0 0 1rem",
    fontSize: "var(--tc-font-size)",
    lineHeight: "var(--tc-leading-body)",
    color: "var(--tc-text)",
  },
  ".topcoat-dialog__actions": {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: "0.5rem",
    margin: "0",
  },
};
