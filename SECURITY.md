# Seguridad de Habbo Duty

## Cómo reportar un problema

Si encontrás una vulnerabilidad, **no abras un issue público**. Reportala en privado desde la pestaña **Security → Report a vulnerability** del repositorio:
<https://github.com/LucianoColalunga/habbo-duty/security/advisories/new>

El sitio también publica ese contacto en `/.well-known/security.txt` (RFC 9116).

## Alcance

Es un sitio **estático**: no tiene servidor propio, base de datos, cuentas de usuario, formularios ni cookies. No guarda ni procesa datos personales. La superficie de ataque es el HTML, CSS y JavaScript publicados, las cabeceras HTTP, la configuración de despliegue y la cadena de dependencias del build.

---

## Auditoría de seguridad

- **Fecha:** 27/10/2026
- **Versión auditada:** 1.0.0 (publicada en <https://habbo-duty.vercel.app>)
- **Método:** revisión del código y la configuración, pruebas automáticas (`npm test`), inspección de las cabeceras reales con la vista previa local, pruebas en navegador (Chromium) en escritorio, tablet y celular escuchando violaciones de CSP, `npm audit` y `npm audit signatures`, y revisión de la configuración de seguridad del repositorio en GitHub.

### Resumen

| Severidad | Encontrados | Resueltos |
| --- | --- | --- |
| Alta | 3 | 3 |
| Media | 6 | 6 |
| Baja | 7 | 7 |
| Informativa | 4 | — |

### Hallazgos y cómo se resolvió cada uno

| ID | Severidad | Hallazgo | Resolución | Verificación |
| --- | --- | --- | --- | --- |
| HD-01 | Alta | El pedido original usaba **Tailwind por CDN** en el navegador. Ese script genera estilos en línea y obliga a permitir `'unsafe-inline'` (y un dominio externo) en la CSP, y suma un tercero que podría inyectar código. | Tailwind 4 se **compila en el build** a `assets/css/main.css`. La CSP solo permite `'self'`; no hay ningún script ni estilo externo. | `tests/security.test.mjs` falla si la CSP tiene `unsafe-*`, comodines o dominios. |
| HD-02 | Alta | El contenido y la configuración (JSON y `site.config.mjs`) se insertan en el HTML: un texto con `<script>` o comillas podría inyectar código (XSS almacenado). | Las vistas usan una plantilla `html` que **escapa todo por defecto** (`src/lib/html.mjs`); el contenido se valida antes de dibujar (`src/lib/load-site.mjs`). | `tests/html.test.mjs` prueba cargas con `<script>` y comillas. |
| HD-03 | Alta | Un enlace configurable podría ser `javascript:`, `data:`, `http:` o `//otro-sitio`. | Todos los `href`/`src` pasan por `safeHref` (`src/lib/urls.mjs`): solo anclas, rutas propias o `https://` sin usuario/contraseña. Si no, **el build se corta**. | `tests/urls.test.mjs` y `tests/content.test.mjs`. |
| HD-04 | Media | Riesgo de **XSS en el navegador** si algún script usa `innerHTML` u otros sumideros del DOM. | El JavaScript solo usa `textContent`, atributos ARIA y `hidden`. Además la CSP activa **Trusted Types** (`require-trusted-types-for 'script'; trusted-types 'none'`): el navegador bloquea cualquier sumidero con texto. | Prueba estática que prohíbe `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval`, `new Function` y `setAttribute` de `style`/`on*`/`href`/`src`. Sin violaciones de CSP en el navegador. |
| HD-05 | Media | **Clickjacking**: el sitio podía mostrarse dentro de un `<iframe>` ajeno. | `frame-ancestors 'none'` en la CSP y `X-Frame-Options: DENY`. | Prueba de cabeceras y `curl -I` a la vista previa. |
| HD-06 | Media | **Reverse tabnabbing** y filtración del Referer en enlaces que abren otra pestaña. | El componente de enlaces agrega siempre `target="_blank" rel="noopener noreferrer"` a los externos y hay `Referrer-Policy: strict-origin-when-cross-origin`. | `tests/build.test.mjs` revisa **cada** `target="_blank"` del HTML final. |
| HD-07 | Media | El **CLI de Vercel no lee `.gitignore`**: un `.env` u otros archivos locales podían subirse al desplegar. | `.vercelignore` propio (excluye `.env*`, `.vercel/`, `node_modules/`, claves, etc.). | Prueba que revisa ambos archivos de ignore. |
| HD-08 | Media | Riesgo de subir **secretos** al repositorio. | `.gitignore` excluye `.env*`, claves y `.vercel/`; el sitio no usa ninguna clave ni variable secreta. Hay una búsqueda de secretos en las pruebas y GitHub tiene secret scanning con push protection. | `tests/security.test.mjs` (tokens de GitHub/AWS/Slack, claves privadas, webhooks, credenciales en texto). |
| HD-09 | Media | **Cadena de suministro**: dependencias con vulnerabilidades o scripts de instalación maliciosos. | Una sola dependencia de desarrollo (`@tailwindcss/cli`), **versión exacta**, `package-lock.json` y `npm ci`. `.npmrc` con `ignore-scripts=true` (ninguna dependencia ejecuta código al instalarse) y `save-exact=true`. El sitio publicado no carga **ninguna** librería de terceros. | `npm audit`: 0 vulnerabilidades. `npm audit signatures`: 33 paquetes con firma verificada del registro. Prueba que exige versiones fijas y cero dependencias de producción. |
| HD-10 | Baja | Fuentes desde Google Fonts/CDN: le pasan la IP de cada visitante a un tercero y obligan a abrir la CSP. | Fuentes **servidas desde el propio sitio** (licencia OFL incluida). | CSP con `font-src 'self'`; la prueba de archivos confirma que existen. |
| HD-11 | Baja | Falta de **HTTPS forzado**. | `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` y `upgrade-insecure-requests`. | Prueba de cabeceras. |
| HD-12 | Baja | APIs del navegador que el sitio no usa (cámara, micrófono, ubicación, pagos…) quedaban disponibles para código inyectado. | `Permissions-Policy` las deshabilita todas. Además `Cross-Origin-Opener-Policy` y `Cross-Origin-Resource-Policy` en `same-origin`. | Prueba de cabeceras; sin advertencias en la consola. |
| HD-13 | Baja | **Path traversal** en el servidor de vista previa local (`/../package.json`). | `resolveInside` normaliza y bloquea cualquier ruta fuera de `dist/` (incluye `%2e%2e`, `%2f` y bytes nulos). Escucha solo en `127.0.0.1` y solo acepta GET/HEAD. No se usa en producción. | `tests/security.test.mjs` y `curl --path-as-is` → 404. |
| HD-14 | Baja | Usar arte o logos oficiales de Habbo/Sulake (riesgo legal y de licencias). | Todo el arte es **propio** (generado con `tools/art/`) y el pie aclara que es un fan site no afiliado. | Revisión manual de `public/assets/`. |
| HD-15 | Baja | Al enlazar el proyecto, el **CLI de Vercel creó `.env.local` con un token** (`VERCEL_OIDC_TOKEN`) y agregó reglas propias a `.gitignore` (una de ellas, `.env*`, pisaba excepciones). | El sitio no usa ese token: se **borró** el archivo y se revirtió el cambio en `.gitignore`. Las reglas existentes (`.env.*` en `.gitignore` y `.vercelignore`) ya impedían subirlo. | `git status` limpio; `/.env.local` en producción → 404; la búsqueda de secretos revisa lo que git subiría. |
| HD-16 | Baja | Aparecieron en la carpeta dos **copias `.bundle` de otro repositorio** (historial completo de otro proyecto) que se podían colar en un commit o en el deploy. | `*.bundle` en `.gitignore` y `.vercelignore`. Los archivos no se tocaron (no son de este proyecto). | `/PortfolioLC-limpio.bundle` en producción → 404; no figuran en el repositorio. |
| HD-17 | Info | La CSP en `<meta>` no admite `frame-ancestors`. | La CSP principal viaja como **cabecera** (Vercel). El `<meta>` es un respaldo si el sitio se sirve sin cabeceras; se genera desde `vercel.json` (una sola fuente) sin esa directiva. | `cspForMeta` + prueba. |
| HD-18 | Info | GitHub Actions no está disponible en la cuenta, así que no hay CI automático. | Los controles se corren en local antes de cada push: `npm run check` (build + 38 pruebas + `npm audit`). | — |
| HD-19 | Info | En los despliegues de **vista previa** de Vercel, la barra de herramientas de Vercel queda bloqueada por la CSP. | Es esperado: no afecta a producción. | — |
| HD-20 | Info | Los enlaces de Discord y redes están vacíos (se muestran como "Próximamente"). | Cuando se carguen, el build los valida (solo `https://`). El contenido de sitios externos queda fuera del alcance. | — |

### Cabeceras en producción

```text
Content-Security-Policy: default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'none'; manifest-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; object-src 'none'; upgrade-insecure-requests; require-trusted-types-for 'script'; trusted-types 'none'
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: accelerometer=(), autoplay=(), browsing-topics=(), camera=(), ... (todas deshabilitadas)
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
X-Permitted-Cross-Domain-Policies: none
```

### Configuración del repositorio en GitHub

| Función | Estado |
| --- | --- |
| Secret scanning (Secret Protection) | Activado |
| Push protection (bloquea pushes con secretos) | Activado |
| Dependency graph | Activado |
| Dependabot alerts | Activado |
| Private vulnerability reporting | Activado |
| Dependabot security updates y version updates | Apagados: abren pull requests con GitHub Actions, que no está disponible en la cuenta. Las alertas siguen llegando y las dependencias se revisan con `npm run audit`. |
| Colaboradores | Solo el dueño (LucianoColalunga). |

Revisado el 27/10/2026 en *Settings → Advanced Security* del repositorio.

### Cómo repetir la auditoría

```bash
npm ci
npm run check
npm audit signatures
npm run preview
```

Con la vista previa abierta, `curl -I http://localhost:4173/` muestra las mismas cabeceras que producción.
