/**
 * Pestañas de mapas según el patrón WAI-ARIA "Tabs":
 * flechas izquierda/derecha, Inicio y Fin para moverse; Enter/clic para elegir.
 * Sin JavaScript, los mapas se ven uno debajo del otro.
 */

export function initMapTabs() {
  const tablist = document.querySelector("[data-map-tablist]");
  if (!tablist) return;
  const tabs = [...tablist.querySelectorAll("[data-map-tab]")];
  const panels = tabs.map((tab) => document.getElementById(tab.getAttribute("aria-controls") ?? ""));
  if (tabs.length === 0 || panels.some((panel) => !panel)) return;

  panels.forEach((panel, i) => {
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("aria-labelledby", tabs[i].id);
    panel.tabIndex = 0;
  });

  const select = (index, { focus = false } = {}) => {
    tabs.forEach((tab, i) => {
      const selected = i === index;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[i].hidden = !selected;
    });
    if (focus) tabs[index].focus();
  };

  tabs.forEach((tab, i) => tab.addEventListener("click", () => select(i)));

  tablist.addEventListener("keydown", (event) => {
    const current = tabs.indexOf(document.activeElement);
    if (current === -1) return;
    const last = tabs.length - 1;
    const next = {
      ArrowRight: current === last ? 0 : current + 1,
      ArrowDown: current === last ? 0 : current + 1,
      ArrowLeft: current === 0 ? last : current - 1,
      ArrowUp: current === 0 ? last : current - 1,
      Home: 0,
      End: last,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    select(next, { focus: true });
  });

  // Un enlace directo a un mapa (#mapa-japon) abre esa pestaña.
  const fromHash = panels.findIndex((panel) => `#${panel.id}` === window.location.hash);
  const initial = fromHash !== -1 ? fromHash : Math.max(0, tabs.findIndex((t) => t.getAttribute("aria-selected") === "true"));
  tablist.hidden = false;
  select(initial);
}
