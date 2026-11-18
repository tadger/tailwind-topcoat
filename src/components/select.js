import { sel } from "./_shared.js";
import { inputReset, field, fieldFocus, disabledField } from "./text-input.js";

const all = ["topcoat-select", "topcoat-select--large"];
const C = "var(--tc-text-muted)";
const SIZE = "var(--tc-select-arrow-size)";
const OFFSET = "var(--tc-select-arrow-offset)";

// A <select> cannot have pseudo-elements and a data-URI image cannot read a variable, so the chevron is two
// gradient half-squares that together form a down-pointing triangle, coloured from --tc-text-muted.
export default {
  [sel(all)]: {
    ...inputReset,
    ...field,
    appearance: "none",
    cursor: "default",
    height: "calc(var(--tc-control-height) + 2px)", // same outer height as topcoat-text-input
    lineHeight: "var(--tc-control-height)",
    fontSize: "var(--tc-font-size)",
    borderRadius: "var(--tc-radius)",
    boxShadow: "var(--tc-shadow-input)",
    paddingBlock: "0",
    paddingInlineStart: "var(--tc-padding-x)",
    paddingInlineEnd: `calc(${OFFSET} + 2 * ${SIZE} + var(--tc-select-arrow-gap))`,
    backgroundImage: `linear-gradient(45deg, transparent 50%, ${C} 50%), linear-gradient(135deg, ${C} 50%, transparent 50%)`,
    backgroundRepeat: "no-repeat",
    backgroundSize: `${SIZE} ${SIZE}, ${SIZE} ${SIZE}`,
    backgroundPosition: `calc(100% - ${OFFSET} - ${SIZE}) 50%, calc(100% - ${OFFSET}) 50%`,
    "&:dir(rtl)": { backgroundPosition: `${OFFSET} 50%, calc(${OFFSET} + ${SIZE}) 50%` },
  },
  // multiple / size>1 is a listbox, not a drop-down: natural height, no chevron.
  [`${sel(all, "[multiple]")}, ${sel(all, '[size]:not([size="0"]):not([size="1"])')}`]: {
    height: "auto",
    lineHeight: "normal",
    backgroundImage: "none",
    paddingBlock: "0.25rem",
    paddingInlineEnd: "var(--tc-padding-x)",
  },
  [sel(all, ":focus")]: { ...fieldFocus, boxShadow: "0 0 0 2px var(--tc-focus-ring)" },
  [sel(all, ":disabled")]: disabledField,
  [`${sel(all, ":invalid")}, ${sel(all, '[aria-invalid="true"]')}`]: { border: "1px solid var(--tc-invalid)" },
  [sel(["topcoat-select--large"])]: {
    height: "calc(var(--tc-control-height-large) + 2px)",
    lineHeight: "var(--tc-control-height-large)",
    fontSize: "var(--tc-font-size-large)",
  },
  // Forced-colors / high-contrast modes drop background images; give the native arrow back.
  "@media (forced-colors: active)": { [sel(all)]: { appearance: "auto" } },
};
