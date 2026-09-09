import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Volume2, Lightbulb, RotateCcw, Home, Star, Coins, PartyPopper, Eye } from 'lucide-react';
import type { ActividadDef, Ejercicio, FaseActividad, Perfil } from '../lib/types';
import { PRAISE, TRY_AGAIN } from '../lib/content';
import { tdVoice } from '../lib/td-voice';
import { sfx } from '../lib/audio';
import TDRobot from '../components/TDRobot';
import TracingCanvas from '../components/TracingCanvas';
import { LecturaView, MatesView, EscrituraView } from '../components/ExerciseViews';
import { instruccionPara, splitPalabra } from '../lib/trazos';
import confetti from 'canvas-confetti';

export interface ResultadoActividad {
  actividadId: string;
  aciertos: number;
  intentos: number;
  precision: number;
  estrellas: number;
  monedas: number;
  superoUmbral: boolean;
}

const FASES: { id: FaseActividad; nombre: string; emoji: string }[] = [
  { id: 'intro', nombre: 'Intro', emoji: '👋' },
  { id: 'ejemplo', nombre: 'Ejemplo', emoji: '👀' },
  { id: 'guiada', nombre: 'Con ayuda', emoji: '🤝' },
  { id: 'independiente', nombre: 'Tú solo', emoji: '🚀' },
];

export default function ActivityRunner({
  perfil,
  actividad,
  yaVioIntro,
  onExit,
  onComplete,
  say,
}: {
  perfil: Perfil;
  actividad: ActividadDef;
  yaVioIntro: boolean;
  onExit: () => void;
  onComplete: (r: ResultadoActividad) => void;
  say: (texto: string, mood?: 'feliz' | 'hablando' | 'pensando' | 'fiesta' | 'durmiendo' | 'triste') => void;
}) {
  const [fase, setFase] = useState<FaseActividad>(yaVioIntro ? 'intro-check' : 'intro');
  const [pasoEjemplo, setPasoEjemplo] = useState(0);
  const [idxGuiada, setIdxGuiada] = useState(0);
  const [idxIndep, setIdxIndep] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [intentos, setIntentos] = useState(0);
  const [erroresSeguidos, setErroresSeguidos] = useState(0);
  const [mostrarPista, setMostrarPista] = useState(false);
  const [bloqueado, setBloqueado] = useState(false);
  const [resultado, setResultado] = useState<ResultadoActividad | null>(null);
  const ejemploAnimKey = useRef(0);

  const totalEj = actividad.practicaGuiada.length + actividad.practicaIndependiente.length;
  const progreso = useMemo(() => {
    if (fase === 'intro' || fase === 'intro-check') return 0.05;
    if (fase === 'ejemplo') return 0.2 + (pasoEjemplo / actividad.ejemploModelado.pasos.length) * 0.15;
    if (fase === 'guiada') return 0.35 + (idxGuiada / totalEj) * 0.2;
    if (fase === 'independiente') return 0.5 + ((actividad.practicaGuiada.length + idxIndep) / totalEj) * 0.45;
    return 1;
  }, [fase, pasoEjemplo, idxGuiada, idxIndep, actividad, totalEj]);

  // ---- Fase: intro ----
  useEffect(() => {
    if (fase === 'intro') {
      setPasoEjemplo(0);
      const texto = `${actividad.introduccion.texto} ${actividad.introduccion.paraQueSirve}`;
      say(texto);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase]);

  // ---- Fase: ejemplo ----
  useEffect(() => {
    if (fase === 'ejemplo') {
      ejemploAnimKey.current++;
      const paso = actividad.ejemploModelado.pasos[pasoEjemplo];
      if (paso) {
        let extra = '';
        if (actividad.tipo === 'escritura') {
          const letras = splitPalabra((actividad.practicaGuiada[0] as unknown as { caracter: string }).caracter ?? 'A');
          extra = ` ${instruccionPara(letras[0])}`;
        }
        say(paso.texto + (pasoEjemplo === 0 ? extra : ''));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase, pasoEjemplo]);

  // ---- Fase: práctica ----
  useEffect(() => {
    if (fase === 'guiada') {
      setMostrarPista(true);
      say(`Ahora inténtalo tú. ${actividad.practicaGuiada[idxGuiada]?.consigna ?? ''} Te ayudo.`);
    }
    if (fase === 'independiente') {
      setMostrarPista(false);
      say(`¡Tú solo! ${actividad.practicaIndependiente[idxIndep]?.consigna ?? ''}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase, idxGuiada, idxIndep]);

  // Pista automática tras 2-3 errores
  useEffect(() => {
    if (erroresSeguidos >= 2 && (fase === 'guiada' || fase === 'independiente')) {
      setMostrarPista(true);
      const ej = fase === 'guiada' ? actividad.practicaGuiada[idxGuiada] : actividad.practicaIndependiente[idxIndep];
      if (ej?.pista && erroresSeguidos === 2) {
        tdVoice.speak(`Te doy una pista. ${ej.pista}`);
      }
    }
  }, [erroresSeguidos, fase, actividad, idxGuiada, idxIndep]);

  const irEjemplo = () => { sfx.pop(); setFase('ejemplo'); setPasoEjemplo(0); };
  const siguientePasoEjemplo = () => {
    sfx.pop();
    if (pasoEjemplo < actividad.ejemploModelado.pasos.length - 1) {
      setPasoEjemplo(pasoEjemplo + 1);
    } else {
      setFase('guiada');
      setIdxGuiada(0);
    }
  };

  const responder = (ok: boolean) => {
    setIntentos((i) => i + 1);
    if (ok) {
      setAciertos((a) => a + 1);
      setErroresSeguidos(0);
      setBloqueado(true);
      const praise = PRAISE[Math.floor(Math.random() * PRAISE.length)];
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 }, disableForReducedMotion: true });
      setTimeout(() => {
        setBloqueado(false);
        if (fase === 'guiada') {
          if (idxGuiada < actividad.practicaGuiada.length - 1) setIdxGuiada(idxGuiada + 1);
          else { setFase('independiente'); setIdxIndep(0); }
        } else if (fase === 'independiente') {
          if (idxIndep < actividad.practicaIndependiente.length - 1) setIdxIndep(idxIndep + 1);
          else finalizar(aciertos + 1, intentos + 1);
        }
      }, 1100);
      void praise;
    } else {
      setErroresSeguidos((e) => e + 1);
      if (erroresSeguidos + 1 >= 3) {
        tdVoice.speak(TRY_AGAIN[Math.floor(Math.random() * TRY_AGAIN.length)]);
      }
    }
  };

  const responderEscritura = (ok: boolean) => {
    responder(ok);
  };

  const finalizar = (ac: number, inten: number) => {
    const precision = inten === 0 ? 0 : ac / inten;
    const estrellas = precision >= 0.9 ? 3 : precision >= 0.7 ? 2 : 1;
    const monedas = ac * 2 + estrellas * 2;
    const superoUmbral = precision >= actividad.umbralAvance;
    const r: ResultadoActividad = { actividadId: actividad.id, aciertos: ac, intentos: inten, precision, estrellas, monedas, superoUmbral };
    setResultado(r);
    setFase('celebramiento');
    sfx.fanfare();
    confetti({ particleCount: 180, spread: 110, origin: { y: 0.5 } });
    setTimeout(() => confetti({ particleCount: 80, angle: 60, spread: 60, origin: { x: 0 } }), 400);
    setTimeout(() => confetti({ particleCount: 80, angle: 120, spread: 60, origin: { x: 1 } }), 700);
    say(superoUmbral
      ? `¡Felicidades ${perfil.nombre}! Ganaste ${estrellas} estrellas y ${monedas} monedas. ¡Eres increíble!`
      : `¡Buen trabajo ${perfil.nombre}! Ganaste ${estrellas} estrella. Practica otra vez para ganar más.`, 'fiesta');
  };

  const ejercicioActual: Ejercicio | null =
    fase === 'guiada' ? actividad.practicaGuiada[idxGuiada] ?? null
    : fase === 'independiente' ? actividad.practicaIndependiente[idxIndep] ?? null
    : null;

  return (
    <div className="min-h-dvh bg-gradient-to-b from-sky-200 via-sky-50 to-amber-50 pb-40">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b-2 border-sky-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-2 px-3 py-2.5 sm:px-4">
          <button onClick={() => { tdVoice.stop(); onExit(); }} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-700 shadow ring-2 ring-slate-100 active:scale-95" aria-label="Salir de la actividad">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="font-display truncate text-base font-black text-slate-900 sm:text-lg">
              {actividad.icono} {actividad.titulo}
            </h1>
            <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-slate-100">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-sky-400 via-violet-400 to-amber-400" animate={{ width: `${Math.round(progreso * 100)}%` }} />
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1.5 text-sm font-black text-amber-700">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {aciertos}
          </div>
        </div>
        {/* Pasos del patrón pedagógico */}
        <div className="mx-auto flex w-full max-w-2xl items-center gap-1 px-3 pb-2 sm:px-4">
          {FASES.map((f) => {
            const orden = ['intro', 'ejemplo', 'guiada', 'independiente'];
            const cur = orden.indexOf(fase === 'intro-check' || fase === 'celebramiento' ? 'intro' : fase);
            const idx = orden.indexOf(f.id);
            const activo = fase === f.id || (fase === 'intro-check' && f.id === 'intro');
            const pasado = idx < cur || fase === 'celebramiento';
            return (
              <div key={f.id} className={`flex flex-1 items-center justify-center gap-1 rounded-full px-1 py-1 text-[10px] font-black uppercase tracking-wide sm:text-[11px] ${activo ? 'bg-sky-500 text-white shadow' : pasado ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                <span>{f.emoji}</span>
                <span className="hidden sm:inline">{f.nombre}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl px-3 pt-4 sm:px-4">
        <AnimatePresence mode="wait">
          {/* 0. INTRO-CHECK (ya vista antes) */}
          {fase === 'intro-check' && (
            <motion.div key="check" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="rounded-3xl bg-white p-6 text-center shadow-xl">
              <TDRobot mood="feliz" size={90} />
              <h2 className="font-display mt-2 text-xl font-black text-sky-950 sm:text-2xl">¡Ya conoces esta actividad! 🌟</h2>
              <p className="font-body mt-1 font-bold text-slate-600">¿Quieres que TD te lo recuerde con el ejemplo?</p>
              <div className="mt-4 grid gap-2">
                <button onClick={() => { sfx.pop(); setFase('guiada'); setIdxGuiada(0); }} className="font-display flex min-h-[60px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-green-400 to-emerald-600 text-lg font-black text-white shadow-lg active:scale-[0.98]">
                  ¡No, a jugar! 🚀
                </button>
                <button onClick={() => { sfx.click(); setFase('intro'); }} className="font-display flex min-h-[56px] items-center justify-center gap-2 rounded-2xl bg-sky-100 text-lg font-black text-sky-700 active:scale-[0.98]">
                  <Eye className="h-5 w-5" /> Sí, recuérdame
                </button>
              </div>
            </motion.div>
          )}

          {/* 1. INTRODUCCIÓN */}
          {fase === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="overflow-hidden rounded-3xl bg-white shadow-xl">
              <div className={`bg-gradient-to-r ${actividad.color} p-5 text-white`}>
                <div className="flex items-center gap-3">
                  <span className="text-6xl drop-shadow">{actividad.icono}</span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest opacity-80">Paso 1 · Introducción 👋</p>
                    <h2 className="font-display text-2xl font-black leading-tight">{actividad.titulo}</h2>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div className="rounded-2xl bg-sky-50 p-4 ring-1 ring-sky-100">
                  <p className="font-body text-lg font-bold leading-relaxed text-slate-800">🤖 {actividad.introduccion.texto}</p>
                </div>
                <div className="mt-3 rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200">
                  <p className="font-body text-base font-bold text-amber-900">🌟 ¿Para qué sirve? {actividad.introduccion.paraQueSirve}</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => { sfx.click(); say(`${actividad.introduccion.texto} ${actividad.introduccion.paraQueSirve}`); }} className="flex min-h-[56px] items-center justify-center gap-2 rounded-2xl bg-sky-100 px-5 font-display text-base font-black text-sky-700 active:scale-95">
                    <Volume2 className="h-5 w-5" /> Oír
                  </button>
                  <button onClick={irEjemplo} className={`font-display flex min-h-[56px] flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r ${actividad.color} text-lg font-black text-white shadow-lg active:scale-[0.98]`}>
                    ¡Vamos al ejemplo! <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* 2. EJEMPLO MODELADO */}
          {fase === 'ejemplo' && (
            <motion.div key={`ej-${pasoEjemplo}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="overflow-hidden rounded-3xl bg-white shadow-xl">
              <div className="flex items-center justify-between bg-violet-500 p-4 text-white">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest opacity-80">Paso 2 · Ejemplo de TD 👀</p>
                  <h2 className="font-display text-xl font-black">Mira cómo lo hago</h2>
                </div>
                <span className="rounded-full bg-white/25 px-3 py-1 text-sm font-black">{pasoEjemplo + 1}/{actividad.ejemploModelado.pasos.length}</span>
              </div>
              <div className="p-5">
                <EjemploVisual actividad={actividad} paso={pasoEjemplo} animKey={ejemploAnimKey.current} />
                <div className="mt-4 rounded-2xl bg-violet-50 p-4 ring-1 ring-violet-100">
                  <p className="font-body text-lg font-bold leading-relaxed text-slate-800">
                    🤖 {actividad.ejemploModelado.pasos[pasoEjemplo]?.texto}
                  </p>
                </div>
                <div className="mt-2 flex justify-center gap-1.5">
                  {actividad.ejemploModelado.pasos.map((_, i) => (
                    <span key={i} className={`h-2.5 rounded-full transition-all ${i === pasoEjemplo ? 'w-8 bg-violet-500' : i < pasoEjemplo ? 'w-2.5 bg-green-400' : 'w-2.5 bg-slate-200'}`} />
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => { const p = actividad.ejemploModelado.pasos[pasoEjemplo]; if (p) say(p.texto); }} className="flex min-h-[56px] items-center justify-center gap-2 rounded-2xl bg-violet-100 px-5 font-display text-base font-black text-violet-700 active:scale-95">
                    <Volume2 className="h-5 w-5" /> Oír
                  </button>
                  <button onClick={siguientePasoEjemplo} className="font-display flex min-h-[56px] flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-violet-500 to-purple-600 text-lg font-black text-white shadow-lg active:scale-[0.98]">
                    {pasoEjemplo === actividad.ejemploModelado.pasos.length - 1 ? '¡Ahora yo! 🤝' : 'Siguiente'} <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* 3 y 4. PRÁCTICA */}
          {(fase === 'guiada' || fase === 'independiente') && ejercicioActual && (
            <motion.div key={ejercicioActual.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="rounded-3xl bg-white p-4 shadow-xl sm:p-5">
              <div className={`mb-3 flex items-center justify-between gap-2 rounded-2xl p-2.5 text-white sm:p-3 ${fase === 'guiada' ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gradient-to-r from-orange-500 to-rose-500'}`}>
                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-90 sm:text-[11px]">
                    {fase === 'guiada' ? `Paso 3 · Juntos 🤝 (${idxGuiada + 1}/${actividad.practicaGuiada.length})` : `Paso 4 · Tú solo 🚀 (${idxIndep + 1}/${actividad.practicaIndependiente.length})`}
                  </p>
                  <h2 className="font-display text-lg font-black leading-snug">{ejercicioActual.consigna}</h2>
                </div>
                <button
                  onClick={() => { setFase('ejemplo'); setPasoEjemplo(0); sfx.click(); }}
                  className="flex shrink-0 flex-col items-center gap-0.5 rounded-2xl bg-white/20 px-3 py-2 text-[11px] font-black uppercase active:scale-95"
                  title="¿Quieres que TD te lo recuerde?"
                >
                  <Eye className="h-5 w-5" /> Recuerda
                </button>
              </div>

              {erroresSeguidos >= 2 && (
                <div className="mb-3 flex items-center gap-2 rounded-2xl bg-sky-50 p-2.5 text-sm font-bold text-sky-800 ring-1 ring-sky-200">
                  <Lightbulb className="h-5 w-5 shrink-0 text-sky-600" />
                  TD te ayuda: mira la pista amarilla y respira. ¡Tú puedes! 💪
                </div>
              )}

              {ejercicioActual.categoria === 'lectura' && (
                <LecturaView ejercicio={ejercicioActual} mostrarPista={mostrarPista} erroresSeguidos={erroresSeguidos} onResponder={responder} disabled={bloqueado} />
              )}
              {(ejercicioActual.categoria === 'suma' || ejercicioActual.categoria === 'resta') && (
                <MatesView ejercicio={ejercicioActual} mostrarPista={mostrarPista} erroresSeguidos={erroresSeguidos} onResponder={responder} disabled={bloqueado} />
              )}
              {ejercicioActual.categoria === 'escritura' && (
                <EscrituraView ejercicio={ejercicioActual} modoGuia={fase === 'guiada'} onResponder={responderEscritura} />
              )}
            </motion.div>
          )}

          {/* 5. CELEBRACIÓN */}
          {fase === 'celebramiento' && resultado && (
            <motion.div key="fin" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="rounded-3xl bg-white p-6 text-center shadow-xl">
              <TDRobot mood="fiesta" size={100} />
              <h2 className="font-display mt-2 flex items-center justify-center gap-1.5 text-2xl font-black text-slate-900 sm:gap-2 sm:text-3xl">
                <PartyPopper className="h-7 w-7 text-rose-500" /> ¡Genial!
              </h2>
              <div className="mt-3 flex justify-center gap-2">
                {[1, 2, 3].map((s) => (
                  <motion.span
                    key={s}
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3 + s * 0.25, type: 'spring' }}
                    className={`text-5xl ${s <= resultado.estrellas ? '' : 'opacity-20 grayscale'}`}
                  >
                    ⭐
                  </motion.span>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-2xl bg-amber-50 p-3 ring-1 ring-amber-200">
                  <Star className="mx-auto h-5 w-5 fill-amber-400 text-amber-400" />
                  <div className="font-display text-xl font-black text-amber-700">{resultado.estrellas}</div>
                  <div className="text-[10px] font-black uppercase text-amber-600">Estrellas</div>
                </div>
                <div className="rounded-2xl bg-orange-50 p-3 ring-1 ring-orange-200">
                  <Coins className="mx-auto h-5 w-5 text-orange-500" />
                  <div className="font-display text-xl font-black text-orange-700">{resultado.monedas}</div>
                  <div className="text-[10px] font-black uppercase text-orange-600">Monedas</div>
                </div>
                <div className="rounded-2xl bg-green-50 p-3 ring-1 ring-green-200">
                  <div className="font-display text-xl font-black text-green-700">{Math.round(resultado.precision * 100)}%</div>
                  <div className="text-[10px] font-black uppercase text-green-600">Aciertos</div>
                </div>
              </div>
              <p className="mt-3 text-sm font-bold text-slate-500">
                {resultado.superoUmbral ? '¡Superaste el reto! TD está muy orgulloso. 🌟' : 'Buen intento. Juega otra vez para dominarlo. 💪'}
              </p>
              <div className="mt-4 grid gap-2">
                <button onClick={() => { sfx.pop(); tdVoice.stop(); onComplete(resultado); }} className="font-display flex min-h-[60px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-sky-500 to-blue-600 text-lg font-black text-white shadow-lg active:scale-[0.98]">
                  <Home className="h-5 w-5" /> Seguir jugando
                </button>
                <button onClick={() => { sfx.click(); setFase('guiada'); setIdxGuiada(0); setIdxIndep(0); setAciertos(0); setIntentos(0); setErroresSeguidos(0); setResultado(null); }} className="font-display flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-slate-100 text-base font-black text-slate-600 active:scale-[0.98]">
                  <RotateCcw className="h-5 w-5" /> Jugar otra vez
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ---------- Visual del ejemplo modelado ----------
function EjemploVisual({ actividad, paso, animKey }: { actividad: ActividadDef; paso: number; animKey: number }) {
  if (actividad.tipo === 'suma' || actividad.tipo === 'resta') {
    const ej = actividad.practicaGuiada[0] as unknown as { a: number; b: number; emoji: string; categoria: string };
    const esSuma = actividad.tipo === 'suma';
    const total = esSuma ? ej.a + ej.b : ej.a - ej.b;
    return (
      <div className="rounded-3xl bg-gradient-to-b from-amber-50 to-white p-4 ring-2 ring-amber-100">
        <div className="flex items-start justify-center gap-2 sm:gap-4">
          {/* Grupo A */}
          <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: paso >= 0 ? 1 : 0.25, scale: 1 }} className="rounded-2xl bg-sky-100 p-2 text-center">
            <div className="flex max-w-[120px] flex-wrap justify-center gap-0.5">
              {Array.from({ length: ej.a }).map((_, i) => (
                <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: paso >= 0 ? 1 : 0 }} transition={{ delay: i * 0.15 }} className="text-2xl sm:text-3xl">{ej.emoji}</motion.span>
              ))}
            </div>
            <div className="font-display text-xl font-black text-sky-700">{ej.a}</div>
          </motion.div>
          <div className={`mt-6 flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl font-black text-white shadow ${esSuma ? 'bg-orange-500' : 'bg-sky-500'}`}>
            {esSuma ? '+' : '−'}
          </div>
          {/* Grupo B */}
          <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: paso >= 1 ? 1 : 0.25, scale: 1 }} className="rounded-2xl bg-violet-100 p-2 text-center">
            <div className="flex max-w-[120px] flex-wrap justify-center gap-0.5">
              {Array.from({ length: ej.b }).map((_, i) => (
                <motion.span key={i} initial={{ scale: 0, x: 30 }} animate={{ scale: paso >= 1 ? 1 : 0, x: 0 }} transition={{ delay: i * 0.15 }} className={`text-2xl sm:text-3xl ${!esSuma && paso >= 1 ? 'opacity-30 grayscale' : ''}`}>{ej.emoji}</motion.span>
              ))}
            </div>
            <div className="font-display text-xl font-black text-violet-700">{ej.b}</div>
          </motion.div>
          <div className="mt-6 text-2xl font-black text-slate-400">=</div>
          <motion.div animate={{ opacity: paso >= 3 ? 1 : 0.25, scale: paso >= 3 ? [1, 1.2, 1] : 1 }} className="rounded-2xl bg-green-100 p-2 text-center">
            <div className="font-display px-2 text-4xl font-black text-green-700">{paso >= 3 ? total : '?'}</div>
            <div className="text-[10px] font-black uppercase text-green-600">Total</div>
          </motion.div>
        </div>
        {paso === 2 && (
          <motion.p className="mt-2 text-center font-display text-lg font-black text-amber-700" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            🔢 Contamos: {esSuma ? Array.from({ length: total }, (_, i) => i + 1).join(' · ') : total > 0 ? Array.from({ length: total }, (_, i) => i + 1).join(' · ') : '¡cero!'}
          </motion.p>
        )}
      </div>
    );
  }

  if (actividad.tipo === 'escritura') {
    const car = (actividad.practicaGuiada[0] as unknown as { caracter: string }).caracter ?? 'A';
    const primera = splitPalabra(car)[0] ?? 'A';
    return (
      <div className="pointer-events-none rounded-3xl bg-amber-50 p-2 ring-2 ring-amber-100">
        <p className="pb-1 text-center text-xs font-black uppercase tracking-widest text-amber-600">🪄 El lápiz mágico dibuja… ¡mira!</p>
        <TracingCanvas caracter={primera} modoGuia resetKey={animKey} mostrarAnimacion onComplete={() => {}} />
      </div>
    );
  }

  // Lectura
  const pasoData = actividad.ejemploModelado.pasos[paso];
  return (
    <div className="rounded-3xl bg-gradient-to-b from-sky-50 to-white p-6 text-center ring-2 ring-sky-100">
      <motion.div
        key={paso}
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="font-display text-5xl font-black text-sky-950 sm:text-6xl"
      >
        {pasoData?.visual ?? '📖'}
      </motion.div>
      <p className="mt-2 text-sm font-bold text-slate-500">{actividad.ejemploModelado.descripcion}</p>
    </div>
  );
}
