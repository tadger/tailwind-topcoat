import plugin from "tailwindcss/plugin";
import components from "./components/index.js";

export default plugin(({ addComponents }) => {
  addComponents(components);
});
