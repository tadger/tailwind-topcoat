// A label, a control and an optional message. Spacing is fixed (not scale-dependent); the control is untouched.
// Put the label beside the control with utilities (`flex-row items-center`), which beat these rules.
const SMALL = "calc(var(--tc-font-size) * 0.85)";

export default {
  ".topcoat-field": {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  ".topcoat-field__label": {
    margin: "0",
    fontSize: "var(--tc-font-size)",
    lineHeight: "1.3",
    color: "var(--tc-text)",
  },
  ".topcoat-field__message": {
    margin: "0",
    fontSize: SMALL,
    lineHeight: "1.3",
    color: "var(--tc-text)",
  },
  ".topcoat-field__message--invalid, .topcoat-field__message[role=\"alert\"]": {
    color: "var(--tc-invalid-text)",
  },
};
