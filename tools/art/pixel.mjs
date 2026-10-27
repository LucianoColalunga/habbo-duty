/**
 * Utilidades de pixel art: convierten sprites dibujados en texto (una letra por
 * píxel) en rectángulos SVG. Cada letra se traduce a un color con una paleta.
 *
 * Convenciones:
 *   "." = transparente
 *   "k" = contorno / negro (se usa también para ojos)
 */

/** Pasa las filas de texto a una grilla rectangular (rellena con "."). */
export function parseSprite(rows) {
  const w = Math.max(...rows.map((r) => r.length));
  const grid = rows.map((r) => r.padEnd(w, ".").split(""));
  return { w, h: grid.length, grid };
}

/** Copia profunda de un sprite. */
export function cloneSprite(sprite) {
  return { w: sprite.w, h: sprite.h, grid: sprite.grid.map((row) => [...row]) };
}

/** Pinta un píxel si está dentro de la grilla. */
export function plot(sprite, x, y, ch) {
  if (y >= 0 && y < sprite.h && x >= 0 && x < sprite.w) sprite.grid[y][x] = ch;
}

/** Línea de Bresenham (para hojas de espadas, cañones, trazos de bala...). */
export function line(sprite, x0, y0, x1, y1, ch) {
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (;;) {
    plot(sprite, x0, y0, ch);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
}

/** Agranda la grilla dejando un margen transparente (para el contorno). */
export function pad(sprite, n = 1) {
  const w = sprite.w + n * 2;
  const empty = () => new Array(w).fill(".");
  const grid = [
    ...Array.from({ length: n }, empty),
    ...sprite.grid.map((row) => [...new Array(n).fill("."), ...row, ...new Array(n).fill(".")]),
    ...Array.from({ length: n }, empty),
  ];
  return { w, h: grid.length, grid };
}

/**
 * Agrega un contorno de 1 píxel alrededor de todo lo que no es transparente
 * (vecindad de 4), como el borde oscuro típico de los avatares de Habbo.
 */
export function outline(sprite, ch = "k") {
  const out = pad(sprite, 1);
  const src = out.grid.map((row) => [...row]);
  for (let y = 0; y < out.h; y++) {
    for (let x = 0; x < out.w; x++) {
      if (src[y][x] !== ".") continue;
      const near = [
        [x + 1, y],
        [x - 1, y],
        [x, y + 1],
        [x, y - 1],
      ].some(([nx, ny]) => src[ny]?.[nx] && src[ny][nx] !== ".");
      if (near) out.grid[y][x] = ch;
    }
  }
  return out;
}

/** Espeja el sprite horizontalmente (para que mire hacia el otro lado). */
export function flipX(sprite) {
  return { w: sprite.w, h: sprite.h, grid: sprite.grid.map((row) => [...row].reverse()) };
}

/** Reemplaza letras de la paleta (por ejemplo, para cambiar de equipo). */
export function recolor(sprite, map) {
  return {
    w: sprite.w,
    h: sprite.h,
    grid: sprite.grid.map((row) => row.map((ch) => map[ch] ?? ch)),
  };
}

const r1 = (n) => Math.round(n * 100) / 100;

/**
 * Convierte el sprite en SVG: un solo <path> por color, uniendo los píxeles
 * contiguos de cada fila, para que el archivo quede liviano.
 */
export function spriteToSvg(sprite, palette, { x = 0, y = 0, scale = 1 } = {}) {
  const paths = new Map();
  for (let row = 0; row < sprite.h; row++) {
    let col = 0;
    while (col < sprite.w) {
      const ch = sprite.grid[row][col];
      if (ch === ".") {
        col++;
        continue;
      }
      let end = col + 1;
      while (end < sprite.w && sprite.grid[row][end] === ch) end++;
      const fill = palette[ch];
      if (!fill) throw new Error(`Falta el color de la letra "${ch}" en la paleta`);
      const w = r1((end - col) * scale);
      const d = `M${r1(x + col * scale)} ${r1(y + row * scale)}h${w}v${r1(scale)}h-${w}z`;
      paths.set(fill, (paths.get(fill) ?? "") + d);
      col = end;
    }
  }
  const body = [...paths].map(([fill, d]) => `<path fill="${fill}" d="${d}"/>`).join("");
  return `<g shape-rendering="crispEdges">${body}</g>`;
}
