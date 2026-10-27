import assert from "node:assert/strict";
import { test } from "node:test";
import { escapeHtml, html, raw, toString } from "../src/lib/html.mjs";

test("escapa los 5 caracteres peligrosos", () => {
  assert.equal(escapeHtml(`<a href="x" onclick='y'>&</a>`), "&lt;a href=&quot;x&quot; onclick=&#39;y&#39;&gt;&amp;&lt;/a&gt;");
});

test("los valores interpolados se escapan siempre", () => {
  const evil = `"><script>alert(1)</script>`;
  const out = toString(html`<p title="${evil}">${evil}</p>`);
  assert.ok(!out.includes("<script>"));
  assert.equal(out, `<p title="&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;">&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;</p>`);
});

test("los fragmentos anidados y las listas no se escapan dos veces", () => {
  const items = ["a<b", "c"].map((t) => html`<li>${t}</li>`);
  assert.equal(toString(html`<ul>${items}</ul>`), "<ul><li>a&lt;b</li><li>c</li></ul>");
});

test("null, undefined y false no imprimen nada; 0 sí", () => {
  assert.equal(toString(html`${null}${undefined}${false}${0}`), "0");
});

test("raw solo inserta lo que se marcó a mano", () => {
  assert.equal(toString(html`${raw("<br>")}`), "<br>");
});
