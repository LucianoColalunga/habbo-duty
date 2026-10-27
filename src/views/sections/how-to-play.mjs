/** Cómo empezar (3 pasos) y bloque de comunidad con Discord, redes y reglas. */
import { html } from "../../lib/html.mjs";
import { button, eyebrow, icon, linkAttrs, newTabHint, sectionHeader, soon } from "../components.mjs";

function step(s, i, config) {
  const number = String(i + 1).padStart(2, "0");
  const text = s.text.replaceAll("{roomName}", config.roomName);
  return html`<li class="step-card" data-reveal>
    <div class="flex items-center justify-between gap-4">
      <span class="step-number" aria-hidden="true">${number}</span>
      <img src="${s.icon}" width="72" height="72" alt="" class="step-icon" loading="lazy" decoding="async" />
    </div>
    <h3 class="step-title"><span class="sr-only">Paso ${i + 1}: </span>${s.title}</h3>
    <p class="mt-3 text-fog-300">${text}</p>
    ${s.link === "hotel"
      ? html`<a class="text-link mt-5"${linkAttrs(config.hotelUrl)}>${s.linkLabel}${icon("arrowUpRight", "size-4")}${newTabHint(config.hotelUrl)}</a>`
      : ""}
  </li>`;
}

/** Un <li> por red social: enlace si tiene URL, "Próximamente" si no. */
export function socialItems(config, soonLabel) {
  return config.social.map(
    (s) => html`<li>
      ${s.url
        ? html`<a class="social-link"${linkAttrs(s.url)}>${icon(s.id, "size-5")}<span>${s.label}</span>${newTabHint(s.url)}</a>`
        : soon(s.label, soonLabel, s.id)}
    </li>`,
  );
}

function socialLinks(config, soonLabel, className = "") {
  return html`<ul class="flex flex-wrap gap-3 ${className}" role="list">
    ${socialItems(config, soonLabel)}
  </ul>`;
}

export function howToPlay({ config, site, howTo: t }) {
  const c = t.community;
  return html`<section id="como-jugar" class="section" aria-labelledby="como-jugar-title">
    <div class="section-glow section-glow--blue" aria-hidden="true"></div>
    <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      ${sectionHeader({ id: "como-jugar-title", eyebrow: t.eyebrow, title: t.title, intro: t.intro })}
      <ol class="steps mt-14 grid gap-6 lg:grid-cols-3 lg:gap-8" role="list">
        ${t.steps.map((s, i) => step(s, i, config))}
      </ol>
    </div>
  </section>

  <section id="comunidad" class="section section--alt" aria-labelledby="comunidad-title">
    <div class="relative mx-auto grid max-w-7xl items-start gap-10 px-4 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:gap-16 lg:px-8">
      <div data-reveal>
        ${eyebrow(c.eyebrow)}
        <h2 id="comunidad-title" class="section-title mt-4">${c.title}</h2>
        <p class="mt-5 max-w-xl text-lg text-fog-300">${c.text}</p>
        <div class="mt-8">
          ${config.discordUrl
            ? button({ href: config.discordUrl, label: c.discordLabel, iconName: "discord" })
            : soon(c.discordLabel, site.soonLabel, "discord")}
        </div>
        <h3 class="mt-10 text-sm font-semibold tracking-widest text-fog-400 uppercase">${c.socialTitle}</h3>
        ${socialLinks(config, site.soonLabel, "mt-4")}
      </div>
      <aside class="habbo-window" aria-labelledby="reglas-title" data-reveal>
        <div class="habbo-window-bar">
          <h3 id="reglas-title" class="habbo-window-title">${c.rulesTitle}</h3>
          <span class="habbo-window-dots" aria-hidden="true"><span></span><span></span></span>
        </div>
        <ol class="rules" role="list">
          ${c.rules.map((r, i) => html`<li><span class="rule-num" aria-hidden="true">${i + 1}</span><span>${r}</span></li>`)}
        </ol>
      </aside>
    </div>
  </section>`;
}
