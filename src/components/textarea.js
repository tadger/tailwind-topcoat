import { sel } from "./_shared.js";
import { inputReset, field, fieldFocus, disabledField } from "./text-input.js";

const all = ["topcoat-textarea", "topcoat-textarea--large"];

export default {
  [sel(all)]: {
    ...inputReset,
    ...field,
    resize: "none",
    padding: "var(--tc-textarea-padding)",
    fontSize: "var(--tc-textarea-font-size)",
    lineHeight: "var(--tc-control-height)",
    borderRadius: "var(--tc-radius)",
    boxShadow: "var(--tc-shadow-input)",
  },
  [sel(all, ":focus")]: { ...fieldFocus, boxShadow: "0 0 0 2px var(--tc-focus-ring)" },
  [sel(all, ":disabled")]: disabledField,
  [sel(["topcoat-textarea--large"])]: {
    fontSize: "var(--tc-textarea-font-size-large)",
    lineHeight: "var(--tc-control-height-large)",
  },
};
