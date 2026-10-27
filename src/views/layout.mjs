/**
 * Documento HTML base: <head> con SEO, Open Graph y política de seguridad, y
 * el <body> con la página. Los estilos y scripts son archivos propios del
 * sitio (nada en línea), así la CSP puede ser estricta.
 */
import { html, raw } from "../lib/html.mjs";

export function layout({ config, title, description, path = "/", csp, ogImage, ogImageAlt, noindex = false, body, scripts = [] }) {
  const canonical = config.siteUrl ? `${config.siteUrl}${path}` : null;
  const ogImageUrl = config.siteUrl && ogImage ? `${config.siteUrl}${ogImage}` : null;
  return html`${raw("<!doctype html>")}
<html lang="es" dir="ltr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="Content-Security-Policy" content="${csp}" />
  <meta name="referrer" content="strict-origin-when-cross-origin" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  ${noindex ? html`<meta name="robots" content="noindex" />` : ""}
  <meta name="theme-color" content="${config.themeColor}" />
  <meta name="color-scheme" content="dark" />
  ${canonical && !noindex ? html`<link rel="canonical" href="${canonical}" />` : ""}
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/site.webmanifest" />
  <link rel="preload" href="/assets/fonts/chakra-petch-latin-700-normal.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="preload" href="/assets/fonts/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="stylesheet" href="/assets/css/main.css" />
  ${scripts.map((src) => html`<link rel="modulepreload" href="${src}" />`)}
  <script type="module" src="/assets/js/main.js"></script>
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="es_ES" />
  <meta property="og:site_name" content="${config.name}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  ${canonical ? html`<meta property="og:url" content="${canonical}" />` : ""}
  ${ogImageUrl
    ? html`<meta property="og:image" content="${ogImageUrl}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${ogImageAlt}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content="${ogImageUrl}" />`
    : html`<meta name="twitter:card" content="summary" />`}
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
</head>
<body>
  <a class="skip-link" href="#contenido">Saltar al contenido</a>
  ${body}
</body>
</html>
`;
}
