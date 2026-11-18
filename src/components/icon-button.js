import { sel, reset, disabled, raised, hoverFill, focusGlow, pressed, quiet, quietHover, quietPressed } from "./_shared.js";

const all = ["topcoat-icon-button", "topcoat-icon-button--quiet", "topcoat-icon-button--large", "topcoat-icon-button--large--quiet"];
const quietOnes = ["topcoat-icon-button--quiet", "topcoat-icon-button--large--quiet"];
const large = ["topcoat-icon-button--large", "topcoat-icon-button--large--quiet"];

export default {
  [sel(all)]: {
    ...reset,
    ...raised,
    padding: "0 var(--tc-icon-button-padding-x)",
    lineHeight: "var(--tc-control-height)",
    verticalAlign: "baseline",
  },
  [sel(all, ":hover")]: hoverFill,
  [sel(all, '[aria-pressed="true"]')]: pressed,
  [`${sel(all, ":focus")}, ${sel(quietOnes, ":hover:focus")}`]: focusGlow,
  [`${sel(["topcoat-icon-button", "topcoat-icon-button--large"], ":active")}`]: pressed,
  [sel(["topcoat-icon-button--quiet"])]: quiet,
  [sel(quietOnes, ":hover")]: quietHover,
  [sel(quietOnes, '[aria-pressed="true"]:hover')]: { boxShadow: "var(--tc-shadow-inset-active)" },
  [`${sel(quietOnes, ":active")}, ${sel(quietOnes, ":focus:active")}`]: quietPressed,
  [sel(large)]: {
    width: "var(--tc-control-height-large)",
    height: "var(--tc-control-height-large)",
    lineHeight: "var(--tc-control-height-large)",
  },
  [sel(["topcoat-icon-button--large--quiet"])]: quiet,
  [sel(all, ":disabled")]: disabled,
  ".topcoat-icon, .topcoat-icon--large": {
    position: "relative",
    display: "inline-block",
    overflow: "hidden",
    width: "var(--tc-icon-size)",
    height: "var(--tc-icon-size)",
    verticalAlign: "middle",
    top: "-1px",
  },
  ".topcoat-icon--large": {
    width: "var(--tc-icon-size-large)",
    height: "var(--tc-icon-size-large)",
    top: "-2px",
  },
};
