/* Motor de evaluación de trazo (DTW - Dynamic Time Warping).
 * Mucho más exacto que "cobertura de puntos": compara la trayectoria del
 * niño contra la ruta ideal en espacio-tempo, midiendo:
 *  - cobertura:  % de la ruta ideal que tocó
 *  - orden:      si trazó los segmentos en el orden correcto
 *  - dirección:  si el movimiento siguió la dirección de la guía (no al revés)
 *  - suavidad:   penaliza temblor/garabato
 */

export type Pt = [number, number];

export interface ResultadoTrazo {
  global: number; // 0-100
  cobertura: number;
  orden: number;
  direccion: number;
  suavidad: number;
  calificacion: 'logrado' | 'bien' | 'practica';
  hitos: boolean[];
  progreso: number; // 0-1 recorrido en secuencia
}

const N = 64;

const dist = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]);

/** Re-muestrea un trazo a n puntos equidistantes por arcos */
export function resample(pts: Pt[], n = N): Pt[] {
  if (pts.length === 0) return [];
  if (pts.length === 1) return [pts[0]];
  const lens = [0];
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    total += dist(pts[i - 1], pts[i]);
    lens.push(total);
  }
  if (total < 0.5) return [pts[0], pts[pts.length - 1]];
  const out: Pt[] = [];
  let j = 0;
  for (let k = 0; k < n; k++) {
    const objetivo = (total * k) / (n - 1);
    while (j < lens.length - 2 && lens[j + 1] < objetivo) j++;
    const seg = lens[j + 1] - lens[j];
    const t = seg > 1e-6 ? (objetivo - lens[j]) / seg : 0;
    out.push([
      pts[j][0] + (pts[j + 1][0] - pts[j][0]) * t,
      pts[j][1] + (pts[j + 1][1] - pts[j][1]) * t,
    ]);
  }
  return out;
}

/** DTW clásico (sin banda: 64×64 = trivial). Devuelve costo medio + alineación */
export function dtw(a: Pt[], b: Pt[]): { cost: number; align: [number, number][] } {
  const n = a.length;
  const m = b.length;
  const INF = 1e12;
  const C: number[][] = Array.from({ length: n }, () => new Array<number>(m).fill(INF));
  C[0][0] = dist(a[0], b[0]);
  for (let i = 1; i < n; i++) C[i][0] = C[i - 1][0] + dist(a[i], b[0]);
  for (let j = 1; j < m; j++) C[0][j] = C[0][j - 1] + dist(a[0], b[j]);
  for (let i = 1; i < n; i++) {
    for (let j = 1; j < m; j++) {
      C[i][j] = dist(a[i], b[j]) + Math.min(C[i - 1][j], C[i][j - 1], C[i - 1][j - 1]);
    }
  }
  // backtrace
  const align: [number, number][] = [];
  let i = n - 1;
  let j = m - 1;
  align.push([i, j]);
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      if (C[i - 1][j - 1] <= C[i - 1][j] && C[i - 1][j - 1] <= C[i][j - 1]) { i--; j--; }
      else if (C[i - 1][j] <= C[i][j - 1]) i--;
      else j--;
    } else if (i > 0) i--;
    else j--;
    align.push([i, j]);
  }
  align.reverse();
  return { cost: C[n - 1][m - 1] / align.length, align };
}

/** % de puntos del objetivo cubiertos por el trazo del niño */
export function coberturaTrazo(child: Pt[], target: Pt[], tol: number): number {
  if (child.length === 0 || target.length === 0) return 0;
  let hit = 0;
  for (const tp of target) {
    if (child.some((cp) => dist(cp, tp) <= tol)) hit++;
  }
  return hit / target.length;
}

/** Coherencia direccional (0..1) a lo largo de la alineación DTW */
function direccionAlineada(a: Pt[], b: Pt[], align: [number, number][]): number {
  let sum = 0;
  let cnt = 0;
  for (let k = 1; k < align.length; k++) {
    const [i0, j0] = align[k - 1];
    const [i1, j1] = align[k];
    const vax = a[i1][0] - a[i0][0];
    const vay = a[i1][1] - a[i0][1];
    const vbx = b[j1][0] - b[j0][0];
    const vby = b[j1][1] - b[j0][1];
    const la = Math.hypot(vax, vay);
    const lb = Math.hypot(vbx, vby);
    if (la < 0.3 || lb < 0.3) continue;
    sum += (vax * vbx + vay * vby) / (la * lb);
    cnt++;
  }
  if (cnt === 0) return 0;
  return Math.max(0, (sum / cnt + 1) / 2);
}

/** 1 = fluido, 0 = tembloroso (ángulo medio de giro) */
function suavidadTrazo(pts: Pt[]): number {
  if (pts.length < 4) return 0.8;
  let sum = 0;
  for (let i = 2; i < pts.length; i++) {
    const ax = pts[i - 1][0] - pts[i - 2][0];
    const ay = pts[i - 1][1] - pts[i - 2][1];
    const bx = pts[i][0] - pts[i - 1][0];
    const by = pts[i][1] - pts[i - 1][1];
    const la = Math.hypot(ax, ay);
    const lb = Math.hypot(bx, by);
    if (la < 0.4 || lb < 0.4) continue;
    const c = Math.max(-1, Math.min(1, (ax * bx + ay * by) / (la * lb)));
    sum += Math.acos(c);
  }
  const avg = sum / (pts.length - 2);
  return Math.max(0, 1 - avg / (Math.PI * 0.7));
}

/** Une todos los trazos del niño en una sola ruta (tolerante a levantadas de dedo) */
export function concatenar(strokes: Pt[][]): Pt[] {
  return strokes.reduce<Pt[]>((acc, s) => acc.concat(s), []);
}

/**
 * Evalúa el conjunto de trazos del niño contra los trazos objetivo.
 * MODO DUPL (multitrazo): compara en paralelo
 *   1) CONTINUO — toda la ruta del niño (sin importar cuántas veces
 *      levantó el dedo) contra la ruta ideal completa. Tolerante:
 *      sirve para dibujar la letra de una sola vez o en 4 partes.
 *   2) PORTRAZO — asigna cada trazo del niño al segmento objetivo
 *      correcto (preciso con el orden caligráfico).
 * La puntuación final toma el MEJOR desempeño de ambos modos.
 */
export function evaluarTrazo(
  childStrokes: Pt[][],
  targetStrokes: Pt[][],
  size: number,
  hitos?: boolean[]
): ResultadoTrazo {
  const tol = size * 0.08;
  const maxErr = size * 0.14;

  const targets = targetStrokes.map((t) => resample(t, N));
  const flat = concatenar(childStrokes);
  // >= 2: acepta "tocs" (puntos de i y j) además de trazos largos
  const children = childStrokes.filter((s) => s.length >= 2).map((s) => resample(s, N));

  // ————— MODO 1: CONTINUO (cualquier cantidad de trazos) —————
  const targetConcat = resample(concatenar(targets), N);
  let accC = 0;
  let dirC = 0;
  const cobC = flat.length > 0 ? coberturaTrazo(flat, targetConcat, tol) : 0;
  if (flat.length >= 2) {
    const childRes = resample(flat, N);
    const { cost, align } = dtw(childRes, targetConcat);
    accC = Math.max(0, 1 - cost / maxErr);
    dirC = direccionAlineada(childRes, targetConcat, align);
  }

  // ————— MODO 2: PORTRAZO (orden caligráfico) —————
  let cobT = 0;
  let accT = 0;
  let dirT = 0;
  let ordenT = 0;
  if (children.length > 0 && targets.length > 0) {
    const costo: number[][] = children.map((c) =>
      targets.map((t) => (c.length < 2 || t.length < 2 ? 1e9 : dtw(c, t).cost))
    );
    const asignadoA: (number | null)[] = new Array(targets.length).fill(null); // target -> child
    const usados = new Set<number>();
    // pasada 1: en orden (prefiere trazo del niño "posterior")
    let minChildIdx = -1;
    for (let t = 0; t < targets.length; t++) {
      let best = -1;
      let bestCost = Infinity;
      for (let ci = 0; ci < children.length; ci++) {
        if (usados.has(ci) || ci <= minChildIdx) continue;
        if (costo[ci][t] < bestCost) { bestCost = costo[ci][t]; best = ci; }
      }
      if (best >= 0 && bestCost < maxErr * 2.2) {
        asignadoA[t] = best;
        usados.add(best);
        minChildIdx = best;
      }
    }
    // pasada 2: sin restricción de orden (penaliza orden después)
    for (let t = 0; t < targets.length; t++) {
      if (asignadoA[t] !== null) continue;
      let best = -1;
      let bestCost = Infinity;
      for (let ci = 0; ci < children.length; ci++) {
        if (usados.has(ci)) continue;
        if (costo[ci][t] < bestCost) { bestCost = costo[ci][t]; best = ci; }
      }
      if (best >= 0 && bestCost < maxErr * 2.6) {
        asignadoA[t] = best;
        usados.add(best);
      }
    }

    let cobSum = 0;
    let accSum = 0;
    let dirSum = 0;
    let asignados = 0;
    for (let t = 0; t < targets.length; t++) {
      const cIdx = asignadoA[t];
      const childPts = cIdx !== null ? children[cIdx] : flat;
      const cob = coberturaTrazo(childPts, targets[t], tol);
      cobSum += cob;
      if (cIdx !== null) {
        asignados++;
        const { cost, align } = dtw(children[cIdx], targets[t]);
        accSum += Math.max(0, 1 - cost / maxErr);
        dirSum += direccionAlineada(children[cIdx], targets[t], align);
      }
    }
    const nt = targets.length || 1;
    cobT = cobSum / nt;
    accT = accSum / nt;
    dirT = dirSum / nt;

    // orden: inversiones en la asignación
    let inv = 0;
    const pairs: [number, number][] = [];
    for (let t = 0; t < asignadoA.length; t++) if (asignadoA[t] !== null) pairs.push([t, asignadoA[t]!]);
    for (let a = 0; a < pairs.length; a++) {
      for (let b = a + 1; b < pairs.length; b++) {
        if (pairs[a][0] < pairs[b][0] && pairs[a][1] > pairs[b][1]) inv++;
      }
    }
    const maxInv = (pairs.length * (pairs.length - 1)) / 2;
    const factorOrden = asignados / nt;
    ordenT = factorOrden * (maxInv === 0 ? 1 : 1 - inv / maxInv);
  }

  // ————— MEJOR DE AMBOS MODOS —————
  const cobertura = Math.max(cobC, cobT);
  const acc = Math.max(accC, accT);
  const direccion = Math.max(dirC, dirT);
  // Si el niño usó menos trazos que la letra pide, dibujó de corrido:
  // el orden queda cubierto por la dirección (dirC).
  const orden =
    childStrokes.length >= targets.length ? Math.max(ordenT, dirC * 0.5 + cobC * 0.5) : 1;

  const suavidad =
    children.length === 0
      ? 0
      : children.reduce((s, c) => s + suavidadTrazo(c), 0) / children.length;

  const global = Math.round(
    100 * (0.35 * cobertura + 0.3 * acc + 0.15 * orden + 0.15 * direccion + 0.05 * suavidad)
  );

  // progreso secuencial por hitos
  let progreso = 0;
  if (hitos && hitos.length > 0) {
    let k = 0;
    while (k < hitos.length && hitos[k]) k++;
    progreso = k / hitos.length;
  }

  const calificacion: ResultadoTrazo['calificacion'] =
    global >= 75 ? 'logrado' : global >= 55 ? 'bien' : 'practica';

  return {
    global,
    cobertura: Math.round(cobertura * 100),
    orden: Math.round(orden * 100),
    direccion: Math.round(direccion * 100),
    suavidad: Math.round(suavidad * 100),
    calificacion,
    hitos: hitos ?? [],
    progreso,
  };
}

/**
 * Condición de "terminó de trazar" tras soltar el dedo.
 * Multitrazo: NO importa cuántas veces levante el dedo. Se completa
 * cuando la FORMA completa está sustancialmente cubierta (72%), o
 * cuando todos los segmentos objetivo están cubiertos, o cuando está
 * "atascado" (muchos garabatos con cobertura decente → evaluar de todas).
 */
export function trazoCompleto(childStrokes: Pt[][], targetStrokes: Pt[][], size: number): boolean {
  if (childStrokes.length === 0) return false;
  const tol = size * 0.08;
  const half = Math.max(16, Math.floor(N / 2));
  const flat = concatenar(childStrokes);
  const targets = targetStrokes.map((t) => resample(t, half));
  // Cobertura de la forma completa (todos los segmentos juntos)
  const cobConcat = coberturaTrazo(flat, resample(concatenar(targets), half), tol);
  // 0.9: evita completar la A sin el travesaño (el zigzag solo cubre ~0.83)
  if (cobConcat >= 0.9) return true;
  // Todos los segmentos individuales cubiertos
  const cobs = targets.map((t) => coberturaTrazo(flat, t, tol));
  const cubiertos = cobs.filter((c) => c >= 0.55).length;
  if (cubiertos >= targets.length) return true;
  // Atascado: demasiados trazos y cobertura decente → evaluar igualmente
  if (childStrokes.length >= targets.length + 4 && cobConcat >= 0.5) return true;
  return false;
}
