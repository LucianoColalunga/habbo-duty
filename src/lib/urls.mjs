/**
 * Validación de enlaces. Todo href del sitio pasa por acá en el build:
 *   - "#seccion"          ancla interna
 *   - "/ruta"             archivo del propio sitio
 *   - "https://..."       sitio externo (sin usuario/contraseña en la URL)
 * Cualquier otra cosa (javascript:, data:, http:, //otro-sitio...) hace fallar
 * el build con un mensaje claro, en vez de publicarse.
 */

export class UrlError extends Error {}

export function safeHref(value, where = "enlace") {
  const v = String(value ?? "").trim();
  if (/^#[A-Za-z][\w-]*$/.test(v)) return v;
  if (/^\/(?!\/)[\w\-./]*$/.test(v) && !v.includes("..")) return v;
  let url;
  try {
    url = new URL(v);
  } catch {
    throw new UrlError(`${where}: "${v}" no es una URL válida`);
  }
  if (url.protocol !== "https:") throw new UrlError(`${where}: solo se permiten enlaces https:// (recibido "${v}")`);
  if (url.username || url.password) throw new UrlError(`${where}: la URL no puede llevar usuario ni contraseña`);
  return url.href;
}

/** Igual que safeHref, pero un valor vacío significa "todavía no hay enlace". */
export function optionalHref(value, where) {
  return String(value ?? "").trim() === "" ? null : safeHref(value, where);
}

export const isExternal = (href) => href.startsWith("https://");
