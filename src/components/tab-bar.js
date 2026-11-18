import { reset, disabled, hiddenInput } from "./_shared.js";

const item = ".topcoat-tab-bar__item";
const button = ".topcoat-tab-bar__button";
const selected = {
  color: "var(--tc-cta-bg)",
  backgroundColor: "var(--tc-selected-bg)",
  boxShadow: "inset 0 0 1px rgba(0, 0, 0, 0.1)",
};
const focusGlow = { zIndex: "1", boxShadow: "var(--tc-focus-inset), 0 0 0 2px var(--tc-focus-ring)", outline: "0" };

export default {
  ".topcoat-tab-bar": {
    display: "table",
    tableLayout: "fixed",
    whiteSpace: "nowrap",
    margin: "0",
    padding: "0",
  },
  ".topcoat-tab-bar__item": { display: "table-cell", width: "auto", borderRadius: "0" },
  ".topcoat-tab-bar__item > input": hiddenInput,
  ".topcoat-tab-bar__button": {
    ...reset,
    width: "100%",
    padding: "0 var(--tc-padding-x)",
    height: "var(--tc-control-height)",
    lineHeight: "var(--tc-control-height)",
    letterSpacing: "var(--tc-letter-spacing)",
    fontSize: "var(--tc-font-size)",
    color: "var(--tc-text)",
    textShadow: "var(--tc-text-shadow)",
    backgroundColor: "var(--tc-surface-raised)",
    boxShadow: "var(--tc-shadow-inset)",
    borderTop: "1px solid var(--tc-border)",
    "&:active": selected,
    "&:focus": focusGlow,
    "&:disabled": disabled,
  },
  [`:checked + ${button}`]: selected,
  // Radio-driven tabs: a <button> inside a <label> does not forward clicks, so let the click fall through
  // to the label (which activates the radio) and mirror the button's own states from the label/input.
  [`${item}:has(> input) > ${button}`]: { pointerEvents: "none" },
  [`${item}:has(> input):active > ${button}`]: selected,
  [`${item} > input:focus + ${button}`]: focusGlow,
  [`${item} > input:disabled + ${button}`]: disabled,
};
