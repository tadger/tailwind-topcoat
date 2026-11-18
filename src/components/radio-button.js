import { hiddenInput, disabled, focusGlow, pressed } from "./_shared.js";

const mark = ".topcoat-radio-button__checkmark";
const input = ".topcoat-radio-button > input";

export default {
  ".topcoat-radio-button": {
    position: "relative",
    display: "inline-block",
    verticalAlign: "top",
    cursor: "default",
    userSelect: "none",
    color: "var(--tc-text)",
    lineHeight: "var(--tc-radio-size)",
  },
  [input]: {
    ...hiddenInput,
    height: "var(--tc-radio-size)",
    width: "var(--tc-radio-size)",
    margin: "0 calc(-1 * var(--tc-radio-size)) calc(-1 * var(--tc-radio-size)) 0",
  },
  [mark]: {
    boxSizing: "border-box",
    backgroundClip: "padding-box",
    position: "relative",
    display: "inline-block",
    verticalAlign: "top",
    cursor: "default",
    userSelect: "none",
    width: "var(--tc-radio-size)",
    height: "var(--tc-radio-size)",
    "&::before, &::after": { content: "''", position: "absolute", borderRadius: "100%" },
    "&::before": {
      boxSizing: "border-box",
      backgroundClip: "padding-box",
      width: "var(--tc-radio-size)",
      height: "var(--tc-radio-size)",
      background: "var(--tc-surface-raised)",
      border: "1px solid var(--tc-border)",
      boxShadow: "var(--tc-shadow-inset)",
    },
    "&::after": {
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      opacity: "0",
      width: "var(--tc-radio-dot)",
      height: "var(--tc-radio-dot)",
      background: "var(--tc-text)",
      border: "1px solid var(--tc-dot-border)",
      boxShadow: "var(--tc-dot-shadow)",
    },
  },
  [`${input}:checked + ${mark}::after`]: { opacity: "1" },
  [`${input}:focus + ${mark}::before`]: focusGlow,
  [`${input}:active + ${mark}::before`]: pressed,
  [`${input}:disabled + ${mark}`]: disabled,
  [`${input}:disabled:active + ${mark}::before`]: {
    border: "1px solid var(--tc-border)",
    background: "var(--tc-surface-raised)",
    boxShadow: "var(--tc-shadow-inset)",
  },
};
