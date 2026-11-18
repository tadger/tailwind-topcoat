import { disabled } from "./_shared.js";

const thumb = {
  height: "var(--tc-control-height)",
  width: "var(--tc-range-thumb-width)",
  backgroundColor: "var(--tc-surface-raised)",
  border: "1px solid var(--tc-border)",
  borderRadius: "var(--tc-radius)",
  boxShadow: "var(--tc-shadow-inset)",
  cursor: "pointer",
};
const thumbFocus = {
  border: "1px solid var(--tc-focus-border)",
  boxShadow: "var(--tc-focus-inset), 0 0 0 2px var(--tc-focus-ring)",
};
const thumbActive = { border: "1px solid var(--tc-border)", boxShadow: "var(--tc-shadow-inset)" };
const track = {
  border: "1px solid var(--tc-border)",
  backgroundColor: "var(--tc-surface-sunken)",
  height: "var(--tc-range-track-height)",
  borderRadius: "var(--tc-radius-pill)",
};

export default {
  ".topcoat-range": {
    padding: "0",
    margin: "0",
    font: "inherit",
    color: "inherit",
    boxSizing: "border-box",
    backgroundClip: "padding-box",
    verticalAlign: "top",
    outline: "none",
    appearance: "none",
    ...track,
    "&::-webkit-slider-thumb": { ...thumb, appearance: "none" },
    "&::-moz-range-thumb": thumb,
    "&::-moz-range-track": track,
    "&:focus::-webkit-slider-thumb": thumbFocus,
    "&:focus::-moz-range-thumb": thumbFocus,
    "&:active::-webkit-slider-thumb": thumbActive,
    "&:active::-moz-range-thumb": thumbActive,
    "&:disabled": disabled,
  },
};
