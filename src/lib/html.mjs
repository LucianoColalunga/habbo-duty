/**
 * Plantillas HTML seguras para generar la página en el build.
 *
 * `html` es una "tagged template": todo valor interpolado se escapa por
 * defecto (&, <, >, ", '), así que un texto del contenido nunca puede
 * inyectar etiquetas ni atributos. Solo lo que ya pasó por `html` o lo que se
 * marca a mano con `raw()` se inserta sin escapar.
 */

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ESCAPES[ch]);
}

/** Fragmento de HTML ya seguro (resultado de `html` o de `raw`). */
class SafeHtml {
  constructor(value) {
    this.value = value;
  }
  toString() {
    return this.value;
  }
}

/** Marca un texto como HTML confiable. Usar solo con texto escrito en el código. */
export function raw(trusted) {
  return new SafeHtml(String(trusted));
}

function renderValue(value) {
  if (value === null || value === undefined || value === false) return "";
  if (value instanceof SafeHtml) return value.value;
  if (Array.isArray(value)) return value.map(renderValue).join("");
  return escapeHtml(value);
}

export function html(strings, ...values) {
  let out = strings[0];
  for (let i = 0; i < values.length; i++) out += renderValue(values[i]) + strings[i + 1];
  return new SafeHtml(out);
}

/** Convierte un fragmento a texto final. */
export function toString(fragment) {
  return renderValue(fragment);
}
