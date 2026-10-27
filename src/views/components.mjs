/**
 * Piezas reutilizables de la interfaz (botones, encabezados, íconos).
 * Todas devuelven fragmentos de `html`, así que el texto siempre se escapa.
 */
import { html, raw } from "../lib/html.mjs";
import { isExternal } from "../lib/urls.mjs";

/** Atributos para enlaces: los externos abren en otra pestaña y sin filtrar datos. */
export function linkAttrs(href) {
  return isExternal(href) ? html` href="${href}" target="_blank" rel="noopener noreferrer"` : html` href="${href}"`;
}

/** Aviso para lectores de pantalla en enlaces que abren otra pestaña. */
export function newTabHint(href) {
  return isExternal(href) ? html`<span class="sr-only"> (se abre en una pestaña nueva)</span>` : "";
}

/* Íconos en SVG en línea (decorativos: el texto del enlace o botón ya los describe). */
const ICONS = {
  arrowUpRight: '<path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"/>',
  arrowDown: '<path d="M12 5v14M6 13l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"/>',
  arrowUp: '<path d="M12 19V5M6 11l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"/>',
  crosshair:
    '<circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 1v6M12 17v6M1 12h6M17 12h6" stroke="currentColor" stroke-width="2"/><rect x="11" y="11" width="2" height="2" fill="currentColor"/>',
  chevron: '<path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="square"/>',
  check: '<path d="M4 12.5 9.5 18 20 6.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="square"/>',
  discord:
    '<path d="M4 6h16v10h-7l-4 4v-4H4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><rect x="8" y="10" width="2" height="2" fill="currentColor"/><rect x="14" y="10" width="2" height="2" fill="currentColor"/>',
  youtube:
    '<rect x="2.5" y="5.5" width="19" height="13" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="m10 9 5 3-5 3z" fill="currentColor"/>',
  tiktok: '<path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5M14 3c.5 2.6 2.4 4.4 5 4.6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
  instagram:
    '<rect x="3.5" y="3.5" width="17" height="17" rx="4.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><rect x="16" y="6" width="2" height="2" fill="currentColor"/>',
  x: '<path d="M4 4l16 16M20 4 4 20" stroke="currentColor" stroke-width="2.4" stroke-linecap="square"/>',
  code: '<path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"/>',
  users:
    '<circle cx="9" cy="8" r="3.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M2.5 20c.6-3.7 3.2-6 6.5-6s5.9 2.3 6.5 6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M15.5 4.8a3.5 3.5 0 0 1 0 6.4M18 14.3c2 .8 3.2 2.8 3.5 5.7" fill="none" stroke="currentColor" stroke-width="2"/>',
  swords:
    '<path d="M4 4l9 9M4 4h4M4 4v4M20 4l-9 9M20 4h-4M20 4v4M7 15l2 2M17 15l-2 2M5 19l3-3M19 19l-3-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
};

export function icon(name, className = "size-5") {
  const body = ICONS[name];
  if (!body) throw new Error(`Ícono desconocido: ${name}`);
  return raw(`<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${body}</svg>`);
}

/** Etiqueta chica en pixel art sobre los títulos. */
export function eyebrow(text, className = "") {
  return html`<p class="eyebrow ${className}">${text}</p>`;
}

/** Encabezado estándar de cada sección. */
export function sectionHeader({ id, eyebrow: kicker, title, intro }) {
  return html`<header class="mx-auto max-w-2xl text-center" data-reveal>
    ${eyebrow(kicker, "justify-center")}
    <h2 id="${id}" class="section-title mt-4">${title}</h2>
    <p class="mt-5 text-base text-fog-300 sm:text-lg">${intro}</p>
  </header>`;
}

/** Botón-enlace. variant: "primary" | "secondary". */
export function button({ href, label, variant = "primary", iconName = null, className = "" }) {
  return html`<a class="btn btn-${variant} ${className}"${linkAttrs(href)}>
    <span>${label}</span>${iconName ? icon(iconName, "size-5 shrink-0") : ""}${newTabHint(href)}
  </a>`;
}

/** Pastilla para enlaces que todavía no existen (por ejemplo, el Discord). */
export function soon(label, soonLabel, iconName) {
  return html`<span class="soon-pill" aria-disabled="true">
    ${iconName ? icon(iconName, "size-5 shrink-0") : ""}<span>${label}</span><span class="soon-tag">${soonLabel}</span>
  </span>`;
}

/** "El [campo de batalla] de Habbo" → resalta lo que va entre corchetes. */
export function accentTitle(title) {
  const parts = title.split(/\[(.+?)\]/);
  return parts.map((part, i) => (i % 2 ? html`<span class="text-gradient">${part}</span>` : part));
}
