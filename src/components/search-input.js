import { sel } from "./_shared.js";
import { inputReset, field, fieldFocus, disabledField } from "./text-input.js";

const all = ["topcoat-search-input", "topcoat-search-input--large"];
const CANCEL = "&::-webkit-search-cancel-button";

// Fix for Topcoat 0.8.0, where the icon (16px offset + 12px wide) ended past the text start (1.3rem padding).
// Icon geometry is three variables and the inline-start padding is derived from them, so they cannot drift apart.
export default {
  [sel(all)]: {
    ...inputReset,
    ...field,
    appearance: "none",
    lineHeight: "var(--tc-control-height)",
    height: "var(--tc-control-height)",
    fontSize: "var(--tc-font-size)",
    borderRadius: "var(--tc-radius-pill)",
    boxShadow: "var(--tc-shadow-search)",
    paddingBlock: "0",
    paddingInlineEnd: "0",
    paddingInlineStart: "calc(var(--tc-search-icon-offset) + var(--tc-search-icon-size) + var(--tc-search-icon-gap))",
    backgroundImage: "var(--tc-search-icon)",
    backgroundRepeat: "no-repeat",
    backgroundSize: "var(--tc-search-icon-size)",
    backgroundPosition: "left var(--tc-search-icon-offset) center",
    "&:dir(rtl)": { backgroundPosition: "right var(--tc-search-icon-offset) center" },
    [CANCEL]: {
      appearance: "none",
      width: "0.875em",
      height: "0.875em",
      marginInline: "0.25em 0.5em",
      cursor: "pointer",
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' stroke='%23c6c8c8' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='M3 3l10 10M13 3L3 13'/%3E%3C/svg%3E\")",
      backgroundSize: "contain",
      backgroundRepeat: "no-repeat",
    },
  },
  [sel(all, ":focus")]: { ...fieldFocus, boxShadow: "var(--tc-shadow-search), 0 0 0 2px var(--tc-focus-ring)" },
  [sel(all, ":disabled")]: disabledField,
  [sel(["topcoat-search-input--large"])]: {
    "--tc-search-icon-size": "var(--tc-search-icon-size-large)",
    "--tc-search-icon-offset": "var(--tc-search-icon-offset-large)",
    "--tc-search-icon-gap": "var(--tc-search-icon-gap-large)",
    lineHeight: "var(--tc-control-height-large)",
    height: "var(--tc-control-height-large)",
    fontSize: "var(--tc-font-size-large)",
  },
};
