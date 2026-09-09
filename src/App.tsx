import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MoonStar } from 'lucide-react';
import OnboardingScreen from './screens/OnboardingScreen';
import DiagnosticTest from './screens/DiagnosticTest';
import WelcomeScreen from './screens/WelcomeScreen';
import HomeMap from './screens/HomeMap';
import ActivityHub from './screens/ActivityHub';
import ActivityRunner, { type ResultadoActividad } from './screens/ActivityRunner';
import ProgressScreen from './screens/ProgressScreen';
import ParentDashboard from './screens/ParentDashboard';
import SettingsScreen from './screens/SettingsScreen';
import PresentationScreen from './screens/PresentationScreen';
import TDAssistant from './components/TDAssistant';
import Logo from './components/Logo';
import TDRobot, { type TDMood } from './components/TDRobot';
import { tdVoice } from './lib/td-voice';
import { setSoundEnabled, sfx } from './lib/audio';
import {
  loadState, saveState, getActiveProfile, findByName, createProfile, touchSession,
  markIntroVista, isActivityDone, maybeAdvanceWeek, awardInsignia, conteoSemana,
} from './lib/store';
import { getActividadSafe, TD_TIPS_DESCANSO } from './lib/content';
import type { AppState, Materia, Perfil } from './lib/types';

type Pantalla = 'boot' | 'onboarding' | 'diagnostic' | 'welcome' | 'home' | 'hub' | 'runner' | 'progress' | 'parent' | 'settings' | 'presentacion';

export default function App() {
  const [state, setState] = useState<AppState>({ perfiles: [], perfilActivo: null, diagCompletado: {} });
  const [pantalla, setPantalla] = useState<Pantalla>('boot');
  const [semanaSel, setSemanaSel] = useState(1);
  const [materiaSel, setMateriaSel] = useState<Materia>('lectura');
  const [tdMessage, setTdMessage] = useState('');
  const [tdMood, setTdMood] = useState<TDMood>('feliz');
  const [showRest, setShowRest] = useState(false);
  const [pendingProfile, setPendingProfile] = useState<Perfil | null>(null);
  const sessionStart = useRef(Date.now());
  const restShown = useRef(false);

  const perfil = getActiveProfile(state);

  // ---------- say(): mensaje global de TD ----------
  const say = useCallback((texto: string, mood: TDMood = 'feliz') => {
    setTdMessage(texto);
    setTdMood(mood);
    tdVoice.speak(texto);
  }, []);

  const replay = useCallback(() => {
    if (tdMessage) {
      sfx.click();
      tdVoice.speak(tdMessage);
    }
  }, [tdMessage]);

  // ---------- boot ----------
  useEffect(() => {
    const loaded = loadState();
    setState(loaded);
    // Voz: preferencia del perfil activo
    const active = loaded.perfilActivo ? loaded.perfiles.find((p) => p.id === loaded.perfilActivo) : null;
    if (active?.configuracion.vozSeleccionada) {
      tdVoice.setPreferredName(active.configuracion.vozSeleccionada);
      tdVoice.setRatePitch(active.configuracion.velocidadVoz, active.configuracion.tonoVoz);
      setSoundEnabled(active.configuracion.sonidoActivado);
    }
    void tdVoice.ready().then((name) => {
      // Si el perfil no tenía voz guardada, persistir la auto-detectada
      if (active && !active.configuracion.vozSeleccionada && name) {
        active.configuracion.vozSeleccionada = name;
        const next = { ...loaded, perfiles: loaded.perfiles.map((p) => (p.id === active.id ? active : p)) };
        setState(next);
        saveState(next);
      }
    });
    const t = setTimeout(() => {
      if (active) {
        touchSession(active);
        saveState(loaded);
        setPantalla('home');
        setSemanaSel(active.progreso.semanaActual);
        setTdMessage(`¡Hola de nuevo, ${active.nombre}! Toca Jugar para seguir en la semana ${active.progreso.semanaActual}. 🗺️`);
        setTdMood('feliz');
      } else {
        setPantalla(loaded.perfiles.length > 0 ? 'onboarding' : 'onboarding');
      }
    }, 1400);
    return () => clearTimeout(t);
  }, []);

  // ---------- recordatorio de descanso (~10 min) ----------
  useEffect(() => {
    if (pantalla !== 'home' && pantalla !== 'hub' && pantalla !== 'runner') return;
    const iv = setInterval(() => {
      const mins = (Date.now() - sessionStart.current) / 60000;
      if (mins >= 10 && !restShown.current) {
        restShown.current = true;
        setShowRest(true);
        sfx.star();
        const tip = TD_TIPS_DESCANSO[Math.floor(Math.random() * TD_TIPS_DESCANSO.length)];
        setTdMessage(tip);
        tdVoice.speak(tip);
      }
    }, 20000);
    return () => clearInterval(iv);
  }, [pantalla]);

  const ir = (p: Pantalla) => {
    tdVoice.stop();
    setPantalla(p);
    window.scrollTo(0, 0);
  };

  // Presentación para padres: recuerda de dónde salió para volver ahí
  const [presentacionDesde, setPresentacionDesde] = useState<Pantalla>('onboarding');
  const abrirPresentacion = (desde: Pantalla) => {
    setPresentacionDesde(desde);
    tdVoice.stop();
    setPantalla('presentacion');
    window.scrollTo(0, 0);
  };

  const persist = (next: AppState) => {
    setState(next);
    saveState(next);
  };

  // iOS Safari / algunos navegadores: la voz no suena hasta que hay un
  // gesto del usuario. "Destrabamos" el motor de voz en el primer toque.
  useEffect(() => {
    const prime = () => {
      try {
        if ('speechSynthesis' in window && window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      } catch {
        /* navegador sin soporte */
      }
    };
    window.addEventListener('pointerdown', prime);
    window.addEventListener('touchend', prime);
    return () => {
      window.removeEventListener('pointerdown', prime);
      window.removeEventListener('touchend', prime);
    };
  }, []);

  // ---------- onboarding ----------
  const handleOnboardingDone = async (nombre: string, personaje: string) => {
    const existente = findByName(state, nombre);
    if (existente) {
      // Nombre existente → cargar perfil
      const next: AppState = { ...state, perfilActivo: existente.id };
      touchSession(existente);
      persist(next);
      tdVoice.setPreferredName(existente.configuracion.vozSeleccionada || null);
      if (existente.configuracion.vozSeleccionada) {
        await tdVoice.ready();
        tdVoice.setVoiceByName(existente.configuracion.vozSeleccionada);
      }
      tdVoice.setRatePitch(existente.configuracion.velocidadVoz, existente.configuracion.tonoVoz);
      setSoundEnabled(existente.configuracion.sonidoActivado);
      setSemanaSel(existente.progreso.semanaActual);
      setPendingProfile(existente);
      setPantalla('welcome');
      return;
    }
    // Nuevo → crear + voz auto-detectada + diagnóstico
    await tdVoice.ready();
    const voz = tdVoice.getCurrentVoiceName();
    const nuevo = createProfile(nombre, personaje, voz, tdVoice.getRate(), tdVoice.getPitch());
    touchSession(nuevo);
    const next: AppState = { ...state, perfiles: [...state.perfiles, nuevo], perfilActivo: nuevo.id };
    persist(next);
    setPendingProfile(nuevo);
    setPantalla('diagnostic');
  };

  const handleSelectExisting = async (p: Perfil) => {
    const next: AppState = { ...state, perfilActivo: p.id };
    touchSession(p);
    persist(next);
    await tdVoice.ready();
    if (p.configuracion.vozSeleccionada) tdVoice.setVoiceByName(p.configuracion.vozSeleccionada);
    tdVoice.setRatePitch(p.configuracion.velocidadVoz, p.configuracion.tonoVoz);
    setSoundEnabled(p.configuracion.sonidoActivado);
    setSemanaSel(p.progreso.semanaActual);
    setPendingProfile(p);
    setPantalla('welcome');
  };

  const handleDiagFinish = () => {
    if (!pendingProfile && !perfil) return;
    const id = (pendingProfile ?? perfil)!.id;
    const next = { ...state, diagCompletado: { ...state.diagCompletado, [id]: true } };
    persist(next);
    setPantalla('welcome');
  };

  // ---------- actividades ----------
  const [varianteSel, setVarianteSel] = useState(1);
  const actividadActual = getActividadSafe(materiaSel, semanaSel, varianteSel);

  const handleStartActividad = (materia: Materia, variante: number) => {
    setMateriaSel(materia);
    setVarianteSel(variante);
    setPantalla('runner');
    window.scrollTo(0, 0);
  };

  const rangoSemana = (p: Perfil, m: Materia, a: number, b: number) => {
    let n = 0;
    for (let s = a; s <= b; s++) n += conteoSemana(p, m, s);
    return n;
  };

  const checkInsignias = (p: Perfil) => {
    const c = p.progreso.actividadesCompletadas;
    if (rangoSemana(p, 'lectura', 1, 2) >= 2) awardInsignia(p, 'maestro-vocales');
    if (rangoSemana(p, 'lectura', 7, 8) >= 2) awardInsignia(p, 'cazador-silabas');
    if (rangoSemana(p, 'lectura', 13, 24) >= 2) awardInsignia(p, 'lector-estrella');
    if (c.escritura.length >= 10) awardInsignia(p, 'artista-trazo');
    if (rangoSemana(p, 'suma', 1, 2) >= 2) awardInsignia(p, 'contador-brillante');
    if (conteoSemana(p, 'suma', 10) >= 1) awardInsignia(p, 'genio-sumas');
    if (conteoSemana(p, 'resta', 10) >= 1) awardInsignia(p, 'heroe-restas');
    if (p.progreso.semanaActual >= 7) awardInsignia(p, 'explorador');
    if (p.progreso.semanaActual >= 19) awardInsignia(p, 'aventurero');
    if (p.progreso.estrellas >= 50) awardInsignia(p, 'super-estrella');
  };

  const handleActivityComplete = (r: ResultadoActividad) => {
    if (!perfil) return;
    const p: Perfil = JSON.parse(JSON.stringify(perfil)) as Perfil;
    p.progreso.estrellas += r.estrellas;
    p.progreso.monedas += r.monedas;
    p.progreso.aciertosTotales += r.aciertos;
    p.progreso.intentosTotales += r.intentos;
    p.progreso.tiempoTotalMin += 5;
    if (!isActivityDone(p, materiaSel, r.actividadId)) {
      p.progreso.actividadesCompletadas[materiaSel].push(r.actividadId);
    }
    markIntroVista(p, `${r.actividadId}-intro`);
    // Dificultad adaptativa simple
    const key = materiaSel === 'escritura' ? 'escritura' : materiaSel === 'lectura' ? 'lectura' : materiaSel;
    if (r.precision >= 0.8) {
      p.progreso.nivelDificultadActual[key] = Math.min(3, p.progreso.nivelDificultadActual[key] + 1);
      delete p.progreso.nivelesFallidos[r.actividadId];
    } else if (r.precision < 0.5) {
      p.progreso.nivelesFallidos[r.actividadId] = (p.progreso.nivelesFallidos[r.actividadId] ?? 0) + 1;
    }
    const avanzo = maybeAdvanceWeek(p, semanaSel);
    checkInsignias(p);
    const next: AppState = { ...state, perfiles: state.perfiles.map((x) => (x.id === p.id ? p : x)) };
    persist(next);
    if (avanzo) {
      setSemanaSel(p.progreso.semanaActual);
    }
    ir('hub');
    setTimeout(() => {
      say(avanzo
        ? `¡Increíble! Completaste la semana ${semanaSel} y desbloqueaste la semana ${p.progreso.semanaActual}.`
        : `¡Actividad completada! Ganaste ${r.estrellas} estrellas. ¿Qué hacemos ahora?`, 'fiesta');
    }, 400);
  };

  // ---------- voz / sonido ----------
  const handleSaveVoice = (nombreVoz: string, rate: number, pitch: number, sonido: boolean) => {
    if (!perfil) return;
    const p: Perfil = { ...perfil, configuracion: { ...perfil.configuracion, vozSeleccionada: nombreVoz, velocidadVoz: rate, tonoVoz: pitch, sonidoActivado: sonido } };
    persist({ ...state, perfiles: state.perfiles.map((x) => (x.id === p.id ? p : x)) });
    setSoundEnabled(sonido);
  };

  const handleToggleSound = () => {
    if (!perfil) return;
    const v = !perfil.configuracion.sonidoActivado;
    handleSaveVoice(perfil.configuracion.vozSeleccionada, perfil.configuracion.velocidadVoz, perfil.configuracion.tonoVoz, v);
  };

  const showTD = pantalla === 'home' || pantalla === 'hub' || pantalla === 'runner';

  // ---------- render ----------
  if (pantalla === 'boot') {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-sky-400 via-sky-300 to-amber-100">
        <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 180, damping: 14 }}>
          <Logo withText size={110} />
        </motion.div>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }} className="mt-6 h-10 w-10 rounded-full border-4 border-white/40 border-t-white" />
        <p className="font-display mt-3 text-lg font-black text-white">TD está despertando… 🤖✨</p>
      </div>
    );
  }

  return (
    <div className="font-body min-h-dvh text-slate-900">
      <AnimatePresence>
        {showRest && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
              <MoonStar className="mx-auto h-12 w-12 text-indigo-500" />
              <h2 className="font-display mt-2 text-2xl font-black text-slate-900">Pausa de campeón 😌</h2>
              <div className="mx-auto mt-2 w-fit"><TDRobot mood="durmiendo" size={90} animate={false} /></div>
              <p className="mt-2 font-bold text-slate-600">Llevas 10 minutos aprendiendo. Descansa tus ojitos, toma agua 💧 y estírate.</p>
              <button onClick={() => { setShowRest(false); sessionStart.current = Date.now(); restShown.current = false; sfx.pop(); tdVoice.stop(); }} className="font-display mt-4 min-h-[56px] w-full rounded-2xl bg-gradient-to-b from-indigo-500 to-violet-600 text-lg font-black text-white active:scale-95">
                ¡Ya descansé! Seguir 🚀
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {pantalla === 'onboarding' && (
        <OnboardingScreen perfiles={state.perfiles} onDone={handleOnboardingDone} onSelectExisting={handleSelectExisting} onPresentation={() => abrirPresentacion('onboarding')} />
      )}
      {pantalla === 'diagnostic' && (pendingProfile ?? perfil) && (
        <DiagnosticTest nombre={(pendingProfile ?? perfil)!.nombre} onFinish={handleDiagFinish} />
      )}
      {pantalla === 'welcome' && (pendingProfile ?? perfil) && (
        <WelcomeScreen perfil={(pendingProfile ?? perfil)!} onGo={() => { setSemanaSel((pendingProfile ?? perfil)!.progreso.semanaActual); ir('home'); setTimeout(() => say(`Este es tu mapa, ${(pendingProfile ?? perfil)!.nombre}. Toca Jugar para empezar la semana ${(pendingProfile ?? perfil)!.progreso.semanaActual}.`), 500); }} />
      )}
      {pantalla === 'home' && perfil && (
        <HomeMap
          perfil={perfil}
          onSelectWeek={(s) => { setSemanaSel(s); ir('hub'); }}
          onProgress={() => ir('progress')}
          onParent={() => ir('parent')}
          onSettings={() => ir('settings')}
        />
      )}
      {pantalla === 'hub' && perfil && (
        <ActivityHub perfil={perfil} semana={semanaSel} onBack={() => ir('home')} onStart={handleStartActividad} say={(t) => say(t)} />
      )}
      {pantalla === 'runner' && perfil && (
        <ActivityRunner
          perfil={perfil}
          actividad={actividadActual}
          yaVioIntro={perfil.progreso.introVistas.includes(`${actividadActual.id}-intro`)}
          onExit={() => ir('hub')}
          onComplete={handleActivityComplete}
          say={say}
        />
      )}
      {pantalla === 'progress' && perfil && (
        <ProgressScreen perfil={perfil} onBack={() => ir('home')} />
      )}
      {pantalla === 'parent' && perfil && (
        <ParentDashboard
          state={state}
          perfil={perfil}
          onBack={() => ir('home')}
          onUpdateState={persist}
          onSwitchProfile={(id) => {
            const p = state.perfiles.find((x) => x.id === id);
            if (!p) return;
            persist({ ...state, perfilActivo: id });
            setSemanaSel(p.progreso.semanaActual);
            ir('home');
          }}
          onDeleteProfile={(id) => {
            const rest = state.perfiles.filter((x) => x.id !== id);
            const next: AppState = { perfiles: rest, perfilActivo: rest.length > 0 ? rest[0].id : null, diagCompletado: state.diagCompletado };
            persist(next);
            if (rest.length === 0) ir('onboarding');
            else { setSemanaSel(rest[0].progreso.semanaActual); ir('home'); }
          }}
          onSaveVoice={handleSaveVoice}
          onPresentation={() => abrirPresentacion('parent')}
        />
      )}
      {pantalla === 'settings' && perfil && (
        <SettingsScreen
          perfiles={state.perfiles}
          perfil={perfil}
          onBack={() => ir('home')}
          onSwitch={(id) => {
            const p = state.perfiles.find((x) => x.id === id);
            if (!p) return;
            persist({ ...state, perfilActivo: id });
            setSemanaSel(p.progreso.semanaActual);
          }}
          onNewProfile={() => ir('onboarding')}
          onToggleSound={handleToggleSound}
          onParent={() => ir('parent')}
          onPresentation={() => abrirPresentacion('settings')}
        />
      )}

      {pantalla === 'presentacion' && (
        <PresentationScreen onExit={() => ir(presentacionDesde)} />
      )}

      {showTD && (
        <TDAssistant message={tdMessage} mood={tdMood} onReplay={replay} />
      )}
    </div>
  );
}
