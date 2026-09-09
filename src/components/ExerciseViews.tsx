import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Lightbulb, Eraser, Check, Mic, RotateCcw } from 'lucide-react';
import type { EjercicioEscritura, EjercicioLectura, EjercicioMates } from '../lib/types';
import { tdVoice } from '../lib/td-voice';
import { objetosVoz } from '../lib/content';
import { escuchar, evaluarDicho, soportaReconocimiento } from '../lib/td-listen';
import { sfx } from '../lib/audio';
import type { ResultadoTrazo } from '../lib/trazo-analitica';
import TracingCanvas from './TracingCanvas';
import { instruccionPara, splitPalabra } from '../lib/trazos';
import confetti from 'canvas-confetti';

// ---------- LECTURA ----------
export function LecturaView({
  ejercicio,
  mostrarPista,
  erroresSeguidos,
  onResponder,
  disabled,
}: {
  ejercicio: EjercicioLectura;
  mostrarPista: boolean;
  erroresSeguidos: number;
  onResponder: (ok: boolean) => void;
  disabled: boolean;
}) {
  const [elegido, setElegido] = useState<string | null>(null);
  const [ok, setOk] = useState<boolean | null>(null);
  const esRepiteVoz = ejercicio.subtipo === 'repite-voz';

  useEffect(() => {
    setElegido(null);
    setOk(null);
  }, [ejercicio.id]);

  const escuchar = () => {
    sfx.click();
    // Audio cue según subtipo
    if (ejercicio.subtipo === 'escucha-elige' || ejercicio.subtipo === 'une-silaba') {
      tdVoice.speak(`Escucha: ${ejercicio.respuesta}. ${ejercicio.consigna}. Repito: ${ejercicio.respuesta}.`);
    } else if (ejercicio.palabra) {
      tdVoice.speak(`${ejercicio.consigna}. La palabra es: ${ejercicio.palabra.split('').join(' ')}... ${ejercicio.palabra}.`);
    } else if (ejercicio.frase) {
      tdVoice.speak(ejercicio.frase);
      setTimeout(() => tdVoice.speak(ejercicio.consigna), 100);
    } else {
      tdVoice.speak(ejercicio.consigna);
    }
  };

  useEffect(() => {
    if (esRepiteVoz) return; // el micrófono maneja su propia audio
    const t = setTimeout(escuchar, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ejercicio.id]);

  if (esRepiteVoz) {
    return (
      <RepiteVozView
        objetivo={ejercicio.objetivoVoz ?? ejercicio.respuesta.toLowerCase()}
        pista={ejercicio.pista}
        onResponder={onResponder}
        disabled={disabled}
      />
    );
  }

  const elegir = (op: string) => {
    if (disabled || (elegido && ok)) return;
    setElegido(op);
    const good = op === ejercicio.respuesta;
    setOk(good);
    if (good) {
      sfx.success();
      tdVoice.speak('¡Correcto! Muy bien.');
      setTimeout(() => onResponder(true), 900);
    } else {
      sfx.error();
      tdVoice.speak('Casi. Mira con atención e intenta otra vez.');
      setTimeout(() => { setElegido(null); setOk(null); }, 1200);
      onResponder(false);
    }
  };

  const esEmoji = ejercicio.subtipo === 'elige-imagen';

  return (
    <div>
      {/* Estímulo principal */}
      <div className="rounded-3xl bg-gradient-to-b from-sky-50 to-white p-4 text-center shadow-inner ring-2 ring-sky-100">
        {ejercicio.emoji && ejercicio.subtipo !== 'elige-imagen' && (
          <div className="text-6xl sm:text-7xl">{ejercicio.emoji}</div>
        )}
        {ejercicio.palabra && (
          <div className="font-display mt-1 text-4xl font-black tracking-wide text-sky-950 sm:text-5xl">
            {ejercicio.palabra}
          </div>
        )}
        {ejercicio.frase && (
          <div className="font-body mx-auto mt-1 max-w-md rounded-2xl bg-amber-50 p-3 text-lg font-bold leading-relaxed text-slate-800 ring-1 ring-amber-200">
            {ejercicio.subtipo === 'comprension' ? `📖 ${ejercicio.frase}` : ejercicio.consigna.includes('___') || ejercicio.frase.includes('___') ? ejercicio.frase : `💬 "${ejercicio.frase}"`}
          </div>
        )}
        {(ejercicio.subtipo === 'escucha-elige' || ejercicio.subtipo === 'une-silaba') && !ejercicio.palabra && (
          <button onClick={escuchar} className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-b from-sky-400 to-blue-600 text-white shadow-xl transition active:scale-90" aria-label="Escuchar sílaba">
            <Volume2 className="h-10 w-10" />
          </button>
        )}
        <button onClick={escuchar} className="mx-auto mt-3 flex items-center gap-1.5 rounded-full bg-sky-500 px-4 py-2 text-sm font-black uppercase tracking-wide text-white shadow active:scale-95">
          <Volume2 className="h-4 w-4" /> Escuchar
        </button>
      </div>

      {/* Pista */}
      {(mostrarPista || erroresSeguidos >= 2) && ejercicio.pista && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 flex items-start gap-2 rounded-2xl bg-amber-100 p-3 text-sm font-bold text-amber-900 ring-2 ring-amber-200">
          <Lightbulb className="h-5 w-5 shrink-0 text-amber-600" />
          <span>Pista de TD: {ejercicio.pista}</span>
        </motion.div>
      )}

      {/* Opciones */}
      <div className={`mt-4 grid gap-3 ${ejercicio.opciones.length > 3 || ejercicio.opciones.some((o) => o.length > 6) ? 'grid-cols-1' : 'grid-cols-3'}`}>
        {ejercicio.opciones.map((op) => {
          const fue = elegido === op;
          const correcta = op === ejercicio.respuesta;
          return (
            <motion.button
              key={op}
              whileTap={{ scale: 0.93 }}
              onClick={() => elegir(op)}
              disabled={disabled}
              className={`font-display flex min-h-[72px] items-center justify-center rounded-3xl px-3 py-3 font-black shadow-lg transition ${
                esEmoji ? 'text-5xl' : op.length > 8 ? 'text-lg' : op.length > 3 ? 'text-2xl' : 'text-4xl'
              } ${
                fue && !correcta
                  ? 'bg-rose-400 text-white ring-4 ring-rose-200'
                  : fue && correcta
                    ? 'bg-green-400 text-white ring-4 ring-green-200'
                    : 'bg-white text-sky-950 ring-2 ring-sky-100 hover:ring-sky-300'
              }`}
            >
              {op}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ---------- MATES ----------
export function MatesView({
  ejercicio,
  mostrarPista,
  erroresSeguidos,
  onResponder,
  disabled,
  forzarAyuda,
}: {
  ejercicio: EjercicioMates;
  mostrarPista: boolean;
  erroresSeguidos: number;
  onResponder: (ok: boolean) => void;
  disabled: boolean;
  forzarAyuda?: boolean;
}) {
  const [elegido, setElegido] = useState<number | null>(null);
  const [ok, setOk] = useState<boolean | null>(null);
  const [contados, setContados] = useState<number[]>([]);
  const ayuda = ejercicio.conAyudaVisual || forzarAyuda || erroresSeguidos >= 2;
  const esSuma = ejercicio.categoria === 'suma';
  const total = esSuma ? ejercicio.a + ejercicio.b : ejercicio.a;

  useEffect(() => {
    setElegido(null);
    setOk(null);
    setContados([]);
  }, [ejercicio.id]);

  const escuchar = () => {
    sfx.click();
    if (esSuma) tdVoice.speak(`¿Cuánto es ${ejercicio.a} más ${ejercicio.b}? Son ${objetosVoz(ejercicio.emoji, ejercicio.a)} más ${objetosVoz(ejercicio.emoji, ejercicio.b)}.`);
    else tdVoice.speak(`¿Cuánto es ${ejercicio.a} menos ${ejercicio.b}? Tenías ${objetosVoz(ejercicio.emoji, ejercicio.a)} y quitas ${objetosVoz(ejercicio.emoji, ejercicio.b)}. ¿Cuántas quedan?`);
  };

  useEffect(() => {
    const t = setTimeout(escuchar, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ejercicio.id]);

  const contar = (i: number) => {
    if (contados.includes(i)) return;
    sfx.countTick();
    const n = contados.length + 1;
    tdVoice.speak(`${n}`);
    setContados((c) => [...c, i]);
  };

  const elegir = (op: number) => {
    if (disabled || (elegido !== null && ok)) return;
    setElegido(op);
    const good = op === ejercicio.respuesta;
    setOk(good);
    if (good) {
      sfx.success();
      tdVoice.speak(esSuma ? `¡Sí! ${ejercicio.a} más ${ejercicio.b} es ${ejercicio.respuesta}.` : `¡Sí! ${ejercicio.a} menos ${ejercicio.b} es ${ejercicio.respuesta}.`);
      setTimeout(() => onResponder(true), 1000);
    } else {
      sfx.error();
      tdVoice.speak('Mmm, cuenta otra vez despacio.');
      setTimeout(() => { setElegido(null); setOk(null); }, 1200);
      onResponder(false);
    }
  };

  const objetos = useMemo(() => {
    if (esSuma) {
      return [
        ...Array.from({ length: ejercicio.a }, (_, i) => ({ grupo: 0, idx: i })),
        ...Array.from({ length: ejercicio.b }, (_, i) => ({ grupo: 1, idx: ejercicio.a + i })),
      ];
    }
    return Array.from({ length: ejercicio.a }, (_, i) => ({ grupo: i < ejercicio.a - ejercicio.b ? 0 : 1, idx: i }));
  }, [ejercicio.a, ejercicio.b, esSuma]);

  return (
    <div>
      {/* Operación */}
      <div className="rounded-3xl bg-gradient-to-b from-orange-50 to-white p-4 text-center shadow-inner ring-2 ring-orange-100">
        <div className="font-display flex items-center justify-center gap-2 text-5xl font-black text-slate-900 sm:text-6xl">
          <span className="rounded-2xl bg-white px-3 py-1 shadow ring-2 ring-orange-200">{ejercicio.a}</span>
          <span className={`flex h-12 w-12 items-center justify-center rounded-full text-3xl text-white shadow ${esSuma ? 'bg-orange-500' : 'bg-sky-500'}`}>
            {esSuma ? '+' : '−'}
          </span>
          <span className="rounded-2xl bg-white px-3 py-1 shadow ring-2 ring-orange-200">{ejercicio.b}</span>
          <span className="text-slate-400">=</span>
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-3xl text-amber-600 ring-2 ring-dashed ring-amber-300 sm:h-20 sm:w-20">?</span>
        </div>
        <button onClick={escuchar} className="mx-auto mt-3 flex items-center gap-1.5 rounded-full bg-orange-500 px-4 py-2 text-sm font-black uppercase tracking-wide text-white shadow active:scale-95">
          <Volume2 className="h-4 w-4" /> Escuchar
        </button>
      </div>

      {/* Manipulables */}
      {ayuda && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 rounded-3xl bg-white p-3 shadow ring-2 ring-sky-100">
          <p className="text-center text-xs font-black uppercase tracking-widest text-sky-600">
            {esSuma ? `Toca y cuenta todas ${contados.length}/${total}` : `Toca las que QUEDAN ${contados.length}/${ejercicio.a - ejercicio.b}`}
          </p>
          {!esSuma && (
            <div className="mt-1 flex justify-center gap-4 text-sm font-black">
              <span className="rounded-full bg-green-100 px-3 py-1 text-green-700">Quedan {ejercicio.a - ejercicio.b}</span>
              <span className="rounded-full bg-rose-100 px-3 py-1 text-rose-700 line-through opacity-80">Se van {ejercicio.b} 👋</span>
            </div>
          )}
          <div className="mt-2 flex flex-wrap justify-center gap-1.5">
            {objetos.map((o) => {
              const quitado = !esSuma && o.grupo === 1;
              const fueContado = contados.includes(o.idx);
              return (
                <button
                  key={o.idx}
                  onClick={() => !quitado && contar(o.idx)}
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl text-3xl transition active:scale-90 ${
                    quitado ? 'bg-rose-50 opacity-30 grayscale' : fueContado ? 'bg-green-100 ring-2 ring-green-400' : 'bg-amber-50 ring-1 ring-amber-200 hover:bg-amber-100'
                  }`}
                  aria-label={quitado ? 'quitado' : `contar objeto ${o.idx + 1}`}
                >
                  <span className={quitado ? 'line-through' : ''}>{ejercicio.emoji}</span>
                </button>
              );
            })}
          </div>
          {esSuma && (
            <div className="mt-2 flex items-center justify-center gap-2 text-2xl font-black">
              <span className="rounded-xl bg-sky-100 px-2 text-sky-700">{ejercicio.a}</span>
              <span className="text-slate-400">+</span>
              <span className="rounded-xl bg-violet-100 px-2 text-violet-700">{ejercicio.b}</span>
              <span className="text-slate-400">=</span>
              <span className="rounded-xl bg-green-100 px-2 text-green-700">{contados.length > 0 ? contados.length : '?'}</span>
            </div>
          )}
        </motion.div>
      )}

      {(mostrarPista || erroresSeguidos >= 1) && ejercicio.pista && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 flex items-start gap-2 rounded-2xl bg-amber-100 p-3 text-sm font-bold text-amber-900 ring-2 ring-amber-200">
          <Lightbulb className="h-5 w-5 shrink-0 text-amber-600" />
          <span>Pista de TD: {ejercicio.pista}</span>
        </motion.div>
      )}

      <div className="mt-4 grid grid-cols-3 gap-3">
        {ejercicio.opciones.map((op) => {
          const fue = elegido === op;
          const correcta = op === ejercicio.respuesta;
          return (
            <motion.button
              key={op}
              whileTap={{ scale: 0.92 }}
              onClick={() => elegir(op)}
              disabled={disabled}
              className={`font-display flex min-h-[84px] items-center justify-center rounded-3xl text-4xl font-black shadow-lg transition ${
                fue && !correcta
                  ? 'bg-rose-400 text-white ring-4 ring-rose-200'
                  : fue && correcta
                    ? 'bg-green-400 text-white ring-4 ring-green-200'
                    : 'bg-white text-slate-900 ring-2 ring-orange-100 hover:ring-orange-300'
              }`}
            >
              {op}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ---------- ESCRITURA ----------
export function EscrituraView({
  ejercicio,
  modoGuia,
  onResponder,
}: {
  ejercicio: EjercicioEscritura;
  modoGuia: boolean;
  onResponder: (ok: boolean, cobertura: number) => void;
}) {
  const letras = useMemo(() => splitPalabra(ejercicio.caracter), [ejercicio.caracter]);
  const [letraIdx, setLetraIdx] = useState(0);
  const [rep, setRep] = useState(1);
  const [resetKey, setResetKey] = useState(0);
  const [progreso, setProgreso] = useState(0);
  const [terminado, setTerminado] = useState(false);
  const [scores, setScores] = useState<number[]>([]);
  const [ultimoRes, setUltimoRes] = useState<ResultadoTrazo | null>(null);
  const [vozPaso, setVozPaso] = useState<string | null>(null);
  const [caseo, setCaseo] = useState<'MAY' | 'min'>('MAY');
  const totalPasos = letras.length * ejercicio.repeticiones;

  useEffect(() => {
    setLetraIdx(0);
    setRep(1);
    setResetKey((k) => k + 1);
    setProgreso(0);
    setTerminado(false);
    setScores([]);
    setUltimoRes(null);
    setVozPaso(null);
    setCaseo('MAY');
    const t = setTimeout(() => {
      tdVoice.speak(`${ejercicio.consigna} ${instruccionPara(letras[0] ?? 'A')}`);
    }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ejercicio.id]);

  const pasoActual = letraIdx * ejercicio.repeticiones + rep;
  const letraBase = letras[letraIdx] ?? 'A';
  const letraVis = caseo === 'MAY' ? letraBase.toUpperCase() : letraBase.toLowerCase();

  const cambiarCaseo = (c: 'MAY' | 'min') => {
    if (c === caseo || terminado) return;
    setCaseo(c);
    sfx.pop();
    tdVoice.speak(
      c === 'min'
        ? `Ahora la escribimos en minúscula: ${letraBase.toLowerCase()}. ¡Mira cómo cambia!`
        : `Ahora la escribimos en mayúscula: ${letraBase.toUpperCase()}.`
    );
  };

  const finConVoz = (paso: string, promedio: number) => {
    // Bonus de exactitud: TD escucha al niño decir lo que trazó
    setVozPaso(paso);
    tdVoice.speak(`¡Excelente trazo! Ahora di en voz alta la letra que escribiste: ${paso}.`);
    finRef.current = { promedio, paso };
  };

  const finRef = useRef<{ promedio: number; paso: string } | null>(null);

  const finalizar = (promedio: number) => {
    setTerminado(true);
    sfx.star();
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.7 } });
    tdVoice.speak(`¡Hermoso trazo! Tu puntuación fue ${Math.round(promedio)} por ciento.`);
    setTimeout(() => onResponder(true, promedio / 100), 1200);
  };

  const handleComplete = (res: ResultadoTrazo) => {
    setUltimoRes(res);
    if (res.calificacion === 'practica') {
      tdVoice.speak('Buen intento. Borra e inténtalo más despacio, siguiendo los números.');
      return;
    }
    const nuevos = [...scores, res.global];
    setScores(nuevos);
    const esUltimo = letraIdx === letras.length - 1 && rep === ejercicio.repeticiones;
    if (esUltimo) {
      const promedioFin = nuevos.reduce((a, b) => a + b, 0) / nuevos.length;
      const esSimple = letras.length === 1 && ejercicio.tipoTrazo !== 'palabra';
      if (soportaReconocimiento() && esSimple) {
        finConVoz(letraVis, promedioFin);
      } else {
        finalizar(promedioFin);
      }
    } else {
      sfx.success();
      tdVoice.speak('¡Bien! Vamos con la siguiente.');
      setTimeout(() => {
        if (rep < ejercicio.repeticiones) setRep(rep + 1);
        else { setLetraIdx(letraIdx + 1); setRep(1); }
        setResetKey((k) => k + 1);
        setProgreso(0);
        setUltimoRes(null);
      }, 900);
    }
  };

  const onVozResuelta = () => {
    const f = finRef.current;
    setVozPaso(null);
    if (f) finalizar(f.promedio);
    else finalizar(100);
  };

  const escuchar = () => {
    sfx.click();
    tdVoice.speak(`Traza la letra ${letraVis}. ${instruccionPara(letraVis)}`);
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-black uppercase tracking-wide text-white">
            {ejercicio.caracter.length > 1 ? `Letra ${letraIdx + 1} de ${letras.length}: ${letraVis}` : `Traza: ${letraVis}`}
          </span>
          {ejercicio.repeticiones > 1 && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">
              Vez {rep} de {ejercicio.repeticiones}
            </span>
          )}
        </div>
        <span className="text-xs font-black text-slate-400">{pasoActual}/{totalPasos}</span>
      </div>

      {/* Selector de mayúsculas / minúsculas */}
      <div className="mb-3 flex items-center justify-center gap-2">
        <span className="text-[11px] font-black uppercase tracking-wide text-slate-400">Tamaño de la letra</span>
        <div className="flex overflow-hidden rounded-full bg-white p-1 shadow ring-2 ring-slate-100">
          <button onClick={() => cambiarCaseo('MAY')} className={`font-display flex min-h-[44px] items-center rounded-full px-4 text-base font-black transition ${caseo === 'MAY' ? 'bg-sky-500 text-white' : 'text-slate-500'}`}>
            ABC
          </button>
          <button onClick={() => cambiarCaseo('min')} className={`font-display flex min-h-[44px] items-center rounded-full px-4 text-base font-black transition ${caseo === 'min' ? 'bg-sky-500 text-white' : 'text-slate-500'}`}>
            abc
          </button>
        </div>
      </div>

      <div className="mb-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all" style={{ width: `${(progreso * 100).toFixed(0)}%` }} />
      </div>

      {vozPaso && !terminado ? (
        <div className="rounded-3xl bg-violet-50 p-3 ring-2 ring-violet-200">
          <p className="mb-2 text-center text-xs font-black uppercase tracking-widest text-violet-600">🎤 Bonus: dilo en voz alta</p>
          <RepiteVozView objetivo={vozPaso.toLowerCase()} onResponder={onVozResuelta} />
        </div>
      ) : (
        <TracingCanvas
          caracter={letraVis}
          modoGuia={modoGuia}
          resetKey={resetKey}
          mostrarAnimacion={false}
          onComplete={handleComplete}
          onProgress={setProgreso}
        />
      )}

      <div className="mt-3 flex gap-2">
        <button onClick={escuchar} className="flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-2xl bg-sky-500 font-display text-base font-black text-white shadow active:scale-95">
          <Volume2 className="h-5 w-5" /> Escuchar
        </button>
        <button onClick={() => { sfx.click(); setResetKey((k) => k + 1); setProgreso(0); setUltimoRes(null); }} className="flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-2xl bg-white font-display text-base font-black text-slate-600 shadow ring-2 ring-slate-100 active:scale-95">
          <Eraser className="h-5 w-5" /> Borrar
        </button>
      </div>

      {ultimoRes && ultimoRes.calificacion !== 'practica' && !terminado && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-[11px] font-black">
          <span className="rounded-full bg-green-100 px-2.5 py-1 text-green-700">Cobertura {ultimoRes.cobertura}%</span>
          <span className="rounded-full bg-sky-100 px-2.5 py-1 text-sky-700">Orden {ultimoRes.orden}%</span>
          <span className="rounded-full bg-violet-100 px-2.5 py-1 text-violet-700">Dirección {ultimoRes.direccion}%</span>
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-amber-700">Total {ultimoRes.global}%</span>
        </div>
      )}

      {terminado && (
        <div className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-green-100 p-3 font-black text-green-700">
          <Check className="h-5 w-5" /> ¡Trazo completado! ⭐
        </div>
      )}
    </div>
  );
}

// ---------- REPETICIÓN EN VOZ ALTA (micrófono) ----------
export function RepiteVozView({
  objetivo,
  pista,
  onResponder,
  disabled,
}: {
  objetivo: string;
  pista?: string;
  onResponder: (ok: boolean) => void;
  disabled?: boolean;
}) {
  const [estado, setEstado] = useState<'pre' | 'escuchando' | 'fallo' | 'ok' | 'juntos'>('pre');
  const [dicho, setDicho] = useState('');
  const [intentos, setIntentos] = useState(0);
  const [sim, setSim] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      tdVoice.speak(`Escucha bien: ${objetivo}. Y ahora tócame y dilo tú, bien fuerte.`, { rate: 0.85 });
    }, 500);
    return () => clearTimeout(t);
  }, [objetivo]);

  const empezar = async () => {
    if (disabled || estado === 'escuchando') return;
    sfx.whoosh();
    setEstado('escuchando');
    setDicho('');
    const r = await escuchar({ maxMs: 4500, onParcial: setDicho });
    if (r.error === 'denegado') {
      setEstado('fallo');
      setDicho('micrófono bloqueado');
      tdVoice.speak('Necesito permiso del micrófono. Pídele a un adulto que lo permita. ¡Seguimos!');
      setTimeout(() => onResponder(true), 2600);
      return;
    }
    const v = evaluarDicho(r.texto, objetivo);
    setSim(v.similitud);
    if (v.ok) {
      setEstado('ok');
      sfx.success();
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
      tdVoice.speak(`¡Sí! Dijiste ${objetivo}. ¡Muy bien dicho!`);
      setTimeout(() => onResponder(true), 1600);
    } else if (intentos + 1 >= 3) {
      setEstado('juntos');
      tdVoice.speak(`No pasa nada. Digámoslo juntos: ${objetivo}. ¡Bien!`);
      setTimeout(() => onResponder(true), 2400);
    } else {
      setIntentos((i) => i + 1);
      setEstado('fallo');
      setDicho(r.texto || 'silencio');
      sfx.error();
      tdVoice.speak(`Escuché: ${r.texto || 'mmm, nada'}. Escucha otra vez: ${objetivo}. ¡Tócame e inténtalo!`, { rate: 0.9 });
    }
  };

  return (
    <div className="text-center">
      <div className="rounded-3xl bg-gradient-to-b from-violet-50 to-white p-4 shadow-inner ring-2 ring-violet-100">
        <p className="text-xs font-black uppercase tracking-widest text-violet-500">🎤 Repite en voz alta</p>
        <div className="font-display mt-1 text-5xl font-black text-violet-950 sm:text-6xl">{objetivo}</div>
        <button onClick={() => { sfx.click(); tdVoice.speak(`Escucha: ${objetivo}.`, { rate: 0.8 }); }} className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-violet-500 px-4 py-2 text-sm font-black uppercase tracking-wide text-white shadow active:scale-95">
          <Volume2 className="h-4 w-4" /> Escuchar
        </button>
      </div>

      <div className="mt-4 flex flex-col items-center">
        {estado !== 'ok' && estado !== 'juntos' ? (
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={empezar}
            disabled={disabled || estado === 'escuchando'}
            className={`relative flex h-28 w-28 items-center justify-center rounded-full text-white shadow-xl ${
              estado === 'escuchando' ? 'bg-rose-500' : 'bg-gradient-to-b from-sky-400 to-blue-600'
            }`}
            aria-label="Decir en voz alta"
          >
            {estado === 'escuchando' && (
              <motion.span
                animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-rose-400"
              />
            )}
            <Mic className="h-12 w-12" />
          </motion.button>
        ) : (
          <span className="text-7xl">{estado === 'ok' ? '🎉' : '🤝'}</span>
        )}
        <p className="mt-3 text-sm font-black text-slate-600">
          {estado === 'pre' && `Tócame y di: ${objetivo}`}
          {estado === 'escuchando' && `Te escucho…${dicho ? ` "${dicho}"` : ''}`}
          {estado === 'fallo' && dicho === 'micrófono bloqueado' && 'El micrófono está bloqueado. Seguimos igual. 🎧'}
          {estado === 'fallo' && dicho !== 'micrófono bloqueado' && `Dijiste: "${dicho}". Intento ${intentos + 1} de 3.`}
          {estado === 'ok' && `¡Dijiste ${objetivo} perfecto! 🌟`}
          {estado === 'juntos' && `¡Lo dijimos juntos! ${objetivo} 🎶`}
        </p>
        {(estado === 'pre' || estado === 'fallo') && (
          <div className="mt-2 flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span key={i} className={`h-2.5 w-2.5 rounded-full ${i < intentos && estado === 'fallo' ? 'bg-rose-400' : 'bg-slate-200'}`} />
            ))}
          </div>
        )}
        {estado === 'fallo' && (
          <div className="mt-2 flex items-center gap-2">
            <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${Math.round(sim * 100)}%` }} />
            </div>
            <span className="text-xs font-bold text-slate-400">{Math.round(sim * 100)}% cerca</span>
          </div>
        )}
        {estado === 'fallo' && (
          <button onClick={() => { sfx.click(); setEstado('pre'); setDicho(''); }} className="mt-3 flex items-center gap-1.5 rounded-full bg-slate-100 px-4 py-2 text-xs font-black text-slate-600 active:scale-95">
            <RotateCcw className="h-4 w-4" /> Intentar de nuevo
          </button>
        )}
        {pista && estado === 'fallo' && intentos >= 2 && (
          <div className="mt-3 flex items-start gap-2 rounded-2xl bg-amber-100 p-3 text-left text-sm font-bold text-amber-900 ring-2 ring-amber-200">
            <Lightbulb className="h-5 w-5 shrink-0 text-amber-600" />
            <span>{pista}</span>
          </div>
        )}
      </div>
    </div>
  );
}
