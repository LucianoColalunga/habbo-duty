/**
 * Configuración del sitio.
 *
 * Es el único archivo que hace falta tocar para cambiar enlaces y datos
 * generales. Reglas:
 *   - Los enlaces externos tienen que empezar con https:// (si no, el build falla).
 *   - Un enlace vacío ("") se muestra como "Próximamente" y no lleva a ningún lado.
 *   - Después de cambiar algo: `npm run build` (Vercel lo hace solo al publicar).
 */
export default {
  /** Nombre del juego/sitio. */
  name: "Habbo Duty",

  /**
   * URL pública donde está publicado el sitio, sin barra al final.
   * Se usa para la vista previa al compartir (Open Graph), la URL canónica y
   * el sitemap. Si queda vacía, esas etiquetas no se generan.
   */
  siteUrl: "https://habbo-duty.vercel.app",

  /** Hotel oficial al que llevan "Jugar Ahora" / "Entrar al Hotel". */
  hotelUrl: "https://www.habbo.es",

  /** Nombre de la sala que hay que buscar en el Navegador del hotel. */
  roomName: "Habbo Duty",

  /** Invitación al servidor de Discord de la comunidad. */
  discordUrl: "",

  /** Redes sociales. Dejá la URL vacía hasta tener la cuenta creada. */
  social: [
    { id: "youtube", label: "YouTube", url: "" },
    { id: "tiktok", label: "TikTok", url: "" },
    { id: "instagram", label: "Instagram", url: "" },
    { id: "x", label: "X (Twitter)", url: "" },
  ],

  /**
   * Repositorio con el código del sitio (enlace "Código del sitio" en el pie).
   * Vacío a propósito: la URL de GitHub lleva el nombre del dueño.
   */
  sourceUrl: "",

  /**
   * Dónde reportar problemas de seguridad (se publica en
   * /.well-known/security.txt). Vacío a propósito por el mismo motivo: si se
   * completa, se genera el archivo.
   */
  securityContact: "",

  /** Color de la barra del navegador en celulares. */
  themeColor: "#07080a",
};
