import { hiddenInput, disabled, focusGlow, pressed } from "./_shared.js";

const mark = ".topcoat-checkbox__checkmark";
const input = ".topcoat-checkbox > input";

export default {
  ".topcoat-checkbox": {
    position: "relative",
    display: "inline-block",
    verticalAlign: "top",
    cursor: "default",
    userSelect: "none",
    lineHeight: "var(--tc-check-size)",
    color: "var(--tc-text)",
  },
  [input]: {
    ...hiddenInput,
    height: "var(--tc-check-size)",
    width: "var(--tc-check-size)",
    margin: "0 calc(-1 * var(--tc-check-size)) calc(-1 * var(--tc-check-size)) 0",
  },
  [mark]: {
    boxSizing: "border-box",
    backgroundClip: "padding-box",
    position: "relative",
    display: "inline-block",
    verticalAlign: "top",
    cursor: "default",
    userSelect: "none",
    width: "var(--tc-check-size)",
    height: "var(--tc-check-size)",
    "&::before, &::after": { content: "''", position: "absolute" },
    "&::before": {
      boxSizing: "border-box",
      backgroundClip: "padding-box",
      width: "var(--tc-check-size)",
      height: "var(--tc-check-size)",
      background: "var(--tc-surface-raised)",
      border: "1px solid var(--tc-border)",
      borderRadius: "3px",
      boxShadow: "var(--tc-shadow-inset)",
    },
    "&::after": {
      top: "var(--tc-checkmark-top)",
      left: "var(--tc-checkmark-left)",
      opacity: "0",
      width: "var(--tc-checkmark-width)",
      height: "var(--tc-checkmark-height)",
      background: "transparent",
      border: "var(--tc-checkmark-thickness) solid var(--tc-text)",
      borderTop: "none",
      borderRight: "none",
      borderRadius: "1px",
      transform: "rotate(-50deg)",
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
