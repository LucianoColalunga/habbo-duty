import assert from "node:assert/strict";
import { test } from "node:test";
import config from "../src/config/site.config.mjs";
import { ContentError, loadSite, validateConfig } from "../src/lib/load-site.mjs";
import { UrlError } from "../src/lib/urls.mjs";

test("la configuración y el contenido actuales son válidos", async () => {
  const data = await loadSite();
  assert.equal(data.modes.items.length, 3);
  assert.deepEqual(
    data.modes.items.map((m) => m.badge),
    ["1 vs 1", "2 vs 2", "5 vs 5"],
  );
  assert.equal(data.maps.items.length, 2);
  assert.equal(data.howTo.steps.length, 3);
});

test("los enlaces vacíos de redes quedan como 'Próximamente' (null)", () => {
  const c = validateConfig({ ...config, discordUrl: "", social: [{ id: "youtube", label: "YouTube", url: "" }] });
  assert.equal(c.discordUrl, null);
  assert.equal(c.social[0].url, null);
});

test("un enlace inseguro en la configuración corta el build", () => {
  assert.throws(() => validateConfig({ ...config, discordUrl: "javascript:alert(1)" }), UrlError);
  assert.throws(() => validateConfig({ ...config, hotelUrl: "http://www.habbo.es" }), UrlError);
  assert.throws(() => validateConfig({ ...config, social: [{ id: "x", label: "X", url: "data:text/html,hola" }] }), UrlError);
});

test("siteUrl tiene que ser https y sin barra final", () => {
  assert.throws(() => validateConfig({ ...config, siteUrl: "https://habbo-duty.vercel.app/" }), ContentError);
  assert.throws(() => validateConfig({ ...config, siteUrl: "http://habbo-duty.vercel.app" }), ContentError);
  assert.equal(validateConfig({ ...config, siteUrl: "" }).siteUrl, "");
});

test("los id de redes no pueden traer caracteres raros (se usan en el HTML)", () => {
  assert.throws(() => validateConfig({ ...config, social: [{ id: 'x" onclick="1', label: "X", url: "" }] }), ContentError);
});
