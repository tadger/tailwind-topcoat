// Fragments shared by several components. Values come only from --tc-* variables.

/** ".a, .b" or ".a:hover, .b:hover" from class names (no leading dot). */
export const sel = (names, state = "") => names.map((n) => `.${n}${state}`).join(", ");

/** Strips browser chrome from a control so Topcoat styling starts from nothing. */
export const reset = {
  position: "relative",
  display: "inline-block",
  verticalAlign: "top",
  boxSizing: "border-box",
  maxWidth: "100%",
  backgroundClip: "padding-box",
  padding: "0",
  margin: "0",
  font: "inherit",
  color: "inherit",
  background: "transparent",
  border: "none",
  cursor: "default",
  userSelect: "none",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textDecoration: "none",
};

export const disabled = {
  opacity: "var(--tc-disabled-opacity)",
  cursor: "default",
  pointerEvents: "none",
};

/** The default "raised" look: flat fill, hairline border, top highlight. */
export const raised = {
  fontSize: "var(--tc-font-size)",
  letterSpacing: "var(--tc-letter-spacing)",
  color: "var(--tc-text)",
  textShadow: "var(--tc-text-shadow)",
  backgroundColor: "var(--tc-surface-raised)",
  boxShadow: "var(--tc-shadow-inset)",
  border: "1px solid var(--tc-border)",
  borderRadius: "var(--tc-radius)",
};

export const hoverFill = { backgroundColor: "var(--tc-surface-hover)" };

export const focusGlow = {
  border: "1px solid var(--tc-focus-border)",
  boxShadow: "var(--tc-focus-inset), 0 0 0 2px var(--tc-focus-ring)",
  outline: "0",
};

export const pressed = {
  border: "1px solid var(--tc-border)",
  backgroundColor: "var(--tc-surface-active)",
  boxShadow: "var(--tc-shadow-inset-active)",
};

export const quiet = {
  background: "transparent",
  border: "1px solid transparent",
  boxShadow: "none",
};

export const quietHover = {
  textShadow: "var(--tc-text-shadow)",
  border: "1px solid var(--tc-border)",
  boxShadow: "var(--tc-shadow-inset)",
};

export const quietPressed = {
  color: "var(--tc-text)",
  textShadow: "var(--tc-text-shadow)",
  ...pressed,
};

/** Native input kept focusable and clickable but invisible; the sibling element draws the control. */
export const hiddenInput = {
  position: "absolute",
  overflow: "hidden",
  padding: "0",
  border: "0",
  opacity: "0.001",
  zIndex: "1",
  verticalAlign: "top",
  outline: "none",
};
