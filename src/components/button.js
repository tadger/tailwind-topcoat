import { sel, reset, disabled, raised, hoverFill, focusGlow, pressed, quiet, quietHover, quietPressed } from "./_shared.js";

// Button Bar buttons share Topcoat's button look, so they ride on these same selector lists.
const all = [
  "topcoat-button",
  "topcoat-button--quiet",
  "topcoat-button--large",
  "topcoat-button--large--quiet",
  "topcoat-button--cta",
  "topcoat-button--large--cta",
  "topcoat-button-bar__button",
  "topcoat-button-bar__button--large",
];
const quietOnes = ["topcoat-button--quiet", "topcoat-button--large--quiet"];
const cta = ["topcoat-button--cta", "topcoat-button--large--cta"];
const large = all.filter((n) => n.includes("--large"));
const nonCta = all.filter((n) => !cta.includes(n));
const pressable = ["topcoat-button", "topcoat-button--large", "topcoat-button-bar__button", "topcoat-button-bar__button--large"];

const largeSize = {
  fontSize: "var(--tc-font-size-large)",
  fontWeight: "var(--tc-font-weight-large)",
  lineHeight: "var(--tc-control-height-large)",
  padding: "0 var(--tc-padding-x-large)",
};

export default {
  [sel(all)]: { ...reset, padding: "0 var(--tc-padding-x)", lineHeight: "var(--tc-control-height)", ...raised },
  [sel(nonCta, ":hover")]: hoverFill,
  [`${sel(all, ":focus")}, ${sel(quietOnes, ":hover:focus")}`]: focusGlow,
  [`${sel(pressable, ":active")}, :checked + .topcoat-button-bar__button`]: pressed,
  [sel(["topcoat-button--quiet"])]: quiet,
  [sel(quietOnes, ":hover")]: quietHover,
  [`${sel(quietOnes, ":active")}, ${sel(quietOnes, ":focus:active")}`]: quietPressed,
  [sel(large)]: largeSize,
  [sel(["topcoat-button--large--quiet"])]: quiet,
  [sel(cta)]: {
    border: "1px solid var(--tc-cta-border)",
    backgroundColor: "var(--tc-cta-bg)",
    boxShadow: "var(--tc-focus-inset)",
    color: "var(--tc-text-on-accent)",
    fontWeight: "500",
    textShadow: "0 -1px rgba(0, 0, 0, 0.36)",
  },
  [sel(cta, ":hover")]: { backgroundColor: "var(--tc-cta-bg-hover)" },
  [sel(cta, ":active")]: {
    backgroundColor: "var(--tc-cta-bg-active)",
    boxShadow: "inset 0 1px rgba(0, 0, 0, 0.12)",
  },
  [sel(["topcoat-button--large--cta"])]: largeSize,
  [sel(all, ":disabled")]: disabled,
};
