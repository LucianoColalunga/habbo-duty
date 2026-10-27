/**
 * Punto de entrada del JavaScript del sitio (módulo ES, sin dependencias).
 * La página funciona sin JavaScript; esto solo agrega interacción.
 */
import { initMapTabs } from "./modules/map-tabs.js";
import { initModeCards } from "./modules/mode-cards.js";
import { initNavbar, initScrollSpy } from "./modules/navbar.js";

for (const init of [initNavbar, initScrollSpy, initModeCards, initMapTabs]) {
  try {
    init();
  } catch (error) {
    // Si una parte falla, el resto de la página sigue funcionando.
    console.error(`[habbo-duty] ${init.name}:`, error);
  }
}
