/**
 * Proyección isométrica 2:1 (la misma idea que usan las salas de Habbo:
 * baldosas de 64 x 32 px). Todas las piezas se dibujan con polígonos simples.
 *
 *   gx crece hacia abajo a la derecha, gy hacia abajo a la izquierda,
 *   gz hacia arriba (en unidades de baldosa).
 */

const r1 = (n) => Math.round(n * 10) / 10;

export function createIso({ ox = 0, oy = 0, tw = 64, th = 32, zh = 32 } = {}) {
  const p = (gx, gy, gz = 0) => [ox + (gx - gy) * (tw / 2), oy + (gx + gy) * (th / 2) - gz * zh];
  const pts = (list) => list.map(([gx, gy, gz]) => p(gx, gy, gz).map(r1).join(",")).join(" ");
  const poly = (list, fill, extra = "") => `<polygon points="${pts(list)}" fill="${fill}"${extra}/>`;

  /** Caja con tapa y dos caras visibles. */
  function box(gx, gy, gz, w, d, h, c) {
    const s = c.stroke ? ` stroke="${c.stroke}" stroke-width="${c.strokeWidth ?? 1}" stroke-linejoin="round"` : "";
    return [
      // cara izquierda (mira hacia abajo a la izquierda, plano gy + d)
      poly(
        [
          [gx, gy + d, gz],
          [gx + w, gy + d, gz],
          [gx + w, gy + d, gz + h],
          [gx, gy + d, gz + h],
        ],
        c.left,
        s,
      ),
      // cara derecha (mira hacia abajo a la derecha, plano gx + w)
      poly(
        [
          [gx + w, gy, gz],
          [gx + w, gy + d, gz],
          [gx + w, gy + d, gz + h],
          [gx + w, gy, gz + h],
        ],
        c.right,
        s,
      ),
      // tapa
      poly(
        [
          [gx, gy, gz + h],
          [gx + w, gy, gz + h],
          [gx + w, gy + d, gz + h],
          [gx, gy + d, gz + h],
        ],
        c.top,
        s,
      ),
    ].join("");
  }

  /** Rombo plano sobre el piso (baldosa, alfombra, mancha, marca). */
  function tile(gx, gy, w, d, fill, gz = 0, extra = "") {
    return poly(
      [
        [gx, gy, gz],
        [gx + w, gy, gz],
        [gx + w, gy + d, gz],
        [gx, gy + d, gz],
      ],
      fill,
      extra,
    );
  }

  /** Cuadrilátero pegado a la pared del fondo derecha (plano gy = 0). */
  function onRightWall(a, b, z1, z2, fill, extra = "", gy = 0) {
    return poly(
      [
        [a, gy, z1],
        [b, gy, z1],
        [b, gy, z2],
        [a, gy, z2],
      ],
      fill,
      extra,
    );
  }

  /** Cuadrilátero pegado a la pared del fondo izquierda (plano gx = 0). */
  function onLeftWall(a, b, z1, z2, fill, extra = "", gx = 0) {
    return poly(
      [
        [gx, a, z1],
        [gx, b, z1],
        [gx, b, z2],
        [gx, a, z2],
      ],
      fill,
      extra,
    );
  }

  /**
   * Sala estilo Habbo: piso de baldosas con espesor y dos paredes al fondo.
   * `shade(x, y)` devuelve el color de cada baldosa.
   */
  function room({ cols, rows, wallH, floor, wall, shade, grid = "rgba(0,0,0,.35)", thickness = 0.28 }) {
    const out = [];
    const t = 0.18; // espesor de las paredes
    // paredes (primero, quedan detrás de todo)
    out.push(
      poly(
        [
          [0, 0, 0],
          [0, rows, 0],
          [0, rows, wallH],
          [0, 0, wallH],
        ],
        wall.left,
      ),
      poly(
        [
          [0, 0, 0],
          [cols, 0, 0],
          [cols, 0, wallH],
          [0, 0, wallH],
        ],
        wall.right,
      ),
      // canto superior de las paredes
      poly(
        [
          [-t, -t, wallH],
          [cols, -t, wallH],
          [cols, 0, wallH],
          [0, 0, wallH],
          [0, rows, wallH],
          [-t, rows, wallH],
        ],
        wall.top,
      ),
      // cantos de las puntas de cada pared
      poly(
        [
          [-t, rows, wallH],
          [0, rows, wallH],
          [0, rows, -thickness],
          [-t, rows, -thickness],
        ],
        wall.edge ?? wall.left,
      ),
      poly(
        [
          [cols, -t, wallH],
          [cols, 0, wallH],
          [cols, 0, -thickness],
          [cols, -t, -thickness],
        ],
        wall.edge ?? wall.right,
      ),
    );
    // espesor del piso (bordes delanteros)
    out.push(
      poly(
        [
          [0, rows, 0],
          [cols, rows, 0],
          [cols, rows, -thickness],
          [0, rows, -thickness],
        ],
        floor.left,
      ),
      poly(
        [
          [cols, 0, 0],
          [cols, rows, 0],
          [cols, rows, -thickness],
          [cols, 0, -thickness],
        ],
        floor.right,
      ),
    );
    // baldosas
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        out.push(tile(x, y, 1, 1, shade(x, y), 0, ` stroke="${grid}" stroke-width="1"`));
      }
    }
    return out.join("");
  }

  return { p, pts, poly, box, tile, room, onRightWall, onLeftWall };
}
