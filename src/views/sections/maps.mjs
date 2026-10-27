/**
 * Mapas destacados. Sin JavaScript se ven todos uno debajo del otro; con
 * JavaScript se convierten en pestañas accesibles (role="tablist").
 */
import { html } from "../../lib/html.mjs";
import { icon, sectionHeader } from "../components.mjs";

function mapPanel(map, t) {
  return html`<article id="mapa-${map.id}" class="map-panel" data-accent="${map.accent}" data-map-panel aria-labelledby="mapa-${map.id}-title">
    <figure class="hud-frame map-figure" data-accent="${map.accent}">
      <img src="${map.image.src}" width="${map.image.width}" height="${map.image.height}" alt="${map.image.alt}" loading="lazy" decoding="async" class="relative z-10 h-auto w-full" />
    </figure>
    <div class="map-info">
      <p class="map-tag">${map.tag}</p>
      <h3 id="mapa-${map.id}-title" class="map-title">${map.name}</h3>
      <p class="mt-4 leading-relaxed text-fog-300">${map.description}</p>
      <h4 class="map-subtitle">${t.labels.features}</h4>
      <ul class="map-features" role="list">
        ${map.features.map((f) => html`<li>${icon("check", "size-4 shrink-0")}<span>${f}</span></li>`)}
      </ul>
      <dl class="map-meta">
        <div>
          <dt>${t.labels.bestFor}</dt>
          <dd class="flex flex-wrap gap-2">${map.bestFor.map((b) => html`<span class="chip">${b}</span>`)}</dd>
        </div>
        <div>
          <dt>${t.labels.playstyle}</dt>
          <dd>${map.playstyle}</dd>
        </div>
      </dl>
    </div>
  </article>`;
}

export function maps({ maps: t }) {
  return html`<section id="mapas" class="section section--alt" aria-labelledby="mapas-title">
    <div class="section-glow section-glow--green" aria-hidden="true"></div>
    <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      ${sectionHeader({ id: "mapas-title", eyebrow: t.eyebrow, title: t.title, intro: t.intro })}
      <div class="map-tabs" role="tablist" aria-label="${t.tablistLabel}" data-map-tablist hidden>
        ${t.items.map(
          (map, i) => html`<button type="button" class="map-tab" role="tab" id="tab-${map.id}" aria-controls="mapa-${map.id}" aria-selected="${i === 0 ? "true" : "false"}" tabindex="${i === 0 ? "0" : "-1"}" data-accent="${map.accent}" data-map-tab>
            <img src="${map.image.src}" width="${map.image.width}" height="${map.image.height}" alt="" loading="lazy" decoding="async" class="map-tab-thumb" />
            <span class="flex flex-col items-start text-left">
              <span class="map-tab-name">${map.name}</span>
              <span class="map-tab-tag">${map.tag}</span>
            </span>
          </button>`,
        )}
      </div>
      <div class="mt-10 space-y-16" data-reveal>
        ${t.items.map((map) => mapPanel(map, t))}
      </div>
    </div>
  </section>`;
}
