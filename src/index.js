import plugin from "tailwindcss/plugin";
import components from "./components/index.js";

// Components go in the base layer (not addComponents, which Tailwind v4 emits in the utilities layer):
// every utility, including ones under hover:/dark: variants, then beats them regardless of specificity or order.
// Side effect: all topcoat-* classes are always emitted (no per-class tree-shaking).
export default plugin(({ addBase }) => {
  addBase(components);
});
