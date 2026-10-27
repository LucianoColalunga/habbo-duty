/** Portada: título, llamados a la acción y la escena de batalla. */
import { html } from "../../lib/html.mjs";
import { accentTitle, button, eyebrow } from "../components.mjs";

export function hero({ site }) {
  const h = site.hero;
  return html`<section id="inicio" class="hero" aria-labelledby="hero-title">
    <div class="hero-bg" aria-hidden="true"></div>
    <div class="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:gap-6 lg:px-8">
      <div class="hero-copy">
        ${eyebrow(h.eyebrow)}
        <h1 id="hero-title" class="hero-title mt-6">${accentTitle(h.title)}</h1>
        <p class="mt-6 max-w-xl text-lg leading-relaxed text-fog-300 sm:text-xl">${h.subtitle}</p>
        <div class="mt-9 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
          ${button({ href: h.primaryCta.href, label: h.primaryCta.label, iconName: "crosshair" })}
          ${button({ href: h.secondaryCta.href, label: h.secondaryCta.label, variant: "secondary", iconName: "arrowDown" })}
        </div>
        <dl class="mt-10 grid max-w-lg grid-cols-3 gap-3">
          ${h.stats.map(
            (s) => html`<div class="stat">
              <dt class="stat-label">${s.label}</dt>
              <dd class="stat-value">${s.value}</dd>
            </div>`,
          )}
        </dl>
      </div>
      <figure class="hud-frame hero-art" data-accent="green">
        <img src="${h.image.src}" width="${h.image.width}" height="${h.image.height}" alt="${h.image.alt}" fetchpriority="high" decoding="async" class="relative z-10 h-auto w-full" />
        <figcaption class="hud-label">${h.imageLabel}</figcaption>
      </figure>
    </div>
  </section>
  <div class="ticker" aria-hidden="true">
    <div class="ticker-track">
      ${[0, 1].map(
        () => html`<ul class="ticker-list" role="list">
          ${h.ticker.map((t) => html`<li>${t}</li>`)}
        </ul>`,
      )}
    </div>
  </div>`;
}
