/* Guía de trazos: checkpoints ordenados por carácter (normalizados 0..1).
 * Cada carácter = lista de strokes; cada stroke = lista de puntos [x, y].
 * El canvas los convierte a píxeles, dibuja guía punteada y valida proximidad.
 */

export type Punto = [number, number];
export type Stroke = Punto[];

const T: Record<string, Stroke[]> = {
  A: [[[0.2, 0.9], [0.5, 0.1], [0.8, 0.9]], [[0.32, 0.62], [0.68, 0.62]]],
  Á: [[[0.2, 0.9], [0.5, 0.1], [0.8, 0.9]], [[0.32, 0.62], [0.68, 0.62]]],
  E: [[[0.75, 0.15], [0.25, 0.15], [0.25, 0.85], [0.75, 0.85]], [[0.25, 0.5], [0.6, 0.5]]],
  É: [[[0.75, 0.15], [0.25, 0.15], [0.25, 0.85], [0.75, 0.85]], [[0.25, 0.5], [0.6, 0.5]]],
  I: [[[0.3, 0.15], [0.7, 0.15]], [[0.5, 0.15], [0.5, 0.85]], [[0.3, 0.85], [0.7, 0.85]]],
  Í: [[[0.3, 0.15], [0.7, 0.15]], [[0.5, 0.15], [0.5, 0.85]], [[0.3, 0.85], [0.7, 0.85]]],
  O: [[[0.5, 0.1], [0.78, 0.3], [0.78, 0.7], [0.5, 0.9], [0.22, 0.7], [0.22, 0.3], [0.5, 0.1]]],
  Ó: [[[0.5, 0.1], [0.78, 0.3], [0.78, 0.7], [0.5, 0.9], [0.22, 0.7], [0.22, 0.3], [0.5, 0.1]]],
  U: [[[0.25, 0.1], [0.25, 0.68], [0.5, 0.9], [0.75, 0.68], [0.75, 0.1]]],
  Ú: [[[0.25, 0.1], [0.25, 0.68], [0.5, 0.9], [0.75, 0.68], [0.75, 0.1]]],
  M: [[[0.15, 0.9], [0.15, 0.1], [0.5, 0.5], [0.85, 0.1], [0.85, 0.9]]],
  P: [[[0.3, 0.9], [0.3, 0.1], [0.62, 0.1], [0.72, 0.25], [0.62, 0.45], [0.3, 0.45]]],
  S: [[[0.75, 0.22], [0.5, 0.1], [0.26, 0.22], [0.32, 0.4], [0.68, 0.6], [0.74, 0.78], [0.5, 0.9], [0.25, 0.78]]],
  L: [[[0.35, 0.1], [0.35, 0.85], [0.75, 0.85]]],
  T: [[[0.15, 0.15], [0.85, 0.15]], [[0.5, 0.15], [0.5, 0.9]]],
  D: [[[0.3, 0.1], [0.3, 0.9], [0.58, 0.9], [0.76, 0.68], [0.76, 0.32], [0.58, 0.1], [0.3, 0.1]]],
  B: [[[0.3, 0.1], [0.3, 0.9], [0.58, 0.9], [0.66, 0.76], [0.54, 0.6], [0.66, 0.48], [0.66, 0.24], [0.58, 0.1], [0.3, 0.1]]],
  C: [[[0.75, 0.22], [0.5, 0.1], [0.26, 0.3], [0.26, 0.7], [0.5, 0.9], [0.75, 0.78]]],
  F: [[[0.65, 0.15], [0.3, 0.15], [0.3, 0.9]], [[0.3, 0.5], [0.58, 0.5]]],
  G: [[[0.75, 0.22], [0.5, 0.1], [0.26, 0.3], [0.26, 0.7], [0.5, 0.9], [0.75, 0.85], [0.75, 0.6], [0.55, 0.6]]],
  H: [[[0.25, 0.1], [0.25, 0.9]], [[0.75, 0.1], [0.75, 0.9]], [[0.25, 0.55], [0.75, 0.55]]],
  J: [[[0.65, 0.1], [0.65, 0.68], [0.5, 0.88], [0.32, 0.84]]],
  K: [[[0.3, 0.1], [0.3, 0.9]], [[0.72, 0.1], [0.3, 0.55]], [[0.42, 0.6], [0.72, 0.9]]],
  N: [[[0.25, 0.9], [0.25, 0.1], [0.75, 0.9], [0.75, 0.1]]],
  Ñ: [[[0.25, 0.9], [0.25, 0.15], [0.75, 0.9], [0.75, 0.15]]],
  Q: [[[0.5, 0.1], [0.76, 0.3], [0.76, 0.68], [0.55, 0.88], [0.7, 0.95]], [[0.55, 0.88], [0.28, 0.68], [0.28, 0.3], [0.5, 0.1]]],
  R: [[[0.3, 0.9], [0.3, 0.1], [0.62, 0.1], [0.72, 0.26], [0.6, 0.45], [0.3, 0.45]], [[0.5, 0.45], [0.75, 0.9]]],
  V: [[[0.2, 0.1], [0.5, 0.9], [0.8, 0.1]]],
  W: [[[0.1, 0.1], [0.3, 0.9], [0.5, 0.4], [0.7, 0.9], [0.9, 0.1]]],
  X: [[[0.25, 0.1], [0.75, 0.9]], [[0.75, 0.1], [0.25, 0.9]]],
  Y: [[[0.2, 0.1], [0.5, 0.5], [0.8, 0.1]], [[0.5, 0.5], [0.5, 0.9]]],
  Z: [[[0.25, 0.12], [0.75, 0.12], [0.25, 0.88], [0.75, 0.88]]],
  '1': [[[0.36, 0.26], [0.52, 0.1], [0.52, 0.9]], [[0.32, 0.9], [0.72, 0.9]]],
  '2': [[[0.26, 0.26], [0.4, 0.1], [0.6, 0.1], [0.7, 0.26], [0.26, 0.85], [0.74, 0.85]]],
  '3': [[[0.26, 0.2], [0.5, 0.1], [0.7, 0.24], [0.54, 0.46], [0.64, 0.56], [0.7, 0.74], [0.5, 0.9], [0.26, 0.8]]],
  '4': [[[0.6, 0.1], [0.3, 0.6], [0.76, 0.6]], [[0.6, 0.1], [0.6, 0.9]]],
  '5': [[[0.7, 0.1], [0.3, 0.1], [0.3, 0.45], [0.58, 0.45], [0.7, 0.6], [0.6, 0.85], [0.34, 0.9]]],
  '6': [[[0.65, 0.15], [0.4, 0.3], [0.3, 0.6], [0.4, 0.85], [0.6, 0.85], [0.7, 0.7], [0.6, 0.55], [0.36, 0.55]]],
  '7': [[[0.2, 0.15], [0.8, 0.15], [0.5, 0.9]]],
  '8': [[[0.5, 0.5], [0.3, 0.36], [0.35, 0.15], [0.65, 0.15], [0.7, 0.36], [0.5, 0.5], [0.3, 0.64], [0.35, 0.85], [0.65, 0.85], [0.7, 0.64], [0.5, 0.5]]],
  '9': [[[0.35, 0.85], [0.6, 0.7], [0.7, 0.4], [0.6, 0.15], [0.4, 0.15], [0.3, 0.3], [0.4, 0.45], [0.64, 0.45]]],
  '0': [[[0.5, 0.1], [0.75, 0.3], [0.75, 0.7], [0.5, 0.9], [0.25, 0.7], [0.25, 0.3], [0.5, 0.1]]],
};

/* ---------- MINÚSCULAS (x-altura 0.37–0.85, ascendentes 0.15, descendentes 0.95) ---------- */
const ACENTO: Stroke = [[0.42, 0.27], [0.6, 0.15]];

const TL: Record<string, Stroke[]> = {
  a: [[[0.62, 0.47], [0.5, 0.37], [0.34, 0.47], [0.34, 0.72], [0.5, 0.85], [0.62, 0.74], [0.62, 0.47]], [[0.62, 0.37], [0.62, 0.85]]],
  b: [[[0.32, 0.15], [0.32, 0.85]], [[0.32, 0.45], [0.5, 0.37], [0.65, 0.47], [0.65, 0.72], [0.5, 0.85], [0.32, 0.74]]],
  c: [[[0.65, 0.45], [0.5, 0.35], [0.34, 0.47], [0.34, 0.72], [0.5, 0.85], [0.65, 0.74]]],
  d: [[[0.35, 0.45], [0.5, 0.37], [0.66, 0.47], [0.66, 0.72], [0.5, 0.85], [0.35, 0.74]], [[0.66, 0.15], [0.66, 0.85]]],
  e: [[[0.35, 0.62], [0.65, 0.62], [0.65, 0.45], [0.5, 0.37], [0.34, 0.47], [0.34, 0.72], [0.5, 0.85], [0.63, 0.78]]],
  f: [[[0.6, 0.2], [0.42, 0.13], [0.32, 0.26], [0.32, 0.85]], [[0.2, 0.44], [0.55, 0.44]]],
  g: [[[0.62, 0.47], [0.5, 0.37], [0.34, 0.47], [0.34, 0.72], [0.5, 0.85], [0.62, 0.74]], [[0.62, 0.37], [0.62, 0.88], [0.52, 0.96], [0.35, 0.92], [0.3, 0.82]]],
  h: [[[0.3, 0.15], [0.3, 0.85]], [[0.3, 0.52], [0.45, 0.37], [0.62, 0.44], [0.62, 0.85]]],
  i: [[[0.42, 0.37], [0.42, 0.85]], [[0.41, 0.19], [0.44, 0.21]]],
  j: [[[0.58, 0.37], [0.58, 0.78], [0.45, 0.92], [0.3, 0.84]], [[0.57, 0.19], [0.6, 0.21]]],
  k: [[[0.3, 0.15], [0.3, 0.85]], [[0.58, 0.4], [0.34, 0.63]], [[0.42, 0.68], [0.64, 0.85]]],
  l: [[[0.4, 0.15], [0.4, 0.78], [0.55, 0.85]]],
  m: [[[0.25, 0.85], [0.25, 0.42], [0.4, 0.35], [0.5, 0.85], [0.6, 0.35], [0.75, 0.85]]],
  n: [[[0.28, 0.85], [0.28, 0.42], [0.45, 0.36], [0.72, 0.45], [0.72, 0.85]]],
  o: [[[0.5, 0.36], [0.66, 0.47], [0.66, 0.72], [0.5, 0.85], [0.34, 0.72], [0.34, 0.47], [0.5, 0.36]]],
  p: [[[0.35, 0.45], [0.5, 0.37], [0.65, 0.47], [0.65, 0.72], [0.5, 0.85], [0.35, 0.74]], [[0.35, 0.37], [0.35, 0.95]]],
  q: [[[0.35, 0.45], [0.5, 0.37], [0.65, 0.47], [0.65, 0.72], [0.5, 0.85], [0.35, 0.74]], [[0.65, 0.37], [0.65, 0.95]]],
  r: [[[0.32, 0.37], [0.32, 0.85]], [[0.32, 0.54], [0.42, 0.37], [0.58, 0.42], [0.62, 0.5]]],
  s: [[[0.6, 0.44], [0.45, 0.35], [0.33, 0.45], [0.42, 0.56], [0.58, 0.64], [0.62, 0.75], [0.5, 0.85], [0.34, 0.78]]],
  t: [[[0.38, 0.25], [0.38, 0.72], [0.5, 0.85], [0.6, 0.8]], [[0.24, 0.45], [0.52, 0.45]]],
  u: [[[0.32, 0.37], [0.32, 0.72], [0.48, 0.85], [0.66, 0.72], [0.66, 0.37]]],
  v: [[[0.3, 0.37], [0.5, 0.85], [0.7, 0.37]]],
  w: [[[0.22, 0.37], [0.38, 0.85], [0.5, 0.5], [0.62, 0.85], [0.78, 0.37]]],
  x: [[[0.35, 0.38], [0.65, 0.84]], [[0.65, 0.38], [0.35, 0.84]]],
  y: [[[0.32, 0.37], [0.5, 0.85]], [[0.68, 0.37], [0.5, 0.85], [0.42, 0.94], [0.28, 0.86]]],
  z: [[[0.32, 0.38], [0.68, 0.38], [0.32, 0.84], [0.68, 0.84]]],
  'ñ': [[[0.28, 0.85], [0.28, 0.42], [0.45, 0.36], [0.72, 0.45], [0.72, 0.85]], [[0.3, 0.26], [0.42, 0.18], [0.54, 0.26], [0.66, 0.18]]],
};
// Vocales acentuadas (mínuscula) = letra + tilde como trazo extra
TL['á'] = [...TL.a, ACENTO];
TL['é'] = [...TL.e, ACENTO];
TL['í'] = [...TL.i, [[0.42, 0.31], [0.58, 0.2]]];
TL['ó'] = [...TL.o, ACENTO];
TL['ú'] = [...TL.u, ACENTO];

export const INSTRUCCIONES_TRAZO: Record<string, string> = {
  A: 'Empezamos abajo a la izquierda, subimos a la punta, bajamos a la derecha y cruzamos en medio.',
  E: 'Empezamos arriba a la derecha, vamos a la izquierda, bajamos hasta abajo, vamos a la derecha y cruzamos en medio.',
  I: 'Rayita arriba, palito en medio de arriba a abajo, y rayita abajo.',
  O: 'Empezamos arriba y hacemos un círculo completo sin levantar el dedo.',
  U: 'Bajamos por la izquierda, hacemos la pancita abajo y subimos por la derecha.',
  M: 'Empezamos abajo, subimos, bajamos al centro, subimos y bajamos otra vez.',
  P: 'Bajamos el palito y luego hacemos la pancita arriba.',
  S: 'Empezamos arriba y hacemos una culebrita hasta abajo.',
  L: 'Bajamos el palito y luego vamos a la derecha.',
  T: 'Primero la rayita de arriba, luego bajamos en medio.',
  D: 'Bajamos el palito y luego hacemos la pancita grande.',
  '1': 'Pequeña rayita, palito largo hacia abajo y base.',
  '2': 'Curvita arriba, diagonal y base.',
  '3': 'Dos pancitas una sobre otra.',
  '4': 'Triangulito y palito largo.',
  '5': 'Rayita, bajamos y pancita abajo.',
  '6': 'Curva desde arriba y circulito abajo.',
  '7': 'Rayita arriba y diagonal hasta abajo.',
  '8': 'Dos circulitos, uno arriba y otro abajo.',
  '9': 'Circulito arriba y colita abajo.',
  '0': 'Un óvalo grande empezando arriba.',
  // Minúsculas
  a: 'Un circulito y una línea a la derecha.',
  b: 'Línea larga hacia abajo, y una panza a la derecha.',
  c: 'Una panza abierta a la derecha.',
  d: 'Una panza a la izquierda y línea larga a la derecha.',
  e: 'Línea en medio, y luego la panza que la cierra.',
  f: 'Gancho arriba, línea larga abajo y rayita cruzada.',
  g: 'Un circulito, línea a la derecha y cola que baja.',
  h: 'Línea larga, y una panza que baja.',
  i: 'Línea cortita, y un puntito arriba.',
  j: 'Línea con cola curva, y un puntito arriba.',
  k: 'Línea larga, y dos puntas como alas.',
  l: 'Línea larga con una colita al final.',
  m: 'Abajo, arriba, abajo, arriba y abajo: dos panzas.',
  n: 'Abajo, arriba, y una panza que baja.',
  o: 'Un circulito completo sin levantar el dedo.',
  p: 'Una panza, y una línea que baja más abajo.',
  q: 'Una panza, y línea a la derecha que baja más abajo.',
  r: 'Línea cortita, y una panzita que sale a la derecha.',
  s: 'Una culebrita pequeña.',
  t: 'Línea con colita, y rayita cruzada arriba.',
  u: 'Bajamos, hacemos la panza abajo, y subimos.',
  v: 'Bajamos en diagonal, y subimos en diagonal.',
  w: 'Dos vees juntas: abajo, arriba, abajo, arriba.',
  x: 'Dos diagonales que se cruzan.',
  y: 'Una diagonal que baja, y otra que baja con cola.',
  z: 'Rayita arriba, diagonal, y rayita abajo.',
  'ñ': 'Como la n, pero con una onditita arriba.',
  'á': 'Como la a, pero con una rayita inclinada arriba.',
  'é': 'Como la e, pero con una rayita inclinada arriba.',
  'í': 'Como la i, pero con una rayita inclinada arriba.',
  'ó': 'Como la o, pero con una rayita inclinada arriba.',
  'ú': 'Como la u, pero con una rayita inclinada arriba.',
};

export function getStrokesForChar(ch: string): Stroke[] {
  const c = (ch || '').trim();
  if (T[c]) return T[c]; // mayúsculas y números
  if (TL[c]) return TL[c]; // minúsculas
  if (T[c.toUpperCase()]) return T[c.toUpperCase()];
  // Fallback genérico: diagonal simple
  return [[[0.25, 0.2], [0.5, 0.5], [0.75, 0.8]]];
}

export function splitPalabra(palabra: string): string[] {
  return palabra.split('').filter((c) => c.trim().length > 0);
}

export function instruccionPara(ch: string): string {
  const c = (ch || '').trim();
  if (INSTRUCCIONES_TRAZO[c]) return INSTRUCCIONES_TRAZO[c];
  if (INSTRUCCIONES_TRAZO[c.toUpperCase()]) return INSTRUCCIONES_TRAZO[c.toUpperCase()];
  return `Sigue los puntitos para trazar la letra ${c.toUpperCase()}, despacio y sin salirte.`;
}

/** Interpola puntos densos a lo largo de strokes para guía punteada fluida */
export function densify(strokes: Stroke[], perSegment = 14): Punto[] {
  const out: Punto[] = [];
  for (const st of strokes) {
    for (let i = 0; i < st.length - 1; i++) {
      const [x1, y1] = st[i];
      const [x2, y2] = st[i + 1];
      for (let k = 0; k < perSegment; k++) {
        const t = k / perSegment;
        out.push([x1 + (x2 - x1) * t, y1 + (y2 - y1) * t]);
      }
    }
    const last = st[st.length - 1];
    out.push([last[0], last[1]]);
  }
  return out;
}
