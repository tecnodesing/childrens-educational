import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Coins, Flame, Clock, Target, Lock } from 'lucide-react';
import { INSIGNIAS, PERSONAJES, MATERIAS } from '../lib/content';
import { sfx } from '../lib/audio';
import { tdVoice } from '../lib/td-voice';
import TDRobot from '../components/TDRobot';
import type { Perfil } from '../lib/types';

export default function ProgressScreen({ perfil, onBack }: { perfil: Perfil; onBack: () => void }) {
  const pj = PERSONAJES.find((p) => p.id === perfil.personaje) ?? PERSONAJES[0];
  const precision = perfil.progreso.intentosTotales === 0 ? 0 : Math.round((perfil.progreso.aciertosTotales / perfil.progreso.intentosTotales) * 100);

  // Mascota evolutiva
  const estrellas = perfil.progreso.estrellas;
  const etapa = estrellas >= 60 ? 3 : estrellas >= 25 ? 2 : estrellas >= 8 ? 1 : 0;
  const etapas = [
    { emoji: '🥚', nombre: 'Huevito', msg: 'Gana 8 ⭐ para que nazca tu mascota' },
    { emoji: '🐣', nombre: 'Bebé', msg: 'Gana 25 ⭐ para que crezca' },
    { emoji: pj.emoji, nombre: pj.nombre, msg: '¡Tu compañero crece contigo! Llega a 60 ⭐' },
    { emoji: pj.emoji, nombre: `Súper ${pj.nombre}`, msg: '¡Mascota legendaria! 🌟' },
  ];

  useEffect(() => {
    const t = setTimeout(() => {
      tdVoice.speak(`¡Mira todo lo que lograste ${perfil.nombre}! Tienes ${estrellas} estrellas y ${perfil.progreso.insignias.length} insignias.`);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-gradient-to-b from-violet-200 via-purple-50 to-amber-50">
      <div className="shrink-0 border-b-2 border-violet-100 bg-white/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-3 py-3 sm:px-4">
          <button onClick={() => { sfx.click(); tdVoice.stop(); onBack(); }} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-700 shadow ring-2 ring-slate-100 active:scale-95" aria-label="Volver">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="font-display text-xl font-black text-slate-900">Mis premios 🏆</h1>
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-3 pt-4 pb-8 sm:px-4">
        {/* Héroe */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={`rounded-3xl bg-gradient-to-br ${pj.gradiente} p-4 text-white shadow-xl sm:p-5`}>
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-white/25 text-4xl sm:h-20 sm:w-20 sm:text-5xl">{pj.emoji}</span>
            <div className="min-w-0">
              <h2 className="font-display truncate text-xl font-black sm:text-2xl">{perfil.nombre}</h2>
              <p className="truncate text-xs font-bold opacity-90 sm:text-sm">{pj.nombre} · Sem {perfil.progreso.semanaActual} · Blq {perfil.progreso.bloqueActual}</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-1.5 sm:mt-4 sm:gap-2">
            {[
              { icon: <Star className="h-4 w-4 fill-amber-300 text-amber-300" />, v: estrellas, l: 'Estrellas' },
              { icon: <Coins className="h-4 w-4" />, v: perfil.progreso.monedas, l: 'Monedas' },
              { icon: <Flame className="h-4 w-4" />, v: perfil.progreso.rachaDias, l: 'Racha' },
              { icon: <Target className="h-4 w-4" />, v: `${precision}%`, l: 'Aciertos' },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl bg-white/20 p-1.5 text-center sm:p-2">
                <div className="flex items-center justify-center gap-0.5 font-display text-base font-black sm:gap-1 sm:text-lg">{s.icon} {s.v}</div>
                <div className="text-[10px] font-black uppercase opacity-80">{s.l}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Mascota */}
        <div className="mt-3 rounded-3xl bg-white p-4 shadow-lg">
          <h3 className="font-display text-lg font-black text-slate-900">Mi mascota 🐾</h3>
          <div className="mt-2 flex items-center gap-3 sm:gap-4">
            <motion.span animate={{ y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-6xl sm:text-7xl">
              {etapas[etapa].emoji}
            </motion.span>
            <div className="min-w-0">
              <p className="font-display text-lg font-black text-violet-700 sm:text-xl">{etapas[etapa].nombre}</p>
              <p className="text-sm font-bold text-slate-500">{etapas[etapa].msg}</p>
              <div className="mt-2 flex gap-1">
                {[0, 1, 2, 3].map((e) => (
                  <span key={e} className={`h-2.5 w-8 rounded-full ${e <= etapa ? 'bg-violet-500' : 'bg-slate-200'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Por materia */}
        <div className="mt-3 rounded-3xl bg-white p-4 shadow-lg">
          <h3 className="font-display text-lg font-black text-slate-900">Mi avance por materia 📊</h3>
          <div className="mt-3 space-y-2.5">
            {MATERIAS.map((m) => {
              const done = perfil.progreso.actividadesCompletadas[m.id].length;
              return (
                <div key={m.id}>
                  <div className="flex items-center justify-between text-sm font-black">
                    <span>{m.emoji} {m.nombre}</span>
                    <span className="text-slate-500">{done}/120</span>
                  </div>
                  <div className="mt-1 h-3 overflow-hidden rounded-full bg-slate-100">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(done / 120) * 100}%` }} className={`h-full rounded-full bg-gradient-to-r ${m.color}`} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-2xl bg-slate-50 p-2.5 text-sm font-bold text-slate-500">
            <Clock className="h-4 w-4" /> Tiempo jugando: ~{perfil.progreso.tiempoTotalMin} min
          </div>
        </div>

        {/* Insignias */}
        <div className="mt-3 rounded-3xl bg-white p-4 shadow-lg">
          <h3 className="font-display text-lg font-black text-slate-900">Insignias 🎖️ ({perfil.progreso.insignias.length}/{INSIGNIAS.length})</h3>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {INSIGNIAS.map((ins) => {
              const tiene = perfil.progreso.insignias.includes(ins.id);
              return (
                <div key={ins.id} className={`rounded-2xl p-3 text-center ring-2 ${tiene ? 'bg-gradient-to-b from-amber-50 to-yellow-100 ring-amber-300' : 'bg-slate-50 ring-slate-100 opacity-70'}`}>
                  <div className={`text-4xl ${tiene ? '' : 'grayscale opacity-50'}`}>{tiene ? ins.emoji : <span className="relative inline-block">{ins.emoji}<Lock className="absolute -bottom-1 -right-1 h-4 w-4 text-slate-400" /></span>}</div>
                  <div className="font-display mt-1 text-sm font-black text-slate-800">{ins.nombre}</div>
                  <div className="text-[11px] font-semibold text-slate-500">{tiene ? ins.descripcion : ins.condicion}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Historial */}
        {perfil.progreso.historialSemanal.length > 0 && (
          <div className="mt-3 rounded-3xl bg-white p-4 shadow-lg">
            <h3 className="font-display text-lg font-black text-slate-900">Mi historia 📜</h3>
            <div className="mt-2 space-y-1.5">
              {perfil.progreso.historialSemanal.slice(-5).reverse().map((h, i) => (
                <div key={i} className="flex items-center gap-2 rounded-2xl bg-sky-50 p-2 text-xs font-bold text-slate-700 sm:p-2.5 sm:text-sm">
                  <span className="text-lg sm:text-xl">🎉</span> <span className="min-w-0 truncate">Sem {h.semana}: {h.resumen}</span> <span className="ml-auto shrink-0 text-[10px] text-slate-400 sm:text-xs">{h.fecha}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 flex items-end gap-2">
          <TDRobot mood="fiesta" size={64} />
          <p className="flex-1 rounded-2xl rounded-bl-md bg-white p-3 text-sm font-bold text-slate-600 shadow">
            ¡Sigue así! Cada estrella te acerca al Castillo Lector. 🏰✨
          </p>
        </div>
      </div>
    </div>
  );
}
