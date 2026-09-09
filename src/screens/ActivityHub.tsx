import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Eye } from 'lucide-react';
import { MATERIAS, SESIONES_POR_SEMANA, tituloSemana, getActividadSafe } from '../lib/content';
import { hasSeenIntro, isActivityDone, conteoSemana } from '../lib/store';
import { sfx } from '../lib/audio';
import { tdVoice } from '../lib/td-voice';
import type { Materia, Perfil } from '../lib/types';

export default function ActivityHub({
  perfil,
  semana,
  onBack,
  onStart,
  say,
}: {
  perfil: Perfil;
  semana: number;
  onBack: () => void;
  onStart: (materia: Materia, variante: number) => void;
  say: (texto: string) => void;
}) {
  // Selección de sesión por materia (1..5)
  const [sels, setSels] = useState<Record<string, number>>({});

  const nextVariant = (m: Materia): number => {
    for (let v = 1; v <= SESIONES_POR_SEMANA; v++) {
      if (!isActivityDone(perfil, m, `${m}-semana-${semana}-v${v}`)) return v;
    }
    return 1;
  };

  useEffect(() => {
    setSels({});
    const t = setTimeout(() => {
      say(`Semana ${semana}. Cada materia tiene ${SESIONES_POR_SEMANA} sesiones. Hoy puedes hacer ${SESIONES_POR_SEMANA} y serás un campeón. Elige tu materia.`);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [semana]);

  return (
    <div className="min-h-dvh bg-gradient-to-b from-amber-100 via-orange-50 to-sky-50 pb-32">
      <div className="sticky top-0 z-30 border-b-2 border-orange-100 bg-white/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-3 py-3 sm:px-4">
          <button onClick={() => { sfx.click(); tdVoice.stop(); onBack(); }} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-700 shadow ring-2 ring-slate-100 active:scale-95" aria-label="Volver al mapa">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="font-display text-xl font-black leading-tight text-slate-900">{tituloSemana(semana)}</h1>
            <p className="text-xs font-bold text-slate-500">Elige tu misión de hoy · 5 sesiones por materia 🎯</p>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl space-y-3 px-3 pt-4 sm:px-4">
        {MATERIAS.map((m, i) => {
          const doneN = Math.min(5, conteoSemana(perfil, m.id, semana));
          const vSel = sels[m.id] ?? nextVariant(m.id);
          const act = getActividadSafe(m.id, semana, vSel);
          const selDone = isActivityDone(perfil, m.id, act.id);
          const seen = hasSeenIntro(perfil, `${act.id}-intro`);
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`overflow-hidden rounded-3xl bg-gradient-to-br ${m.color} shadow-xl`}
            >
              <div className="p-4 text-white">
                <div className="flex items-center gap-3">
                  <span className="text-4xl drop-shadow-lg">{m.emoji}</span>
                  <div className="flex-1">
                    <h2 className="font-display text-xl font-black">
                      {m.nombre} <span className="text-sm font-bold opacity-80">· {act.titulo}</span>
                    </h2>
                    <p className="text-xs font-bold opacity-90">{act.subtitulo}</p>
                  </div>
                  <span className={`flex h-11 w-11 flex-col items-center justify-center rounded-2xl text-xs font-black leading-none ${doneN >= 5 ? 'bg-white/30' : 'bg-white/90 text-slate-800'}`}>
                    {doneN >= 5 ? <Check className="h-5 w-5" strokeWidth={3.5} /> : (
                      <>
                        <span className="text-sm">{doneN}/5</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Selector de sesión 1-5 */}
                <div className="mt-3 flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider opacity-80">Sesión</span>
                  {Array.from({ length: SESIONES_POR_SEMANA }, (_, k) => k + 1).map((v) => {
                    const vDone = isActivityDone(perfil, m.id, `${m.id}-semana-${semana}-v${v}`);
                    const esSel = v === vSel;
                    const esNext = v === nextVariant(m.id);
                    return (
                      <button
                        key={v}
                        onClick={() => { setSels((s) => ({ ...s, [m.id]: v })); sfx.click(); }}
                        className={`relative flex h-11 w-11 items-center justify-center rounded-xl font-display text-base font-black transition active:scale-90 ${
                          esSel ? 'bg-white text-slate-900 shadow-lg scale-105' : 'bg-white/25 text-white'
                        }`}
                        aria-label={`Sesión ${v}${vDone ? ' (completada)' : ''}`}
                      >
                        {vDone ? <Check className="h-5 w-5" strokeWidth={3.5} /> : v}
                        {esNext && !vDone && (
                          <span className="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full bg-amber-300" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => { sfx.pop(); tdVoice.stop(); onStart(m.id, vSel); }}
                    className="font-display flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-2xl bg-white/95 text-lg font-black text-slate-800 shadow transition active:scale-[0.98]"
                  >
                    {selDone ? 'Jugar otra vez 🔄' : seen ? '¡A jugar! 🚀' : 'Empezar ✨'}
                  </button>
                </div>
                {!seen && (
                  <span className="mt-2 flex items-center gap-1 text-[11px] font-black uppercase tracking-wide opacity-90">
                    <Eye className="h-3.5 w-3.5" /> TD te explica con un ejemplo primero
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}

        <div className="rounded-3xl bg-white/80 p-4 shadow ring-2 ring-sky-100">
          <p className="text-center text-sm font-bold text-slate-600">
            🕐 <b>Meta de hoy: 1 hora</b>. Haz una sesión de cada materia (o 5 de una) y descansa. Cada sesión dura ~12 minutos y TD siempre empieza con un ejemplo.
          </p>
        </div>
      </div>
    </div>
  );
}
