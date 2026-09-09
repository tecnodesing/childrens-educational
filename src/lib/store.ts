import type { AppState, Materia, Perfil, Progreso } from './types';

const KEY = 'aprendeJugando_v1';

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function defaultProgreso(): Progreso {
  return {
    bloqueActual: 1,
    semanaActual: 1,
    estrellas: 0,
    monedas: 0,
    insignias: [],
    actividadesCompletadas: { lectura: [], escritura: [], suma: [], resta: [] },
    nivelDificultadActual: { lectura: 1, suma: 1, resta: 1, escritura: 1 },
    nivelesFallidos: {},
    introVistas: [],
    historialSemanal: [],
    rachaDias: 1,
    ultimaSesion: todayStr(),
    tiempoTotalMin: 0,
    aciertosTotales: 0,
    intentosTotales: 0,
  };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { perfiles: [], perfilActivo: null, diagCompletado: {} };
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed.perfiles) return { perfiles: [], perfilActivo: null, diagCompletado: {} };
    // Migración defensiva: asegurar campos nuevos
    for (const p of parsed.perfiles) {
      if (!p.progreso.introVistas) p.progreso.introVistas = [];
      if (!p.progreso.nivelDificultadActual) p.progreso.nivelDificultadActual = { lectura: 1, suma: 1, resta: 1, escritura: 1 };
      if ((p.progreso.nivelDificultadActual as Record<string, number>).escritura === undefined) {
        (p.progreso.nivelDificultadActual as Record<string, number>).escritura = 1;
      }
      if (p.configuracion.velocidadVoz === undefined) p.configuracion.velocidadVoz = 0.9;
      if (p.configuracion.tonoVoz === undefined) p.configuracion.tonoVoz = 1.15;
      if (p.configuracion.vozSeleccionada === undefined) p.configuracion.vozSeleccionada = '';
      if (p.progreso.rachaDias === undefined) p.progreso.rachaDias = 1;
      if (p.progreso.tiempoTotalMin === undefined) p.progreso.tiempoTotalMin = 0;
      if (p.progreso.aciertosTotales === undefined) { p.progreso.aciertosTotales = 0; p.progreso.intentosTotales = 0; }
    }
    if (!parsed.diagCompletado) parsed.diagCompletado = {};
    return parsed;
  } catch {
    return { perfiles: [], perfilActivo: null, diagCompletado: {} };
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* almacenamiento lleno, ignorar */
  }
}

export function getActiveProfile(state: AppState): Perfil | null {
  if (!state.perfilActivo) return null;
  return state.perfiles.find((p) => p.id === state.perfilActivo) ?? null;
}

export function findByName(state: AppState, nombre: string): Perfil | null {
  const n = nombre.trim().toLowerCase();
  if (!n) return null;
  return state.perfiles.find((p) => p.nombre.trim().toLowerCase() === n) ?? null;
}

export function createProfile(nombre: string, personaje: string, voz = '', rate = 0.9, pitch = 1.15): Perfil {
  return {
    id: uid(),
    nombre: nombre.trim(),
    personaje,
    fechaCreacion: todayStr(),
    progreso: defaultProgreso(),
    configuracion: {
      sonidoActivado: true,
      vozSeleccionada: voz,
      velocidadVoz: rate,
      tonoVoz: pitch,
    },
  };
}

export function touchSession(p: Perfil): Perfil {
  const hoy = todayStr();
  if (p.progreso.ultimaSesion !== hoy) {
    // racha: si ayer fue última sesión, +1; si no, reiniciar a 1
    const ayer = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    p.progreso.rachaDias = p.progreso.ultimaSesion === ayer ? p.progreso.rachaDias + 1 : 1;
    p.progreso.ultimaSesion = hoy;
  }
  return p;
}

export function hasSeenIntro(p: Perfil, introId: string): boolean {
  return p.progreso.introVistas.includes(introId);
}

export function markIntroVista(p: Perfil, introId: string): void {
  if (!p.progreso.introVistas.includes(introId)) {
    p.progreso.introVistas.push(introId);
  }
}

export function isActivityDone(p: Perfil, materia: Materia, actividadId: string): boolean {
  return p.progreso.actividadesCompletadas[materia].includes(actividadId);
}

/** Sesiones completadas de una materia en una semana (ids: `<m>-semana-<s>-v<n>`) */
export function conteoSemana(p: Perfil, m: Materia, s: number): number {
  const pref = `${m}-semana-${s}-v`;
  return p.progreso.actividadesCompletadas[m].filter((id) => id.startsWith(pref)).length;
}

/** 4 materias × 5 sesiones = 20 actividades por semana (~1 h/día) */
export function weekProgress(p: Perfil, semana: number): { done: number; total: number; materias: Materia[] } {
  const materias: Materia[] = ['lectura', 'escritura', 'suma', 'resta'];
  let done = 0;
  const doneMaterias: Materia[] = [];
  for (const m of materias) {
    const n = Math.min(5, conteoSemana(p, m, semana));
    done += n;
    if (n >= 5) doneMaterias.push(m);
  }
  return { done, total: 20, materias: doneMaterias };
}

export function isWeekUnlocked(p: Perfil, semana: number): boolean {
  if (semana <= 1) return true;
  if (semana <= p.progreso.semanaActual) return true;
  // Desbloquear si semana anterior tiene al menos 2 completadas
  const prev = weekProgress(p, semana - 1);
  return prev.done >= 2;
}

export function maybeAdvanceWeek(p: Perfil, semana: number): boolean {
  const prog = weekProgress(p, semana);
  // Semana completa al 80% de sesiones (16/20)
  if (prog.done >= 16 && semana >= p.progreso.semanaActual && semana < 24) {
    p.progreso.semanaActual = semana + 1;
    p.progreso.bloqueActual = Math.min(4, Math.floor((semana) / 6) + 1);
    p.progreso.historialSemanal.push({
      semana,
      fecha: todayStr(),
      resumen: `Completó ${prog.done}/20 sesiones de la semana ${semana}`,
      estrellas: prog.done,
    });
    return true;
  }
  return false;
}

export function awardInsignia(p: Perfil, id: string): boolean {
  if (!p.progreso.insignias.includes(id)) {
    p.progreso.insignias.push(id);
    return true;
  }
  return false;
}

export function exportJSON(state: AppState): string {
  return JSON.stringify(state, null, 2);
}

export function importJSON(text: string): AppState | null {
  try {
    const parsed = JSON.parse(text) as AppState;
    if (!Array.isArray(parsed.perfiles)) return null;
    return parsed;
  } catch {
    return null;
  }
}
