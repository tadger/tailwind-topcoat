import { reset, disabled, hiddenInput } from "./_shared.js";

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
    "&:active": {
      color: "var(--tc-cta-bg)",
      backgroundColor: "var(--tc-selected-bg)",
      boxShadow: "inset 0 0 1px rgba(0, 0, 0, 0.1)",
    },
    "&:focus": {
      zIndex: "1",
      boxShadow: "var(--tc-focus-inset), 0 0 0 2px var(--tc-focus-ring)",
      outline: "0",
    },
    "&:disabled": disabled,
  },
  ":checked + .topcoat-tab-bar__button": {
    color: "var(--tc-cta-bg)",
    backgroundColor: "var(--tc-selected-bg)",
    boxShadow: "inset 0 0 1px rgba(0, 0, 0, 0.1)",
  },
};
