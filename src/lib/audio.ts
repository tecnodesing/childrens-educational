/* Efectos de sonido sintetizados con WebAudio (sin assets) */

let ctx: AudioContext | null = null;
let enabled = true;

export function setSoundEnabled(v: boolean) { enabled = v; }
export function isSoundEnabled() { return enabled; }

function ac(): AudioContext | null {
  if (!enabled) return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.18) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + start;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

export const sfx = {
  click() { tone(660, 0, 0.12, 'triangle', 0.12); },
  pop() {
    tone(500, 0, 0.1, 'sine', 0.2);
    tone(800, 0.06, 0.12, 'sine', 0.18);
  },
  success() {
    tone(523.25, 0, 0.15, 'triangle', 0.2);
    tone(659.25, 0.12, 0.15, 'triangle', 0.2);
    tone(783.99, 0.24, 0.25, 'triangle', 0.22);
  },
  star() {
    tone(880, 0, 0.2, 'sine', 0.2);
    tone(1174.66, 0.15, 0.3, 'sine', 0.18);
  },
  error() {
    tone(220, 0, 0.2, 'sawtooth', 0.06);
    tone(196, 0.15, 0.25, 'sawtooth', 0.06);
  },
  fanfare() {
    const seq = [523.25, 523.25, 659.25, 783.99, 659.25, 783.99, 1046.5];
    seq.forEach((f, i) => tone(f, i * 0.13, 0.2, 'triangle', 0.2));
  },
  whoosh() {
    tone(300, 0, 0.15, 'sine', 0.1);
    tone(600, 0.08, 0.15, 'sine', 0.1);
  },
  countTick() { tone(740, 0, 0.08, 'square', 0.05); },
};
