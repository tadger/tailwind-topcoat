import { reset } from "./_shared.js";

export default {
  ".topcoat-notification": {
    ...reset,
    padding: "0.15em 0.5em 0.2em",
    borderRadius: "2px",
    backgroundColor: "var(--tc-invalid)",
    color: "var(--tc-text-on-accent)",
  },
};
