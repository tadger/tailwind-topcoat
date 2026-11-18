import { hiddenInput, disabled } from "./_shared.js";

const toggle = ".topcoat-switch__toggle";
const input = ".topcoat-switch__input";

export default {
  ".topcoat-switch": {
    position: "relative",
    display: "inline-block",
    verticalAlign: "top",
    boxSizing: "border-box",
    backgroundClip: "padding-box",
    fontSize: "var(--tc-font-size)",
    padding: "0 var(--tc-padding-x)",
    borderRadius: "var(--tc-radius)",
    border: "1px solid var(--tc-border)",
    overflow: "hidden",
    width: "var(--tc-switch-width)",
    direction: "ltr", // the ON/OFF art and thumb travel are physical; keep them readable in rtl pages
  },
  // The ring is drawn on the frame: the thumb sits inside overflow:hidden, which would clip its own glow.
  [`.topcoat-switch:has(${input}:focus)`]: {
    borderColor: "var(--tc-focus-border)",
    boxShadow: "0 0 0 2px var(--tc-focus-ring)",
  },
  [input]: hiddenInput,
  [toggle]: {
    position: "relative",
    display: "inline-block",
    verticalAlign: "top",
    boxSizing: "border-box",
    backgroundClip: "padding-box",
    padding: "0",
    font: "inherit",
    cursor: "default",
    userSelect: "none",
    lineHeight: "var(--tc-control-height)",
    height: "var(--tc-control-height)",
    width: "var(--tc-switch-thumb-width)",
    borderRadius: "var(--tc-radius)",
    color: "var(--tc-text)",
    textShadow: "var(--tc-text-shadow)",
    backgroundColor: "var(--tc-surface-raised)",
    border: "1px solid var(--tc-border)",
    margin: "-1px 0 -1px var(--tc-switch-thumb-offset)",
    boxShadow: "var(--tc-shadow-inset)",
    transition: "margin-left 0.05s ease-in-out",
    "&::before, &::after": {
      content: "''",
      position: "absolute",
      zIndex: "-1",
      boxSizing: "border-box",
      backgroundClip: "padding-box",
      top: "-1px",
      width: "var(--tc-switch-label-width)",
    },
    "&::before": {
      content: "'ON'",
      color: "var(--tc-cta-bg)",
      backgroundColor: "var(--tc-selected-bg)",
      right: "var(--tc-switch-on-right)",
      paddingLeft: "var(--tc-switch-on-pad)",
    },
    "&::after": {
      content: "'OFF'",
      backgroundColor: "var(--tc-surface-active)",
      left: "var(--tc-switch-off-left)",
      paddingLeft: "var(--tc-switch-off-pad)",
    },
  },
  [`${input}:checked + ${toggle}`]: { marginLeft: "var(--tc-switch-thumb-offset-on)" },
  [`${input}:active + ${toggle}`]: {
    border: "1px solid var(--tc-border)",
    boxShadow: "var(--tc-shadow-inset)",
  },
  [`${input}:focus + ${toggle}`]: { borderColor: "var(--tc-focus-border)" },
  [`${input}:disabled + ${toggle}`]: disabled,
  [`${input}:disabled + ${toggle}::before, ${input}:disabled + ${toggle}::after`]: { background: "transparent" },
};
