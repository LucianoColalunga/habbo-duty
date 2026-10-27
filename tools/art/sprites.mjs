/**
 * Kekos (avatares) originales en pixel art, inspirados en las proporciones de
 * los avatares de Habbo pero dibujados desde cero. Todos miran a la derecha;
 * para el otro equipo se espejan. El contorno se agrega automáticamente.
 *
 * Letras comunes: S/s piel, k ojos, B botas, M/m metal del arma.
 */
import { parseSprite, line, plot, outline } from "./pixel.mjs";

/* Soldado con rifle */
const SOLDIER = [
  "......HHHHHHH...........",
  "....HHHHHHHHHHH.........",
  "...HHHLLLHHHHHHH........",
  "..HHHLLHHHHHHHHHH.......",
  "..HHHHHHHHHHHHHHH.......",
  ".hhhhhhhhhhhhhhhhhh.....",
  "..hhSSSSSSSSSSSSS.......",
  "..hsSSSSSSSSSSSSS.......",
  "..hsSSSSSSSkSSSkS.......",
  "...sSSSSSSSkSSSkS.......",
  "...sSSSSSSSSSSSSS.......",
  "...ssSSSSSSSSSkSS.......",
  "....ssSSSSSSSSSS........",
  ".....sssSSSSSSs.........",
  "......sSSSs.............",
  "....TTTTTTTTTT..........",
  "...tTTAATTTTTTT.........",
  "...tTTTAATTTTTT..MM.....",
  "...tTTTTAATTTSSMMMMMMMMm",
  "...tTTTTTAATSSmMMMMMMM..",
  "...tTTTTTTTTTMM.M.......",
  "....tTTTTTTTT.M.........",
  "....AAAAAAAAAA..........",
  "....PPPPPpPPPP..........",
  "....pPPPP.pPPPP.........",
  "....pPPP...PPPP.........",
  "....pPPP...PPPP.........",
  "....pPPP...pPPP.........",
  "...BBBBB...BBBBB........",
  "...BBBBB...BBBBBB.......",
];

/* Ninja con katana de hoja brillante */
const NINJA = [
  ".....HHHHHHHH...........",
  "...HHHHHHHHHHHH.........",
  "..HHHHHHHHHHHHHH........",
  "..HHHHHHHHHHHHHHH.......",
  "RRRRRRRRRRRRRRRRR.......",
  ".RRhrrrrrrrrrrrrr.......",
  "R.hhSSSSSSSSSSSSS.......",
  "..hsSSSSSSSkSSSkS.......",
  "..hsSSSSSSSkSSSkS.......",
  "...sQQQQQQQQQQQQQ.......",
  "...QQQQQQQQQQQQQQ.......",
  "....QQQQQQQQQQQQ........",
  ".....QQQQQQQQQQ.........",
  "......QQQQQQ............",
  "......ssss..............",
  "....TTTTTTTTTT..........",
  "...tTTVTTTVTTTT.........",
  "...tTTTVTVTTTTT.........",
  "...tTTTTVTTTTSS.........",
  "...tTTTTTTTTTSSO........",
  "...tTTTTTTTTTT..........",
  "....tTTTTTTTT...........",
  "....OYOOOOOOOO..........",
  "....PPPPPPPPPPP.........",
  "...pPPPPPpPPPPP.........",
  "...pPPPPP.PPPPPP........",
  "...pPPPP...PPPPP........",
  "...pPPPP...pPPPP........",
  "....BBBB....BBBB........",
  "...BBBBB...BBBBBB.......",
];

/* Agente con gorra, visor y pistola */
const AGENT = [
  "......CCCCCCC...........",
  "....CCCCCCCCCCC.........",
  "...CCCCCCCCCCCCC........",
  "..CCCCLCCCCCCCCCC.......",
  "..cccccccccccccccccccc..",
  "..HHSSSSSSSSSSSSS.......",
  "..HsSSSSSSSSSSSSS.......",
  "..HsSSSVVVVVVVVVV.......",
  "...sSSSVVVVVVVVVV.......",
  "...sSSSSSSSSSSSSS.......",
  "...ssSSSSSSSSSkSS.......",
  "....ssSSSSSSSSSS........",
  ".....sssSSSSSSs.........",
  "......sSSSs.............",
  "....TTTTTTTTTT..........",
  "...tTTXTTTTTTTTTTTSS....",
  "...tTTXTTTTTTTTTTTSSMMMm",
  "...tTTXTTTTTT......MM...",
  "...tTTXTTTTTT...........",
  "...tTTXTTTTTT...........",
  "....tTXTTTTTT...........",
  "....AAAAAAAAAA..........",
  "....PPPPPpPPPP..........",
  "....pPPPP.pPPPP.........",
  "....pPPP...PPPP.........",
  "....pPPP...PPPP.........",
  "....pPPP...pPPP.........",
  "...BBBBB...BBBBB........",
  "...BBBBB...BBBBBB.......",
];

function buildNinja() {
  const s = parseSprite(NINJA);
  // guarda dorada y hoja de la katana apuntando arriba a la derecha
  line(s, 16, 16, 22, 2, "G");
  line(s, 17, 16, 23, 2, "W");
  plot(s, 15, 18, "Y");
  plot(s, 16, 17, "Y");
  plot(s, 17, 17, "Y");
  plot(s, 15, 17, "Y");
  return outline(s);
}

export const SPRITES = {
  soldier: outline(parseSprite(SOLDIER)),
  ninja: buildNinja(),
  agent: outline(parseSprite(AGENT)),
};

/* Paletas: el mismo sprite cambia de equipo cambiando los colores. */
const BASE = {
  k: "#07090c",
  S: "#f0c29c",
  s: "#cc9471",
  B: "#16181c",
  M: "#2c3138",
  m: "#a3aeba",
};

export const PALETTES = {
  soldierGreen: {
    ...BASE,
    H: "#56733a",
    h: "#3d5329",
    L: "#86a95a",
    T: "#4b5f32",
    t: "#35451f",
    A: "#23271b",
    P: "#3a4329",
    p: "#2a311e",
  },
  soldierRed: {
    ...BASE,
    H: "#8f2f2a",
    h: "#62201c",
    L: "#c9564d",
    T: "#702823",
    t: "#4f1a17",
    A: "#1f1313",
    P: "#3b2523",
    p: "#2a1918",
  },
  ninjaRed: {
    ...BASE,
    H: "#18181e",
    h: "#0e0e13",
    R: "#ff3d3d",
    r: "#c4232a",
    Q: "#26161c",
    T: "#a3202b",
    t: "#6f141d",
    V: "#efe3d3",
    O: "#121216",
    Y: "#ffc93a",
    P: "#221b25",
    p: "#17121a",
    G: "#ff5a4d",
    W: "#fff0ea",
  },
  ninjaBlue: {
    ...BASE,
    H: "#18181e",
    h: "#0e0e13",
    R: "#38c6ff",
    r: "#1f86c4",
    Q: "#141a26",
    T: "#1e4fa3",
    t: "#143571",
    V: "#e3ecf3",
    O: "#10131a",
    Y: "#ffc93a",
    P: "#1a1f2b",
    p: "#11151e",
    G: "#3fd2ff",
    W: "#eafcff",
  },
  agentBlue: {
    ...BASE,
    C: "#2373ff",
    c: "#174bb3",
    L: "#6aa6ff",
    H: "#2d2219",
    V: "#46f0ff",
    T: "#15233f",
    t: "#0d172b",
    X: "#33aaff",
    A: "#0b101b",
    P: "#1b263b",
    p: "#121b2c",
  },
  agentRed: {
    ...BASE,
    C: "#e0312d",
    c: "#9e1f1c",
    L: "#ff7468",
    H: "#2d2219",
    V: "#ffcf5a",
    T: "#2a1416",
    t: "#1c0d0f",
    X: "#ff4d42",
    A: "#120a0b",
    P: "#2f1d1f",
    p: "#211315",
  },
};

/* Íconos y emblemas en pixel art */

/** Escudo con mira: insignia de Habbo Duty (logo y favicon). */
export function badgeSprite() {
  const rows = [
    "OOOOOOOOOOOOOOOOOO",
    "OddddddddddddddddO",
    "OdDDDDDDDDDDDDDDdO",
    "OdDDDDDDggDDDDDDdO",
    "OdDDDDggggggDDDDdO",
    "OdDDDggDggDggDDDdO",
    "OdDDggDDggDDggDDdO",
    "OdDDgDDDDDDDDgDDdO",
    "OdgggggDWWDgggggdO",
    "OdgggggDWWDgggggdO",
    "OdDDgDDDDDDDDgDDdO",
    "OdDDggDDggDDggDDdO",
    ".OdDDggDggDggDDdO.",
    ".OdDDDggggggDDDdO.",
    "..OdDDDDggDDDDdO..",
    "...OdDDDggDDDdO...",
    "....OdDDDDDDdO....",
    ".....OddddddO.....",
    "......OOOOOO......",
  ];
  return outline(parseSprite(rows));
}

export const BADGE_PALETTE = {
  k: "#050608",
  O: "#9dff52",
  d: "#2b3a1c",
  D: "#121a0c",
  g: "#9dff52",
  W: "#ffffff",
};

/** Íconos de los pasos de "Cómo empezar" (16 x 16). */
export const ICONS = {
  account: [
    "....HHHHHHH.....",
    "..HHHHHHHHHHH...",
    ".HHHHHHHHHHHHH..",
    ".HSSSSSSSSSSSH..",
    ".SSSSkSSSSkSSS..",
    ".SSSSkSSSSkSSS..",
    ".SSSSSSSSSSSSS..",
    "..SSSSSkkSSSS...",
    "...SSSSSSSSS....",
    ".....SSSSS......",
    "...TTTTTTTTT....",
    "..TTTTTGTTTTT...",
    ".TTTTTGGGTTTTT..",
    ".TTTTTTGTTTTTT..",
    ".TTTTTTTTTTTTT..",
    "................",
  ],
  search: [
    "....WWWWWW......",
    "..WWccccccWW....",
    ".WccLLccccccW...",
    ".WcLccccccccW...",
    "WccLccccccccW...",
    "WccccccccccccW..",
    "WccccccccccccW..",
    "WccccccccccccW..",
    ".WccccccccccW...",
    ".WWccccccccWW...",
    "...WWWWWWWWHH...",
    "..........HHHH..",
    "...........HHHH.",
    "............HHHH",
    ".............HHH",
    "................",
  ],
};

/** Rifle y katana cruzados (16 x 16), dibujados con líneas. */
export function combatIconSprite() {
  const s = parseSprite(Array.from({ length: 16 }, () => ".".repeat(16)));
  // rifle: cañón arriba a la izquierda, culata de madera abajo a la derecha
  line(s, 1, 1, 9, 9, "M");
  line(s, 2, 1, 9, 8, "m");
  line(s, 10, 10, 13, 13, "O");
  line(s, 10, 11, 13, 14, "O");
  line(s, 11, 10, 14, 13, "O");
  plot(s, 7, 10, "M");
  plot(s, 6, 11, "M");
  // katana: punta arriba a la derecha, empuñadura abajo a la izquierda
  line(s, 6, 9, 14, 1, "G");
  line(s, 7, 9, 14, 2, "W");
  plot(s, 4, 9, "Y");
  plot(s, 5, 10, "Y");
  plot(s, 6, 11, "Y");
  plot(s, 7, 12, "Y");
  line(s, 4, 11, 2, 13, "H");
  line(s, 5, 11, 3, 13, "H");
  plot(s, 1, 14, "Y");
  return outline(s);
}

export const ICON_PALETTES = {
  account: { k: "#07090c", H: "#2d2219", S: "#f0c29c", T: "#2373ff", G: "#46f0ff" },
  search: { k: "#07090c", W: "#d9e7ff", c: "#123a5c", L: "#46f0ff", H: "#ffc93a" },
  combat: { k: "#07090c", G: "#ff5a4d", W: "#fff0ea", M: "#2c3138", m: "#a3aeba", Y: "#ffc93a", O: "#8a5a2b", H: "#3a1f12" },
};
