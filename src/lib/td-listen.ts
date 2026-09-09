/* td-listen: reconocimiento de voz del niño (Web Speech API - SpeechRecognition).
 * Permite ejercicios de "repetición en voz alta": TD dice la sílaba,
 * el niño la repite y la app evalúa con Levenshtein normalizado.
 * Fallback suave: si el dispositivo no lo soporta, el contenido genera
 * ejercicios alternativos (ver content.ts).
 */

export interface EscuchaResult {
  texto: string;
  error?: 'no-speech' | 'denegado' | 'timeout' | 'otro';
}

type RecognitionCtor = new () => {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
};

function getCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition as RecognitionCtor) || (w.webkitSpeechRecognition as RecognitionCtor) || null;
}

export function soportaReconocimiento(): boolean {
  try {
    return !!getCtor();
  } catch {
    return false;
  }
}

let actual: { abort(): void } | null = null;

/** Detiene la captura en curso (cambio de pantalla, etc.) */
export function detenerEscucha(): void {
  if (actual) {
    const a = actual;
    actual = null;
    try { a.abort(); } catch { /* noop */ }
  }
}

/** Captura una frase en español. Resuelve con el texto (o error). */
export function escuchar({
  maxMs = 5000,
  onParcial,
}: {
  maxMs?: number;
  onParcial?: (t: string) => void;
}): Promise<EscuchaResult> {
  return new Promise((resolve) => {
    const Ctor = getCtor();
    if (!Ctor) {
      resolve({ texto: '', error: 'otro' });
      return;
    }
    const rec = new Ctor();
    actual = rec;
    rec.lang = 'es-MX';
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    rec.continuous = false;
    let finalText = '';
    let done = false;
    const fin = (r: EscuchaResult) => {
      if (done) return;
      done = true;
      window.clearTimeout(tm);
      actual = null;
      rec.onend = null;
      rec.onerror = null;
      try { rec.abort(); } catch { /* noop */ }
      resolve(r);
    };
    const tm = window.setTimeout(() => {
      fin(finalText ? { texto: finalText } : { texto: '', error: 'timeout' });
    }, maxMs);
    rec.onresult = (e: any) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText = r[0].transcript;
        else interim += r[0].transcript;
      }
      const texto = finalText || interim;
      if (onParcial) onParcial(texto);
      if (finalText) fin({ texto: finalText });
    };
    rec.onerror = (e: any) => {
      if (e?.error === 'not-allowed' || e?.error === 'service-not-allowed') {
        fin({ texto: '', error: 'denegado' });
      }
      // 'no-speech' y 'aborted' se resuelven por timeout/texto final
    };
    rec.onend = () => {
      fin(finalText ? { texto: finalText } : { texto: '', error: 'no-speech' });
    };
    try {
      rec.start();
    } catch {
      fin({ texto: '', error: 'otro' });
    }
  });
}

// ---------- Normalización y similitud ----------

/** minúsculas, sin acentos, sin símbolos, sin repeticiones de carácter */
export function normar(s: string): string {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .replace(/(.)\1+/g, '$1');
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = new Array<number>(n + 1);
  let curr = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

export interface VeredictoVoz {
  ok: boolean;
  similitud: number; // 0..1
}

/** Evalúa lo que dijo el niño contra el objetivo (vocal o sílaba) */
export function evaluarDicho(dicho: string, objetivo: string): VeredictoVoz {
  const a = normar(dicho);
  const b = normar(objetivo);
  if (!a || !b) return { ok: false, similitud: 0 };
  // Vocal: primer fonema (tolera "ah", "aaah")
  if (b.length <= 1) {
    const ok = a[0] === b;
    return { ok, similitud: ok ? 1 : 0.2 };
  }
  // Si dice el objetivo al inicio (tolera "mama" para "ma")
  if (a.startsWith(b)) return { ok: true, similitud: 1 };
  const d = levenshtein(a, b);
  const sim = 1 - d / Math.max(a.length, b.length);
  return { ok: sim >= 0.7, similitud: sim };
}
