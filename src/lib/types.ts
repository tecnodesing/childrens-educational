export type Materia = 'lectura' | 'escritura' | 'suma' | 'resta';

export interface HistorialSemanal {
  semana: number;
  fecha: string;
  resumen: string;
  estrellas: number;
}

export interface Progreso {
  bloqueActual: number;
  semanaActual: number;
  estrellas: number;
  monedas: number;
  insignias: string[];
  actividadesCompletadas: Record<Materia, string[]>;
  nivelDificultadActual: { lectura: number; suma: number; resta: number; escritura: number };
  nivelesFallidos: Record<string, number>;
  introVistas: string[];
  historialSemanal: HistorialSemanal[];
  rachaDias: number;
  ultimaSesion: string;
  tiempoTotalMin: number;
  aciertosTotales: number;
  intentosTotales: number;
}

export interface Configuracion {
  sonidoActivado: boolean;
  vozSeleccionada: string;
  velocidadVoz: number;
  tonoVoz: number;
}

export interface Perfil {
  id: string;
  nombre: string;
  personaje: string;
  fechaCreacion: string;
  progreso: Progreso;
  configuracion: Configuracion;
}

export interface AppState {
  perfiles: Perfil[];
  perfilActivo: string | null;
  diagCompletado: Record<string, boolean>;
}

export type FaseActividad = 'intro-check' | 'intro' | 'ejemplo' | 'guiada' | 'independiente' | 'celebramiento';

export interface EjercicioBase {
  id: string;
  consigna: string;
  pista?: string;
  ayudaVisual?: boolean;
}

export interface EjercicioLectura extends EjercicioBase {
  categoria: 'lectura';
  subtipo: 'escucha-elige' | 'elige-sonido' | 'une-silaba' | 'forma-palabra' | 'elige-imagen' | 'elige-palabra' | 'ordena-frase' | 'comprension' | 'repite-voz';
  opciones: string[];
  respuesta: string;
  emoji?: string;
  palabra?: string;
  silabas?: string[];
  frase?: string;
  imagenOpciones?: string[];
  /** objetivo para el ejercicio de repetición en voz alta */
  objetivoVoz?: string;
}

export interface EjercicioEscritura extends EjercicioBase {
  categoria: 'escritura';
  caracter: string;
  tipoTrazo: 'vocal' | 'consonante' | 'numero' | 'silaba' | 'palabra';
  repeticiones: number;
}

export interface EjercicioMates extends EjercicioBase {
  categoria: 'suma' | 'resta';
  a: number;
  b: number;
  opciones: number[];
  respuesta: number;
  emoji: string;
  conAyudaVisual: boolean;
}

export type Ejercicio = EjercicioLectura | EjercicioEscritura | EjercicioMates;

export interface ActividadDef {
  id: string;
  tipo: Materia;
  semana: number;
  bloque: number;
  titulo: string;
  subtitulo: string;
  icono: string;
  color: string;
  escalonLectura?: number;
  introduccion: { texto: string; paraQueSirve: string };
  ejemploModelado: { descripcion: string; pasos: { texto: string; visual?: string }[] };
  practicaGuiada: Ejercicio[];
  practicaIndependiente: Ejercicio[];
  umbralAvance: number;
}

export interface PersonajeDef {
  id: string;
  nombre: string;
  emoji: string;
  gradiente: string;
  descripcion: string;
}

export interface InsigniaDef {
  id: string;
  nombre: string;
  emoji: string;
  descripcion: string;
  condicion: string;
}
