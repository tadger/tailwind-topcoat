import { sel, disabled } from "./_shared.js";

const all = ["topcoat-text-input", "topcoat-text-input--large"];
const placeholderDisabled = { color: "var(--tc-text-strong)" };

export const inputReset = {
  padding: "0",
  margin: "0",
  font: "inherit",
  color: "inherit",
  background: "transparent",
  border: "none",
  boxSizing: "border-box",
  backgroundClip: "padding-box",
  verticalAlign: "top",
  outline: "none",
};

/** Look shared by text input, textarea and search input. */
export const field = {
  letterSpacing: "var(--tc-letter-spacing)",
  border: "1px solid var(--tc-border)",
  backgroundColor: "var(--tc-input-bg)",
  color: "var(--tc-text)",
};

export const fieldFocus = {
  backgroundColor: "var(--tc-input-bg-focus)",
  color: "var(--tc-text-strong)",
  border: "1px solid var(--tc-focus-border)",
};

export const disabledField = {
  ...disabled,
  "&::placeholder": placeholderDisabled,
};

export default {
  [sel(all)]: {
    ...inputReset,
    ...field,
    lineHeight: "var(--tc-control-height)",
    fontSize: "var(--tc-font-size)",
    padding: "0 var(--tc-padding-x)",
    borderRadius: "var(--tc-radius)",
    boxShadow: "var(--tc-shadow-input)",
  },
  [sel(all, ":focus")]: { ...fieldFocus, boxShadow: "0 0 0 2px var(--tc-focus-ring)" },
  [sel(all, ":disabled")]: disabledField,
  [sel(all, ":invalid")]: { border: "1px solid var(--tc-invalid)" },
  [sel(["topcoat-text-input--large"])]: {
    lineHeight: "var(--tc-control-height-large)",
    fontSize: "var(--tc-font-size-large)",
  },
};
