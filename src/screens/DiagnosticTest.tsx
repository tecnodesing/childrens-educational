import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Volume2 } from 'lucide-react';
import TDRobot from '../components/TDRobot';
import { tdVoice } from '../lib/td-voice';
import { sfx } from '../lib/audio';
import confetti from 'canvas-confetti';

const PASOS = [
  {
    titulo: 'Vamos a conocerte 🕵️',
    consigna: 'Toca la vocal A',
    pista: 'La A suena aaaa, como cuando abres la boca en el doctor.',
    opciones: ['A', 'E', 'O'],
    respuesta: 'A',
    tipo: 'letra' as const,
  },
  {
    titulo: 'Cuentas muy bien 🔢',
    consigna: '¿Cuántas manzanas hay? 🍎🍎🍎',
    pista: 'Cuenta conmigo: una, dos, tres.',
    opciones: ['2', '3', '4'],
    respuesta: '3',
    tipo: 'numero' as const,
  },
  {
    titulo: 'Casi terminas ➕',
    consigna: 'Si tienes 🍎🍎 y te dan 🍎 más, ¿cuántas tienes?',
    pista: 'Junta todas y cuéntalas: una, dos, tres.',
    opciones: ['2', '3', '4'],
    respuesta: '3',
    tipo: 'numero' as const,
  },
  {
    titulo: 'Última, ¡tú puedes! 🧩',
    consigna: 'TD dice "ma". ¿Cuál sílaba es?',
    pista: 'Empieza con la M, como mamá.',
    opciones: ['MA', 'PA', 'SA'],
    respuesta: 'MA',
    tipo: 'silaba' as const,
    decir: 'ma',
  },
];

export default function DiagnosticTest({ nombre, onFinish }: { nombre: string; onFinish: (aciertos: number) => void }) {
  const [paso, setPaso] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [elegido, setElegido] = useState<string | null>(null);
  const [esCorrecto, setEsCorrecto] = useState<boolean | null>(null);
  const [fin, setFin] = useState(false);

  const actual = PASOS[paso];

  useEffect(() => {
    setElegido(null);
    setEsCorrecto(null);
    const t = setTimeout(() => {
      tdVoice.speak(`${actual.titulo}. ${actual.consigna}`);
    }, 400);
    return () => clearTimeout(t);
  }, [paso]); // eslint-disable-line react-hooks/exhaustive-deps

  const hablar = () => {
    sfx.click();
    if (actual.decir) tdVoice.speak(`${actual.consigna}. Escucha: ${actual.decir}, ${actual.decir}.`);
    else tdVoice.speak(actual.consigna);
  };

  const elegir = (op: string) => {
    if (elegido) return;
    setElegido(op);
    const ok = op === actual.respuesta;
    setEsCorrecto(ok);
    if (ok) {
      sfx.success();
      setAciertos((a) => a + 1);
      tdVoice.speak('¡Muy bien! Eres increíble.');
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } else {
      sfx.error();
      tdVoice.speak(`${actual.pista} Intenta con otra.`);
      setTimeout(() => { setElegido(null); setEsCorrecto(null); }, 1400);
    }
  };

  const siguiente = () => {
    sfx.pop();
    tdVoice.stop();
    if (paso < PASOS.length - 1) {
      setPaso(paso + 1);
    } else {
      setFin(true);
      sfx.fanfare();
      confetti({ particleCount: 160, spread: 100, origin: { y: 0.5 } });
      tdVoice.speak(`¡Felicidades ${nombre}! Ya sé cómo ayudarte. ¡Vamos al mapa de aventura!`);
      setTimeout(() => onFinish(aciertos + (esCorrecto ? 0 : 0)), 2200);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-b from-violet-200 via-fuchsia-100 to-amber-50">
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 pb-8 pt-6">
        {/* Progreso */}
        <div className="flex items-center gap-2">
          {PASOS.map((_, i) => (
            <div key={i} className={`h-3 flex-1 rounded-full ${i < paso || (i === paso && esCorrecto) ? 'bg-green-500' : i === paso ? 'bg-amber-400' : 'bg-white/70'}`} />
          ))}
        </div>
        <p className="mt-2 text-center text-xs font-black uppercase tracking-widest text-violet-600">
          Juego de conocimiento · {paso + 1} de {PASOS.length}
        </p>

        {!fin ? (
          <motion.div key={paso} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} className="mt-4">
            <div className="flex items-end gap-3">
              <div className="shrink-0 rounded-full bg-white p-1 shadow-xl ring-4 ring-violet-300">
                <TDRobot mood={esCorrecto ? 'fiesta' : 'feliz'} size={76} />
              </div>
              <div className="flex-1 rounded-3xl rounded-bl-md border-2 border-violet-200 bg-white/95 p-4 shadow-lg">
                <p className="font-display text-lg font-black text-violet-950">{actual.titulo}</p>
                <p className="font-body text-base font-bold text-slate-700">{actual.consigna}</p>
                <button onClick={hablar} className="mt-2 flex items-center gap-1.5 rounded-full bg-violet-500 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-white active:scale-95">
                  <Volume2 className="h-3.5 w-3.5" /> Escuchar
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 sm:mt-6 sm:gap-3">
              {actual.opciones.map((op) => {
                const fueElegido = elegido === op;
                const esResp = op === actual.respuesta;
                return (
                  <motion.button
                    key={op}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => elegir(op)}
                    className={`font-display flex min-h-[90px] items-center justify-center rounded-3xl text-3xl font-black shadow-lg transition sm:min-h-[110px] sm:text-4xl ${
                      fueElegido && !esResp
                        ? 'bg-rose-400 text-white ring-4 ring-rose-200'
                        : fueElegido && esResp
                          ? 'bg-green-400 text-white ring-4 ring-green-200'
                          : 'bg-white text-violet-900 ring-2 ring-violet-100'
                    }`}
                  >
                    {op}
                  </motion.button>
                );
              })}
            </div>

            {esCorrecto && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={siguiente}
                className="font-display mt-6 flex min-h-[60px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-green-400 to-emerald-600 text-xl font-black text-white shadow-xl active:scale-[0.98]"
              >
                {paso === PASOS.length - 1 ? '¡Ver mi mapa! 🗺️' : 'Siguiente'} <ArrowRight className="h-6 w-6" />
              </motion.button>
            )}
          </motion.div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <TDRobot mood="fiesta" size={140} />
            <h2 className="font-display mt-4 break-words text-2xl font-black text-violet-950 sm:text-3xl">¡Lo hiciste genial, {nombre}! 🎉</h2>
            <p className="font-body mt-2 font-bold text-slate-600">Acertaste {aciertos} de {PASOS.length}. TD ya sabe por dónde empezar.</p>
          </div>
        )}
      </div>
    </div>
  );
}
