/**
 * Servidor local para probar dist/ con las MISMAS cabeceras de seguridad que
 * Vercel (las lee de vercel.json). Así, si algo rompe la CSP, se ve en local.
 *
 * Uso: npm run preview   →   http://localhost:4173
 *
 * Solo para desarrollo: escucha en 127.0.0.1 y bloquea rutas fuera de dist/.
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const dist = resolve(root, "dist");
const port = Number(process.env.PORT ?? 4173);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".json": "application/json; charset=utf-8",
};

/** Convierte los "source" de vercel.json ("/assets/fonts/(.*)") en expresiones regulares. */
function compileRules(vercel) {
  return vercel.headers.map((rule) => {
    const pattern = rule.source
      .split("(.*)")
      .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join(".*");
    return { re: new RegExp(`^${pattern}$`), headers: rule.headers };
  });
}

/** Resuelve la ruta pedida dentro de dist/ o devuelve null si intenta salir. */
export function resolveInside(base, urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    return null;
  }
  if (decoded.includes("\0")) return null;
  const full = normalize(join(base, decoded));
  return full === base || full.startsWith(base + sep) ? full : null;
}

async function findFile(urlPath) {
  const candidates = urlPath.endsWith("/") ? [`${urlPath}index.html`] : [urlPath, `${urlPath}.html`];
  for (const candidate of candidates) {
    const full = resolveInside(dist, candidate);
    if (!full) return null;
    try {
      if ((await stat(full)).isFile()) return full;
    } catch {
      /* sigue con el próximo candidato */
    }
  }
  return null;
}

async function start() {
  const vercel = JSON.parse(await readFile(join(root, "vercel.json"), "utf8"));
  const rules = compileRules(vercel);

  const server = createServer(async (req, res) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405, { Allow: "GET, HEAD" }).end();
      return;
    }
    const { pathname } = new URL(req.url ?? "/", "http://localhost");
    for (const rule of rules) {
      if (rule.re.test(pathname)) for (const h of rule.headers) res.setHeader(h.key, h.value);
    }
    const file = await findFile(pathname);
    const status = file ? 200 : 404;
    const target = file ?? join(dist, "404.html");
    try {
      const body = await readFile(target);
      res.writeHead(status, { "Content-Type": TYPES[extname(target)] ?? "application/octet-stream" });
      res.end(req.method === "HEAD" ? undefined : body);
    } catch {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("No encontrado. ¿Corriste npm run build?");
    }
  });

  server.listen(port, "127.0.0.1", () => {
    console.log(`Vista previa con cabeceras de producción: http://localhost:${port}`);
  });
}

// Solo arranca el servidor cuando se ejecuta este archivo (no al importarlo en las pruebas).
if (process.argv[1] && resolve(process.argv[1]).toLowerCase() === fileURLToPath(import.meta.url).toLowerCase()) {
  start();
}
