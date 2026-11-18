// Structure only: the bar's buttons get their look from button.js (topcoat-button-bar__button*).
export default {
  ".topcoat-button-bar": {
    display: "table",
    tableLayout: "fixed",
    whiteSpace: "nowrap",
    margin: "0",
    padding: "0",
  },
  ".topcoat-button-bar__item": {
    display: "table-cell",
    width: "auto",
    borderRadius: "0",
  },
  ".topcoat-button-bar__item > input": {
    position: "absolute",
    overflow: "hidden",
    padding: "0",
    border: "0",
    opacity: "0.001",
    zIndex: "1",
    verticalAlign: "top",
    outline: "none",
  },
  ".topcoat-button-bar > .topcoat-button-bar__item:first-child": {
    borderTopLeftRadius: "var(--tc-radius)",
    borderBottomLeftRadius: "var(--tc-radius)",
  },
  ".topcoat-button-bar > .topcoat-button-bar__item:last-child": {
    borderTopRightRadius: "var(--tc-radius)",
    borderBottomRightRadius: "var(--tc-radius)",
  },
  ".topcoat-button-bar__item:first-child > .topcoat-button-bar__button, .topcoat-button-bar__item:first-child > .topcoat-button-bar__button--large": {
    borderRight: "none",
  },
  ".topcoat-button-bar__item:last-child > .topcoat-button-bar__button, .topcoat-button-bar__item:last-child > .topcoat-button-bar__button--large": {
    borderLeft: "none",
  },
  ".topcoat-button-bar__button, .topcoat-button-bar__button--large": {
    borderRadius: "inherit",
  },
  ".topcoat-button-bar__button:focus, .topcoat-button-bar__button--large:focus": {
    zIndex: "1",
  },
};
