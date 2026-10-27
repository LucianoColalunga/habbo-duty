/**
 * Genera todo el arte del sitio (SVG propios) en public/assets/img/.
 * Uso: npm run art
 *
 * Nada de esto usa imágenes oficiales de Habbo/Sulake: las salas, los kekos,
 * los íconos y la insignia están dibujados desde cero con código.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { createIso } from "./iso.mjs";
import { flipX, outline, parseSprite, spriteToSvg } from "./pixel.mjs";
import { BADGE_PALETTE, ICONS, ICON_PALETTES, PALETTES, SPRITES, badgeSprite, combatIconSprite } from "./sprites.mjs";

const OUT = new URL("../../public/assets/img/", import.meta.url);
const r1 = (n) => Math.round(n * 10) / 10;

/* ---------- Piezas comunes ---------- */

const GLOW_DEFS = `
<filter id="glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="glow-soft" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="8"/></filter>`;

function svgDoc({ w, h, title, body, defs = "" }) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${title}">` +
    `<title>${title}</title><defs>${GLOW_DEFS}${defs}</defs>${body}</svg>\n`
  );
}

// Puntos de referencia de cada sprite (ya con el contorno sumado).
const ANCHORS = {
  soldier: { muzzle: [24, 19] },
  agent: { muzzle: [24, 17] },
  ninja: { tip: [24, 3] },
};
const BODY_CENTER = 9.5;

/** Ubica un keko parado sobre una baldosa (sombra incluida). */
function keko(iso, kind, palette, gx, gy, { flip = false, scale = 3, gz = 0 } = {}) {
  const base = SPRITES[kind];
  const sprite = flip ? flipX(base) : base;
  const [fx, fy] = iso.p(gx, gy, gz);
  const cx = flip ? base.w - BODY_CENTER : BODY_CENTER;
  const x = fx - cx * scale;
  const y = fy - (base.h - 1.5) * scale;
  const shadow = `<ellipse cx="${r1(fx)}" cy="${r1(fy)}" rx="${7 * scale}" ry="${3 * scale}" fill="#000" fill-opacity=".45"/>`;
  const point = (name) => {
    const a = ANCHORS[kind][name];
    const col = flip ? base.w - 1 - a[0] : a[0];
    return [x + (col + 0.5) * scale, y + (a[1] + 0.5) * scale];
  };
  return { svg: shadow + spriteToSvg(sprite, PALETTES[palette], { x, y, scale }), depth: gx + gy, point };
}

/** Fogonazo del disparo. dir = 1 (derecha) o -1 (izquierda). */
function flash([x, y], dir, s = 10, color = "#ffd65a") {
  const P = (dx, dy) => `${r1(x + dir * dx)},${r1(y + dy)}`;
  const pts = [P(0, -s * 0.45), P(s * 0.5, -s * 0.12), P(s * 1.6, 0), P(s * 0.5, s * 0.12), P(0, s * 0.45), P(-s * 0.15, 0)];
  return (
    `<polygon points="${pts.join(" ")}" fill="${color}" filter="url(#glow)"/>` +
    `<circle cx="${r1(x + dir * s * 0.35)}" cy="${r1(y)}" r="${r1(s * 0.22)}" fill="#fff"/>`
  );
}

/** Trazo de bala con brillo neón. */
function tracer([x1, y1], [x2, y2], color, width = 2.5) {
  return (
    `<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-dasharray="26 10" filter="url(#glow)" opacity=".95"/>` +
    `<line x1="${r1(x2 - (x2 - x1) * 0.08)}" y1="${r1(y2 - (y2 - y1) * 0.08)}" x2="${r1(x2)}" y2="${r1(y2)}" stroke="#fff" stroke-width="${width}" stroke-linecap="round"/>`
  );
}

/** Brillo de 4 puntas en pixel art (los "sparkles" típicos de Habbo). */
function sparkle(x, y, s = 2, color = "#fff") {
  const r = (dx, dy, w, h) => `<rect x="${r1(x + dx * s)}" y="${r1(y + dy * s)}" width="${w * s}" height="${h * s}" fill="${color}"/>`;
  return `<g shape-rendering="crispEdges">${r(-0.5, -2.5, 1, 5)}${r(-2.5, -0.5, 5, 1)}${r(-1, -1, 2, 2)}</g>`;
}

/** Cilindro (tambores, troncos, linternas redondas). */
function cylinder(iso, gx, gy, gz, r, h, c) {
  const [cx, cy] = iso.p(gx, gy, gz);
  const [, ty] = iso.p(gx, gy, gz + h);
  const rx = r * 45;
  const ry = rx / 2;
  return (
    `<ellipse cx="${r1(cx)}" cy="${r1(cy)}" rx="${r1(rx)}" ry="${r1(ry)}" fill="${c.side}"/>` +
    `<rect x="${r1(cx - rx)}" y="${r1(ty)}" width="${r1(rx * 2)}" height="${r1(cy - ty)}" fill="${c.side}"/>` +
    (c.band ? `<rect x="${r1(cx - rx)}" y="${r1(ty + (cy - ty) * 0.45)}" width="${r1(rx * 2)}" height="${r1((cy - ty) * 0.12)}" fill="${c.band}"/>` : "") +
    `<ellipse cx="${r1(cx)}" cy="${r1(ty)}" rx="${r1(rx)}" ry="${r1(ry)}" fill="${c.top}"/>`
  );
}

/** Banderín sobre un mástil. */
function flag(iso, gx, gy, color, h = 2.4, dir = 1) {
  const [bx, by] = iso.p(gx, gy, 0);
  const [, ty] = iso.p(gx, gy, h);
  return (
    `<line x1="${r1(bx)}" y1="${r1(by)}" x2="${r1(bx)}" y2="${r1(ty)}" stroke="#c9ced6" stroke-width="2.5"/>` +
    `<polygon points="${r1(bx)},${r1(ty)} ${r1(bx + dir * 40)},${r1(ty + 9)} ${r1(bx + dir * 34)},${r1(ty + 18)} ${r1(bx)},${r1(ty + 24)}" fill="${color}" filter="url(#glow)"/>`
  );
}

/** Ordena por profundidad (de atrás hacia adelante) y concatena. */
const paint = (items) => items.sort((a, b) => a.depth - b.depth).map((i) => i.svg).join("");
const item = (depth, svg) => ({ depth, svg });

// Hash determinístico para variar baldosas sin aleatoriedad real.
const hash = (x, y) => {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
};

const SAND = { top: "#b9a679", left: "#8f7f58", right: "#a39167", stroke: "#4a4130" };
const WOOD = { top: "#8a6337", left: "#5e4122", right: "#73512c", stroke: "#2e2010" };
const CONCRETE = { top: "#5d636c", left: "#3b4048", right: "#4a5058", stroke: "#1d2025" };
const METAL = { top: "#3a414b", left: "#22272e", right: "#2d333b", stroke: "#111418" };

function sandbags(iso, gx, gy, count, axis = "y") {
  const out = [];
  for (let i = 0; i < count; i++) {
    const x = axis === "x" ? gx + i * 0.55 : gx;
    const y = axis === "y" ? gy + i * 0.55 : gy;
    out.push(item(x + y + 0.4, iso.box(x, y, 0, 0.55, 0.55, 0.36, SAND)));
    if (i < count - 1) {
      const x2 = axis === "x" ? x + 0.28 : x + 0.04;
      const y2 = axis === "y" ? y + 0.28 : y + 0.04;
      out.push(item(x2 + y2 + 0.45, iso.box(x2, y2, 0.36, 0.5, 0.5, 0.3, SAND)));
    }
  }
  return out;
}

/* ---------- Escena principal (hero) ---------- */

function heroScene() {
  const cols = 10;
  const rows = 8;
  const W = 700;
  const H = 480;
  const iso = createIso({ ox: rows * 32 + 62, oy: 150 });
  const parts = [];

  // halo de fondo
  parts.push(
    `<ellipse cx="350" cy="250" rx="300" ry="170" fill="#9dff52" opacity=".10" filter="url(#glow-soft)"/>`,
    `<ellipse cx="520" cy="200" rx="160" ry="110" fill="#ff4438" opacity=".10" filter="url(#glow-soft)"/>`,
    `<ellipse cx="170" cy="230" rx="160" ry="110" fill="#38bdff" opacity=".10" filter="url(#glow-soft)"/>`,
  );

  parts.push(
    iso.room({
      cols,
      rows,
      wallH: 3.2,
      floor: { left: "#1b1f16", right: "#22271c" },
      wall: { left: "#171a1f", right: "#1f2329", top: "#343a43", edge: "#111317" },
      shade: (x, y) => {
        const h = hash(x, y);
        if (h > 0.9) return "#23281c";
        return (x + y) % 2 ? "#2c3224" : "#30372a";
      },
    }),
  );

  // decoración de paredes
  parts.push(
    iso.onLeftWall(0, rows, 2.45, 2.55, "#9dff52", ' filter="url(#glow)"'),
    iso.onRightWall(0, cols, 2.45, 2.55, "#38bdff", ' filter="url(#glow)"'),
    // franjas de peligro abajo en la pared izquierda
    ...Array.from({ length: 16 }, (_, i) =>
      iso.onLeftWall(i * 0.5, i * 0.5 + 0.25, 0, 0.32, "#ffc93a", ' opacity=".55"'),
    ),
    // pantalla táctica en la pared derecha
    iso.onRightWall(3.1, 6.1, 0.95, 2.05, "#0b0e12", ' stroke="#ff4438" stroke-width="2" filter="url(#glow)"'),
    iso.onRightWall(3.4, 5.6, 1.7, 1.8, "#ff4438", ' opacity=".9"'),
    iso.onRightWall(3.4, 4.9, 1.45, 1.55, "#ff4438", ' opacity=".6"'),
    iso.onRightWall(3.4, 5.2, 1.2, 1.3, "#ff4438", ' opacity=".4"'),
    // estandarte del equipo verde en la pared izquierda
    iso.onLeftWall(2.4, 3.4, 0.9, 2.2, "#2b3a1c", ' stroke="#9dff52" stroke-width="2"'),
    iso.onLeftWall(2.75, 3.05, 1.2, 1.9, "#9dff52", ' opacity=".85"'),
    // ventanas tipo búnker
    iso.onLeftWall(5.2, 6.8, 1.6, 1.85, "#050608"),
    iso.onRightWall(7.4, 9.0, 1.6, 1.85, "#050608"),
  );

  // zona de captura en el centro
  const [zx, zy] = iso.p(5, 4.2);
  parts.push(
    `<ellipse cx="${zx}" cy="${zy}" rx="92" ry="46" fill="#9dff52" fill-opacity=".07" stroke="#9dff52" stroke-width="2" stroke-dasharray="10 8" filter="url(#glow)"/>`,
    `<ellipse cx="${zx}" cy="${zy}" rx="52" ry="26" fill="none" stroke="#9dff52" stroke-opacity=".45" stroke-width="1.5"/>`,
  );

  const items = [];
  // coberturas
  items.push(...sandbags(iso, 3.0, 7.0, 2, "x"));
  items.push(item(5.6 + 6.2, iso.box(5.2, 5.8, 0, 0.9, 0.9, 0.9, WOOD)));
  items.push(item(5.6 + 6.2 + 0.1, iso.box(5.35, 5.95, 0.9, 0.6, 0.6, 0.55, WOOD)));
  items.push(item(7.9 + 6.4, iso.box(7.0, 6.2, 0, 1.8, 0.45, 0.55, CONCRETE)));
  items.push(item(8.6 + 0.5, cylinder(iso, 8.6, 0.55, 0, 0.32, 0.8, { side: "#7a2a22", top: "#a6463a", band: "#2a0e0b" })));
  items.push(item(9.3 + 1.1, cylinder(iso, 9.3, 1.1, 0, 0.32, 0.8, { side: "#6e6a2a", top: "#9b963f", band: "#25240e" })));
  items.push(item(0.9 + 6.8, iso.box(0.6, 6.5, 0, 0.7, 0.7, 0.7, METAL)));
  items.push(item(0.5 + 3.4, flag(iso, 0.5, 3.4, "#9dff52", 2.6, 1)));

  // kekos
  const a1 = keko(iso, "soldier", "soldierGreen", 1.6, 1.4);
  const a2 = keko(iso, "agent", "agentBlue", 2.2, 6.2);
  const a3 = keko(iso, "soldier", "soldierGreen", 3.0, 4.6);
  const b1 = keko(iso, "ninja", "ninjaRed", 5.6, 3.3, { flip: true });
  const b2 = keko(iso, "soldier", "soldierRed", 8.4, 3.9, { flip: true });
  const b3 = keko(iso, "agent", "agentRed", 6.6, 1.3, { flip: true });
  items.push(a1, a2, a3, b1, b2, b3);
  parts.push(paint(items));

  // disparos y efectos (encima de todo)
  const m1 = a1.point("muzzle");
  const m2 = a2.point("muzzle");
  const m3 = b2.point("muzzle");
  const m4 = b3.point("muzzle");
  const tip = b1.point("tip");
  parts.push(
    tracer([m1[0] + 18, m1[1]], [m1[0] + 210, m1[1] - 30], "#9dff52"),
    flash(m1, 1, 11),
    tracer([m2[0] + 16, m2[1]], [m2[0] + 150, m2[1] - 62], "#38bdff", 2),
    flash(m2, 1, 9, "#7fe3ff"),
    tracer([m3[0] - 18, m3[1]], [m3[0] - 230, m3[1] + 4], "#ff4438"),
    flash(m3, -1, 11, "#ff8a4a"),
    tracer([m4[0] - 16, m4[1]], [m4[0] - 140, m4[1] + 56], "#ff4438", 2),
    flash(m4, -1, 9, "#ff8a4a"),
    // corte de katana
    `<path d="M ${r1(tip[0] + 30)} ${r1(tip[1] + 6)} Q ${r1(tip[0] - 28)} ${r1(tip[1] + 6)} ${r1(tip[0] - 46)} ${r1(tip[1] + 62)}" fill="none" stroke="#ff5a4d" stroke-width="4" stroke-linecap="round" filter="url(#glow)" opacity=".9"/>`,
    `<path d="M ${r1(tip[0] + 22)} ${r1(tip[1] + 10)} Q ${r1(tip[0] - 22)} ${r1(tip[1] + 12)} ${r1(tip[0] - 38)} ${r1(tip[1] + 56)}" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" opacity=".9"/>`,
  );

  // brillos
  parts.push(
    sparkle(80, 70, 2.5, "#ffffff"),
    sparkle(640, 90, 2, "#9dff52"),
    sparkle(600, 40, 1.5, "#ffffff"),
    sparkle(110, 150, 1.5, "#38bdff"),
    sparkle(660, 300, 2, "#ff4438"),
    sparkle(40, 330, 1.5, "#ffffff"),
  );

  return svgDoc({
    w: W,
    h: H,
    title: "Sala isométrica de guerra: kekos del equipo verde con rifles y pistolas se enfrentan a kekos del equipo rojo con katana, rifle y pistola",
    body: parts.join(""),
  });
}

/* ---------- Plataformas de los modos de juego ---------- */

function platform(iso, n, accent, top1, top2) {
  const out = [];
  out.push(iso.box(0, 0, -0.45, n, n, 0.45, { top: top1, left: "#0f1115", right: "#15181d" }));
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      out.push(iso.tile(x, y, 1, 1, (x + y) % 2 ? top1 : top2, 0, ' stroke="rgba(0,0,0,.35)" stroke-width="1"'));
    }
  }
  // bordes neón del frente
  const a = iso.p(0, n, 0);
  const b = iso.p(n, n, 0);
  const c = iso.p(n, 0, 0);
  out.push(
    `<polyline points="${a.map(r1).join(",")} ${b.map(r1).join(",")} ${c.map(r1).join(",")}" fill="none" stroke="${accent}" stroke-width="3" stroke-linejoin="round" filter="url(#glow)"/>`,
  );
  const a2 = iso.p(0, n, -0.45);
  const b2 = iso.p(n, n, -0.45);
  const c2 = iso.p(n, 0, -0.45);
  out.push(
    `<polyline points="${a2.map(r1).join(",")} ${b2.map(r1).join(",")} ${c2.map(r1).join(",")}" fill="none" stroke="${accent}" stroke-opacity=".35" stroke-width="2" stroke-linejoin="round"/>`,
  );
  return out.join("");
}

function modeScene({ n, accent, title, top1, top2, fighters, effects, w = 420, h = 280, ox, oy, glowY = 170 }) {
  const iso = createIso({ ox: ox ?? w / 2, oy: oy ?? 70 });
  const parts = [
    `<ellipse cx="${w / 2}" cy="${glowY}" rx="${w * 0.42}" ry="${h * 0.3}" fill="${accent}" opacity=".16" filter="url(#glow-soft)"/>`,
    platform(iso, n, accent, top1, top2),
  ];
  const ks = fighters.map(([kind, pal, gx, gy, flip, scale]) => keko(iso, kind, pal, gx, gy, { flip, scale }));
  parts.push(paint([...ks]));
  if (effects) parts.push(effects(ks));
  return svgDoc({ w, h, title, body: parts.join("") });
}

function mode1v1() {
  return modeScene({
    n: 3,
    accent: "#ff4438",
    title: "Duelo 1 contra 1: un agente con pistola frente a un ninja con katana",
    top1: "#2a1c1e",
    top2: "#311f22",
    oy: 92,
    glowY: 190,
    fighters: [
      ["agent", "agentBlue", 0.45, 2.45, false, 3],
      ["ninja", "ninjaRed", 2.55, 0.55, true, 3],
    ],
    effects: (ks) => {
      const m = ks[0].point("muzzle");
      return tracer([m[0] + 14, m[1]], [m[0] + 48, m[1] - 10], "#38bdff", 2) + flash(m, 1, 9, "#7fe3ff") + sparkle(380, 230, 2) + sparkle(370, 70, 1.5, "#ff4438");
    },
  });
}

function mode2v2() {
  return modeScene({
    n: 4,
    accent: "#38bdff",
    title: "Combate 2 contra 2: dos parejas se enfrentan con rifles, pistolas y katanas",
    top1: "#16202c",
    top2: "#1a2532",
    oy: 78,
    glowY: 185,
    fighters: [
      ["soldier", "soldierGreen", 0.68, 1.93, false, 2.6],
      ["agent", "agentBlue", 0.78, 4.0, false, 2.6],
      ["ninja", "ninjaRed", 1.93, 0.68, true, 2.6],
      ["soldier", "soldierRed", 4.0, 0.78, true, 2.6],
    ],
    effects: (ks) => {
      const m = ks[0].point("muzzle");
      const r = ks[3].point("muzzle");
      return flash(m, 1, 8) + flash(r, -1, 8, "#ff8a4a") + sparkle(40, 240, 2, "#38bdff") + sparkle(380, 50, 1.5);
    },
  });
}

function mode5v5() {
  const team = [
    ["soldier", "soldierGreen"],
    ["agent", "agentBlue"],
    ["soldier", "soldierGreen"],
    ["agent", "agentBlue"],
    ["ninja", "ninjaBlue"],
  ];
  const enemy = [
    ["ninja", "ninjaRed"],
    ["soldier", "soldierRed"],
    ["agent", "agentRed"],
    ["soldier", "soldierRed"],
    ["ninja", "ninjaRed"],
  ];
  const leftSpots = [
    [0.5, 1.6],
    [0.6, 3.0],
    [1.5, 2.3],
    [1.0, 4.4],
    [2.1, 3.9],
  ];
  const rightSpots = [
    [3.0, 0.5],
    [4.0, 1.1],
    [3.6, 2.0],
    [4.6, 2.4],
    [4.3, 0.2],
  ];
  return modeScene({
    n: 5,
    accent: "#9dff52",
    title: "Guerra 5 contra 5: dos clanes de cinco kekos cada uno combaten en una plataforma",
    top1: "#1c2416",
    top2: "#212a1a",
    oy: 64,
    glowY: 180,
    fighters: [
      ...team.map(([k, p], i) => [k, p, leftSpots[i][0], leftSpots[i][1], false, 2]),
      ...enemy.map(([k, p], i) => [k, p, rightSpots[i][0], rightSpots[i][1], true, 2]),
    ],
    effects: (ks) => {
      let fx = "";
      for (const k of ks) {
        try {
          const m = k.point("muzzle");
          const dir = m[0] < 210 ? 1 : -1;
          fx += flash(m, dir, 6, dir > 0 ? "#ffd65a" : "#ff8a4a");
        } catch {
          /* los ninjas no tienen cañón */
        }
      }
      return fx + sparkle(30, 250, 2, "#9dff52") + sparkle(390, 60, 1.5);
    },
  });
}

/* ---------- Mapas ---------- */

function warMap() {
  const n = 9;
  const W = 640;
  const H = 440;
  const iso = createIso({ ox: n * 32 + 32, oy: 128 });
  const parts = [`<ellipse cx="320" cy="240" rx="280" ry="160" fill="#9dff52" opacity=".08" filter="url(#glow-soft)"/>`];
  const trench = (y) => y === 4;
  parts.push(
    iso.room({
      cols: n,
      rows: n,
      wallH: 3,
      floor: { left: "#1d1a12", right: "#252117" },
      wall: { left: "#1a1c1f", right: "#212428", top: "#3a3e44", edge: "#121315" },
      shade: (x, y) => {
        if (trench(y)) return "#17130d";
        const h = hash(x + 3, y + 7);
        if (h > 0.88) return "#3b3424";
        return (x + y) % 2 ? "#4a4230" : "#504735";
      },
    }),
  );
  // pared del fondo de la trinchera (da sensación de profundidad)
  parts.push(iso.poly([[0, 4, 0], [n, 4, 0], [n, 4.18, 0], [0, 4.18, 0]], "#0b0907"));
  parts.push(
    iso.onLeftWall(0, n, 2.3, 2.4, "#9dff52", ' filter="url(#glow)"'),
    iso.onRightWall(0, n, 2.3, 2.4, "#ff4438", ' filter="url(#glow)"'),
    // grafiti / marcas militares
    iso.onRightWall(2.4, 4.6, 0.8, 1.7, "#2a2d31", ' stroke="#ffc93a" stroke-width="2"'),
    iso.onRightWall(2.7, 4.3, 1.15, 1.35, "#ffc93a", ' opacity=".8"'),
    iso.onLeftWall(5.4, 7.6, 1.5, 1.75, "#050608"),
  );

  const items = [];
  // torre de vigilancia
  const legs = [
    [0.4, 0.4],
    [1.5, 0.4],
    [0.4, 1.5],
    [1.5, 1.5],
  ];
  for (const [x, y] of legs) items.push(item(x + y, iso.box(x, y, 0, 0.14, 0.14, 1.9, WOOD)));
  items.push(item(2.1, iso.box(0.3, 0.3, 1.9, 1.5, 1.5, 0.16, WOOD)));
  items.push(item(2.15, iso.box(0.3, 0.3, 2.06, 1.5, 1.5, 0.35, { ...WOOD, top: "#2c2112" })));
  items.push(item(2.2, flag(iso, 1.05, 1.05, "#9dff52", 3.4, 1)));
  // búnker rojo (base) contra la pared derecha
  items.push(item(6.4 + 1.0, iso.box(5.6, 0.3, 0, 1.8, 1.3, 0.95, CONCRETE)));
  items.push(item(6.4 + 1.1, iso.poly([[5.9, 1.6, 0.55], [7.1, 1.6, 0.55], [7.1, 1.6, 0.7], [5.9, 1.6, 0.7]], "#050608")));
  items.push(item(6.4 + 1.2, flag(iso, 7.2, 0.6, "#ff4438", 2.2, -1)));
  // búnker verde
  items.push(item(1.3 + 7.0, iso.box(0.3, 6.3, 0, 1.3, 1.8, 0.95, CONCRETE)));
  items.push(item(1.3 + 7.1, flag(iso, 0.6, 7.6, "#9dff52", 2.0, 1)));
  // bolsas de arena a los costados de la trinchera
  items.push(...sandbags(iso, 2.4, 3.4, 5, "x"));
  items.push(...sandbags(iso, 3.6, 5.05, 5, "x"));
  // cajas y barricadas urbanas
  items.push(item(7.6 + 7.0, iso.box(7.2, 6.6, 0, 0.9, 0.9, 0.9, WOOD)));
  items.push(item(7.7 + 7.1, iso.box(7.35, 6.75, 0.9, 0.6, 0.6, 0.5, WOOD)));
  items.push(item(3.6 + 7.4, iso.box(2.8, 7.2, 0, 1.6, 0.35, 0.8, CONCRETE)));
  // erizos checos (barreras antitanque)
  for (const [x, y] of [
    [6.3, 2.9],
    [1.6, 2.6],
  ]) {
    const [cx, cy] = iso.p(x, y, 0);
    items.push(
      item(
        x + y,
        `<g stroke="#8a929c" stroke-width="3" stroke-linecap="round"><line x1="${r1(cx - 16)}" y1="${r1(cy)}" x2="${r1(cx + 16)}" y2="${r1(cy - 30)}"/><line x1="${r1(cx + 16)}" y1="${r1(cy)}" x2="${r1(cx - 16)}" y2="${r1(cy - 30)}"/><line x1="${r1(cx)}" y1="${r1(cy + 6)}" x2="${r1(cx)}" y2="${r1(cy - 34)}"/></g>`,
      ),
    );
  }
  // alambre de púas
  {
    const [x1, y1] = iso.p(5.2, 8.6, 0.3);
    const [x2, y2] = iso.p(8.6, 8.6, 0.3);
    items.push(item(16.5, `<path d="M ${r1(x1)} ${r1(y1)} L ${r1(x2)} ${r1(y2)}" stroke="#9aa3ad" stroke-width="2" stroke-dasharray="3 5" fill="none"/>`));
  }
  items.push(keko(iso, "soldier", "soldierGreen", 1.6, 5.4, { scale: 2.4 }));
  items.push(keko(iso, "soldier", "soldierRed", 6.2, 2.3, { flip: true, scale: 2.4 }));
  parts.push(paint(items));
  parts.push(sparkle(60, 60, 2, "#9dff52"), sparkle(590, 70, 1.5));

  return svgDoc({
    w: W,
    h: H,
    title: "Mapa de Guerra: sala isométrica con trinchera central, bolsas de arena, búnkeres, torre de vigilancia y barreras antitanque",
    body: parts.join(""),
  });
}

function pagodaRoof(iso, gx, gy, gz, w, d, rh, c) {
  const e = 0.35;
  const A = [gx - e, gy + d + e, gz];
  const B = [gx + w + e, gy + d + e, gz];
  const C = [gx + w + e, gy - e, gz];
  const apex = [gx + w / 2, gy + d / 2, gz + rh];
  return (
    iso.poly([A, B, apex], c.left, ` stroke="${c.edge}" stroke-width="2" stroke-linejoin="round"`) +
    iso.poly([B, C, apex], c.right, ` stroke="${c.edge}" stroke-width="2" stroke-linejoin="round"`)
  );
}

function japanMap() {
  const n = 9;
  const W = 640;
  const H = 440;
  const iso = createIso({ ox: n * 32 + 32, oy: 128 });
  const parts = [
    `<ellipse cx="320" cy="230" rx="280" ry="160" fill="#ff3fa4" opacity=".09" filter="url(#glow-soft)"/>`,
    `<ellipse cx="200" cy="160" rx="160" ry="110" fill="#38bdff" opacity=".08" filter="url(#glow-soft)"/>`,
  ];
  const tatami = (x, y) => x >= 3 && x <= 5 && y >= 3 && y <= 6;
  parts.push(
    iso.room({
      cols: n,
      rows: n,
      wallH: 3.2,
      floor: { left: "#160f0d", right: "#1d1411" },
      wall: { left: "#15122a", right: "#1c1836", top: "#332d55", edge: "#0e0c1d" },
      shade: (x, y) => {
        if (tatami(x, y)) return (x + y) % 2 ? "#4a4f2c" : "#525832";
        return (x + y) % 2 ? "#2d201c" : "#33251f";
      },
    }),
  );
  // carteles de neón y faroles en las paredes
  parts.push(
    iso.onLeftWall(0, n, 2.6, 2.68, "#38bdff", ' filter="url(#glow)"'),
    iso.onRightWall(0, n, 2.6, 2.68, "#ff3fa4", ' filter="url(#glow)"'),
    // cartel vertical rosa
    iso.onRightWall(3.3, 4.1, 0.9, 2.4, "#120d1c", ' stroke="#ff3fa4" stroke-width="2.5" filter="url(#glow)"'),
    iso.onRightWall(3.5, 3.9, 2.05, 2.15, "#ff3fa4"),
    iso.onRightWall(3.5, 3.9, 1.75, 1.85, "#ff3fa4"),
    iso.onRightWall(3.65, 3.75, 1.2, 1.95, "#ff3fa4"),
    iso.onRightWall(3.5, 3.9, 1.1, 1.2, "#ff3fa4"),
    // cartel horizontal celeste
    iso.onLeftWall(4.6, 7.4, 1.5, 2.15, "#0b1220", ' stroke="#38bdff" stroke-width="2.5" filter="url(#glow)"'),
    iso.onLeftWall(4.9, 5.6, 1.7, 1.95, "#38bdff"),
    iso.onLeftWall(5.9, 6.2, 1.65, 2.0, "#38bdff"),
    iso.onLeftWall(6.5, 7.1, 1.7, 1.95, "#38bdff"),
    // ventana redonda (shoji)
    iso.onRightWall(6.2, 7.8, 1.0, 2.1, "#e9dcc4", ' opacity=".18"'),
  );

  const items = [];
  // torii
  const RED = { top: "#ff5544", left: "#b3241c", right: "#d63a2c" };
  items.push(item(1.9 + 1.0, iso.box(1.9, 1.0, 0, 0.22, 0.22, 2.5, RED)));
  items.push(item(1.9 + 3.6, iso.box(1.9, 3.6, 0, 0.22, 0.22, 2.5, RED)));
  items.push(item(2.0 + 2.4 + 0.5, iso.box(1.92, 0.75, 2.05, 0.18, 3.3, 0.16, RED)));
  items.push(item(2.0 + 2.4 + 0.6, iso.box(1.84, 0.45, 2.5, 0.34, 3.9, 0.2, RED)));
  items.push(item(2.0 + 2.4 + 0.7, iso.box(1.8, 0.35, 2.7, 0.42, 4.1, 0.1, { top: "#1a1215", left: "#0c0809", right: "#120c0e" })));
  // santuario con techo de pagoda
  items.push(item(6.4 + 1.2, iso.box(5.6, 0.4, 0, 1.7, 1.5, 1.2, { top: "#3b2418", left: "#2a170f", right: "#341e14" })));
  items.push(item(6.4 + 1.25, iso.poly([[6.0, 1.9, 0.0], [6.9, 1.9, 0.0], [6.9, 1.9, 0.9], [6.0, 1.9, 0.9]], "#ffb347", ' opacity=".55" filter="url(#glow)"')));
  items.push(item(6.4 + 1.3, pagodaRoof(iso, 5.6, 0.4, 1.2, 1.7, 1.5, 1.1, { left: "#241f3a", right: "#2e2850", edge: "#ff3fa4" })));
  // linternas de piedra
  for (const [x, y] of [
    [4.2, 1.2],
    [7.6, 3.4],
  ]) {
    items.push(item(x + y, iso.box(x, y, 0, 0.36, 0.36, 0.5, CONCRETE) + iso.box(x + 0.05, y + 0.05, 0.5, 0.26, 0.26, 0.3, { top: "#ffd27a", left: "#ffb347", right: "#ffc35e" }) + iso.box(x - 0.06, y - 0.06, 0.8, 0.48, 0.48, 0.12, CONCRETE)));
  }
  // cerezo
  {
    const tx = 1.3;
    const ty = 7.2;
    const [cx, cy] = iso.p(tx, ty, 1.5);
    let blossoms = "";
    const spots = [
      [0, -22, 30],
      [-30, -8, 22],
      [28, -6, 24],
      [-12, 14, 20],
      [18, 16, 18],
      [-34, -30, 16],
      [30, -32, 18],
    ];
    for (const [dx, dy, r] of spots) blossoms += `<circle cx="${r1(cx + dx + 4)}" cy="${r1(cy + dy + 5)}" r="${r}" fill="#c9478c"/>`;
    for (const [dx, dy, r] of spots) blossoms += `<circle cx="${r1(cx + dx)}" cy="${r1(cy + dy)}" r="${r - 3}" fill="#ff8cc6"/>`;
    for (const [dx, dy] of [
      [-10, -30],
      [14, -18],
      [-22, 4],
      [24, 6],
      [4, 10],
    ])
      blossoms += `<circle cx="${r1(cx + dx)}" cy="${r1(cy + dy)}" r="5" fill="#ffd1e8"/>`;
    items.push(item(tx + ty, iso.box(tx - 0.08, ty - 0.08, 0, 0.16, 0.16, 1.6, WOOD) + `<g filter="url(#glow)" opacity=".95">${blossoms}</g>`));
  }
  // pétalos en el piso
  for (const [x, y] of [
    [2.2, 6.4],
    [3.1, 7.6],
    [0.8, 5.6],
    [4.4, 8.1],
  ]) {
    const [px, py] = iso.p(x, y, 0);
    items.push(item(x + y - 0.5, `<ellipse cx="${r1(px)}" cy="${r1(py)}" rx="4" ry="2" fill="#ff8cc6"/>`));
  }
  // bambú
  for (let i = 0; i < 3; i++) items.push(item(8.4 + 5.6 + i * 0.3, iso.box(8.3 - i * 0.25, 5.4 + i * 0.35, 0, 0.12, 0.12, 2.2 - i * 0.3, { top: "#7cc46a", left: "#3f7a35", right: "#55964a" })));
  // kekos: un ninja emboscado sobre el techo y otro en el piso
  items.push({ ...keko(iso, "ninja", "ninjaRed", 2.0, 2.4, { flip: true, scale: 2.4, gz: 2.8 }), depth: 6 });
  items.push(keko(iso, "agent", "agentBlue", 4.0, 5.6, { scale: 2.4 }));
  parts.push(paint(items));
  parts.push(sparkle(70, 70, 2, "#ff3fa4"), sparkle(580, 60, 1.5, "#38bdff"), sparkle(600, 330, 1.5));

  return svgDoc({
    w: W,
    h: H,
    title: "Mapa de Japón: sala isométrica con torii rojo, santuario con techo de pagoda, carteles de neón, linternas de piedra, bambú y un cerezo",
    body: parts.join(""),
  });
}

/* ---------- Insignia e íconos ---------- */

function badge() {
  const s = badgeSprite();
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s.w} ${s.h}" width="${s.w * 4}" height="${s.h * 4}" role="img" aria-label="Insignia de Habbo Duty">` +
    `<title>Insignia de Habbo Duty</title>${spriteToSvg(s, BADGE_PALETTE)}</svg>\n`
  );
}

function icon(name, title) {
  const s = name === "combat" ? combatIconSprite() : outline(parseSprite(ICONS[name]));
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s.w} ${s.h}" width="${s.w * 4}" height="${s.h * 4}" role="img" aria-label="${title}">` +
    `<title>${title}</title>${spriteToSvg(s, ICON_PALETTES[name])}</svg>\n`
  );
}

/* ---------- Salida ---------- */

const files = {
  "hero-battle.svg": heroScene(),
  "mode-1v1.svg": mode1v1(),
  "mode-2v2.svg": mode2v2(),
  "mode-5v5.svg": mode5v5(),
  "map-war.svg": warMap(),
  "map-japan.svg": japanMap(),
  "badge.svg": badge(),
  "icon-account.svg": icon("account", "Cuenta de Habbo"),
  "icon-search.svg": icon("search", "Buscar la sala"),
  "icon-combat.svg": icon("combat", "Armas listas para combatir"),
};

await mkdir(OUT, { recursive: true });
for (const [name, svg] of Object.entries(files)) {
  await writeFile(new URL(name, OUT), svg, "utf8");
  console.log(`  ✓ ${name} (${(svg.length / 1024).toFixed(1)} KB)`);
}
