/**
 * Barra de navegación: fondo sólido al bajar, menú hamburguesa accesible
 * (aria-expanded, Escape para cerrar) y resaltado de la sección visible.
 */

const DESKTOP = window.matchMedia("(min-width: 64rem)");

export function initNavbar() {
  const header = document.querySelector("[data-header]");
  const toggle = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-mobile-menu]");
  if (!header || !toggle || !menu) return;
  const label = toggle.querySelector("[data-menu-label]");

  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const isOpen = () => toggle.getAttribute("aria-expanded") === "true";
  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    if (label) label.textContent = open ? "Cerrar menú" : "Abrir menú";
    menu.classList.toggle("is-open", open);
    header.classList.toggle("is-open", open);
  };

  toggle.addEventListener("click", () => setOpen(!isOpen()));

  // Elegir una sección cierra el menú.
  menu.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) setOpen(false);
  });

  // Escape cierra y devuelve el foco al botón.
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });

  // Tocar fuera del encabezado también lo cierra.
  document.addEventListener("click", (event) => {
    if (isOpen() && event.target instanceof Node && !header.contains(event.target)) setOpen(false);
  });

  // Si la ventana pasa a tamaño escritorio, el menú móvil deja de tener sentido.
  DESKTOP.addEventListener("change", (event) => {
    if (event.matches) setOpen(false);
  });
}

/** Marca con aria-current el enlace de la sección que se está viendo. */
export function initScrollSpy() {
  const links = [...document.querySelectorAll("[data-nav-link]")];
  const ids = [...new Set(links.map((a) => a.getAttribute("href") ?? "").filter((h) => h.startsWith("#")))];
  const sections = ids.map((h) => document.getElementById(h.slice(1))).filter(Boolean);
  if (sections.length === 0) return;

  let current = null;
  let ticking = false;

  const update = () => {
    ticking = false;
    const line = window.innerHeight * 0.35;
    let active = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= line) active = section;
    }
    // Al llegar al final de la página, la última sección queda activa.
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
      active = sections[sections.length - 1];
    }
    if (active === current) return;
    current = active;
    for (const link of links) {
      if (link.getAttribute("href") === `#${active.id}`) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    }
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  };

  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
}
