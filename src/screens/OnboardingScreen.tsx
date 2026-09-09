import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Delete, Check, Mic, Loader2 } from 'lucide-react';
import Logo from '../components/Logo';
import TDRobot from '../components/TDRobot';
import { PERSONAJES } from '../lib/content';
import { tdVoice } from '../lib/td-voice';
import { sfx } from '../lib/audio';
import type { Perfil } from '../lib/types';

const TECLAS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'Ñ', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

export default function OnboardingScreen({
  perfiles,
  onDone,
  onSelectExisting,
  onPresentation,
}: {
  perfiles: Perfil[];
  onDone: (nombre: string, personaje: string) => void;
  onSelectExisting: (perfil: Perfil) => void;
  onPresentation: () => void;
}) {
  const [paso, setPaso] = useState<'nombre' | 'personaje'>('nombre');
  const [nombre, setNombre] = useState('');
  const [personaje, setPersonaje] = useState(PERSONAJES[0].id);
  const [saludoHecho, setSaludoHecho] = useState(false);
  const [vozLista, setVozLista] = useState(false);
  const [vozNombre, setVozNombre] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Detección automática de voz en segundo plano
  useEffect(() => {
    let alive = true;
    tdVoice.ready().then((name) => {
      if (alive) {
        setVozLista(true);
        setVozNombre(name);
      }
    });
    return () => { alive = false; };
  }, []);

  const saludar = () => {
    sfx.pop();
    setSaludoHecho(true);
    tdVoice.speak('¡Hola! ¿Cómo te llamas? Escríbelo con las letras grandes.', { rate: 0.9, pitch: 1.15 });
  };

  const pressTecla = (t: string) => {
    if (nombre.length >= 14) return;
    sfx.click();
    setNombre((n) => (n + t).slice(0, 14));
  };

  const continuar = () => {
    if (nombre.trim().length < 2) {
      tdVoice.speak('Escribe tu nombre para continuar. ¡Tú puedes!');
      return;
    }
    sfx.pop();
    setPaso('personaje');
    tdVoice.speak(`¡Hola ${nombre}! Ahora elige tu personaje favorito.`);
  };

  const finalizar = () => {
    sfx.fanfare();
    tdVoice.stop();
    onDone(nombre.trim(), personaje);
  };

  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-b from-sky-200 via-sky-100 to-amber-50">
      {/* Cielo decorativo */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-6 top-10 text-4xl opacity-70">☁️</div>
        <div className="absolute right-10 top-24 text-3xl opacity-60">☁️</div>
        <div className="absolute left-1/2 top-6 text-3xl">🌈</div>
        <div className="absolute bottom-40 left-4 text-2xl opacity-50">🌸</div>
        <div className="absolute bottom-52 right-6 text-2xl opacity-50">🦋</div>
      </div>

      <div className="relative mx-auto flex w-full max-w-xl flex-1 flex-col px-4 pb-8 pt-6 sm:pt-10">
        <div className="flex items-center justify-between">
          <Logo withText size={52} />
          <div className="flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-xs font-bold text-sky-700 shadow">
            {vozLista ? (
              <>
                <span className="h-2 w-2 rounded-full bg-green-500" /> TD listo 🎙️
              </>
            ) : (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> TD despertando…
              </>
            )}
          </div>
        </div>

        {/* TD saludo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button onClick={saludar} className="shrink-0 rounded-full bg-white p-1 shadow-xl ring-4 ring-sky-300 transition active:scale-95" aria-label="Saludar a TD">
                <TDRobot mood={saludoHecho ? 'feliz' : 'pensando'} size={72} />
              </button>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="min-w-0 flex-1 rounded-3xl rounded-bl-md border-2 border-sky-200 bg-white/95 p-3 shadow-lg sm:p-4"
              >
            {!saludoHecho ? (
              <button onClick={saludar} className="w-full text-left">
                <p className="font-display text-lg font-black text-sky-900">¡Hola! Soy TD 🤖</p>
                <p className="font-body text-sm font-semibold text-slate-600">Tócame para que te hable…</p>
              </button>
            ) : paso === 'nombre' ? (
              <>
                <p className="font-display text-lg font-black text-sky-900">¡Hola! ¿Cómo te llamas? 👋</p>
                <p className="font-body text-sm font-semibold text-slate-600">Escríbelo con las letras grandes.</p>
              </>
            ) : (
              <>
                <p className="font-display text-lg font-black text-sky-900">¡Hola, {nombre}! 🎉</p>
                <p className="font-body text-sm font-semibold text-slate-600">Elige tu compañero de aventuras.</p>
              </>
            )}
          </motion.div>
        </div>

        {paso === 'nombre' ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-4 sm:mt-5">
            <div className="rounded-3xl bg-white p-4 shadow-xl">
              <label className="text-xs font-black uppercase tracking-widest text-sky-600">Mi nombre es</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  ref={inputRef}
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, '').slice(0, 14))}
                  placeholder="Ej. Sofía"
                  className="font-display min-h-[56px] flex-1 rounded-2xl border-3 border-sky-200 bg-sky-50 px-4 text-3xl font-black text-sky-950 outline-none placeholder:text-sky-300 focus:border-sky-400"
                  style={{ borderWidth: 3 }}
                />
                {nombre.length > 0 && (
                  <button onClick={() => setNombre('')} className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 active:scale-95" aria-label="Borrar nombre">
                    <Delete className="h-6 w-6" />
                  </button>
                )}
              </div>
              {/* Teclado en pantalla */}
              <div className="mt-3 grid grid-cols-6 gap-1 sm:grid-cols-7 sm:gap-1.5 md:grid-cols-9">
                {TECLAS.map((t) => (
                  <button
                    key={t}
                    onClick={() => pressTecla(t)}
                    className="flex min-h-[42px] items-center justify-center rounded-xl bg-gradient-to-b from-sky-500 to-sky-600 font-display text-base font-black text-white shadow transition active:scale-90 active:from-sky-600 sm:min-h-[48px] sm:text-lg"
                  >
                    {t}
                  </button>
                ))}
                <button onClick={() => setNombre((n) => n.slice(0, -1))} className="flex min-h-[42px] items-center justify-center rounded-xl bg-slate-200 text-slate-600 active:scale-90 sm:min-h-[48px]" aria-label="Borrar letra">
                  <Delete className="h-5 w-5" />
                </button>
              </div>
              <button
                onClick={continuar}
                disabled={nombre.trim().length < 2}
                className="font-display mt-4 flex min-h-[56px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-amber-400 to-orange-500 text-xl font-black text-white shadow-lg shadow-orange-200 transition active:scale-[0.98] disabled:opacity-40"
              >
                Siguiente <ArrowRight className="h-6 w-6" />
              </button>
            </div>

            {/* Perfiles existentes */}
            {perfiles.length > 0 && (
              <div className="mt-4 rounded-3xl bg-white/80 p-4 shadow">
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">¿Ya jugaste antes? Elige tu nombre</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {perfiles.map((p) => {
                    const pj = PERSONAJES.find((x) => x.id === p.personaje);
                    return (
                      <button
                        key={p.id}
                        onClick={() => { sfx.pop(); onSelectExisting(p); }}
                        className="flex items-center gap-2 rounded-full bg-white px-3 py-2 font-bold text-slate-700 shadow ring-2 ring-sky-100 transition active:scale-95"
                      >
                        <span className="text-xl">{pj?.emoji ?? '😊'}</span> {p.nombre}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-4 sm:mt-5">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {PERSONAJES.map((pj) => {
                const sel = personaje === pj.id;
                return (
                  <button
                    key={pj.id}
                    onClick={() => { setPersonaje(pj.id); sfx.pop(); tdVoice.speak(`¡${pj.nombre}! ${pj.descripcion}.`); }}
                    className={`relative flex min-h-[120px] flex-col items-center justify-center gap-1 rounded-3xl bg-gradient-to-b p-3 text-white shadow-lg transition active:scale-95 ${pj.gradiente} ${sel ? 'ring-4 ring-amber-300 scale-[1.03]' : 'opacity-90'}`}
                  >
                    {sel && (
                      <span className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-white shadow">
                        <Check className="h-5 w-5" strokeWidth={3.5} />
                      </span>
                    )}
                    <span className="text-5xl drop-shadow">{pj.emoji}</span>
                    <span className="font-display text-sm font-black">{pj.nombre}</span>
                    <span className="text-[11px] font-semibold opacity-90">{pj.descripcion}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setPaso('nombre')} className="min-h-[56px] rounded-2xl bg-white px-5 font-display text-lg font-black text-sky-700 shadow transition active:scale-95">
                ←
              </button>
              <button onClick={finalizar} className="font-display flex min-h-[56px] flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-green-400 to-emerald-600 text-xl font-black text-white shadow-lg shadow-green-200 transition active:scale-[0.98]">
                ¡Empezar aventura! 🚀
              </button>
            </div>
          </motion.div>
        )}

        <button
          onClick={() => { sfx.click(); tdVoice.stop(); onPresentation(); }}
          className="mx-auto mt-3 flex items-center gap-1.5 rounded-full bg-white/80 px-4 py-2 text-xs font-black text-slate-600 shadow ring-2 ring-sky-100 transition active:scale-95"
        >
          👨‍👩‍👧 ¿Cómo funciona la app? <span className="text-slate-400">(para padres)</span>
        </button>
        <p className="mt-2 text-center text-[11px] font-semibold text-sky-700/60">
          <Mic className="mr-1 inline h-3 w-3" />
          {vozLista && vozNombre ? `Voz de TD: ${vozNombre}` : 'TD está eligiendo su mejor voz…'} · Sin contraseña · 100% en este dispositivo
        </p>
      </div>
    </div>
  );
}
