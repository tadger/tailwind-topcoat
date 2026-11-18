import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const ref = fileURLToPath(new URL("../../reference/topcoat-mobile-light.css", import.meta.url));

// Topdoc names are per variant ("Large Quiet Button"); strip modifier words to get the component.
const family = (name) =>
  name.replace(/\b(large|quiet|call to action)\b\s*/gi, "").trim().toLowerCase();

/** Every `topcoat-*` class used in the topdoc markup of the component and its variants (e.g. "Search Input"). */
export function topdocClasses(component) {
  const css = readFileSync(ref, "utf8");
  const classes = new Set();
  for (const [, body] of css.matchAll(/\/\* topdoc([\s\S]*?)\*\//g)) {
    const name = body.match(/^\s*name:\s*(.+)$/m)?.[1].trim();
    if (!name || family(name) !== component.toLowerCase()) continue;
    const markup = body.match(/markup:\s*\n([\s\S]*?)(?=\n\s{2}\w[\w-]*:|\s*$)/)?.[1] ?? "";
    for (const [, attr] of markup.matchAll(/class="([^"]+)"/g)) {
      for (const c of attr.split(/\s+/)) if (c.startsWith("topcoat-")) classes.add(c);
    }
  }
  return classes;
}

/** All section names in the reference topdoc comments. */
export function topdocNames() {
  const css = readFileSync(ref, "utf8");
  return [...css.matchAll(/\/\* topdoc[\s\S]*?^\s*name:\s*(.+)$/gm)].map((m) => m[1].trim());
}
