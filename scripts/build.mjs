/**
 * Build del sitio estático → carpeta dist/
 *
 *   1. Valida configuración y contenido (src/config, src/content).
 *   2. Copia los archivos públicos (imágenes, fuentes, íconos).
 *   3. Compila Tailwind a un CSS minificado (sin CDN en el navegador).
 *   4. Copia los scripts del navegador (módulos ES, sin bundler).
 *   5. Genera index.html y 404.html desde las vistas.
 *   6. Genera robots.txt, sitemap.xml, security.txt y el manifest.
 *
 * Uso: npm run build
 */
import { spawnSync } from "node:child_process";
import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { toString } from "../src/lib/html.mjs";
import { loadSite } from "../src/lib/load-site.mjs";
import { homePage, notFoundPage } from "../src/views/pages.mjs";

const root = new URL("../", import.meta.url);
const dist = new URL("dist/", root);
const p = (url) => fileURLToPath(url);

/** La CSP vive en vercel.json (fuente única) y se repite como <meta> en el HTML. */
export async function readSecurityHeaders() {
  const vercel = JSON.parse(await readFile(new URL("vercel.json", root), "utf8"));
  const global = vercel.headers.find((h) => h.source === "/(.*)");
  const csp = global?.headers.find((h) => h.key === "Content-Security-Policy")?.value;
  if (!csp) throw new Error("vercel.json no tiene la cabecera Content-Security-Policy");
  return { vercel, csp };
}

/** frame-ancestors, report-uri y sandbox no funcionan dentro de <meta>. */
export function cspForMeta(csp) {
  return csp
    .split(";")
    .map((d) => d.trim())
    .filter((d) => d && !/^(frame-ancestors|report-uri|report-to|sandbox)\b/.test(d))
    .join("; ");
}

function runTailwind() {
  const cli = p(new URL("node_modules/@tailwindcss/cli/dist/index.mjs", root));
  const result = spawnSync(
    process.execPath,
    [cli, "-i", p(new URL("src/styles/main.css", root)), "-o", p(new URL("assets/css/main.css", dist)), "--minify"],
    { cwd: p(root), encoding: "utf8" },
  );
  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout);
    throw new Error("Falló la compilación de Tailwind");
  }
}

async function listFiles(dir, base = dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = new URL(entry.name + (entry.isDirectory() ? "/" : ""), dir);
    if (entry.isDirectory()) out.push(...(await listFiles(full, base)));
    else out.push(full.href.slice(base.href.length));
  }
  return out;
}

async function main() {
  const started = Date.now();
  const data = await loadSite();
  const { csp } = await readSecurityHeaders();
  const metaCsp = cspForMeta(csp);
  const year = new Date().getFullYear();

  await rm(dist, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });
  await cp(new URL("public/", root), dist, { recursive: true });
  await cp(new URL("src/scripts/", root), new URL("assets/js/", dist), { recursive: true });
  runTailwind();

  // modulepreload de todos los módulos para evitar la cascada de descargas
  const modules = (await listFiles(new URL("assets/js/", dist))).filter((f) => f.endsWith(".js") && f !== "main.js");
  const scripts = modules.map((f) => `/assets/js/${f}`);

  const opts = { csp: metaCsp, year, scripts };
  await writeFile(new URL("index.html", dist), toString(homePage(data, opts)), "utf8");
  await writeFile(new URL("404.html", dist), toString(notFoundPage(data, opts)), "utf8");

  const { siteUrl, securityContact, name, themeColor } = data.config;
  await writeFile(
    new URL("robots.txt", dist),
    `User-agent: *\nAllow: /\n${siteUrl ? `\nSitemap: ${siteUrl}/sitemap.xml\n` : ""}`,
    "utf8",
  );
  if (siteUrl) {
    const today = new Date().toISOString().slice(0, 10);
    await writeFile(
      new URL("sitemap.xml", dist),
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${siteUrl}/</loc><lastmod>${today}</lastmod></url>\n</urlset>\n`,
      "utf8",
    );
  }
  if (securityContact) {
    // RFC 9116: el campo Expires es obligatorio (menos de un año).
    const expires = new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString();
    await mkdir(new URL(".well-known/", dist), { recursive: true });
    await writeFile(
      new URL(".well-known/security.txt", dist),
      `Contact: ${securityContact}\nExpires: ${expires}\nPreferred-Languages: es, en\n${siteUrl ? `Canonical: ${siteUrl}/.well-known/security.txt\n` : ""}`,
      "utf8",
    );
  }
  await writeFile(
    new URL("site.webmanifest", dist),
    JSON.stringify(
      {
        name,
        short_name: name,
        lang: "es",
        start_url: "/",
        display: "standalone",
        background_color: themeColor,
        theme_color: themeColor,
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      null,
      2,
    ),
    "utf8",
  );

  const files = await listFiles(dist);
  let total = 0;
  for (const f of files) total += (await stat(new URL(f, dist))).size;
  console.log(`✓ Build listo en ${Date.now() - started} ms: ${files.length} archivos, ${(total / 1024).toFixed(0)} KB en dist/`);
}

// Solo corre el build cuando se ejecuta este archivo (no al importarlo en las pruebas).
const isCli = process.argv[1] && resolve(process.argv[1]).toLowerCase() === fileURLToPath(import.meta.url).toLowerCase();
if (isCli) {
  main().catch((error) => {
    console.error(`✗ ${error.message}`);
    process.exit(1);
  });
}
