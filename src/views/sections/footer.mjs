/** Pie de página con descargo legal, navegación y redes. */
import { html } from "../../lib/html.mjs";
import { icon, linkAttrs, newTabHint, soon } from "../components.mjs";
import { socialItems } from "./how-to-play.mjs";
import { logo } from "./navbar.mjs";

export function footer({ config, site, year, anchorBase = "" }) {
  const f = site.footer;
  const links = site.navigation.map((l) => ({ ...l, href: l.href.startsWith("#") ? anchorBase + l.href : l.href }));
  return html`<footer class="site-footer">
    <div class="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div class="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          ${logo(config.name, anchorBase)}
          <p class="mt-4 max-w-sm text-fog-400">${f.tagline}</p>
        </div>
        <nav aria-label="Pie de página">
          <h2 class="footer-heading">Secciones</h2>
          <ul class="mt-4 space-y-2" role="list">
            ${links.map((l) => html`<li><a class="footer-link" href="${l.href}">${l.label}</a></li>`)}
          </ul>
        </nav>
        <div>
          <h2 class="footer-heading">Comunidad</h2>
          <ul class="footer-social mt-4 flex flex-wrap gap-2" role="list">
            <li>
              ${config.discordUrl
                ? html`<a class="social-link"${linkAttrs(config.discordUrl)}>${icon("discord", "size-4")}<span>Discord</span>${newTabHint(config.discordUrl)}</a>`
                : soon("Discord", site.soonLabel, "discord")}
            </li>
            ${socialItems(config, site.soonLabel)}
          </ul>
        </div>
      </div>
      <div class="footer-legal">
        <p class="max-w-3xl">${f.disclaimer}</p>
        <p class="mt-2">${f.credits}</p>
        <div class="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p>© ${year} ${config.name} · Comunidad de Habbo</p>
          <div class="flex flex-wrap items-center gap-5">
            ${config.sourceUrl ? html`<a class="footer-link inline-flex items-center gap-2"${linkAttrs(config.sourceUrl)}>${icon("code", "size-4")}${f.sourceLabel}${newTabHint(config.sourceUrl)}</a>` : ""}
            <a class="footer-link inline-flex items-center gap-2" href="${anchorBase}#inicio">${icon("arrowUp", "size-4")}${f.backToTop}</a>
          </div>
        </div>
      </div>
    </div>
  </footer>`;
}
