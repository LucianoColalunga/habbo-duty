/**
 * Corre el build completo y revisa el HTML generado: estructura accesible,
 * nada en línea (CSP estricta), enlaces externos seguros y archivos existentes.
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { before, describe, test } from "node:test";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const dist = new URL("dist/", root);
const read = (path) => readFileSync(new URL(path, dist), "utf8");

before(() => {
  const r = spawnSync(process.execPath, [fileURLToPath(new URL("scripts/build.mjs", root))], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr || r.stdout);
});

for (const page of ["index.html", "404.html"]) {
  describe(page, () => {
    const html = () => read(page);

    test("idioma español y un solo h1", () => {
      assert.match(html(), /<html lang="es"/);
      assert.equal(html().match(/<h1[\s>]/g)?.length, 1);
    });

    test("sin scripts en línea, sin style= y sin onclick=", () => {
      assert.doesNotMatch(html(), /<script(?![^>]*\bsrc=)[^>]*>/i, "hay un <script> sin src");
      assert.doesNotMatch(html(), /\sstyle\s*=/i, "hay un atributo style");
      assert.doesNotMatch(html(), /\son[a-z]+\s*=/i, "hay un manejador de eventos en línea");
      assert.doesNotMatch(html(), /<style[\s>]/i, "hay un bloque <style>");
    });

    test("la CSP también viaja como <meta> y no permite unsafe-*", () => {
      const meta = html().match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)"/);
      assert.ok(meta, "falta la CSP en <meta>");
      const csp = meta[1].replaceAll("&#39;", "'"); // el HTML escapa las comillas del atributo
      assert.doesNotMatch(csp, /unsafe-/);
      assert.match(csp, /script-src 'self'/);
    });

    test("todo enlace que abre otra pestaña lleva rel=noopener noreferrer", () => {
      const blanks = html().match(/<a\b[^>]*target="_blank"[^>]*>/g) ?? [];
      assert.ok(page === "404.html" || blanks.length > 0);
      for (const a of blanks) assert.match(a, /rel="noopener noreferrer"/, a);
    });

    test("todas las imágenes tienen alt", () => {
      for (const img of html().match(/<img\b[^>]*>/g) ?? []) assert.match(img, /\salt="/, img);
    });

    test("los id son únicos y las anclas internas existen", () => {
      const ids = [...html().matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
      assert.equal(new Set(ids).size, ids.length, "hay id repetidos");
      const anchors = [...html().matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
      for (const a of anchors) assert.ok(ids.includes(a), `#${a} no existe`);
    });

    test("los archivos propios referenciados existen en dist/", () => {
      const refs = [...html().matchAll(/(?:src|href)="(\/[^"#?]+)"/g)].map((m) => m[1]).filter((r) => r !== "/");
      assert.ok(refs.length > 0);
      for (const ref of refs) assert.ok(existsSync(new URL(`.${ref}`, dist)), `falta ${ref}`);
    });
  });
}

test("la landing tiene todas las secciones pedidas", () => {
  const html = read("index.html");
  for (const id of ["inicio", "modos", "mapas", "como-jugar", "comunidad"]) assert.match(html, new RegExp(`<section id="${id}"`));
  for (const text of ["1 vs 1", "2 vs 2", "5 vs 5", "Mapa de Guerra", "Mapa de Japón", "Unirse al Juego", "Ver Mapas", "Jugar Ahora", "No está afiliado"]) {
    assert.ok(html.includes(text), `falta "${text}"`);
  }
});

test("los archivos auxiliares se generan", () => {
  assert.match(read("robots.txt"), /User-agent: \*/);
  assert.match(read(".well-known/security.txt"), /^Contact: https:\/\//m);
  assert.match(read(".well-known/security.txt"), /^Expires: /m);
  assert.equal(JSON.parse(read("site.webmanifest")).lang, "es");
  assert.ok(existsSync(new URL("assets/css/main.css", dist)));
  assert.ok(existsSync(new URL("assets/js/main.js", dist)));
});
