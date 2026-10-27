/**
 * Genera las imágenes PNG que no pueden ser SVG:
 *   - public/assets/img/og-image.png  (vista previa al compartir, 1200 x 630)
 *   - public/favicon-32.png, public/apple-touch-icon.png, public/icon-192.png, public/icon-512.png
 *
 * Usa Playwright, que NO está en las dependencias (para mantenerlas mínimas).
 * Solo hace falta cuando cambia el arte:
 *
 *   npm i --no-save playwright && npx playwright install chromium
 *   node tools/images/render-png.mjs
 */
import { copyFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const root = new URL("../../", import.meta.url);
const out = (path) => fileURLToPath(new URL(path, root));

const browser = await chromium.launch();
try {
  // Imagen para redes
  const og = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await og.goto(new URL("tools/images/og.html", root).href);
  await og.evaluate(() => document.fonts.ready);
  await og.screenshot({ path: out("public/assets/img/og-image.png") });

  // Íconos cuadrados a partir de la insignia en pixel art
  for (const [file, size, pad] of [
    ["public/icon-512.png", 512, 64],
    ["public/icon-192.png", 192, 24],
    ["public/apple-touch-icon.png", 180, 22],
    ["public/favicon-32.png", 32, 2],
  ]) {
    const page = await browser.newPage({ viewport: { width: size, height: size } });
    const url = new URL("tools/images/icon.html", root);
    url.search = new URLSearchParams({ size: String(size), pad: String(pad) }).toString();
    await page.goto(url.href);
    await page.waitForFunction(() => document.images[0]?.complete);
    await page.screenshot({ path: out(file) });
    await page.close();
  }
  await copyFile(out("public/assets/img/badge.svg"), out("public/favicon.svg"));
  console.log("✓ PNG generados");
} finally {
  await browser.close();
}
