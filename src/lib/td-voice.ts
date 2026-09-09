/* td-voice.js — Módulo independiente de voz de TD (Web Speech API)
 * Clase TDVoice: ready, speak, stop, getAvailableSpanishVoices,
 * setVoiceByName, getCurrentVoiceName
 */

export interface SpanishVoiceInfo {
  name: string;
  lang: string;
  localService: boolean;
  isDefault: boolean;
  voiceURI: string;
}

const KNOWN_GOOD_NAMES = [
  'Mónica',
  'Monica',
  'Paulina',
  'Google español de Estados Unidos',
  'Google español',
  'Microsoft Dalia',
  'Microsoft Sabina',
  'Microsoft Helena',
  'Sabina',
  'Dalia',
  'Helena',
  'Lucia',
  'Lucía',
  'Alejandra',
];

const LANG_PRIORITY = ['es-MX', 'es-419', 'es-US', 'es_US', 'es-ES', 'es_ES', 'es'];

function scoreVoice(v: SpeechSynthesisVoice): number {
  let score = 0;
  const name = v.name || '';
  const lang = (v.lang || '').toLowerCase();
  // 1. Nombres conocidos de alta calidad
  for (let i = 0; i < KNOWN_GOOD_NAMES.length; i++) {
    if (name.toLowerCase().includes(KNOWN_GOOD_NAMES[i].toLowerCase())) {
      score += 1000 - i * 20;
      break;
    }
  }
  // 2. Variante de idioma preferida
  const langLower = LANG_PRIORITY.map((l) => l.toLowerCase());
  const idx = langLower.findIndex((l) => lang === l || lang.startsWith(l.toLowerCase().replace('_', '-')) || lang.replace('_', '-').startsWith(l.replace('_', '-')));
  if (idx >= 0) score += 500 - idx * 40;
  else if (lang.startsWith('es')) score += 100;
  // 3. Local antes que remota
  if (v.localService) score += 60;
  // 4. Default bump
  if (v.default) score += 5;
  // Penalizar voces de niños raras o de otro idioma
  if (!lang.startsWith('es')) score -= 2000;
  return score;
}

type SpeakOptions = {
  rate?: number;
  pitch?: number;
  volume?: number;
  onend?: () => void;
  onstart?: () => void;
};

/* Los emojis "contenidos" (frutas = objetos para contar) se traducen a
 * palabras con su cantidad; los decorativos se silencian. */
const FRUTA_VOZ: Record<string, { sing: string; plur: string }> = {
  '🍎': { sing: 'manzana', plur: 'manzanas' },
  '🍊': { sing: 'naranja', plur: 'naranjas' },
  '🍌': { sing: 'plátano', plur: 'plátanos' },
  '🍓': { sing: 'fresa', plur: 'fresas' },
  '🫐': { sing: 'arándano', plur: 'arándanos' },
  '🍇': { sing: 'racimo de uvas', plur: 'racimos de uvas' },
  '🥭': { sing: 'mango', plur: 'mangos' },
  '🍐': { sing: 'pera', plur: 'peras' },
};

function emojisAPalabras(t: string): string {
  const chars = Array.from(t);
  let out = '';
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const f = FRUTA_VOZ[ch];
    if (f) {
      let j = i;
      while (j < chars.length && chars[j] === ch) j++;
      const n = j - i;
      out += ` ${n} ${n === 1 ? f.sing : f.plur}`;
      i = j - 1;
    } else {
      out += ch;
    }
  }
  return out;
}

/**
 * Prepara el texto ANTES de hablarlo (aplica en TODOS los módulos):
 * frutas → palabras con cantidad ("🍎🍎" → "2 manzanas"),
 * símbolos matemáticos → palabras, decorativos → silencio.
 */
function limpiarParaVoz(t: string): string {
  return emojisAPalabras(t)
    .replace(/−/g, ' menos ')
    .replace(/×/g, ' por ')
    .replace(/÷/g, ' entre ')
    .replace(/…/g, '. ')
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}\u{2049}\u{203C}]/gu, ' ')
    .replace(/[|_•]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Divide textos largos en frases para evitar el corte ~15s de Chrome */
function chunksDe(texto: string, max = 130): string[] {
  if (texto.length <= max) return [texto];
  const frases = texto.match(/[^.!?…]+[.!?…]*/g) ?? [texto];
  const out: string[] = [];
  let cur = '';
  for (const f of frases) {
    if ((cur ? cur + ' ' + f : f).length > max && cur) {
      out.push(cur.trim());
      cur = f;
    } else {
      cur = cur ? cur + ' ' + f : f;
    }
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

class TDVoice {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private currentVoice: SpeechSynthesisVoice | null = null;
  private currentVoiceName = '';
  private rate = 0.9;
  private pitch = 1.15;
  private readyPromise: Promise<string> | null = null;
  private preferredName: string | null = null;
  private listeners: Set<() => void> = new Set();
  private speaking = false;
  private chainId = 0;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      // Chrome pausa locuciones largas: revivir periódicamente
      if (typeof window.setInterval === 'function') {
        window.setInterval(() => {
          if (this.synth && this.speaking && !this.synth.speaking) {
            try { this.synth.resume(); } catch { /* noop */ }
          }
        }, 6000);
      }
    }
  }

  /** Carga preferencia guardada (nombre de voz del perfil) antes de ready() */
  setPreferredName(name: string | null) {
    this.preferredName = name && name.length > 0 ? name : null;
  }

  setRatePitch(rate: number, pitch: number) {
    this.rate = Math.min(1.4, Math.max(0.5, rate));
    this.pitch = Math.min(2, Math.max(0.5, pitch));
    this.emit();
  }

  getRate() { return this.rate; }
  getPitch() { return this.pitch; }
  isSpeaking() { return this.speaking; }

  onChange(cb: () => void) {
    this.listeners.add(cb);
    return () => { this.listeners.delete(cb); };
  }
  private emit() { this.listeners.forEach((l) => l()); }

  ready(): Promise<string> {
    if (this.readyPromise) return this.readyPromise;
    this.readyPromise = new Promise((resolve) => {
      if (!this.synth) {
        resolve('');
        return;
      }
      const pick = () => {
        this.voices = this.synth!.getVoices();
        if (this.voices.length === 0) return false;
        this.currentVoice = this.pickBest(this.voices);
        this.currentVoiceName = this.currentVoice ? this.currentVoice.name : '';
        this.emit();
        resolve(this.currentVoiceName);
        return true;
      };
      if (pick()) return;
      // Esperar voiceschanged (Chrome carga async)
      let tries = 0;
      const handler = () => {
        if (pick()) {
          this.synth?.removeEventListener('voiceschanged', handler);
        }
      };
      this.synth.addEventListener('voiceschanged', handler);
      // Fallback polling por si voiceschanged no dispara
      const poll = setInterval(() => {
        tries++;
        if (pick() || tries > 30) {
          clearInterval(poll);
          this.synth?.removeEventListener('voiceschanged', handler);
          if (!this.currentVoice) resolve('');
        }
      }, 150);
      // Timeout duro 5s
      setTimeout(() => {
        if (!this.currentVoice) {
          clearInterval(poll);
          resolve('');
        }
      }, 5000);
    });
    return this.readyPromise;
  }

  private pickBest(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
    if (voices.length === 0) return null;
    // Si hay preferencia guardada y existe en este dispositivo, usarla
    if (this.preferredName) {
      const found = voices.find((v) => v.name === this.preferredName);
      if (found) return found;
    }
    const spanish = voices.filter((v) => (v.lang || '').toLowerCase().startsWith('es'));
    const pool = spanish.length > 0 ? spanish : voices;
    let best: SpeechSynthesisVoice | null = null;
    let bestScore = -Infinity;
    for (const v of pool) {
      const s = scoreVoice(v);
      if (s > bestScore) { bestScore = s; best = v; }
    }
    return best;
  }

  speak(texto: string, opciones: SpeakOptions = {}): void {
    if (!this.synth) {
      opciones.onend?.();
      return;
    }
    // Dicción: quitar emojis (el TTS los lee por su nombre) y convertir símbolos
    const limpio = limpiarParaVoz(texto);
    // Anular la cadena anterior (evita frases encoladas/antiguas)
    this.chainId++;
    const id = this.chainId;
    const chunks = chunksDe(limpio);
    try { this.synth.cancel(); } catch { /* noop */ }

    const next = (i: number) => {
      if (id !== this.chainId || !this.synth) return;
      if (i >= chunks.length) {
        this.speaking = false;
        this.emit();
        opciones.onend?.();
        return;
      }
      const u = new SpeechSynthesisUtterance(chunks[i]);
      if (this.currentVoice) u.voice = this.currentVoice;
      u.lang = this.currentVoice?.lang || 'es-MX';
      u.rate = opciones.rate ?? this.rate;
      u.pitch = opciones.pitch ?? this.pitch;
      u.volume = opciones.volume ?? 1;
      u.onend = () => next(i + 1);
      u.onerror = () => next(i + 1);
      if (i === 0 && opciones.onstart) {
        u.onstart = () => opciones.onstart?.();
      }
      this.speaking = true;
      this.emit();
      const doSpeak = () => {
        if (id !== this.chainId || !this.synth) return;
        try {
          // Chrome: revive si quedó pausado; iOS: destraba tras cancel()
          if (this.synth.paused) this.synth.resume();
          this.synth.speak(u);
        } catch {
          this.speaking = false;
          opciones.onend?.();
        }
      };
      // iOS Safari: hablar de inmediato tras cancel() se traga la 1ª frase
      if (i === 0) window.setTimeout(doSpeak, 60);
      else doSpeak();
    };
    next(0);
  }

  stop(): void {
    this.chainId++;
    if (!this.synth) return;
    try { this.synth.cancel(); } catch { /* noop */ }
    this.speaking = false;
    this.emit();
  }

  getAvailableSpanishVoices(): SpanishVoiceInfo[] {
    const all = this.synth ? this.synth.getVoices() : [];
    if (all.length === 0) return [];
    const spanish = all.filter((v) => (v.lang || '').toLowerCase().startsWith('es'));
    const list = (spanish.length > 0 ? spanish : all).map((v) => ({
      name: v.name,
      lang: v.lang,
      localService: v.localService,
      isDefault: !!v.default,
      voiceURI: v.voiceURI,
    }));
    // Ordenar por calidad estimada
    return list.sort((a, b) => {
      const va = all.find((v) => v.name === a.name)!;
      const vb = all.find((v) => v.name === b.name)!;
      return scoreVoice(vb) - scoreVoice(va);
    });
  }

  setVoiceByName(nombre: string): boolean {
    const all = this.synth ? this.synth.getVoices() : [];
    const found = all.find((v) => v.name === nombre);
    if (found) {
      this.currentVoice = found;
      this.currentVoiceName = found.name;
      this.preferredName = found.name;
      this.emit();
      return true;
    }
    return false;
  }

  getCurrentVoiceName(): string {
    return this.currentVoiceName;
  }

  /** Frase de prueba para el selector manual */
  previewVoice(nombre?: string, rate?: number, pitch?: number) {
    const prevVoice = this.currentVoice;
    if (nombre) {
      const all = this.synth ? this.synth.getVoices() : [];
      const found = all.find((v) => v.name === nombre);
      if (found) this.currentVoice = found;
    }
    this.speak('Hola, soy TD, tu compañero de aventuras. ¡Vamos a aprender jugando!', {
      rate: rate ?? this.rate,
      pitch: pitch ?? this.pitch,
      onend: () => {
        if (nombre && prevVoice) {
          // restaurar voz activa si solo era prueba
          this.currentVoice = prevVoice;
          this.currentVoiceName = prevVoice.name;
        }
      },
    });
  }
}

export const tdVoice = new TDVoice();
export default tdVoice;
