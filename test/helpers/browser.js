import { chromium } from "playwright";
import { buildCss } from "./build.js";

let browserPromise;
const getBrowser = () => (browserPromise ??= chromium.launch());

/** Call from `after()` in each browser test file. */
export async function closeBrowser() {
  if (!browserPromise) return;
  const b = await browserPromise;
  browserPromise = undefined;
  await b.close();
}

const classesIn = (html) => [...html.matchAll(/class="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/)).filter(Boolean);

/**
 * Renders `html` with the plugin's CSS in Chromium.
 * scale "mobile" sets data-topcoat on the wrapper; scheme drives prefers-color-scheme.
 */
export async function renderPage(html, { scheme = "light", scale = "desktop", dir = "ltr", width = 600 } = {}) {
  const css = await buildCss({ candidates: classesIn(html) });
  const browser = await getBrowser();
  const context = await browser.newContext({ colorScheme: scheme, viewport: { width, height: 800 } });
  const page = await context.newPage();
  page.setDefaultTimeout(3000);
  const scaleAttr = scale === "mobile" ? ' data-topcoat="mobile"' : "";
  await page.setContent(
    `<!doctype html><html dir="${dir}"><head><meta charset="utf-8"><style>${css}</style></head>` +
      `<body style="margin:16px"><div id="root"${scaleAttr}>${html}</div></body></html>`,
  );
  return { page, close: () => context.close() };
}
