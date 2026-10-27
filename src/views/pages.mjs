/** Páginas del sitio: la landing y la de error 404. */
import { html } from "../lib/html.mjs";
import { button } from "./components.mjs";
import { layout } from "./layout.mjs";
import { footer } from "./sections/footer.mjs";
import { hero } from "./sections/hero.mjs";
import { howToPlay } from "./sections/how-to-play.mjs";
import { maps } from "./sections/maps.mjs";
import { modes } from "./sections/modes.mjs";
import { navbar } from "./sections/navbar.mjs";

export function homePage(data, { csp, year, scripts }) {
  const body = html`${navbar(data)}
  <main id="contenido" tabindex="-1">
    ${hero(data)}
    ${modes(data)}
    ${maps(data)}
    ${howToPlay(data)}
  </main>
  ${footer({ ...data, year })}`;
  return layout({
    config: data.config,
    title: data.site.meta.title,
    description: data.site.meta.description,
    ogImage: data.site.meta.ogImage,
    ogImageAlt: data.site.meta.ogImageAlt,
    csp,
    scripts,
    body,
  });
}

export function notFoundPage(baseData, { csp, year, scripts }) {
  const data = { ...baseData, anchorBase: "/" };
  const body = html`${navbar(data)}
  <main id="contenido" tabindex="-1" class="not-found">
    <div class="hero-bg" aria-hidden="true"></div>
    <div class="relative mx-auto max-w-2xl px-4 text-center">
      <p class="not-found-code" aria-hidden="true">404</p>
      <h1 class="section-title mt-4">Caíste en combate</h1>
      <p class="mt-5 text-lg text-fog-300">La sala que buscas no existe o cambió de lugar. Vuelve a la base y elige otro objetivo.</p>
      <div class="mt-9 flex justify-center">${button({ href: "/", label: "Volver al inicio", iconName: "arrowUp" })}</div>
    </div>
  </main>
  ${footer({ ...data, year })}`;
  return layout({
    config: data.config,
    title: `Página no encontrada · ${data.config.name}`,
    description: data.site.meta.description,
    path: "/404",
    noindex: true,
    csp,
    scripts,
    body,
  });
}
