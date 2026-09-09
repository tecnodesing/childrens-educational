import { useMemo, useRef, useState } from 'react';
import { ArrowLeft, Lock, Volume2, Check, Download, Upload, Trash2, Play, BarChart3, Mic, Gauge, AudioLines, RefreshCw } from 'lucide-react';
import { tdVoice, } from '../lib/td-voice';
import { sfx } from '../lib/audio';
import { INSIGNIAS, MATERIAS, PERSONAJES } from '../lib/content';
import type { AppState, Perfil } from '../lib/types';

export default function ParentDashboard({
  state,
  perfil,
  onBack,
  onUpdateState,
  onSwitchProfile,
  onDeleteProfile,
  onSaveVoice,
  onPresentation,
}: {
  state: AppState;
  perfil: Perfil;
  onBack: () => void;
  onUpdateState: (s: AppState) => void;
  onSwitchProfile: (id: string) => void;
  onDeleteProfile: (id: string) => void;
  onSaveVoice: (nombreVoz: string, rate: number, pitch: number, sonido: boolean) => void;
  onPresentation: () => void;
}) {
  // Puerta de acceso: operación simple
  const [gateA] = useState(() => 5 + Math.floor(Math.random() * 8));
  const [gateB] = useState(() => 3 + Math.floor(Math.random() * 6));
  const [gateResp, setGateResp] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [holdPct, setHoldPct] = useState(0);
  const holdTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Voz
  const [voces, setVoces] = useState(() => tdVoice.getAvailableSpanishVoices());
  const [vozSel, setVozSel] = useState(perfil.configuracion.vozSeleccionada || tdVoice.getCurrentVoiceName());
  const [rate, setRate] = useState(perfil.configuracion.velocidadVoz || tdVoice.getRate());
  const [pitch, setPitch] = useState(perfil.configuracion.tonoVoz || tdVoice.getPitch());
  const [sonido, setSonido] = useState(perfil.configuracion.sonidoActivado);
  const [guardado, setGuardado] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const precision = perfil.progreso.intentosTotales === 0 ? 0 : Math.round((perfil.progreso.aciertosTotales / perfil.progreso.intentosTotales) * 100);

  const refreshVoices = async () => {
    await tdVoice.ready();
    setVoces(tdVoice.getAvailableSpanishVoices());
  };

  useMemo(() => { void refreshVoices(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startHold = () => {
    setHoldPct(0);
    let p = 0;
    holdTimer.current = setInterval(() => {
      p += 4;
      setHoldPct(p);
      if (p >= 100) {
        if (holdTimer.current) clearInterval(holdTimer.current);
        setUnlocked(true);
        sfx.success();
      }
    }, 120);
  };
  const endHold = () => {
    if (holdTimer.current) clearInterval(holdTimer.current);
    setHoldPct(0);
  };

  const tryGate = () => {
    if (parseInt(gateResp, 10) === gateA + gateB) {
      setUnlocked(true);
      sfx.success();
    } else {
      sfx.error();
      setGateResp('');
    }
  };

  const probarVoz = (nombre?: string) => {
    sfx.click();
    tdVoice.previewVoice(nombre ?? vozSel, rate, pitch);
  };

  const guardarVoz = () => {
    tdVoice.setVoiceByName(vozSel);
    tdVoice.setRatePitch(rate, pitch);
    onSaveVoice(vozSel, rate, pitch, sonido);
    setGuardado(true);
    sfx.success();
    tdVoice.speak('Voz guardada. Así hablaré de ahora en adelante.');
    setTimeout(() => setGuardado(false), 2500);
  };

  const exportar = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aprende-jugando-${perfil.nombre}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    sfx.success();
  };

  const importar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const parsed = JSON.parse(String(r.result)) as AppState;
        if (!Array.isArray(parsed.perfiles)) throw new Error('bad');
        onUpdateState(parsed);
        sfx.fanfare();
        alert('✅ Progreso importado correctamente.');
      } catch {
        sfx.error();
        alert('❌ Archivo inválido.');
      }
    };
    r.readAsText(f);
  };

  if (!unlocked) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-slate-900 px-3 sm:px-4">
        <div className="w-full max-w-sm rounded-3xl bg-white p-5 text-center shadow-2xl sm:p-6">
          <button onClick={onBack} className="mb-2 flex items-center gap-1 text-sm font-bold text-slate-500"><ArrowLeft className="h-4 w-4" /> Volver</button>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100"><Lock className="h-8 w-8 text-slate-600" /></div>
          <h2 className="font-display mt-3 text-2xl font-black text-slate-900">Zona de adultos 🔐</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">Resuelve para entrar o mantén presionado 3 segundos.</p>
          <div className="font-display mt-4 rounded-2xl bg-slate-100 p-4 text-3xl font-black text-slate-800">
            {gateA} + {gateB} = ?
          </div>
          <div className="mt-3 flex gap-2">
            <input
              value={gateResp}
              onChange={(e) => setGateResp(e.target.value.replace(/\D/g, '').slice(0, 3))}
              onKeyDown={(e) => e.key === 'Enter' && tryGate()}
              inputMode="numeric"
              placeholder="?"
              className="min-h-[56px] flex-1 rounded-2xl border-2 border-slate-200 text-center text-2xl font-black outline-none focus:border-sky-400"
            />
            <button onClick={tryGate} className="min-h-[56px] rounded-2xl bg-sky-500 px-5 font-display text-lg font-black text-white active:scale-95">OK</button>
          </div>
          <button
            onPointerDown={startHold}
            onPointerUp={endHold}
            onPointerLeave={endHold}
            className="relative mt-3 min-h-[52px] w-full overflow-hidden rounded-2xl bg-slate-200 font-bold text-slate-600"
          >
            <span className="absolute inset-y-0 left-0 bg-sky-400/50" style={{ width: `${holdPct}%` }} />
            <span className="relative">Mantén presionado… {Math.round(holdPct)}%</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-slate-100">
      <div className="shrink-0 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-3 py-3 sm:px-4">
          <button onClick={() => { tdVoice.stop(); onBack(); }} className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 active:scale-95" aria-label="Volver">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-display text-xl font-black text-slate-900">Panel del adulto 👨‍👩‍👧</h1>
            <p className="text-xs font-bold text-slate-500">Progreso, voz y perfiles</p>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl flex-1 space-y-4 overflow-y-auto px-3 pt-4 pb-8 sm:px-4">
        {/* Presentación para padres */}
        <button
          onClick={() => { sfx.click(); tdVoice.stop(); onPresentation(); }}
          className="flex w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-indigo-500 to-violet-600 p-3 font-display text-sm font-black text-white shadow-lg transition active:scale-[0.98] sm:p-4 sm:text-lg"
        >
          📽️ Ver presentación para padres de familia <span className="rounded-full bg-white/25 px-2 py-0.5 text-xs">2 min</span>
        </button>

        {/* Resumen */}
        <section className="rounded-3xl bg-white p-4 shadow">
          <h2 className="font-display flex items-center gap-2 text-lg font-black text-slate-900"><BarChart3 className="h-5 w-5 text-sky-600" /> Progreso de {perfil.nombre}</h2>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { l: 'Bloque / Semana', v: `${perfil.progreso.bloqueActual} / ${perfil.progreso.semanaActual}` },
              { l: 'Estrellas ⭐', v: `${perfil.progreso.estrellas}` },
              { l: 'Monedas 🪙', v: `${perfil.progreso.monedas}` },
              { l: 'Precisión 🎯', v: `${precision}%` },
              { l: 'Racha 🔥', v: `${perfil.progreso.rachaDias} días` },
              { l: 'Tiempo ⏱️', v: `~${perfil.progreso.tiempoTotalMin} min` },
              { l: 'Insignias 🎖️', v: `${perfil.progreso.insignias.length}/${INSIGNIAS.length}` },
              { l: 'Intros vistas 👀', v: `${perfil.progreso.introVistas.length}` },
            ].map((c, i) => (
              <div key={i} className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
                <div className="text-[10px] font-black uppercase tracking-wide text-slate-400">{c.l}</div>
                <div className="font-display text-xl font-black text-slate-900">{c.v}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-2">
            {MATERIAS.map((m) => {
              const done = perfil.progreso.actividadesCompletadas[m.id].length;
              return (
                <div key={m.id}>
                  <div className="flex justify-between text-xs font-black text-slate-600"><span>{m.emoji} {m.nombre}</span><span>{done}/120</span></div>
                  <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full bg-gradient-to-r ${m.color}`} style={{ width: `${(done / 120) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-3 rounded-2xl bg-sky-50 p-3 text-xs font-semibold leading-relaxed text-sky-900">
            📌 Resumen semanal: {perfil.progreso.historialSemanal.length > 0
              ? perfil.progreso.historialSemanal.slice(-2).map((h) => `Sem ${h.semana} (${h.fecha}): ${h.resumen}.`).join(' ')
              : 'Aún no se completa ninguna semana. ¡Sigue jugando!'}
          </p>
        </section>

        {/* Voz de TD */}
        <section className="rounded-3xl bg-white p-4 shadow ring-2 ring-sky-100">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display flex items-center gap-2 text-lg font-black text-slate-900"><Mic className="h-5 w-5 text-sky-600" /> Voz de TD 🎙️</h2>
            <button onClick={() => { sfx.click(); void refreshVoices(); }} className="flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-2 text-xs font-black text-sky-700 active:scale-95">
              <RefreshCw className="h-3.5 w-3.5" /> Actualizar voces
            </button>
          </div>
          <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-500">
            Las voces dependen del sistema operativo. Si acabas de <b>instalar una voz</b> (Android: app *Google Text-to-Speech* → Idiomas; iPhone: Ajustes → Accesibilidad → Contenido leído en voz alta → Voces → Español), toca "Actualizar voces".
            Activa: <span className="font-black text-sky-700">{tdVoice.getCurrentVoiceName() || vozSel || 'automática'}</span>
          </p>
          <div className="mt-3 max-h-56 space-y-2 overflow-y-auto rounded-2xl bg-slate-50 p-2">
            {voces.length === 0 && <p className="p-3 text-sm font-bold text-slate-400">Cargando voces… <button onClick={refreshVoices} className="text-sky-600 underline">reintentar</button></p>}
            {voces.map((v) => (
              <div key={v.name} className={`flex items-center gap-2 rounded-2xl p-2.5 ring-1 ${vozSel === v.name ? 'bg-sky-50 ring-sky-300' : 'bg-white ring-slate-100'}`}>
                <button onClick={() => setVozSel(v.name)} className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${vozSel === v.name ? 'border-sky-500 bg-sky-500 text-white' : 'border-slate-300'}`} aria-label={`Elegir ${v.name}`}>
                  {vozSel === v.name && <Check className="h-4 w-4" strokeWidth={3.5} />}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-black text-slate-800">{v.name}</div>
                  <div className="text-[11px] font-bold text-slate-400">{v.lang} · {v.localService ? '📱 local' : '☁️ remota'}</div>
                </div>
                <button onClick={() => probarVoz(v.name)} className="flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-600 active:scale-95">
                  <Play className="h-3.5 w-3.5" /> Probar
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 sm:gap-3">
            <div className="rounded-2xl bg-slate-50 p-2.5 sm:p-3">
              <label className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-500 sm:text-xs"><Gauge className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Velocidad: {rate.toFixed(2)}</label>
              <input type="range" min={0.75} max={1.1} step={0.05} value={rate} onChange={(e) => setRate(parseFloat(e.target.value))} className="mt-2 w-full accent-sky-500" />
            </div>
            <div className="rounded-2xl bg-slate-50 p-2.5 sm:p-3">
              <label className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-500 sm:text-xs"><AudioLines className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Tono: {pitch.toFixed(2)}</label>
              <input type="range" min={1.0} max={1.3} step={0.05} value={pitch} onChange={(e) => setPitch(parseFloat(e.target.value))} className="mt-2 w-full accent-violet-500" />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={() => probarVoz()} className="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-2xl bg-slate-100 font-black text-xs text-slate-700 active:scale-95 sm:min-h-[52px] sm:gap-2 sm:text-sm">
              <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" /> Probar
            </button>
            <button onClick={guardarVoz} className="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-b from-sky-500 to-blue-600 font-display font-black text-xs text-white shadow active:scale-95 sm:min-h-[52px] sm:gap-2 sm:text-sm">
              {guardado ? <><Check className="h-4 w-4 sm:h-5 sm:w-5" /> ¡Guardado!</> : 'Guardar'}
            </button>
          </div>
          <label className="mt-3 flex cursor-pointer items-center justify-between rounded-2xl bg-slate-50 p-3">
            <span className="text-sm font-black text-slate-700">🔊 Sonido y efectos</span>
            <button onClick={() => setSonido(!sonido)} className={`relative h-8 w-14 rounded-full transition ${sonido ? 'bg-green-500' : 'bg-slate-300'}`} aria-label="Activar sonido">
              <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${sonido ? 'left-7' : 'left-1'}`} />
            </button>
          </label>
        </section>

        {/* Exportar / importar */}
        <section className="rounded-3xl bg-white p-4 shadow">
          <h2 className="font-display text-lg font-black text-slate-900">💾 Respaldo de progreso</h2>
          <div className="mt-3 flex gap-2">
            <button onClick={exportar} className="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-2xl bg-emerald-500 font-black text-xs text-white active:scale-95 sm:min-h-[52px] sm:gap-2 sm:text-sm">
              <Download className="h-4 w-4 sm:h-5 sm:w-5" /> Exportar
            </button>
            <button onClick={() => fileRef.current?.click()} className="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-2xl bg-amber-500 font-black text-xs text-white active:scale-95 sm:min-h-[52px] sm:gap-2 sm:text-sm">
              <Upload className="h-4 w-4 sm:h-5 sm:w-5" /> Importar
            </button>
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={importar} />
          </div>
        </section>

        {/* Perfiles */}
        <section className="rounded-3xl bg-white p-4 shadow">
          <h2 className="font-display text-lg font-black text-slate-900">👥 Perfiles ({state.perfiles.length})</h2>
          <div className="mt-3 space-y-2">
            {state.perfiles.map((p) => {
              const pj = PERSONAJES.find((x) => x.id === p.personaje);
              const activo = p.id === perfil.id;
              return (
                <div key={p.id} className={`flex items-center gap-2 rounded-2xl p-2.5 ring-2 sm:gap-3 sm:p-3 ${activo ? 'bg-sky-50 ring-sky-300' : 'bg-slate-50 ring-slate-100'}`}>
                  <span className="text-2xl sm:text-3xl">{pj?.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-black text-slate-800">{p.nombre} {activo && <span className="ml-1 inline-block rounded-full bg-sky-500 px-1.5 py-0.5 text-[9px] uppercase text-white sm:px-2 sm:text-[10px]">activo</span>}</div>
                    <div className="truncate text-[10px] font-bold text-slate-400 sm:text-xs">Sem {p.progreso.semanaActual} · ⭐{p.progreso.estrellas} · {p.fechaCreacion}</div>
                  </div>
                  {!activo && (
                    <button onClick={() => onSwitchProfile(p.id)} className="shrink-0 rounded-full bg-sky-500 px-3 py-1.5 text-[10px] font-black text-white active:scale-95 sm:px-4 sm:text-xs">Usar</button>
                  )}
                  <button onClick={() => { if (confirm(`¿Borrar el perfil de ${p.nombre}?`)) onDeleteProfile(p.id); }} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 active:scale-95 sm:h-10 sm:w-10" aria-label={`Borrar ${p.nombre}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
