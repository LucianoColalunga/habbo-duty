import assert from "node:assert/strict";
import { test } from "node:test";
import { isExternal, optionalHref, safeHref, UrlError } from "../src/lib/urls.mjs";

test("acepta anclas, rutas propias y https", () => {
  assert.equal(safeHref("#modos"), "#modos");
  assert.equal(safeHref("/assets/img/hero-battle.svg"), "/assets/img/hero-battle.svg");
  assert.equal(safeHref("https://www.habbo.es"), "https://www.habbo.es/");
});

test("rechaza esquemas y rutas peligrosas", () => {
  for (const bad of [
    "javascript:alert(1)",
    " JavaScript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "vbscript:msgbox(1)",
    "http://sitio-sin-https.com",
    "//otro-sitio.com",
    "/../../etc/passwd",
    "/ruta con espacios",
    "#",
    "https://usuario:clave@ejemplo.com",
    "",
  ]) {
    assert.throws(() => safeHref(bad), UrlError, `debería rechazar ${JSON.stringify(bad)}`);
  }
});

test("un enlace opcional vacío significa 'todavía no hay'", () => {
  assert.equal(optionalHref(""), null);
  assert.equal(optionalHref("   "), null);
  assert.throws(() => optionalHref("javascript:alert(1)"), UrlError);
});

test("solo https cuenta como externo", () => {
  assert.equal(isExternal("https://discord.gg/abc"), true);
  assert.equal(isExternal("#mapas"), false);
  assert.equal(isExternal("/"), false);
});
