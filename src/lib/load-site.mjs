/**
 * Carga la configuración y el contenido, y los valida antes de generar la
 * página. Si algo está mal (un campo vacío, un enlace inseguro, un id raro)
 * el build se corta con un mensaje que dice exactamente qué corregir.
 */
import { readFile } from "node:fs/promises";
import config from "../config/site.config.mjs";
import { optionalHref, safeHref } from "./urls.mjs";

const CONTENT_DIR = new URL("../content/", import.meta.url);
const ACCENTS = new Set(["green", "blue", "red"]);

export class ContentError extends Error {}

async function readJson(name) {
  const text = await readFile(new URL(name, CONTENT_DIR), "utf8");
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new ContentError(`src/content/${name}: JSON inválido (${err.message})`);
  }
}

function text(value, where) {
  if (typeof value !== "string" || value.trim() === "") throw new ContentError(`${where}: falta el texto`);
  return value.trim();
}

function list(value, where, check = text) {
  if (!Array.isArray(value) || value.length === 0) throw new ContentError(`${where}: tiene que ser una lista con al menos un elemento`);
  return value.map((v, i) => check(v, `${where}[${i}]`));
}

function id(value, where) {
  if (typeof value !== "string" || !/^[a-z0-9][a-z0-9-]*$/.test(value)) {
    throw new ContentError(`${where}: el id solo puede tener minúsculas, números y guiones`);
  }
  return value;
}

function accent(value, where) {
  if (!ACCENTS.has(value)) throw new ContentError(`${where}: el color tiene que ser green, blue o red`);
  return value;
}

/** Imágenes: solo archivos propios dentro de /assets/img/. */
function image(value, where) {
  const src = safeHref(value?.src, `${where}.src`);
  if (!src.startsWith("/assets/img/")) throw new ContentError(`${where}.src: las imágenes tienen que estar en /assets/img/`);
  const size = (n, k) => {
    if (!Number.isInteger(n) || n <= 0) throw new ContentError(`${where}.${k}: tiene que ser un número entero positivo`);
    return n;
  };
  return { src, width: size(value.width, "width"), height: size(value.height, "height"), alt: text(value.alt, `${where}.alt`) };
}

function link(value, where) {
  return { label: text(value?.label, `${where}.label`), href: safeHref(value?.href, `${where}.href`) };
}

export function validateConfig(c) {
  const where = "src/config/site.config.mjs";
  const siteUrl = String(c.siteUrl ?? "").trim();
  if (siteUrl && (!siteUrl.startsWith("https://") || siteUrl.endsWith("/"))) {
    throw new ContentError(`${where} → siteUrl: tiene que empezar con https:// y no terminar en "/"`);
  }
  if (siteUrl) safeHref(siteUrl, `${where} → siteUrl`);
  if (!/^#[0-9a-fA-F]{6}$/.test(c.themeColor ?? "")) throw new ContentError(`${where} → themeColor: usá un color como #07080a`);
  return {
    name: text(c.name, `${where} → name`),
    siteUrl,
    hotelUrl: safeHref(c.hotelUrl, `${where} → hotelUrl`),
    roomName: text(c.roomName, `${where} → roomName`),
    discordUrl: optionalHref(c.discordUrl, `${where} → discordUrl`),
    social: list(c.social, `${where} → social`, (s, w) => ({
      id: id(s?.id, `${w}.id`),
      label: text(s?.label, `${w}.label`),
      url: optionalHref(s?.url, `${w}.url`),
    })),
    sourceUrl: optionalHref(c.sourceUrl, `${where} → sourceUrl`),
    securityContact: optionalHref(c.securityContact, `${where} → securityContact`),
    themeColor: c.themeColor,
  };
}

export function validateContent({ site, modes, maps, howTo }) {
  const s = "src/content/site.json";
  const m = "src/content/modes.json";
  const p = "src/content/maps.json";
  const h = "src/content/how-to-play.json";
  return {
    site: {
      meta: {
        title: text(site.meta?.title, `${s} → meta.title`),
        description: text(site.meta?.description, `${s} → meta.description`),
        ogImage: safeHref(site.meta?.ogImage, `${s} → meta.ogImage`),
        ogImageAlt: text(site.meta?.ogImageAlt, `${s} → meta.ogImageAlt`),
      },
      navigation: list(site.navigation, `${s} → navigation`, link),
      navCta: text(site.navCta, `${s} → navCta`),
      mobileCta: text(site.mobileCta, `${s} → mobileCta`),
      hero: {
        eyebrow: text(site.hero?.eyebrow, `${s} → hero.eyebrow`),
        title: text(site.hero?.title, `${s} → hero.title`),
        subtitle: text(site.hero?.subtitle, `${s} → hero.subtitle`),
        primaryCta: link(site.hero?.primaryCta, `${s} → hero.primaryCta`),
        secondaryCta: link(site.hero?.secondaryCta, `${s} → hero.secondaryCta`),
        stats: list(site.hero?.stats, `${s} → hero.stats`, (v, w) => ({ value: text(v?.value, `${w}.value`), label: text(v?.label, `${w}.label`) })),
        image: image(site.hero?.image, `${s} → hero.image`),
        imageLabel: text(site.hero?.imageLabel, `${s} → hero.imageLabel`),
        ticker: list(site.hero?.ticker, `${s} → hero.ticker`),
      },
      footer: {
        tagline: text(site.footer?.tagline, `${s} → footer.tagline`),
        disclaimer: text(site.footer?.disclaimer, `${s} → footer.disclaimer`),
        credits: text(site.footer?.credits, `${s} → footer.credits`),
        sourceLabel: text(site.footer?.sourceLabel, `${s} → footer.sourceLabel`),
        backToTop: text(site.footer?.backToTop, `${s} → footer.backToTop`),
      },
      soonLabel: text(site.soonLabel, `${s} → soonLabel`),
    },
    modes: {
      eyebrow: text(modes.eyebrow, `${m} → eyebrow`),
      title: text(modes.title, `${m} → title`),
      intro: text(modes.intro, `${m} → intro`),
      tacticsLabel: text(modes.tacticsLabel, `${m} → tacticsLabel`),
      tacticsLabelOpen: text(modes.tacticsLabelOpen, `${m} → tacticsLabelOpen`),
      tacticsTitle: text(modes.tacticsTitle, `${m} → tacticsTitle`),
      labels: {
        players: text(modes.labels?.players, `${m} → labels.players`),
        weapons: text(modes.labels?.weapons, `${m} → labels.weapons`),
        focus: text(modes.labels?.focus, `${m} → labels.focus`),
      },
      items: list(modes.items, `${m} → items`, (it, w) => ({
        id: id(it?.id, `${w}.id`),
        badge: text(it?.badge, `${w}.badge`),
        accent: accent(it?.accent, `${w}.accent`),
        title: text(it?.title, `${w}.title`),
        tagline: text(it?.tagline, `${w}.tagline`),
        description: text(it?.description, `${w}.description`),
        players: text(it?.players, `${w}.players`),
        weapons: list(it?.weapons, `${w}.weapons`),
        focus: text(it?.focus, `${w}.focus`),
        image: image(it?.image, `${w}.image`),
        tips: list(it?.tips, `${w}.tips`),
      })),
    },
    maps: {
      eyebrow: text(maps.eyebrow, `${p} → eyebrow`),
      title: text(maps.title, `${p} → title`),
      intro: text(maps.intro, `${p} → intro`),
      tablistLabel: text(maps.tablistLabel, `${p} → tablistLabel`),
      labels: {
        features: text(maps.labels?.features, `${p} → labels.features`),
        bestFor: text(maps.labels?.bestFor, `${p} → labels.bestFor`),
        playstyle: text(maps.labels?.playstyle, `${p} → labels.playstyle`),
      },
      items: list(maps.items, `${p} → items`, (it, w) => ({
        id: id(it?.id, `${w}.id`),
        name: text(it?.name, `${w}.name`),
        tag: text(it?.tag, `${w}.tag`),
        accent: accent(it?.accent, `${w}.accent`),
        description: text(it?.description, `${w}.description`),
        features: list(it?.features, `${w}.features`),
        bestFor: list(it?.bestFor, `${w}.bestFor`),
        playstyle: text(it?.playstyle, `${w}.playstyle`),
        image: image(it?.image, `${w}.image`),
      })),
    },
    howTo: {
      eyebrow: text(howTo.eyebrow, `${h} → eyebrow`),
      title: text(howTo.title, `${h} → title`),
      intro: text(howTo.intro, `${h} → intro`),
      steps: list(howTo.steps, `${h} → steps`, (st, w) => {
        if (st?.link !== undefined && st.link !== "hotel") throw new ContentError(`${w}.link: el único valor permitido es "hotel"`);
        return {
          title: text(st?.title, `${w}.title`),
          text: text(st?.text, `${w}.text`),
          icon: safeHref(st?.icon, `${w}.icon`),
          link: st?.link ?? null,
          linkLabel: st?.link ? text(st?.linkLabel, `${w}.linkLabel`) : null,
        };
      }),
      community: {
        eyebrow: text(howTo.community?.eyebrow, `${h} → community.eyebrow`),
        title: text(howTo.community?.title, `${h} → community.title`),
        text: text(howTo.community?.text, `${h} → community.text`),
        discordLabel: text(howTo.community?.discordLabel, `${h} → community.discordLabel`),
        socialTitle: text(howTo.community?.socialTitle, `${h} → community.socialTitle`),
        rulesTitle: text(howTo.community?.rulesTitle, `${h} → community.rulesTitle`),
        rules: list(howTo.community?.rules, `${h} → community.rules`),
      },
    },
  };
}

/** Devuelve todo lo necesario para dibujar la página, ya validado. */
export async function loadSite() {
  const [site, modes, maps, howTo] = await Promise.all([
    readJson("site.json"),
    readJson("modes.json"),
    readJson("maps.json"),
    readJson("how-to-play.json"),
  ]);
  const content = validateContent({ site, modes, maps, howTo });
  const ids = [...content.modes.items.map((i) => i.id), ...content.maps.items.map((i) => i.id)];
  const dup = ids.find((v, i) => ids.indexOf(v) !== i);
  if (dup) throw new ContentError(`El id "${dup}" está repetido entre modos y mapas`);
  return { config: validateConfig(config), ...content };
}
