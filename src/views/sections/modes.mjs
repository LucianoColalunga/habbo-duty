/** Modos de juego: grilla de tres tarjetas interactivas. */
import { html } from "../../lib/html.mjs";
import { icon, sectionHeader } from "../components.mjs";

function modeCard(mode, t, { wide }) {
  const tacticsId = `tacticas-${mode.id}`;
  return html`<li class="${wide ? "md:col-span-2 lg:col-span-1" : ""}" data-reveal>
    <article class="mode-card ${wide ? "mode-card--wide" : ""}" data-accent="${mode.accent}" data-mode-card aria-labelledby="modo-${mode.id}">
      <div class="mode-art">
        <img src="${mode.image.src}" width="${mode.image.width}" height="${mode.image.height}" alt="${mode.image.alt}" loading="lazy" decoding="async" />
        <span class="mode-badge">${mode.badge}</span>
      </div>
      <div class="mode-body">
        <h3 id="modo-${mode.id}" class="mode-title">${mode.title}</h3>
        <p class="mode-tagline">${mode.tagline}</p>
        <p class="mt-4 text-fog-300">${mode.description}</p>
        <dl class="mode-stats">
          <div>
            <dt>${icon("users", "size-4")}${t.labels.players}</dt>
            <dd>${mode.players}</dd>
          </div>
          <div>
            <dt>${icon("swords", "size-4")}${t.labels.weapons}</dt>
            <dd>${mode.weapons.join(" · ")}</dd>
          </div>
          <div>
            <dt>${icon("bolt", "size-4")}${t.labels.focus}</dt>
            <dd>${mode.focus}</dd>
          </div>
        </dl>
        <button type="button" class="tactics-toggle" aria-expanded="false" aria-controls="${tacticsId}" data-tactics-toggle data-label-closed="${t.tacticsLabel}" data-label-open="${t.tacticsLabelOpen}" hidden>
          <span data-tactics-label>${t.tacticsLabel}</span>${icon("chevron", "size-4 tactics-chevron")}
        </button>
        <div id="${tacticsId}" class="tactics" data-tactics>
          <p class="tactics-title">${t.tacticsTitle}</p>
          <ul role="list">
            ${mode.tips.map((tip) => html`<li>${tip}</li>`)}
          </ul>
        </div>
      </div>
    </article>
  </li>`;
}

export function modes({ modes: t }) {
  const last = t.items.length - 1;
  return html`<section id="modos" class="section" aria-labelledby="modos-title">
    <div class="section-glow section-glow--red" aria-hidden="true"></div>
    <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      ${sectionHeader({ id: "modos-title", eyebrow: t.eyebrow, title: t.title, intro: t.intro })}
      <ul class="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8" role="list">
        ${t.items.map((mode, i) => modeCard(mode, t, { wide: i === last && t.items.length % 2 === 1 }))}
      </ul>
    </div>
  </section>`;
}
