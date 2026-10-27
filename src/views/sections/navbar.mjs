/** Barra de navegación fija con menú hamburguesa en celulares. */
import { html } from "../../lib/html.mjs";
import { button, icon, linkAttrs, newTabHint } from "../components.mjs";

export function logo(name, base = "") {
  const [first, ...rest] = name.split(" ");
  return html`<a href="${base}#inicio" class="logo group" aria-label="${name}: ir al inicio">
    <img src="/assets/img/badge.svg" width="36" height="38" alt="" class="logo-badge" />
    <span class="logo-text" aria-hidden="true">${first}<span class="text-neon-green">${rest.join(" ")}</span></span>
  </a>`;
}

export function navbar({ config, site, anchorBase = "" }) {
  // En la 404 las anclas apuntan a la portada ("/#modos").
  const links = site.navigation.map((l) => ({ ...l, href: l.href.startsWith("#") ? anchorBase + l.href : l.href }));
  return html`<header class="site-header" data-header>
    <nav class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-20 lg:px-8" aria-label="Principal">
      ${logo(config.name, anchorBase)}
      <ul class="hidden items-center gap-1 lg:flex xl:gap-3" role="list">
        ${links.map((l) => html`<li><a class="nav-link" href="${l.href}" data-nav-link>${l.label}</a></li>`)}
      </ul>
      <div class="flex items-center gap-2">
        ${button({ href: config.hotelUrl, label: site.navCta, iconName: "crosshair", className: "btn-sm hidden sm:inline-flex" })}
        <button type="button" class="menu-toggle lg:hidden" aria-expanded="false" aria-controls="menu-movil" data-menu-toggle>
          <span class="sr-only" data-menu-label>Abrir menú</span>
          <span class="menu-bars" aria-hidden="true"><span></span><span></span><span></span></span>
        </button>
      </div>
    </nav>
    <div id="menu-movil" class="mobile-menu lg:hidden" data-mobile-menu>
      <ul class="mx-auto flex max-w-7xl flex-col px-4 py-4 sm:px-6" role="list">
        ${links.map((l) => html`<li><a class="mobile-link" href="${l.href}" data-nav-link>${l.label}${icon("arrowUpRight", "size-4 opacity-60")}</a></li>`)}
        <li class="mt-4">
          <a class="btn btn-primary w-full"${linkAttrs(config.hotelUrl)}><span>${site.mobileCta}</span>${icon("crosshair", "size-5")}${newTabHint(config.hotelUrl)}</a>
        </li>
      </ul>
    </div>
  </header>`;
}
