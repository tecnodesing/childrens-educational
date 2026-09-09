import type { ActividadDef, Ejercicio, EjercicioLectura, EjercicioMates, InsigniaDef, Materia, PersonajeDef } from './types';
import { soportaReconocimiento } from './td-listen';

export const PERSONAJES: PersonajeDef[] = [
  { id: 'dragon-azul', nombre: 'Drax el Dragón', emoji: '🐲', gradiente: 'from-sky-400 to-blue-600', descripcion: 'Valiente y curioso' },
  { id: 'zorro-naranja', nombre: 'Zoe la Zorra', emoji: '🦊', gradiente: 'from-orange-400 to-amber-600', descripcion: 'Lista y veloz' },
  { id: 'unicornio-rosa', nombre: 'Nube', emoji: '🦄', gradiente: 'from-pink-400 to-fuchsia-600', descripcion: 'Mágica y soñadora' },
  { id: 'robot-verde', nombre: 'Bolt', emoji: '🤖', gradiente: 'from-emerald-400 to-teal-600', descripcion: 'Lógico y divertido' },
  { id: 'gato-moradito', nombre: 'Mishi', emoji: '🐱', gradiente: 'from-violet-400 to-purple-600', descripcion: 'Tierno y juguetón' },
  { id: 'leon-amarillo', nombre: 'Leo', emoji: '🦁', gradiente: 'from-yellow-400 to-orange-500', descripcion: 'Fuerte y amable' },
  { id: 'rana-verde', nombre: 'Rin', emoji: '🐸', gradiente: 'from-lime-400 to-green-600', descripcion: 'Alegre y saltarina' },
  { id: 'pinguino-celeste', nombre: 'Pipo', emoji: '🐧', gradiente: 'from-cyan-400 to-sky-600', descripcion: 'Dulce y friolento' },
];

export const INSIGNIAS: InsigniaDef[] = [
  { id: 'maestro-vocales', nombre: 'Maestro de Vocales', emoji: '🔤', descripcion: 'Dominaste las 5 vocales', condicion: 'Completa lectura semana 1-2' },
  { id: 'cazador-silabas', nombre: 'Cazador de Sílabas', emoji: '🧩', descripcion: 'Unes sílabas como un experto', condicion: 'Completa lectura semana 7-8' },
  { id: 'lector-estrella', nombre: 'Lector Estrella', emoji: '📚', descripcion: 'Lees palabras y frases', condicion: 'Completa lectura semana 13+' },
  { id: 'artista-trazo', nombre: 'Artista del Trazo', emoji: '✏️', descripcion: 'Trazos firmes y bonitos', condicion: 'Completa 4 escrituras' },
  { id: 'contador-brillante', nombre: 'Contador Brillante', emoji: '🔢', descripcion: 'Cuentas hasta 10 sin parar', condicion: 'Completa suma semana 1-2' },
  { id: 'genio-sumas', nombre: 'Genio de las Sumas', emoji: '➕', descripcion: 'Sumas hasta 10', condicion: 'Completa suma semana 10' },
  { id: 'heroe-restas', nombre: 'Héroe de las Restas', emoji: '➖', descripcion: 'Quitas como un ninja', condicion: 'Completa resta semana 10' },
  { id: 'explorador', nombre: 'Explorador', emoji: '🗺️', descripcion: 'Llegaste al bloque 2', condicion: 'Avanza a semana 7' },
  { id: 'aventurero', nombre: 'Aventurero Total', emoji: '🏆', descripcion: 'Llegaste al bloque 4', condicion: 'Avanza a semana 19' },
  { id: 'super-estrella', nombre: 'Súper Estrella', emoji: '⭐', descripcion: 'Ganaste 50 estrellas', condicion: '50 estrellas' },
];

export const BLOQUES = [
  { num: 1, nombre: 'Bosque Vocal', emoji: '🌳', color: 'from-green-400 to-emerald-600', semanas: [1, 2, 3, 4, 5, 6], descripcion: 'Vocales, trazos y conteo' },
  { num: 2, nombre: 'Río de Sílabas', emoji: '🌊', color: 'from-sky-400 to-blue-600', semanas: [7, 8, 9, 10, 11, 12], descripcion: 'Sílabas, sumas y restas hasta 10' },
  { num: 3, nombre: 'Montaña de Palabras', emoji: '⛰️', color: 'from-amber-400 to-orange-600', semanas: [13, 14, 15, 16, 17, 18], descripcion: 'Palabras, frases y cálculo hasta 15' },
  { num: 4, nombre: 'Castillo Lector', emoji: '🏰', color: 'from-violet-400 to-purple-600', semanas: [19, 20, 21, 22, 23, 24], descripcion: 'Textos y cálculo hasta 20' },
];

export const PRAISE = [
  '¡Increíble! 🎉', '¡Muy bien! ⭐', '¡Genial! 🌟', '¡Lo lograste! 🎊',
  '¡Eres un campeón! 🏆', '¡Fantástico! ✨', '¡Súper! 🚀', '¡Bravo! 👏',
];

export const TRY_AGAIN = [
  'Casi, casi. ¡Tú puedes! 💪',
  'Mmm, intenta otra vez. 🧐',
  'No pasa nada. Respira e inténtalo de nuevo. 🌈',
  '¡Buen intento! Mira con atención. 👀',
];

export const TD_TIPS_DESCANSO = [
  'Llevas un rato aprendiendo. ¿Descansamos los ojitos 1 minuto? 👀✨',
  '¡Buen trabajo! Estira tus brazos como un gato. 🐱',
  'Tomemos agua y seguimos. ¡Lo estás haciendo genial! 💧',
];

// ---------- Datos de lectura ----------
const VOCALES = ['A', 'E', 'I', 'O', 'U'];
const SONIDO_VOCAL: Record<string, string> = { A: 'aaaa', E: 'eeee', I: 'iiii', O: 'oooo', U: 'uuuu' };

const SILABAS_POR_SEMANA: Record<number, string[]> = {
  7: ['MA', 'ME', 'MI', 'MO', 'MU'],
  8: ['PA', 'PE', 'PI', 'PO', 'PU'],
  9: ['SA', 'SE', 'SI', 'SO', 'SU'],
  10: ['LA', 'LE', 'LI', 'LO', 'LU'],
  11: ['TA', 'TE', 'TI', 'TO', 'TU'],
  12: ['DA', 'DE', 'DI', 'DO', 'DU'],
};

const PALABRAS: { palabra: string; emoji: string; silabas: string[] }[] = [
  { palabra: 'MAMÁ', emoji: '👩‍👧', silabas: ['MA', 'MÁ'] },
  { palabra: 'PATO', emoji: '🦆', silabas: ['PA', 'TO'] },
  { palabra: 'OSO', emoji: '🐻', silabas: ['O', 'SO'] },
  { palabra: 'MESA', emoji: '🍽️', silabas: ['ME', 'SA'] },
  { palabra: 'SOPA', emoji: '🍲', silabas: ['SO', 'PA'] },
  { palabra: 'LUNA', emoji: '🌙', silabas: ['LU', 'NA'] },
  { palabra: 'TACO', emoji: '🌮', silabas: ['TA', 'CO'] },
  { palabra: 'DADO', emoji: '🎲', silabas: ['DA', 'DO'] },
  { palabra: 'CASA', emoji: '🏠', silabas: ['CA', 'SA'] },
  { palabra: 'GATO', emoji: '🐱', silabas: ['GA', 'TO'] },
  { palabra: 'PELOTA', emoji: '⚽', silabas: ['PE', 'LO', 'TA'] },
  { palabra: 'SAPO', emoji: '🐸', silabas: ['SA', 'PO'] },
  { palabra: 'LORO', emoji: '🦜', silabas: ['LO', 'RO'] },
  { palabra: 'DEDAL', emoji: '🧵', silabas: ['DE', 'DAL'] },
  { palabra: 'TOMATE', emoji: '🍅', silabas: ['TO', 'MA', 'TE'] },
  { palabra: 'MALETA', emoji: '🧳', silabas: ['MA', 'LE', 'TA'] },
];

const FRASES: { frase: string; emoji: string; faltante: string; opciones: string[] }[] = [
  { frase: 'Mi mamá me ama', emoji: '💖', faltante: 'mamá', opciones: ['mamá', 'pato', 'luna'] },
  { frase: 'El pato nada', emoji: '🦆', faltante: 'pato', opciones: ['pato', 'oso', 'gato'] },
  { frase: 'El oso come miel', emoji: '🍯', faltante: 'oso', opciones: ['oso', 'sapo', 'loro'] },
  { frase: 'La luna sale de noche', emoji: '🌙', faltante: 'luna', opciones: ['luna', 'mesa', 'sopa'] },
  { frase: 'El gato toma leche', emoji: '🥛', faltante: 'gato', opciones: ['gato', 'dado', 'taco'] },
  { frase: 'La pelota bota alto', emoji: '⚽', faltante: 'pelota', opciones: ['pelota', 'casa', 'sopa'] },
];

const TEXTOS: { titulo: string; emoji: string; oraciones: string[]; pregunta: string; opciones: string[]; respuesta: string }[] = [
  { titulo: 'El pato Paco', emoji: '🦆', oraciones: ['Paco es un pato.', 'Paco nada en el lago.', 'Paco come pan.'], pregunta: '¿Dónde nada Paco?', opciones: ['En el lago', 'En la casa', 'En la luna'], respuesta: 'En el lago' },
  { titulo: 'La osa Lola', emoji: '🐻', oraciones: ['Lola es una osa.', 'Lola come miel.', 'Lola duerme en su cueva.'], pregunta: '¿Qué come Lola?', opciones: ['Miel', 'Tacos', 'Sopa'], respuesta: 'Miel' },
  { titulo: 'El gato Tito', emoji: '🐱', oraciones: ['Tito es un gato.', 'Tito toma leche.', 'Tito juega con Lulú.'], pregunta: '¿Qué toma Tito?', opciones: ['Leche', 'Agua de mar', 'Jugo de caja'], respuesta: 'Leche' },
  { titulo: 'La luna', emoji: '🌙', oraciones: ['La luna sale de noche.', 'La luna es redonda.', 'Me gusta ver la luna.'], pregunta: '¿Cuándo sale la luna?', opciones: ['De noche', 'De día', 'Nunca'], respuesta: 'De noche' },
  { titulo: 'Mi casa', emoji: '🏠', oraciones: ['Mi casa es bonita.', 'Tiene una puerta roja.', 'Juego en el patio.'], pregunta: '¿De qué color es la puerta?', opciones: ['Roja', 'Azul', 'Verde'], respuesta: 'Roja' },
  { titulo: 'El sapo Pepe', emoji: '🐸', oraciones: ['Pepe es un sapo verde.', 'Pepe salta alto.', 'Pepe canta en el charco.'], pregunta: '¿Qué hace Pepe en el charco?', opciones: ['Canta', 'Duerme', 'Cocina'], respuesta: 'Canta' },
];

// ---------- Escritura ----------
// 5 ítems de trazo por semana (uno por sesión)
const TRAZOS_SEMANA: Record<number, string[]> = {
  1: ['A', 'E', 'I', 'O', 'U'],
  2: ['A', 'E', 'I', 'O', 'U'],
  3: ['U', 'O', 'A', '1', '2'],
  4: ['2', '3', '4', '5', '1'],
  5: ['1', '2', '3', '4', '5'],
  6: ['A', 'E', 'I', 'O', 'U'],
  7: ['M', 'S', '6', 'P', 'L'],
  8: ['P', '7', 'D', 'T', 'M'],
  9: ['S', '8', 'L', 'D', 'P'],
  10: ['L', '9', 'T', 'S', 'M'],
  11: ['T', '10', 'D', 'L', 'P'],
  12: ['D', 'M', 'P', 'T', 'S'],
  13: ['MA', 'PA', 'SO', 'LU', 'TA'],
  14: ['OSO', 'PATO', 'SAPO', 'LORO', 'DEDAL'],
  15: ['MAMÁ', 'LUNA', 'SOPA', 'MALETA', 'PELOTA'],
  16: ['CASA', 'GATO', 'TACO', 'PELOTA', 'DADO'],
  17: ['SOPA', 'MESA', 'LUNA', 'DEDAL', 'TACO'],
  18: ['TACO', 'DADO', 'SAPO', 'CASA', 'PATO'],
  19: ['PATO', 'LUNA', 'SAPO', 'OSO', 'MESA'],
  20: ['MAMÁ', 'CASA', 'LORO', 'PELOTA', 'DEDAL'],
  21: ['GATO', 'SOPA', 'TACO', 'LORO', 'MALETA'],
  22: ['MESA', 'PELOTA', 'MALETA', 'CASA', 'LUNA'],
  23: ['TOMATE', 'MALETA', 'PELOTA', 'SOPA', 'GATO'],
  24: ['CASA', 'OSO', 'MAMÁ', 'PATO', 'LUNA'],
};

type TrazoItem = { caracter: string; tipo: 'vocal' | 'consonante' | 'numero' | 'silaba' | 'palabra'; nombre: string };
function tItem(c: string): TrazoItem {
  const d = c.toUpperCase();
  if (/^\d+$/.test(d)) return { caracter: c, tipo: 'numero', nombre: `el número ${c}` };
  if (/^[AEIOUÁÉÍÓÚ]$/.test(d)) return { caracter: c, tipo: 'vocal', nombre: `la vocal ${c}` };
  if (/^[A-ZÑ]$/.test(d)) return { caracter: c, tipo: 'consonante', nombre: `la letra ${c}` };
  if (d.length <= 2) return { caracter: c, tipo: 'silaba', nombre: `la sílaba ${d}` };
  return { caracter: c, tipo: 'palabra', nombre: `la palabra ${d}` };
}

// ---------- Mates ----------
const FRUTAS = ['🍎', '🍊', '🍌', '🍓', '🫐', '🍇', '🥭', '🍐'];

// Nombre en español para la VOZ (el TTS lee los emojis como "manzana roja")
const FRUTA_NOMBRE: Record<string, { sing: string; plur: string }> = {
  '🍎': { sing: 'manzana', plur: 'manzanas' },
  '🍊': { sing: 'naranja', plur: 'naranjas' },
  '🍌': { sing: 'plátano', plur: 'plátanos' },
  '🍓': { sing: 'fresa', plur: 'fresas' },
  '🫛': { sing: 'arándano', plur: 'arándanos' },
  '🍇': { sing: 'racimo de uvas', plur: 'racimos de uvas' },
  '🥭': { sing: 'mango', plur: 'mangos' },
  '🍐': { sing: 'pera', plur: 'peras' },
};

/** "2 (emoji) N" con plural correcto para la voz de TD */
export function objetosVoz(emoji: string, n: number): string {
  const f = FRUTA_NOMBRE[emoji] ?? { sing: 'cosa', plur: 'cosas' };
  return `${n} ${n === 1 ? f.sing : f.plur}`;
}

function mulberry(seed: number) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function pickOpciones(respuesta: number, min: number, max: number, rand: () => number): number[] {
  const set = new Set<number>([respuesta]);
  let guard = 0;
  while (set.size < 3 && guard++ < 50) {
    const delta = Math.floor(rand() * 3) + 1;
    const cand = respuesta + (rand() > 0.5 ? delta : -delta);
    if (cand >= min && cand <= max && cand !== respuesta) set.add(cand);
  }
  // relleno
  let f = min;
  while (set.size < 3) { if (f !== respuesta) set.add(f); f++; if (f > max + 5) break; }
  return [...set].sort(() => rand() - 0.5);
}

function problemasSuma(semana: number, vt: number): { a: number; b: number }[] {
  const rand = mulberry(semana * 101 + vt * 13 + 7);
  let maxTotal = 5;
  if (semana >= 19) maxTotal = 20;
  else if (semana >= 13) maxTotal = 15;
  else if (semana >= 7) maxTotal = 10;
  else if (semana >= 4) maxTotal = 7;
  const out: { a: number; b: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const a = 1 + Math.floor(rand() * Math.min(9, maxTotal - 1));
    const b = 1 + Math.floor(rand() * Math.min(9, maxTotal - a));
    out.push({ a, b });
  }
  return out;
}

function problemasResta(semana: number, vt: number): { a: number; b: number }[] {
  const rand = mulberry(semana * 77 + vt * 11 + 13);
  let maxTotal = 5;
  if (semana >= 19) maxTotal = 20;
  else if (semana >= 13) maxTotal = 15;
  else if (semana >= 7) maxTotal = 10;
  const out: { a: number; b: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const a = 2 + Math.floor(rand() * (maxTotal - 1));
    const b = 1 + Math.floor(rand() * Math.min(a, 9));
    out.push({ a, b });
  }
  return out;
}

// ---------- Constructores de actividades ----------
function bloqueDe(semana: number): number {
  return Math.min(4, Math.floor((semana - 1) / 6) + 1);
}

function escalonLectura(semana: number): number {
  if (semana <= 6) return 1;
  if (semana <= 12) return 2;
  if (semana <= 14) return 3;
  if (semana <= 16) return 4;
  if (semana <= 18) return 5;
  return 6;
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const SESIONES_POR_SEMANA = 5; // 4 materias × 5 sesiones = 20 actividades/semana (~1 h/día)

export function getActividad(materia: Materia, semana: number, variante = 1): ActividadDef {
  const s = Math.min(24, Math.max(1, semana));
  const vt = Math.min(5, Math.max(1, variante));
  if (materia === 'lectura') return lecturaActividad(s, vt);
  if (materia === 'escritura') return escrituraActividad(s, vt);
  if (materia === 'suma') return sumaActividad(s, vt);
  return restaActividad(s, vt);
}

// ----- LECTURA -----
function lecturaActividad(s: number, vt: number): ActividadDef {
  const esc = escalonLectura(s);
  const bloque = bloqueDe(s);
  // La variante cambia el foco/distribución: 5 sesiones distintas por semana
  const rand = mulberry(s * 31 + vt * 17 + 3);
  const id = `lectura-semana-${s}-v${vt}`;

  if (esc === 1) {
    const foco = VOCALES[(s - 1 + vt - 1) % VOCALES.length];
    const otros = shuffle(VOCALES.filter((v) => v !== foco), rand).slice(0, 2);
    const guiada: Ejercicio[] = [{
      id: `${id}-g1`, categoria: 'lectura', subtipo: 'escucha-elige',
      consigna: `Toca la vocal que suena "${SONIDO_VOCAL[foco]}"`,
      pista: `Busca la letra ${foco}. Suena ${SONIDO_VOCAL[foco]}.`,
      opciones: shuffle([foco, ...otros], rand), respuesta: foco,
    } as EjercicioLectura];
    const indep: Ejercicio[] = VOCALES.map((v, i) => {
      const distract = shuffle(VOCALES.filter((x) => x !== v), rand).slice(0, 2);
      // Con reconocimiento de voz: el niño REPISTE en voz alta (más exacto pedagógicamente)
      if (soportaReconocimiento() && (i === 0 || i === 3)) {
        return {
          id: `${id}-i${i}`, categoria: 'lectura', subtipo: 'repite-voz',
          consigna: `TD dice la vocal. ¡Tú la repites!`,
          pista: `Dilo bien fuerte: ${SONIDO_VOCAL[v]}.`,
          opciones: [], respuesta: v, palabra: v, objetivoVoz: v.toLowerCase(),
        } as EjercicioLectura;
      }
      const esEscucha = i % 2 === 0;
      return {
        id: `${id}-i${i}`, categoria: 'lectura', subtipo: esEscucha ? 'escucha-elige' : 'elige-sonido',
        consigna: esEscucha ? `Escucha y toca la vocal correcta` : `¿Qué letra suena así?`,
        pista: `La ${v} suena ${SONIDO_VOCAL[v]}.`,
        opciones: shuffle([v, ...distract], rand),
        respuesta: v,
        palabra: v,
      } as EjercicioLectura;
    }).slice(0, 5);

    return {
      id, tipo: 'lectura', semana: s, bloque,
      titulo: `Las vocales: ${foco}`,
      subtitulo: 'Escucha, mira y toca la vocal',
      icono: '🔤', color: 'from-rose-400 to-pink-600', escalonLectura: 1,
      introduccion: {
        texto: `Hoy vamos a jugar con la vocal ${foco}. Las vocales son los sonidos más importantes para leer.`,
        paraQueSirve: 'Si conoces las vocales, podrás leer sílabas y palabras muy pronto.',
      },
      ejemploModelado: {
        descripcion: `La vocal ${foco} suena ${SONIDO_VOCAL[foco]}`,
        pasos: [
          { texto: `Mira esta letra: ${foco}. Es la vocal ${foco}.`, visual: foco },
          { texto: `Escucha cómo suena: ${SONIDO_VOCAL[foco]}.`, visual: '🔊' },
          { texto: `Ahora la buscamos entre otras letras. ¡Ahí está la ${foco}!`, visual: '👆' },
        ],
      },
      practicaGuiada: guiada, practicaIndependiente: indep, umbralAvance: 0.8,
    };
  }

  if (esc === 2) {
    const sils = SILABAS_POR_SEMANA[s] ?? SILABAS_POR_SEMANA[7];
    const foco = sils[vt - 1];
    const guiada: Ejercicio[] = [{
      id: `${id}-g1`, categoria: 'lectura', subtipo: 'escucha-elige',
      consigna: `TD dice una sílaba. Toca la que escuches.`,
      pista: `Escucha con atención: ${foco}. Búscala.`,
      opciones: shuffle([...sils.slice(0, 3)], rand), respuesta: foco,
    } as EjercicioLectura];
    const indep: Ejercicio[] = sils.map((sil, i) => {
      const distract = shuffle(sils.filter((x) => x !== sil), rand).slice(0, 2);
      if (soportaReconocimiento() && (i === 0 || i === 3)) {
        return {
          id: `${id}-i${i}`, categoria: 'lectura', subtipo: 'repite-voz',
          consigna: `TD dice la sílaba. ¡Tú la repites!`,
          pista: `Dilo bien fuerte: ${sil.toLowerCase()}.`,
          opciones: [], respuesta: sil, palabra: sil, objetivoVoz: sil.toLowerCase(),
        } as EjercicioLectura;
      }
      return {
        id: `${id}-i${i}`, categoria: 'lectura', subtipo: 'une-silaba',
        consigna: `¿Qué sílaba es? Escúchala y elígela.`,
        pista: `Suena ${sil.toLowerCase()}. Fíjate en la primera letra.`,
        opciones: shuffle([sil, ...distract], rand), respuesta: sil, palabra: sil,
      } as EjercicioLectura;
    });

    return {
      id, tipo: 'lectura', semana: s, bloque,
      titulo: `Sílabas con ${foco[0]}`,
      subtitulo: `Une sonidos: ${sils.join(' · ')}`,
      icono: '🧩', color: 'from-sky-400 to-blue-600', escalonLectura: 2,
      introduccion: {
        texto: `Las letras se juntan para hacer sonidos nuevos. Hoy juntamos la ${foco[0]} con las vocales.`,
        paraQueSirve: 'Con las sílabas podrás formar palabras como mamá y pato.',
      },
      ejemploModelado: {
        descripcion: `${foco[0]} + A = ${foco[0]}A`,
        pasos: [
          { texto: `Escucha: la letra ${foco[0]}… con la A…`, visual: `${foco[0]} + A` },
          { texto: `¡Se juntan y suenan ${foco}!`, visual: foco },
          { texto: `Repite conmigo: ${foco.toLowerCase()}… ¡${foco.toLowerCase()}!`, visual: '🗣️' },
        ],
      },
      practicaGuiada: guiada, practicaIndependiente: indep, umbralAvance: 0.8,
    };
  }

  if (esc === 3 || esc === 4) {
    const palabras = shuffle(PALABRAS, rand).slice(0, 6);
    const p0 = palabras[0];
    const guiada: Ejercicio[] = [{
      id: `${id}-g1`, categoria: 'lectura', subtipo: 'elige-imagen',
      consigna: `Lee la palabra y elige su dibujo.`,
      pista: `Lee despacio: ${p0.palabra}. ¿Qué dibujo es?`,
      opciones: shuffle([p0.emoji, palabras[1].emoji, palabras[2].emoji], rand),
      respuesta: p0.emoji, palabra: p0.palabra, emoji: p0.emoji,
    } as EjercicioLectura];
    const indep: Ejercicio[] = palabras.slice(0, 5).map((p, i) => {
      if (i % 2 === 0) {
        const others = palabras.filter((x) => x.emoji !== p.emoji).slice(0, 2).map((x) => x.emoji);
        return {
          id: `${id}-i${i}`, categoria: 'lectura', subtipo: 'elige-imagen',
          consigna: `¿Qué dibujo dice "${p.palabra}"?`,
          pista: `Divide en sílabas: ${p.silabas.join(' - ')}.`,
          opciones: shuffle([p.emoji, ...others], rand), respuesta: p.emoji, palabra: p.palabra, emoji: p.emoji,
        } as EjercicioLectura;
      }
      const others = palabras.filter((x) => x.palabra !== p.palabra).slice(0, 2).map((x) => x.palabra);
      return {
        id: `${id}-i${i}`, categoria: 'lectura', subtipo: 'elige-palabra',
        consigna: `Mira el dibujo. ¿Qué palabra es?`,
        pista: `Empieza con ${p.palabra[0]}.`,
        opciones: shuffle([p.palabra, ...others], rand), respuesta: p.palabra, palabra: p.palabra, emoji: p.emoji,
      } as EjercicioLectura;
    });

    return {
      id, tipo: 'lectura', semana: s, bloque,
      titulo: esc === 3 ? 'Palabras cortas' : 'Leo con dibujos',
      subtitulo: 'Junta sílabas y descubre palabras',
      icono: '📖', color: 'from-amber-400 to-orange-600', escalonLectura: esc,
      introduccion: {
        texto: `Hoy las sílabas se hacen palabras. Vamos a leer palabras cortas con dibujos.`,
        paraQueSirve: 'Leer palabras te ayuda a leer cuentos y mensajes.',
      },
      ejemploModelado: {
        descripcion: `${p0.silabas.join(' + ')} = ${p0.palabra}`,
        pasos: [
          { texto: `Mira: ${p0.silabas.join(' … ')}.`, visual: p0.silabas.join(' + ') },
          { texto: `Las juntamos rápido: ¡${p0.palabra}!`, visual: p0.palabra },
          { texto: `Y significa esto: ${p0.emoji}`, visual: p0.emoji },
        ],
      },
      practicaGuiada: guiada, practicaIndependiente: indep, umbralAvance: 0.8,
    };
  }

  if (esc === 5) {
    const frases = shuffle(FRASES, rand).slice(0, 6);
    const f0 = frases[0];
    const guiada: Ejercicio[] = [{
      id: `${id}-g1`, categoria: 'lectura', subtipo: 'elige-palabra',
      consigna: `Lee la frase y completa la palabra que falta.`,
      pista: `La frase es: "${f0.frase}". Falta "${f0.faltante}".`,
      opciones: f0.opciones, respuesta: f0.faltante, frase: f0.frase, emoji: f0.emoji,
    } as EjercicioLectura];
    const indep: Ejercicio[] = frases.slice(0, 5).map((f, i) => ({
      id: `${id}-i${i}`, categoria: 'lectura', subtipo: 'elige-palabra',
      consigna: `Completa: "${f.frase.replace(f.faltante, '___')}"`,
      pista: `Piensa qué palabra tiene sentido. ${f.emoji}`,
      opciones: shuffle([...f.opciones], rand), respuesta: f.faltante, frase: f.frase, emoji: f.emoji,
    } as EjercicioLectura));

    return {
      id, tipo: 'lectura', semana: s, bloque,
      titulo: 'Frases cortas',
      subtitulo: 'Lee y completa frases de 3 a 4 palabras',
      icono: '💬', color: 'from-emerald-400 to-teal-600', escalonLectura: 5,
      introduccion: {
        texto: `Ya lees palabras. Hoy leeremos frases cortas, como las de los cuentos.`,
        paraQueSirve: 'Leer frases te prepara para leer cuentos completos.',
      },
      ejemploModelado: {
        descripcion: f0.frase,
        pasos: [
          { texto: `Leemos despacio: ${f0.frase}.`, visual: f0.frase },
          { texto: `¿Qué palabra falta aquí? ${f0.frase.replace(f0.faltante, '___')}`, visual: '❓' },
          { texto: `¡Es "${f0.faltante}"! ${f0.emoji}`, visual: f0.emoji },
        ],
      },
      practicaGuiada: guiada, practicaIndependiente: indep, umbralAvance: 0.8,
    };
  }

  // Escalón 6: textos
  const textos = shuffle(TEXTOS, rand).slice(0, 6);
  const t0 = textos[0];
  const guiada: Ejercicio[] = [{
    id: `${id}-g1`, categoria: 'lectura', subtipo: 'comprension',
    consigna: `${t0.titulo}: ${t0.pregunta}`,
    pista: `Relee: ${t0.oraciones.join(' ')}`,
    opciones: t0.opciones, respuesta: t0.respuesta, frase: t0.oraciones.join(' '), emoji: t0.emoji,
  } as EjercicioLectura];
  const indep: Ejercicio[] = textos.slice(0, 5).map((t, i) => ({
    id: `${id}-i${i}`, categoria: 'lectura', subtipo: 'comprension',
    consigna: `${t.pregunta}`,
    pista: `Busca la respuesta en: ${t.oraciones.join(' ')}`,
    opciones: shuffle([...t.opciones], rand), respuesta: t.respuesta, frase: t.oraciones.join(' '), emoji: t.emoji,
  } as EjercicioLectura));

  return {
    id, tipo: 'lectura', semana: s, bloque,
    titulo: 'Cuentos cortos',
    subtitulo: 'Lee y responde preguntas',
    icono: '📚', color: 'from-violet-400 to-purple-600', escalonLectura: 6,
    introduccion: {
      texto: `Eres un gran lector. Hoy leeremos cuentos cortos y responderemos preguntas.`,
      paraQueSirve: 'Comprender lo que lees es el poder más grande de un lector.',
    },
    ejemploModelado: {
      descripcion: t0.titulo,
      pasos: [
        { texto: `Leemos: ${t0.oraciones.join(' ')}`, visual: t0.emoji },
        { texto: `Pregunta: ${t0.pregunta}`, visual: '❓' },
        { texto: `Respuesta: ¡${t0.respuesta}!`, visual: '✅' },
      ],
    },
    practicaGuiada: guiada, practicaIndependiente: indep, umbralAvance: 0.8,
  };
}

// ----- ESCRITURA -----
function escrituraActividad(s: number, vt: number): ActividadDef {
  const bloque = bloqueDe(s);
  const id = `escritura-semana-${s}-v${vt}`;
  const lista = (TRAZOS_SEMANA[s] ?? TRAZOS_SEMANA[1]).map(tItem);
  const principal = lista[vt - 1];
  const guiada: Ejercicio[] = [{
    id: `${id}-g1`, categoria: 'escritura' as const,
    consigna: `Repasa ${principal.nombre} con tu dedo siguiendo los puntos.`,
    pista: 'Ve despacio y sigue el orden de los números.',
    caracter: principal.caracter, tipoTrazo: principal.tipo, repeticiones: 1,
  }];
  const resto = [1, 2, 3].map((k) => lista[(vt - 1 + k) % lista.length]);
  const indep: Ejercicio[] = [
    ...resto.map((t, i) => ({
      id: `${id}-i${i}`, categoria: 'escritura' as const,
      consigna: i === 0 ? `Ahora traza ${t.nombre} tú solo.` : `Traza ${t.nombre} en el renglón.`,
      pista: 'Recuerda el camino que viste en el ejemplo.',
      caracter: t.caracter, tipoTrazo: t.tipo, repeticiones: t.tipo === 'palabra' ? 1 : 2,
    })),
    {
      id: `${id}-i3`, categoria: 'escritura' as const,
      consigna: `Reto final: traza ${principal.nombre} sin ayuda.`,
      pista: 'Tú puedes. Hazlo con calma.',
      caracter: principal.caracter, tipoTrazo: principal.tipo, repeticiones: 1,
    },
  ];

  return {
    id, tipo: 'escritura', semana: s, bloque,
    titulo: `Trazo: ${principal.caracter}`,
    subtitulo: `Aprende a escribir ${principal.nombre}`,
    icono: '✏️', color: 'from-lime-400 to-green-600',
    introduccion: {
      texto: `Vamos a aprender a escribir ${principal.nombre}. Escribir te ayuda a recordar las letras.`,
      paraQueSirve: 'Cuando sabes escribir, puedes hacer cartas, cuentos y tu nombre.',
    },
    ejemploModelado: {
      descripcion: `Trazo de ${principal.caracter}`,
      pasos: [
        { texto: `Mira ${principal.nombre}. Fíjate por dónde empieza.`, visual: principal.caracter },
        { texto: `El lápiz mágico la dibuja despacio. Sigue su camino con tus ojos.`, visual: '🪄' },
        { texto: `Ahora te toca a ti, repasando los puntitos.`, visual: '👆' },
      ],
    },
    practicaGuiada: guiada, practicaIndependiente: indep as Ejercicio[], umbralAvance: 0.6,
  };
}

// ----- SUMA -----
function sumaActividad(s: number, vt: number): ActividadDef {
  const bloque = bloqueDe(s);
  const id = `suma-semana-${s}-v${vt}`;
  const probs = problemasSuma(s, vt);
  const rand = mulberry(s * 51 + vt * 11 + 11);
  const fruta = FRUTAS[(s + vt) % FRUTAS.length];
  const ej = probs[0];

  const toEj = (p: { a: number; b: number }, i: number, guiada: boolean): EjercicioMates => ({
    id: `${id}-${guiada ? 'g' : 'i'}${i}`, categoria: 'suma',
    consigna: `¿Cuánto es ${p.a} + ${p.b}?`,
    pista: `Junta ${objetosVoz(fruta, p.a)} y ${objetosVoz(fruta, p.b)}. ¡Cuéntalas todas!`,
    a: p.a, b: p.b,
    opciones: pickOpciones(p.a + p.b, 2, 20, rand),
    respuesta: p.a + p.b, emoji: fruta, conAyudaVisual: guiada,
  });

  return {
    id, tipo: 'suma', semana: s, bloque,
    titulo: s <= 6 ? 'Juntar y contar' : s <= 12 ? `Sumas hasta 10` : s <= 18 ? 'Sumas hasta 15' : 'Sumas hasta 20',
    subtitulo: 'Sumar es juntar cosas',
    icono: '➕', color: 'from-orange-400 to-red-500',
    introduccion: {
      texto: `Hoy vamos a sumar. Sumar es juntar cosas para saber cuántas hay en total.`,
      paraQueSirve: 'Sumar sirve para contar juguetes, frutas y puntos de juegos.',
    },
    ejemploModelado: {
      descripcion: `${ej.a} ${fruta} + ${ej.b} ${fruta}`,
      pasos: [
        { texto: `Mira: aquí hay ${objetosVoz(fruta, ej.a)}.`, visual: `${ej.a}` },
        { texto: `Y aquí llegan ${objetosVoz(fruta, ej.b)} más. ¡Los juntamos!`, visual: `${ej.b}` },
        { texto: `Las contamos todas: ${Array.from({ length: ej.a + ej.b }, (_, i) => i + 1).join(', ')}.`, visual: '🔢' },
        { texto: `¡${ej.a} más ${ej.b} es ${ej.a + ej.b}!`, visual: `${ej.a + ej.b}` },
      ],
    },
    practicaGuiada: [toEj(probs[1], 1, true)],
    practicaIndependiente: [probs[2], probs[3], probs[4], probs[5]].map((p, i) => toEj(p, i, false)),
    umbralAvance: 0.8,
  };
}

// ----- RESTA -----
function restaActividad(s: number, vt: number): ActividadDef {
  const bloque = bloqueDe(s);
  const id = `resta-semana-${s}-v${vt}`;
  const probs = problemasResta(s, vt);
  const rand = mulberry(s * 91 + vt * 7 + 5);
  const fruta = FRUTAS[(s + vt + 3) % FRUTAS.length];
  const ej = probs[0];

  const toEj = (p: { a: number; b: number }, i: number, guiada: boolean): EjercicioMates => ({
    id: `${id}-${guiada ? 'g' : 'i'}${i}`, categoria: 'resta',
    consigna: `¿Cuánto es ${p.a} − ${p.b}?`,
    pista: `Tienes ${objetosVoz(fruta, p.a)}. Quitas ${objetosVoz(fruta, p.b)}. ¿Cuántas quedan?`,
    a: p.a, b: p.b,
    opciones: pickOpciones(p.a - p.b, 0, 20, rand),
    respuesta: p.a - p.b, emoji: fruta, conAyudaVisual: guiada,
  });

  return {
    id, tipo: 'resta', semana: s, bloque,
    titulo: s <= 6 ? 'Quitar y contar' : s <= 12 ? 'Restas hasta 10' : s <= 18 ? 'Restas hasta 15' : 'Restas hasta 20',
    subtitulo: 'Restar es quitar cosas',
    icono: '➖', color: 'from-cyan-400 to-blue-600',
    introduccion: {
      texto: `Hoy vamos a restar. Restar es quitar cosas para saber cuántas quedan.`,
      paraQueSirve: 'Restar sirve cuando comes galletas o regalas juguetes y quieres saber cuántos quedan.',
    },
    ejemploModelado: {
      descripcion: `${ej.a} ${fruta} − ${ej.b} ${fruta}`,
      pasos: [
        { texto: `Mira: aquí hay ${objetosVoz(fruta, ej.a)}.`, visual: `${ej.a}` },
        { texto: `Se van ${objetosVoz(fruta, ej.b)}. ¡Adiós!`, visual: `${ej.b}` },
        { texto: `Contamos las que quedan: ${ej.a - ej.b > 0 ? Array.from({ length: ej.a - ej.b }, (_, i) => i + 1).join(', ') : 'ninguna, ¡cero!'}`, visual: '🔢' },
        { texto: `¡${ej.a} menos ${ej.b} es ${ej.a - ej.b}!`, visual: `${ej.a - ej.b}` },
      ],
    },
    practicaGuiada: [toEj(probs[1], 1, true)],
    practicaIndependiente: [probs[2], probs[3], probs[4], probs[5]].map((p, i) => toEj(p, i, false)),
    umbralAvance: 0.8,
  };
}

// Fix: restaActividad tipo debe ser 'resta'
const _origResta = restaActividad;

export function getActividadSafe(m: Materia, s: number, v: number): ActividadDef {
  const a = getActividad(m, s, v);
  if (m === 'resta') a.tipo = 'resta';
  void _origResta;
  return a;
}

export const MATERIAS: { id: Materia; nombre: string; emoji: string; color: string; descripcion: string }[] = [
  { id: 'lectura', nombre: 'Leer', emoji: '📖', color: 'from-rose-400 to-pink-600', descripcion: 'Vocales, sílabas y cuentos' },
  { id: 'escritura', nombre: 'Escribir', emoji: '✏️', color: 'from-lime-400 to-green-600', descripcion: 'Traza letras y palabras' },
  { id: 'suma', nombre: 'Sumar', emoji: '➕', color: 'from-orange-400 to-red-500', descripcion: 'Junta y cuenta' },
  { id: 'resta', nombre: 'Restar', emoji: '➖', color: 'from-cyan-400 to-blue-600', descripcion: 'Quita y descubre' },
];

export function tituloSemana(semana: number): string {
  const b = BLOQUES.find((x) => x.semanas.includes(semana));
  return b ? `${b.emoji} ${b.nombre} · Semana ${semana}` : `Semana ${semana}`;
}
