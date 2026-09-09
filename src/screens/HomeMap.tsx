import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star, Coins, Flame, Trophy, Settings, Users, Lock, Play, Check } from 'lucide-react';
import Logo from '../components/Logo';
import { BLOQUES, PERSONAJES } from '../lib/content';
import { isWeekUnlocked, weekProgress, conteoSemana } from '../lib/store';
import { sfx } from '../lib/audio';
import { tdVoice } from '../lib/td-voice';
import type { Perfil } from '../lib/types';

export default function HomeMap({
  perfil,
  onSelectWeek,
  onProgress,
  onParent,
  onSettings,
}: {
  perfil: Perfil;
  onSelectWeek: (semana: number) => void;
  onProgress: () => void;
  onParent: () => void;
  onSettings: () => void;
}) {
  const pj = PERSONAJES.find((p) => p.id === perfil.personaje) ?? PERSONAJES[0];
  const totalDone = useMemo(() => {
    return (['lectura', 'escritura', 'suma', 'resta'] as const).reduce((acc, m) => acc + perfil.progreso.actividadesCompletadas[m].length, 0);
  }, [perfil]);

  const jugar = (semana: number) => {
    if (!isWeekUnlocked(perfil, semana)) {
      sfx.error();
      tdVoice.speak('Esta semana aún está bloqueada. Completa la anterior para abrirla.');
      return;
    }
    sfx.pop();
    tdVoice.stop();
    onSelectWeek(semana);
  };

  return (
    <div className="min-h-dvh bg-gradient-to-b from-sky-300 via-sky-100 to-amber-50 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b-2 border-sky-200/60 bg-white/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4">
          <Logo size={44} />
          <div className={`flex items-center gap-2 rounded-full bg-gradient-to-r ${pj.gradiente} py-1 pl-1 pr-3 text-white shadow`}>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/25 text-2xl">{pj.emoji}</span>
            <div className="leading-tight">
              <div className="font-display text-sm font-black">{perfil.nombre}</div>
              <div className="text-[10px] font-bold opacity-90">Semana {perfil.progreso.semanaActual} · Bloque {perfil.progreso.bloqueActual}</div>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1.5 text-sm font-black text-amber-700">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {perfil.progreso.estrellas}
            </span>
            <span className="hidden items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1.5 text-sm font-black text-orange-700 sm:flex">
              <Coins className="h-4 w-4" /> {perfil.progreso.monedas}
            </span>
            <span className="hidden items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1.5 text-sm font-black text-rose-700 md:flex">
              <Flame className="h-4 w-4" /> {perfil.progreso.rachaDias}
            </span>
          </div>
        </div>
        <div className="mx-auto flex w-full max-w-3xl items-center gap-2 px-3 pb-2 sm:px-4">
          <button onClick={() => { sfx.click(); onProgress(); }} className="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-b from-violet-500 to-purple-600 text-sm font-black text-white shadow active:scale-95">
            <Trophy className="h-4 w-4" /> Mis premios
          </button>
          <button onClick={() => { sfx.click(); onParent(); }} className="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-2xl bg-slate-700 text-sm font-black text-white shadow active:scale-95">
            <Users className="h-4 w-4" /> Adultos
          </button>
          <button onClick={() => { sfx.click(); onSettings(); }} className="flex min-h-[44px] w-12 items-center justify-center rounded-2xl bg-white text-slate-600 shadow ring-2 ring-slate-100 active:scale-95" aria-label="Ajustes">
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl px-3 sm:px-4">
        {/* Banner actual */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 overflow-hidden rounded-3xl bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 p-4 text-white shadow-xl"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-widest opacity-80">Tu aventura · {totalDone}/480 actividades</p>
              <h2 className="font-display text-2xl font-black">Mapa de aventura 🗺️</h2>
              <p className="text-sm font-semibold opacity-90">Sigue el camino y desbloquea semanas con TD.</p>
            </div>
            <button
              onClick={() => jugar(perfil.progreso.semanaActual)}
              className="font-display flex min-h-[56px] shrink-0 items-center gap-2 rounded-2xl bg-amber-400 px-5 text-lg font-black text-amber-950 shadow-lg transition active:scale-95"
            >
              <Play className="h-5 w-5 fill-amber-950" /> Jugar
            </button>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/25">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-yellow-400 transition-all" style={{ width: `${Math.min(100, (totalDone / 480) * 100)}%` }} />
          </div>
        </motion.div>

        {/* Bloques */}
        {BLOQUES.map((b, bi) => (
          <section key={b.num} className="mt-6">
            <div className={`flex items-center gap-3 rounded-3xl bg-gradient-to-r ${b.color} p-3 text-white shadow-lg`}>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/25 text-3xl">{b.emoji}</span>
              <div>
                <h3 className="font-display text-lg font-black leading-tight">Bloque {b.num}: {b.nombre}</h3>
                <p className="text-xs font-bold opacity-90">{b.descripcion}</p>
              </div>
              <span className="ml-auto rounded-full bg-white/25 px-3 py-1 text-xs font-black">Sem {b.semanas[0]}–{b.semanas[5]}</span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {b.semanas.map((sem, i) => {
                const unlocked = isWeekUnlocked(perfil, sem);
                const prog = weekProgress(perfil, sem);
                const isCurrent = sem === perfil.progreso.semanaActual;
                const done = prog.done >= 16;
                return (
                  <motion.button
                    key={sem}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (bi * 6 + i) * 0.015 }}
                    onClick={() => jugar(sem)}
                    className={`relative overflow-hidden rounded-3xl p-3 text-left shadow-lg transition active:scale-[0.97] ${
                      done
                        ? 'bg-gradient-to-b from-green-400 to-emerald-600 text-white'
                        : isCurrent
                          ? 'bg-white text-slate-800 ring-4 ring-amber-300'
                          : unlocked
                            ? 'bg-white text-slate-800 ring-2 ring-sky-100'
                            : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isCurrent && !done && (
                      <span className="absolute right-2 top-2 animate-pulse rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black uppercase text-amber-950">
                        ¡Aquí!
                      </span>
                    )}
                    <div className="flex items-center gap-2">
                      <span className={`flex h-11 w-11 items-center justify-center rounded-2xl text-2xl font-black ${done ? 'bg-white/25 text-white' : unlocked ? 'bg-sky-100' : 'bg-slate-200'}`}>
                        {done ? <Check className="h-6 w-6" strokeWidth={3.5} /> : unlocked ? `S${sem}` : <Lock className="h-5 w-5" />}
                      </span>
                      <div>
                        <div className="font-display text-base font-black leading-tight">Semana {sem}</div>
                        <div className={`text-[11px] font-bold ${done ? 'text-white/90' : 'text-slate-500'}`}>
                          {done ? '¡Completada! 🎉' : unlocked ? `${prog.done}/20 sesiones` : 'Bloqueada 🔒'}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex gap-1">
                      {(['lectura', 'escritura', 'suma', 'resta'] as const).map((m) => {
                        const n = Math.min(5, conteoSemana(perfil, m, sem));
                        return (
                          <span key={m} className={`flex h-10 flex-1 flex-col items-center justify-center rounded-lg leading-none ${n >= 5 ? 'bg-white text-emerald-700' : done ? 'bg-white/30 text-white' : unlocked ? 'bg-sky-50 text-sky-700' : 'bg-slate-200 text-slate-400 opacity-70'}`}>
                            <span className="text-sm">{m === 'lectura' ? '📖' : m === 'escritura' ? '✏️' : m === 'suma' ? '➕' : '➖'}</span>
                            <span className="mt-0.5 text-[9px] font-black">{n}/5</span>
                          </span>
                        );
                      })}
                    </div>
                    {unlocked && !done && (
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500" style={{ width: `${(prog.done / 4) * 100}%` }} />
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </section>
        ))}

        <p className="mt-8 text-center text-xs font-bold text-slate-400">
          Completa al menos 2 sesiones para desbloquear la siguiente semana 🔓 · 1 hora diaria ≈ 4 sesiones
        </p>
      </div>
    </div>
  );
}
