import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Play, ArrowRight } from 'lucide-react';
import Logo from '../components/Logo';
import TDRobot from '../components/TDRobot';
import { PERSONAJES } from '../lib/content';

// ---------- Mockups en CSS (miniaturas de la app) ----------
function PhoneMock({ children, caption }: { children: React.ReactNode; caption?: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-56 rounded-[2rem] border-[7px] border-slate-800 bg-white p-1.5 shadow-2xl">
        <div className="mx-auto mb-1.5 h-1.5 w-16 rounded-full bg-slate-300" />
        <div className="h-80 overflow-hidden rounded-[1.4rem] bg-sky-50">{children}</div>
      </div>
      {caption && <p className="max-w-52 text-center text-xs font-bold text-slate-500">{caption}</p>}
    </div>
  );
}

function MockOnboarding() {
  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-sky-200 to-amber-50 p-3">
      <div className="flex items-center gap-2">
        <Logo size={34} />
        <div className="text-[9px] font-black uppercase tracking-wide text-sky-700">Aprende Jugando</div>
      </div>
      <div className="mt-2 flex items-end gap-1">
        <TDRobot mood="feliz" size={40} animate={false} />
        <div className="flex-1 rounded-xl rounded-bl-sm bg-white p-1.5 text-[8px] font-bold text-slate-600 shadow">
          ¡Hola! ¿Cómo te llamas? 👋
        </div>
      </div>
      <div className="mt-2 rounded-xl bg-white p-2 shadow">
        <div className="text-[7px] font-black uppercase text-sky-500">Mi nombre es</div>
        <div className="rounded-lg bg-sky-100 px-2 py-1 text-sm font-black text-sky-900">Sofía</div>
        <div className="mt-1.5 grid grid-cols-9 gap-0.5">
          {['S', 'O', 'F', 'Í', 'A'].map((c, i) => (
            <span key={i} className="flex h-5 items-center justify-center rounded bg-sky-500 text-[9px] font-black text-white">{c}</span>
          ))}
          {['A', 'B', 'C', 'D', 'E', 'M', 'P', 'U'].map((c) => (
            <span key={c} className="flex h-5 items-center justify-center rounded bg-sky-400 text-[9px] font-black text-white opacity-60">{c}</span>
          ))}
        </div>
        <div className="mt-1.5 flex items-center gap-1">
          {PERSONAJES.slice(0, 4).map((p) => (
            <span key={p.id} className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-b ${p.gradiente} text-sm ${p.id === 'dragon-azul' ? 'ring-2 ring-amber-400' : 'opacity-70'}`}>{p.emoji}</span>
          ))}
        </div>
      </div>
      <div className="mt-auto rounded-xl bg-orange-500 py-1.5 text-center text-[9px] font-black text-white">¡Empezar aventura! 🚀</div>
    </div>
  );
}

function MockMap() {
  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-sky-200 to-amber-50 p-2.5">
      <div className="flex items-center justify-between">
        <Logo size={26} />
        <div className="flex gap-1">
          <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[8px] font-black text-amber-700">⭐ 12</span>
          <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[8px] font-black text-rose-600">🔥 4</span>
        </div>
      </div>
      <div className="mt-2 rounded-xl bg-gradient-to-r from-green-400 to-emerald-600 p-1.5 text-white">
        <div className="text-[9px] font-black">Bloque 1 · Bosque Vocal 🌳</div>
        <div className="mt-1 grid grid-cols-3 gap-1">
          {['S1', 'S2', 'S3'].map((s, i) => (
            <div key={s} className={`rounded-lg p-1 ${i === 0 ? 'bg-white/90 text-green-700' : 'bg-white/25 text-white'}`}>
              <div className="text-[8px] font-black">{s === 'S1' ? '✓ ¡Lista!' : `Semana ${s[1]}`}</div>
              <div className="mt-0.5 flex gap-0.5 text-[7px]">📖️➕➖</div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-1.5 rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 p-1.5 text-white">
        <div className="text-[9px] font-black">Bloque 2 · Río de Sílabas 🌊</div>
        <div className="mt-1 text-[8px] opacity-80">Semana 7 en adelante…</div>
      </div>
      <div className="mt-1.5 rounded-xl bg-white/70 p-1.5 text-center text-[8px] font-black text-slate-400">⛰️ ⏳ · 🏰 ⏳</div>
    </div>
  );
}

function MockActividad() {
  return (
    <div className="flex h-full flex-col bg-sky-50 p-2.5">
      <div className="flex gap-0.5">
        {['👋', '👀', '🤝', '🚀'].map((e, i) => (
          <span key={i} className={`flex-1 rounded-full py-0.5 text-center text-[8px] font-black ${i < 2 ? 'bg-green-100 text-green-700' : 'bg-white text-slate-400'}`}>{e}</span>
        ))}
      </div>
      <div className="mt-2 rounded-xl bg-white p-2 shadow">
        <div className="text-center">
          <div className="text-[8px] font-black uppercase text-violet-600">Paso 2 · Ejemplo de TD</div>
          <div className="mt-1 flex items-center justify-center gap-1">
            <span className="text-lg">🍎🍎</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs font-black text-white">+</span>
            <span className="text-lg">🍎</span>
            <span className="text-xs font-black text-slate-400">=</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-green-100 text-sm font-black text-green-700">3</span>
          </div>
        </div>
        <div className="mt-1.5 rounded-lg bg-violet-50 p-1.5 text-[8px] font-bold text-slate-600">
          🤖 "¡2 más 1 es 3! Las contamos: uno, dos, tres."
        </div>
        <div className="mt-1.5 grid grid-cols-3 gap-1">
          {['2', '3', '4'].map((n) => (
            <span key={n} className={`rounded-lg py-1 text-center text-[11px] font-black ${n === '3' ? 'bg-green-400 text-white' : 'bg-slate-50 text-slate-600'}`}>{n}</span>
          ))}
        </div>
      </div>
      <div className="mt-auto flex items-end gap-1">
        <TDRobot mood="hablando" size={38} animate={false} />
        <div className="flex-1 rounded-xl rounded-bl-sm bg-white p-1.5 text-[8px] font-bold text-slate-600 shadow">¡Mira cómo lo hago! 👀</div>
      </div>
    </div>
  );
}

function MockPanel() {
  return (
    <div className="flex h-full flex-col bg-slate-100 p-2.5">
      <div className="rounded-xl bg-white p-2 shadow">
        <div className="text-[9px] font-black text-slate-800">👨‍‍👧 Panel del adulto</div>
        <div className="mt-1 grid grid-cols-4 gap-1 text-center">
          {[['⭐', '12'], ['🎯', '86%'], ['🔥', '4 días'], ['⏱️', '38 h']].map(([e, v]) => (
            <div key={v} className="rounded-lg bg-slate-50 p-1">
              <div className="text-[10px]">{e}</div>
              <div className="text-[8px] font-black text-slate-700">{v}</div>
            </div>
          ))}
        </div>
        <div className="mt-1.5 space-y-1">
          {[['📖 Leer', 60], ['✏️ Escribir', 45], ['➕ Sumar', 70], ['➖ Restar', 40]].map(([l, w]) => (
            <div key={l as string}>
              <div className="flex justify-between text-[7px] font-black text-slate-500"><span>{l}</span><span>120</span></div>
              <div className="h-1 rounded-full bg-slate-100"><div className="h-full rounded-full bg-sky-500" style={{ width: `${w}%` }} /></div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-1.5 rounded-xl bg-white p-2 shadow">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-black text-slate-800">🎙️ Voz de TD</span>
          <span className="rounded-full bg-sky-500 px-1.5 py-0.5 text-[7px] font-black text-white">Guardar</span>
        </div>
        <div className="mt-1 rounded-lg bg-sky-50 p-1.5 text-[8px] font-bold text-slate-600">Mónica · es-MX · local 📱</div>
        <div className="mt-1 flex items-center gap-1">
          <span className="text-[7px] font-black text-slate-400">Velocidad</span>
          <div className="h-1 flex-1 rounded-full bg-slate-200"><div className="h-full w-2/3 rounded-full bg-sky-500" /></div>
        </div>
      </div>
    </div>
  );
}

// ---------- Esquema de patrones ----------
function StepBadge({ n, emoji, titulo, desc, color }: { n: number; emoji: string; titulo: string; desc: string; color: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-white p-3 shadow ring-2 ring-slate-100">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b ${color} text-white shadow`}>
        <span className="text-sm font-black">{n}</span>
      </span>
      <div>
        <div className="font-display text-base font-black text-slate-900">{emoji} {titulo}</div>
        <p className="text-xs font-semibold text-slate-500">{desc}</p>
      </div>
    </div>
  );
}

export default function PresentationScreen({ onExit }: { onExit: () => void }) {
  const [idx, setIdx] = useState(0);
  const touchX = useRef<number | null>(null);
  const TOTAL = 11;

  const next = () => setIdx((i) => Math.min(TOTAL - 1, i + 1));
  const prev = () => setIdx((i) => Math.max(0, i - 1));

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'Escape') onExit();
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="flex h-dvh flex-col overflow-hidden bg-gradient-to-b from-indigo-50 via-sky-50 to-amber-50"
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (dx < -50) next();
        if (dx > 50) prev();
        touchX.current = null;
      }}
    >
      {/* Header */}
      <div className="border-b-2 border-indigo-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl items-center gap-2 px-3 py-3 sm:items-center sm:gap-3 sm:px-4">
          <Logo size={40} />
          <div className="min-w-0 flex-1">
            <h1 className="font-display truncate text-sm font-black leading-tight text-slate-900 sm:text-lg">Guía para padres de familia</h1>
            <p className="hidden text-xs font-bold text-slate-500 sm:block">Aprende Jugando con TD · Así funciona la aventura</p>
          </div>
          <button onClick={onExit} className="flex h-10 shrink-0 items-center gap-1.5 rounded-2xl bg-slate-100 px-2.5 text-xs font-black text-slate-600 active:scale-95 sm:h-11 sm:px-3 sm:text-sm">
            <X className="h-4 w-4" /> <span className="hidden sm:inline">Cerrar</span>
          </button>
        </div>
      </div>

      {/* Slide + Navegación */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col overflow-y-auto px-3 py-4 sm:px-4 sm:py-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25 }}
              className="flex min-h-full flex-col justify-start"
            >
            {idx === 0 && (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <Logo size={120} />
                <h2 className="font-display mt-4 text-2xl font-black text-slate-900 sm:text-4xl">
                  Aprende <span className="text-sky-500">Jugando</span> con TD
                </h2>
                <p className="mt-2 max-w-lg text-lg font-bold text-slate-600">
                  Tu hijo o hija de 6 años aprenderá a <b>leer, escribir, sumar y restar</b> en <b>6 meses</b>, jugando ~1 hora al día con su robot compañero.
                </p>
                <p className="mt-4 rounded-full bg-indigo-100 px-4 py-2 text-xs font-black text-indigo-700 sm:text-sm">Desliza o toca "Siguiente" para conocer el sistema →</p>
              </div>
            )}

            {idx === 1 && (
              <div className="flex flex-1 flex-col justify-center">
                <h2 className="font-display text-2xl font-black text-slate-900 sm:text-3xl">¿Qué vamos a lograr? 🎯</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {[
                    { e: '📖', t: 'Leer', d: 'De vocales a cuentos cortos con preguntas de comprensión', c: 'from-rose-400 to-pink-600' },
                    { e: '✏️', t: 'Escribir', d: 'Mayúsculas y minúsculas con trazo táctil evaluado', c: 'from-lime-400 to-green-600' },
                    { e: '➕', t: 'Sumar', d: 'Con objetos que se cuentan, hasta 20', c: 'from-orange-400 to-red-500' },
                    { e: '➖', t: 'Restar', d: 'Con objetos que desaparecen, hasta 20', c: 'from-cyan-400 to-blue-600' },
                  ].map((s) => (
                    <div key={s.t} className={`rounded-3xl bg-gradient-to-br ${s.c} p-4 text-white shadow-lg`}>
                      <div className="text-4xl">{s.e}</div>
                      <div className="font-display mt-1 text-xl font-black">{s.t}</div>
                      <div className="text-xs font-bold opacity-90">{s.d}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid gap-2 text-xs font-bold text-slate-600 sm:text-sm md:grid-cols-3">
                  <p className="rounded-2xl bg-white p-3 shadow ring-1 ring-slate-100">📅 <b>24 semanas</b> · ~1 hora diaria</p>
                  <p className="rounded-2xl bg-white p-3 shadow ring-1 ring-slate-100">📱 En el celular o tablet que ya tienen en casa</p>
                  <p className="rounded-2xl bg-white p-3 shadow ring-1 ring-slate-100">🔒 Sin contraseñas, sin anuncios; los datos no salen del equipo</p>
                </div>
              </div>
            )}

            {idx === 2 && (
              <div className="flex flex-1 flex-col items-center justify-start gap-5 py-4 md:flex-row md:items-center md:justify-center md:gap-10">
                <PhoneMock caption="Paso 1: escribe su nombre y elige su personaje"><MockOnboarding /></PhoneMock>
                <div className="max-w-md">
                  <h2 className="font-display text-2xl font-black text-slate-900 sm:text-3xl">El niño entra solo 🚪</h2>
                  <p className="mt-2 text-base font-semibold text-slate-600">Sin ayuda de un adulto ni contraseñas:</p>
                  <ol className="mt-3 space-y-2 text-sm font-bold text-slate-700">
                    <li className="rounded-2xl bg-white p-3 shadow ring-1 ring-slate-100">1️⃣ Escribe su nombre con un <b>teclado gigante</b> en pantalla.</li>
                    <li className="rounded-2xl bg-white p-3 shadow ring-1 ring-slate-100">2️⃣ Elige a su personaje (dragón, zorra, unicornio…).</li>
                    <li className="rounded-2xl bg-white p-3 shadow ring-1 ring-slate-100">3️⃣ <b>TD lo saluda por su nombre</b> y le hace 4 juegos cortos para medir su nivel.</li>
                  </ol>
                </div>
              </div>
            )}

            {idx === 3 && (
              <div className="flex flex-1 flex-col items-center justify-start gap-5 py-4 md:flex-row md:items-center md:justify-center md:gap-10">
                <div className="max-w-md">
                  <h2 className="font-display text-2xl font-black text-slate-900 sm:text-3xl">TD: el maestro que habla 🤖</h2>
                  <p className="mt-2 text-base font-semibold text-slate-600">Un robot paciente, alegre y bilingüe de voz. TD es quien realmente enseña:</p>
                  <ul className="mt-3 space-y-2 text-sm font-bold text-slate-700">
                    {[
                      '🎙️ Narra cada actividad en voz alta, en español (México / Latinoamérica configurable).',
                      '💡 Si el niño se equivoca 2 veces, da una pista; si insiste, baja la dificultad.',
                      '🌟 Refuerza cada acierto con palabras y celebraciones.',
                      '☕ Recuerda descansar cada 10 minutos continuos.',
                      '👂 Con micrófono, el niño repite vocales y sílabas en voz alta.',
                    ].map((t) => (
                      <li key={t} className="rounded-2xl bg-white p-3 shadow ring-1 ring-slate-100">{t}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <TDRobot mood="hablando" size={150} />
                  <div className="max-w-60 rounded-3xl rounded-bl-md bg-white p-4 text-sm font-bold text-slate-700 shadow-xl">
                    "¡Hola Sofía! Soy TD. Hoy vamos a sumar: es juntar cosas para saber cuántas hay en total."
                  </div>
                </div>
              </div>
            )}

            {idx === 4 && (
              <div className="flex flex-1 flex-col items-center justify-start gap-5 py-4 md:flex-row md:items-center md:justify-center md:gap-10">
                <PhoneMock caption="El mapa de 24 semanas, en 4 mundos"><MockMap /></PhoneMock>
                <div className="max-w-md">
                  <h2 className="font-display text-2xl font-black text-slate-900 sm:text-3xl">Un mapa de aventura 🗺️</h2>
                  <p className="mt-2 text-base font-semibold text-slate-600">No es una lista de tareas: es un viaje que su hijo desbloquea:</p>
                  <ul className="mt-3 space-y-2 text-sm font-bold text-slate-700">
                    {[
                      ['🌳 Bloque 1 (sem 1–6)', 'Vocales, trazos, números 1–5 y sumas simples'],
                      ['🌊 Bloque 2 (sem 7–12)', 'Sílabas, consonantes, sumas y restas hasta 10'],
                      ['⛰️ Bloque 3 (sem 13–18)', 'Palabras, frases y cálculo hasta 15'],
                      ['🏰 Bloque 4 (sem 19–24)', 'Cuentos con comprensión y cálculo hasta 20'],
                    ].map(([t, d]) => (
                      <li key={t} className="rounded-2xl bg-white p-3 shadow ring-1 ring-slate-100"><b>{t}:</b> {d}</li>
                    ))}
                  </ul>
                  <p className="mt-2 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-800 ring-1 ring-amber-200">
                    Cada semana tiene 4 materias × 5 sesiones (20). Al completar 16, desbloquea la siguiente. A su propio ritmo.
                  </p>
                </div>
              </div>
            )}

            {idx === 5 && (
              <div className="flex flex-1 flex-col justify-start py-4 md:justify-center">
                <h2 className="font-display text-2xl font-black text-slate-900 sm:text-3xl">El secreto del método: 4 pasos fijos 🧠</h2>
                <p className="mt-1 text-base font-semibold text-slate-600">Cada actividad, <b>sin excepción</b>, sigue la secuencia probada con niños de 6 años. La primera vez, TD la narra completa; después el niño puede pedir que se la recuerde.</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <StepBadge n={1} emoji="👋" titulo="Introducción breve" desc="TD explica en 1-2 frases qué se va a practicar y para qué sirve." color="from-sky-400 to-blue-600" />
                  <StepBadge n={2} emoji="👀" titulo="Ejemplo modelado" desc="TD resuelve un ejemplo completo frente al niño, paso a paso y en voz alta." color="from-violet-400 to-purple-600" />
                  <StepBadge n={3} emoji="🤝" titulo="Práctica guiada" desc="El niño resuelve un caso similar con pistas activas y sin presión." color="from-emerald-400 to-teal-600" />
                  <StepBadge n={4} emoji="🚀" titulo="Práctica independiente" desc="Varios ejercicios solo; TD interviene solo si hay errores repetidos." color="from-orange-400 to-rose-500" />
                </div>
              </div>
            )}

            {idx === 6 && (
              <div className="flex flex-1 flex-col items-center justify-start gap-5 py-4 md:flex-row md:items-center md:justify-center md:gap-10">
                <PhoneMock caption="Cada ejercicio tiene sus manipulables"><MockActividad /></PhoneMock>
                <div className="max-w-md">
                  <h2 className="font-display text-2xl font-black text-slate-900 sm:text-3xl">Las 4 materias, bien hechas 🎓</h2>
                  <ul className="mt-3 space-y-2 text-sm font-bold text-slate-700">
                    <li className="rounded-2xl bg-white p-3 shadow ring-1 ring-slate-100">📖 <b>Leer:</b> escalera sin saltos — vocales → sílabas → palabras → frases → cuentos. Solo avanza al dominar (≥80% de aciertos).</li>
                    <li className="rounded-2xl bg-white p-3 shadow ring-1 ring-slate-100">✏️ <b>Escribir:</b> animación del trazo, guía punteada y puntaje por <b>cobertura, orden y dirección</b>; mayúsculas y minúsculas.</li>
                    <li className="rounded-2xl bg-white p-3 shadow ring-1 ring-slate-100">➕ <b>Sumar:</b> primero "juntar" frutas tocables y contarlas en voz alta; luego de memoria, hasta 20.</li>
                    <li className="rounded-2xl bg-white p-3 shadow ring-1 ring-slate-100">➖ <b>Restar:</b> "quitar" con objetos que desaparecen (👋), la misma progresión.</li>
                  </ul>
                </div>
              </div>
            )}

            {idx === 7 && (
              <div className="flex flex-1 flex-col justify-start py-4 md:justify-center">
                <h2 className="font-display text-2xl font-black text-slate-900 sm:text-3xl">Motivación que se gana, no se compra 🏆</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {[
                    { e: '⭐', t: 'Estrellas', d: '1 a 3 por cada sesión, según su desempeño real' },
                    { e: '🪙', t: 'Monedas', d: 'Se ganan por aciertos; no hay compras dentro' },
                    { e: '🎖️', t: '10 Insignias', d: 'Maestro de Vocales, Genio de las Sumas, Súper Estrella…' },
                    { e: '🐣', t: 'Mascota que crece', d: 'Del huevo 🥚 a su personaje legendario según sus estrellas' },
                  ].map((s) => (
                    <div key={s.t} className="rounded-3xl bg-white p-4 text-center shadow ring-2 ring-slate-100">
                      <div className="text-4xl">{s.e}</div>
                      <div className="font-display mt-1 text-base font-black text-slate-900">{s.t}</div>
                      <div className="text-xs font-bold text-slate-500">{s.d}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid gap-2 text-sm font-bold text-slate-600 md:grid-cols-2">
                  <p className="rounded-2xl bg-white p-3 shadow ring-1 ring-slate-100">🔥 <b>Racha de días</b>: la constancia se celebra, no se exige.</p>
                  <p className="rounded-2xl bg-white p-3 shadow ring-1 ring-slate-100">📜 <b>Historia personal</b>: cada semana completada queda escrita en su bitácora.</p>
                </div>
              </div>
            )}

            {idx === 8 && (
              <div className="flex flex-1 flex-col items-center justify-start gap-5 py-4 md:flex-row md:items-center md:justify-center md:gap-10">
                <PhoneMock caption="Lo que ustedes pueden revisar"><MockPanel /></PhoneMock>
                <div className="max-w-md">
                  <h2 className="font-display text-2xl font-black text-slate-900 sm:text-3xl">Para ustedes: Panel del adulto 🔐</h2>
                  <p className="mt-2 text-base font-semibold text-slate-600">Protegido (resolver una suma o mantener presionado 3s) para que los niños no entren:</p>
                  <ul className="mt-3 space-y-2 text-sm font-bold text-slate-700">
                    <li className="rounded-2xl bg-white p-3 shadow ring-1 ring-slate-100">📊 Progreso por materia, semana, precisión y tiempo de uso.</li>
                    <li className="rounded-2xl bg-white p-3 shadow ring-1 ring-slate-100">🎙️ Voz de TD: elegir español MX/latino, probar, y ajustar velocidad y tono.</li>
                    <li className="rounded-2xl bg-white p-3 shadow ring-1 ring-slate-100">💾 <b>Exportar e importar su progreso</b> (archivo .json) si cambian de equipo.</li>
                    <li className="rounded-2xl bg-white p-3 shadow ring-1 ring-slate-100">👥 Varios perfiles: cada hijo con su propio avance y voz.</li>
                  </ul>
                </div>
              </div>
            )}

            {idx === 9 && (
              <div className="flex flex-1 flex-col justify-start py-4 md:justify-center">
                <h2 className="font-display text-2xl font-black text-slate-900 sm:text-3xl">Lo que sí necesitan ustedes 💪</h2>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {[
                    ['⏰', '1 hora al día', 'En un lugar tranquilo, con el volumen audible. El sistema está diseñado en sesiones de ~12 minutos.'],
                    ['📲', 'Instalar la app', 'En Chrome: ⋮ → "Instalar app". En Safari iPhone: Compartir → "Inicio de pantalla". Funciona sin internet.'],
                    ['🔌', 'Permitir el micrófono', 'La primera vez que TD pida permiso para escuchar, acepten (permite que el niño repita en voz alta).'],
                    ['📤', 'Respaldo semanal', 'Panel del adulto → "Exportar .json". Así el avance no se pierde si cambian de celular.'],
                  ].map(([e, t, d]) => (
                    <div key={t} className="flex items-start gap-3 rounded-3xl bg-white p-4 shadow ring-2 ring-slate-100">
                      <span className="text-3xl">{e}</span>
                      <div>
                        <div className="font-display text-lg font-black text-slate-900">{t}</div>
                        <p className="text-sm font-bold text-slate-500">{d}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-4 rounded-3xl bg-indigo-50 p-4 text-center text-base font-black text-indigo-800 ring-1 ring-indigo-200">
                  No necesitan saber el contenido: <b>la app enseña, ustedes acompañan y celebran.</b> 🎉
                </p>
              </div>
            )}

            {idx === 10 && (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <TDRobot mood="fiesta" size={130} />
                <h2 className="font-display mt-2 text-3xl font-black text-slate-900 sm:text-4xl">¿Empezamos? 🚀</h2>
                <p className="mt-2 max-w-lg text-base font-bold text-slate-600">
                  Recuerden: <b>leer, escribir, sumar y restar</b> · 24 semanas · 1 hora diaria · y un robot que los acompaña en cada paso.
                </p>
                <button
                  onClick={onExit}
                  className="font-display mt-6 flex min-h-[56px] items-center gap-2 rounded-3xl bg-gradient-to-b from-sky-500 to-blue-600 px-6 text-xl font-black text-white shadow-xl active:scale-95 sm:min-h-[64px] sm:gap-3 sm:px-8 sm:text-2xl"
                >
                  <Play className="h-6 w-6 fill-white" /> ¡Entra a la app!
                </button>
                <p className="mt-3 text-xs font-bold text-slate-400">¿Dudas? Vuelvan aquí desde Ajustes o el Panel del adulto.</p>
              </div>
            )}
          </motion.div>
          </AnimatePresence>
        </div>

        {/* Navegación - fija abajo */}
        <div className="shrink-0 border-t border-indigo-100 bg-white/80 px-3 py-3 backdrop-blur sm:px-4">
          <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-2">
          <button
            onClick={prev}
            disabled={idx === 0}
            className="flex min-h-[48px] items-center gap-1 rounded-2xl bg-white px-3 font-display text-sm font-black text-slate-700 shadow ring-2 ring-slate-100 transition active:scale-95 disabled:opacity-30 sm:min-h-[52px] sm:px-4 sm:text-base"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" /> <span className="hidden sm:inline">Anterior</span>
          </button>
          <div className="flex gap-1 sm:gap-1.5">
            {Array.from({ length: TOTAL }, (_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`Ir al paso ${i + 1}`}
                className={`h-2.5 rounded-full transition-all ${i === idx ? 'w-5 sm:w-7 bg-indigo-500' : 'w-2.5 bg-slate-300'}`}
              />
            ))}
          </div>
          {idx < TOTAL - 1 ? (
            <button
              onClick={next}
              className="flex min-h-[48px] items-center gap-1 rounded-2xl bg-gradient-to-b from-indigo-500 to-violet-600 px-3 font-display text-sm font-black text-white shadow-lg transition active:scale-95 sm:min-h-[52px] sm:px-5 sm:text-base"
            >
              Siguiente <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          ) : (
            <button
              onClick={onExit}
              className="flex min-h-[48px] items-center gap-1 rounded-2xl bg-gradient-to-b from-sky-500 to-blue-600 px-3 font-display text-sm font-black text-white shadow-lg transition active:scale-95 sm:min-h-[52px] sm:px-5 sm:text-base"
            >
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" /> Entrar
            </button>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
