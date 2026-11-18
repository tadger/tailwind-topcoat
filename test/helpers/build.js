import { compile } from "@tailwindcss/node";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../..", import.meta.url));

/** Compiles `@import "tailwindcss"` + the plugin entry; returns CSS text. */
export async function buildCss({ candidates = [], extraCss = "" } = {}) {
  const input = `@import "tailwindcss";\n@import "${root}index.css";\n${extraCss}`;
  const compiler = await compile(input, { base: root, onDependency() {} });
  return compiler.build(candidates);
}
