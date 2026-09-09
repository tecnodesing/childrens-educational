import { useCallback, useEffect, useRef, useState } from 'react';
import { densify, getStrokesForChar } from '../lib/trazos';
import {
  evaluarTrazo, trazoCompleto, type Pt, type ResultadoTrazo,
} from '../lib/trazo-analitica';
import { sfx } from '../lib/audio';

interface Props {
  caracter: string;
  modoGuia: boolean; // true = punteada completa, false = solo puntos de referencia
  onComplete: (res: ResultadoTrazo) => void;
  onProgress?: (progreso: number) => void;
  resetKey: number;
  mostrarAnimacion: boolean;
}

interface TrazoNiño {
  pts: Pt[];
  presiones: number[];
}

export default function TracingCanvas({ caracter, modoGuia, onComplete, onProgress, resetKey, mostrarAnimacion }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(300);
  const [, setRedibujar] = useState(0);
  const strokesRef = useRef<TrazoNiño[]>([]);
  const liveRef = useRef<TrazoNiño | null>(null);
  const hitosRef = useRef<boolean[]>([]);
  const completado = useRef(false);
  const strokes = getStrokesForChar(caracter);
  const guideDots = densify(strokes, 12);
  // Puntos por trazo (la animación del ejemplo respeta los levantados de lápiz)
  const strokesDots = strokes.map((st) => densify([st], 14));
  const animPlan = strokesDots.reduce<{ s: number; d: number }[]>((acc, dots, s) => {
    dots.forEach((_, d) => acc.push({ s, d }));
    return acc;
  }, []);
  const [animStep, setAnimStep] = useState(0);
  const [feedback, setFeedback] = useState<'bien' | 'desviado' | 'fin' | null>(null);
  const [ultimoRes, setUltimoRes] = useState<ResultadoTrazo | null>(null);

  useEffect(() => {
    const update = () => {
      const w = wrapRef.current?.clientWidth ?? 300;
      setSize(Math.min(420, Math.max(240, w)));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    strokesRef.current = [];
    liveRef.current = null;
    hitosRef.current = guideDots.map(() => false);
    completado.current = false;
    setAnimStep(0);
    setFeedback(null);
    setUltimoRes(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, caracter]);

  // Animación del lápiz mágico (ejemplo modelado).
  // Recorre trazo por trazo (con pausa de "levantar el lápiz" entre ellos)
  // para que la letra NUNCA se deforme con líneas conectoras.
  useEffect(() => {
    if (!mostrarAnimacion) return;
    setAnimStep(0);
    const total = animPlan.length;
    let i = 0;
    const iv = setInterval(() => {
      const prevS = planIdx(i).s;
      i += 1;
      // Pausa breve al pasar a un trazo nuevo
      if (i < total && planIdx(i).s !== prevS) i += 6;
      setAnimStep(Math.min(i, total));
      if (i >= total) clearInterval(iv);
    }, 45);
    const planIdx = (k: number) => animPlan[Math.min(k, animPlan.length - 1)];
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mostrarAnimacion, caracter, resetKey]);

  const toPx = useCallback((p: [number, number]): [number, number] => {
    const pad = size * 0.12;
    return [pad + p[0] * (size - pad * 2), pad + p[1] * (size - pad * 2)];
  }, [size]);

  const redib = () => setRedibujar((v) => v + 1);

  // ---------- Dibujo ----------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);

    // Fondo cuaderno
    ctx.fillStyle = '#FFFEF7';
    roundRect(ctx, 0, 0, size, size, 24);
    ctx.fill();
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 2;
    [0.32, 0.62, 0.86].forEach((f) => {
      ctx.beginPath();
      ctx.moveTo(14, size * f);
      ctx.lineTo(size - 14, size * f);
      ctx.stroke();
    });

    // Letra fantasma
    ctx.save();
    ctx.font = `900 ${size * 0.62}px Nunito, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = modoGuia ? 'rgba(14,165,233,0.10)' : 'rgba(148,163,184,0.10)';
    ctx.fillText(caracter, size / 2, size * 0.52);
    ctx.restore();

    // Guía
    const dotsToShow = modoGuia ? guideDots : guideDots.filter((_, i) => i % 12 === 0);
    dotsToShow.forEach((d) => {
      const [x, y] = toPx(d);
      const idx = guideDots.indexOf(d);
      const hit = hitosRef.current[idx];
      ctx.beginPath();
      ctx.arc(x, y, modoGuia ? 4.5 : 7, 0, Math.PI * 2);
      ctx.fillStyle = hit ? '#22C55E' : modoGuia ? '#7DD3FC' : '#CBD5E1';
      ctx.fill();
    });

    // Números de inicio por trazo
    strokes.forEach((st, si) => {
      const [x, y] = toPx(st[0]);
      ctx.beginPath();
      ctx.arc(x, y, 13, 0, Math.PI * 2);
      ctx.fillStyle = '#F59E0B';
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '900 13px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${si + 1}`, x, y + 0.5);
    });

    // Animación lápiz mágico — trazo por trazo, SIN líneas conectoras:
    // cada trazo nuevo empieza con moveTo, como si el lápiz se levantara.
    if (mostrarAnimacion && animStep > 0) {
      const revealed: Pt[][] = strokesDots.map(() => []);
      const limit = Math.min(animStep, animPlan.length);
      for (let k = 0; k < limit; k++) {
        const { s, d } = animPlan[k];
        revealed[s].push(strokesDots[s][d]);
      }
      const lastRef: { p: Pt | null } = { p: null };
      ctx.save();
      ctx.strokeStyle = '#A855F7';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = 'rgba(168,85,247,0.4)';
      ctx.shadowBlur = 10;
      for (const r of revealed) {
        if (r.length === 0) continue;
        ctx.beginPath();
        r.forEach((p, i) => {
          const [x, y] = toPx(p);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          lastRef.p = [x, y];
        });
        ctx.stroke();
      }
      ctx.restore();
      if (lastRef.p) {
        const [lx, ly] = lastRef.p;
        ctx.font = '28px serif';
        ctx.textAlign = 'center';
        ctx.fillText('🪄', lx + 16, ly - 14);
      }
    }

    // Trazos del niño: segmentos verde/naranja según cercanía a la guía
    const tol = size * 0.075;
    const guiasPx = guideDots.map(toPx);
    const distAguia = (p: Pt): number => {
      let m = Infinity;
      for (const g of guiasPx) {
        const dd = Math.hypot(p[0] - g[0], p[1] - g[1]);
        if (dd < m) m = dd;
      }
      return m;
    };
    const dibujarTrazo = (t: TrazoNiño) => {
      for (let i = 1; i < t.pts.length; i++) {
        const ok = distAguia(t.pts[i]) < tol;
        ctx.strokeStyle = ok ? '#22C55E' : '#FB923C';
        ctx.lineWidth = 5 + (t.presiones[i] ?? 0.5) * 7;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(t.pts[i - 1][0], t.pts[i - 1][1]);
        ctx.lineTo(t.pts[i][0], t.pts[i][1]);
        ctx.stroke();
      }
    };
    strokesRef.current.forEach(dibujarTrazo);
    if (liveRef.current) dibujarTrazo(liveRef.current);
  });

  // ---------- Lógica de interacción ----------
  const progresoSecuencial = () => {
    const h = hitosRef.current;
    let k = 0;
    while (k < h.length && h[k]) k++;
    return h.length === 0 ? 0 : k / h.length;
  };

  const checkProximity = (pos: Pt) => {
    const tol = size * 0.075;
    let nearAny = false;
    guideDots.forEach((g, i) => {
      const [gx, gy] = toPx(g);
      const d = Math.hypot(pos[0] - gx, pos[1] - gy);
      if (d < tol) {
        if (!hitosRef.current[i]) {
          hitosRef.current[i] = true;
          if (i % 10 === 0) sfx.countTick();
        }
        nearAny = true;
      }
    });
    setFeedback(nearAny ? 'bien' : 'desviado');
    onProgress?.(progresoSecuencial());
  };

  const posFromEvent = (e: React.PointerEvent): [number, number] => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
  };

  const handleDown = (e: React.PointerEvent) => {
    if (completado.current) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    liveRef.current = { pts: [posFromEvent(e)], presiones: [e.pressure || 0.5] };
    checkProximity(liveRef.current.pts[0]);
    redib();
  };

  const handleMove = (e: React.PointerEvent) => {
    if (!liveRef.current) return;
    const p = posFromEvent(e);
    const ult = liveRef.current.pts[liveRef.current.pts.length - 1];
    if (Math.hypot(p[0] - ult[0], p[1] - ult[1]) < 2) return; // suavizado
    liveRef.current.pts.push(p);
    liveRef.current.presiones.push(e.pressure || 0.5);
    checkProximity(p);
    redib();
  };

  const handleUp = () => {
    const live = liveRef.current;
    liveRef.current = null;
    if (!live || live.pts.length < 1) {
      redib();
      return;
    }
    // Un "toc" (punto de la i o j) puede dar 1 solo punto: lo ampliamos
    // a micro-trazo de 2 px para que el validador DTW pueda emparejarlo.
    if (live.pts.length < 2) {
      const p = live.pts[0];
      live.pts.push([p[0] + 2, p[1] + 1]);
      live.presiones.push(live.presiones[0] ?? 0.5);
    }
    strokesRef.current.push(live);
    redib();

    if (completado.current) return;
    const childPts = strokesRef.current.map((s) => s.pts);
    // IMPORTANTE: la ruta objetivo está en espacio normalizado (0..1);
    // los puntos del niño están en píxeles. Se evalúa en el mismo espacio.
    const strokesPx: Pt[][] = strokes.map((st) => st.map((p) => toPx(p)));
    // Multitrazo: solo se auto-completa cuando la forma completa está
    // sustancialmente cubierta, sin importar cuántas veces se levantó el dedo.
    if (trazoCompleto(childPts, strokesPx, size)) {
      completado.current = true;
      const res = evaluarTrazo(childPts, strokesPx, size, hitosRef.current);
      setUltimoRes(res);
      setFeedback('fin');
      if (res.calificacion === 'logrado') sfx.star();
      else if (res.calificacion === 'bien') sfx.success();
      else sfx.error();
      onComplete(res);
    } else {
      // falta trazo (letras de 2 trazos)
      const cubiertos = strokes.map((st) => {
        const [sx, sy] = toPx(st[0]);
        return childPts.flat().some((p) => Math.hypot(p[0] - sx, p[1] - sy) < size * 0.2);
      });
      const faltaIdx = cubiertos.findIndex((c) => !c);
      if (faltaIdx >= 0) {
        setFeedback('desviado');
      }
      onProgress?.(progresoSecuencial());
    }
  };

  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  const faltaTrazo = (
    strokes.map((st) => {
      const [sx, sy] = toPx(st[0]);
      return strokesRef.current.flatMap((s) => s.pts).some((p) => Math.hypot(p[0] - sx, p[1] - sy) < size * 0.2);
    }).findIndex((c) => !c)
  );

  /** El niño decide que terminó: se evalúa lo que haya trazado (mismo espacio en píxeles) */
  const listoManual = () => {
    if (completado.current || strokesRef.current.length === 0) return;
    completado.current = true;
    const childPts = strokesRef.current.map((s) => s.pts);
    const strokesPx: Pt[][] = strokes.map((st) => st.map((p) => toPx(p)));
    const res = evaluarTrazo(childPts, strokesPx, size, hitosRef.current);
    setUltimoRes(res);
    setFeedback('fin');
    if (res.calificacion === 'logrado') sfx.star();
    else if (res.calificacion === 'bien') sfx.success();
    else sfx.error();
    onComplete(res);
  };

  return (
    <div ref={wrapRef} className="w-full select-none">
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size, touchAction: 'none' }}
        className="mx-auto cursor-crosshair rounded-3xl shadow-inner ring-4 ring-amber-200"
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerCancel={handleUp}
      />
      <div className="mt-2 flex items-center justify-center gap-2 text-sm font-bold">
        <div className="flex flex-1 items-center justify-center">
          {ultimoRes ? (
            <span className={`rounded-full px-3 py-1 ${
              ultimoRes.calificacion === 'logrado' ? 'bg-green-100 text-green-700'
              : ultimoRes.calificacion === 'bien' ? 'bg-sky-100 text-sky-700'
              : 'bg-orange-100 text-orange-700'
            }`}>
              {ultimoRes.calificacion === 'logrado' ? '¡Logrado! ⭐' : ultimoRes.calificacion === 'bien' ? '¡Muy bien! 👍' : 'Practica de nuevo 💪'}
              {' '}· {ultimoRes.global}%
            </span>
          ) : (
            <>
              {feedback === 'bien' && <span className="rounded-full bg-green-100 px-3 py-1 text-green-700">¡Vas muy bien! 🟢</span>}
              {feedback === 'desviado' && <span className="rounded-full bg-orange-100 px-3 py-1 text-orange-700">{faltaTrazo >= 0 && strokes.length > 1 ? `Falta el trazo ${faltaTrazo + 1} 🟠` : 'Sigue los puntitos 🟠'}</span>}
              {!feedback && <span className="rounded-full bg-sky-100 px-3 py-1 text-sky-700">Toca el 1 y traza 👆</span>}
            </>
          )}
        </div>
        {!ultimoRes && (
          <button
            onClick={listoManual}
            disabled={strokesRef.current.length === 0}
            className="font-display shrink-0 rounded-full bg-green-500 px-4 py-2.5 text-sm font-black text-white shadow transition active:scale-95 disabled:opacity-40"
          >
            Listo ✓
          </button>
        )}
      </div>
      {!ultimoRes && strokesRef.current.length > 0 && (
        <p className="mt-1 text-center text-[11px] font-bold text-slate-400">
          Puedes levantar el dedo cuantas veces necesites: {strokesRef.current.length} {strokesRef.current.length === 1 ? 'trazo' : 'trazos'}
        </p>
      )}
    </div>
  );
}
