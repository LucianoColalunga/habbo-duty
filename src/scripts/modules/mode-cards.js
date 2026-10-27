/**
 * Tarjetas de modos de juego:
 *  - un brillo que sigue al puntero y una leve inclinación 3D (solo con mouse
 *    y si la persona no pidió reducir el movimiento);
 *  - el botón "Ver tácticas", que despliega los consejos (aria-expanded).
 *
 * Los estilos se cambian con style.setProperty (CSSOM), que la CSP permite
 * sin necesidad de 'unsafe-inline'.
 */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

function trackPointer(card) {
  card.addEventListener("pointermove", (event) => {
    if (!finePointer.matches) return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    card.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
    card.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
    if (!reduceMotion.matches) {
      card.style.setProperty("--rx", `${((0.5 - y) * 5).toFixed(2)}deg`);
      card.style.setProperty("--ry", `${((x - 0.5) * 6).toFixed(2)}deg`);
    }
  });
  card.addEventListener("pointerleave", () => {
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
  });
}

function setupTactics(card) {
  const button = card.querySelector("[data-tactics-toggle]");
  const panel = card.querySelector("[data-tactics]");
  if (!button || !panel) return;
  const label = button.querySelector("[data-tactics-label]");

  // Sin JavaScript los consejos se ven siempre; con JavaScript arrancan plegados.
  button.hidden = false;
  panel.hidden = true;

  button.addEventListener("click", () => {
    const open = button.getAttribute("aria-expanded") !== "true";
    button.setAttribute("aria-expanded", String(open));
    panel.hidden = !open;
    if (label) label.textContent = open ? button.dataset.labelOpen : button.dataset.labelClosed;
  });
}

export function initModeCards() {
  for (const card of document.querySelectorAll("[data-mode-card]")) {
    trackPointer(card);
    setupTactics(card);
  }
}
