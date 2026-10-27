/**
 * Controles de seguridad del repositorio (se corren con npm test):
 * cabeceras de Vercel, JavaScript sin sumideros de XSS, ignores correctos,
 * dependencias fijadas y una búsqueda simple de secretos.
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { cspForMeta } from "../scripts/build.mjs";
import { resolveInside } from "../scripts/serve.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const vercel = JSON.parse(readFileSync(join(root, "vercel.json"), "utf8"));
const global = vercel.headers.find((h) => h.source === "/(.*)").headers;
const header = (key) => global.find((h) => h.key === key)?.value;

function walk(dir, skip) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (skip.has(name)) continue;
    if (statSync(full).isDirectory()) out.push(...walk(full, skip));
    else out.push(full);
  }
  return out;
}

test("CSP estricta: sin unsafe-*, sin comodines y sin dominios externos", () => {
  const csp = header("Content-Security-Policy");
  assert.ok(csp);
  assert.doesNotMatch(csp, /unsafe-|\*|https?:|data:|blob:/);
  for (const d of ["default-src 'none'", "script-src 'self'", "style-src 'self'", "frame-ancestors 'none'", "base-uri 'none'", "form-action 'none'", "object-src 'none'", "require-trusted-types-for 'script'"]) {
    assert.ok(csp.includes(d), `falta ${d}`);
  }
  assert.ok(!cspForMeta(csp).includes("frame-ancestors"), "frame-ancestors no va en <meta>");
});

test("el resto de las cabeceras de seguridad están presentes", () => {
  assert.match(header("Strict-Transport-Security"), /max-age=(\d+)/);
  assert.ok(Number(header("Strict-Transport-Security").match(/max-age=(\d+)/)[1]) >= 31536000);
  assert.equal(header("X-Frame-Options"), "DENY");
  assert.equal(header("X-Content-Type-Options"), "nosniff");
  assert.equal(header("Referrer-Policy"), "strict-origin-when-cross-origin");
  assert.match(header("Permissions-Policy"), /camera=\(\)/);
  assert.match(header("Permissions-Policy"), /geolocation=\(\)/);
  assert.equal(header("Cross-Origin-Opener-Policy"), "same-origin");
});

test("el JavaScript del navegador no usa sumideros de XSS", () => {
  const files = walk(join(root, "src", "scripts"), new Set());
  assert.ok(files.length > 0);
  const banned = [/\.innerHTML\b/, /\.outerHTML\b/, /insertAdjacentHTML/, /document\.write/, /\beval\s*\(/, /new\s+Function\s*\(/, /setAttribute\(\s*["'](style|on\w+|href|src)["']/, /setTimeout\(\s*["']/];
  for (const file of files) {
    const code = readFileSync(file, "utf8");
    for (const re of banned) assert.doesNotMatch(code, re, `${relative(root, file)} usa ${re}`);
  }
});

test("los ignores dejan afuera secretos, dependencias y la carpeta de Vercel", () => {
  for (const file of [".gitignore", ".vercelignore"]) {
    const text = readFileSync(join(root, file), "utf8");
    for (const entry of ["node_modules/", ".env", ".vercel/", "dist/"]) assert.ok(text.includes(entry), `${file} no ignora ${entry}`);
  }
});

test(".npmrc no guarda tokens y bloquea scripts de instalación", () => {
  const npmrc = readFileSync(join(root, ".npmrc"), "utf8");
  assert.doesNotMatch(npmrc, /_auth|_password|token/i);
  assert.match(npmrc, /^ignore-scripts=true$/m);
});

test("dependencias mínimas: nada en producción y versiones fijas", () => {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  assert.equal(Object.keys(pkg.dependencies ?? {}).length, 0, "el sitio no debería tener dependencias de producción");
  for (const [name, version] of Object.entries(pkg.devDependencies ?? {})) assert.match(version, /^\d+\.\d+\.\d+$/, `${name} no está fijada`);
});

test("no hay secretos en los archivos del repositorio", () => {
  const skip = new Set(["node_modules", "dist", ".git", ".vercel"]);
  const binary = /\.(png|woff2|ico|jpg|jpeg|gif|webp)$/i;
  const patterns = [
    [/AKIA[0-9A-Z]{16}/, "clave de AWS"],
    [/gh[pousr]_[A-Za-z0-9]{36,}/, "token de GitHub"],
    [/github_pat_[A-Za-z0-9_]{40,}/, "token de GitHub"],
    [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, "clave privada"],
    [/xox[abpr]-[A-Za-z0-9-]{10,}/, "token de Slack"],
    [/sk-[A-Za-z0-9]{32,}/, "clave de API"],
    [/discord(app)?\.com\/api\/webhooks\/\d+\/[\w-]+/i, "webhook de Discord"],
    [/(api[_-]?key|secret|token|password)\s*[:=]\s*["'][^"'\s]{12,}["']/i, "credencial en texto"],
  ];
  const files = walk(root, skip).filter((f) => !binary.test(f));
  assert.ok(files.length > 10);
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    for (const [re, what] of patterns) assert.doesNotMatch(text, re, `posible ${what} en ${relative(root, file)}`);
  }
  assert.ok(!files.some((f) => /(^|[\\/])\.env(\.|$)/.test(relative(root, f))), "hay un archivo .env en el repo");
});

test("el servidor local no deja salir de dist/ (path traversal)", () => {
  const base = join(root, "dist");
  assert.ok(resolveInside(base, "/assets/css/main.css"));
  for (const bad of ["/../package.json", "/..%2f..%2fpackage.json", "/%2e%2e/vercel.json", "/a%00b", "/%E0%A4%A"]) {
    assert.equal(resolveInside(base, bad), null, bad);
  }
});
