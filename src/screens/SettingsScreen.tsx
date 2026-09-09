import { ArrowLeft, Volume2, Users, Plus, Info, Download } from 'lucide-react';
import Logo from '../components/Logo';
import { PERSONAJES } from '../lib/content';
import { tdVoice } from '../lib/td-voice';
import { sfx } from '../lib/audio';
import type { Perfil } from '../lib/types';

export default function SettingsScreen({
  perfiles,
  perfil,
  onBack,
  onSwitch,
  onNewProfile,
  onToggleSound,
  onParent,
  onPresentation,
}: {
  perfiles: Perfil[];
  perfil: Perfil;
  onBack: () => void;
  onSwitch: (id: string) => void;
  onNewProfile: () => void;
  onToggleSound: () => void;
  onParent: () => void;
  onPresentation: () => void;
}) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-gradient-to-b from-sky-100 to-amber-50">
      <div className="shrink-0 border-b-2 border-sky-100 bg-white/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-2 px-3 py-3 sm:items-center sm:gap-3 sm:px-4">
          <button onClick={() => { sfx.click(); tdVoice.stop(); onBack(); }} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-700 shadow ring-2 ring-slate-100 active:scale-95 sm:h-12 sm:w-12" aria-label="Volver">
            <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
          <h1 className="font-display text-lg font-black text-slate-900 sm:text-xl">Ajustes ⚙️</h1>
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl flex-1 space-y-3 overflow-y-auto px-3 pt-4 pb-8 sm:px-4">
        <div className="flex justify-center py-2"><Logo withText size={60} /></div>

        {/* Perfiles */}
        <section className="rounded-3xl bg-white p-4 shadow">
          <h2 className="font-display flex items-center gap-2 text-lg font-black text-slate-900"><Users className="h-5 w-5 text-sky-600" /> Elegir perfil</h2>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {perfiles.map((p) => {
              const pj = PERSONAJES.find((x) => x.id === p.personaje);
              const activo = p.id === perfil.id;
              return (
                <button key={p.id} onClick={() => { sfx.pop(); onSwitch(p.id); }} className={`flex items-center gap-2 rounded-2xl p-3 text-left ring-2 transition active:scale-95 ${activo ? 'bg-sky-50 ring-sky-400' : 'bg-slate-50 ring-slate-100'}`}>
                  <span className="text-3xl">{pj?.emoji}</span>
                  <span>
                    <span className="block font-black text-slate-800">{p.nombre}</span>
                    <span className="block text-[11px] font-bold text-slate-400">Sem {p.progreso.semanaActual} · ⭐{p.progreso.estrellas}</span>
                  </span>
                </button>
              );
            })}
            <button onClick={() => { sfx.pop(); onNewProfile(); }} className="flex min-h-[68px] items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-sky-300 bg-sky-50 font-black text-sky-600 active:scale-95">
              <Plus className="h-5 w-5" /> Nuevo niño
            </button>
          </div>
        </section>

        {/* Sonido y voz */}
        <section className="rounded-3xl bg-white p-4 shadow">
          <h2 className="font-display text-lg font-black text-slate-900">🔊 Sonido y voz</h2>
          <div className="mt-3 flex items-center justify-between rounded-2xl bg-slate-50 p-3">
            <span className="text-sm font-black text-slate-700">Efectos de sonido</span>
            <button onClick={() => { sfx.click(); onToggleSound(); }} className={`relative h-8 w-14 rounded-full transition ${perfil.configuracion.sonidoActivado ? 'bg-green-500' : 'bg-slate-300'}`} aria-label="Sonido">
              <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${perfil.configuracion.sonidoActivado ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
          <div className="mt-2 rounded-2xl bg-sky-50 p-3 ring-1 ring-sky-100">
            <p className="text-sm font-bold text-slate-600">Voz actual de TD:</p>
            <p className="font-display font-black text-sky-800">{tdVoice.getCurrentVoiceName() || perfil.configuracion.vozSeleccionada || 'Automática'}</p>
            <div className="mt-2 flex gap-2">
              <button onClick={() => tdVoice.previewVoice(undefined, undefined, undefined)} className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-sky-500 py-2.5 text-sm font-black text-white active:scale-95">
                <Volume2 className="h-4 w-4" /> Probar voz
              </button>
              <button onClick={() => { sfx.click(); onParent(); }} className="flex-1 rounded-2xl bg-slate-700 py-2.5 text-sm font-black text-white active:scale-95">
                Cambiar (adultos)
              </button>
            </div>
          </div>
        </section>

        {/* App */}
        <section className="rounded-3xl bg-white p-4 shadow">
          <h2 className="font-display flex items-center gap-2 text-lg font-black text-slate-900"><Info className="h-5 w-5 text-sky-600" /> La app</h2>
          <div className="mt-2 space-y-2 text-sm font-semibold text-slate-600">
            <p className="rounded-2xl bg-slate-50 p-3 text-xs sm:text-sm">📱 <b>Instalar (según tu navegador):</b><br />
              • <b>Chrome / Edge</b> (Android y PC): menú ⋮ → "Instalar app".<br />
              • <b>Safari</b> (iPhone/iPad): botón de Compartir → "Añadir a inicio de pantalla".<br />
              • <b>Samsung Internet</b>: menú ⋮ → "Añadir a inicio de pantalla".<br />
              • <b>Firefox</b>: funciona igual (sin instalar), aunque con menos voces de TD.
            </p>
            <p className="rounded-2xl bg-slate-50 p-3 text-xs sm:text-sm">💾 <b>Tus datos</b> viven solo en este dispositivo (localStorage). Expórtalos desde el Panel del adulto para no perderlos al cambiar de equipo.</p>
            <p className="rounded-2xl bg-slate-50 p-3 text-xs sm:text-sm">🎯 <b>Meta:</b> 24 semanas (6 meses) para leer, escribir, sumar y restar jugando con TD, ~1 hora diaria.</p>
            <p className="rounded-2xl bg-slate-50 p-3 text-xs sm:text-sm">🎤 <b>Tip de voz:</b> el mejor sonido se logra con <b>Chrome</b> o <b>Safari</b> y una voz en español descargada en el sistema (ver Panel del adulto → Voz de TD).</p>
          </div>
          <button
            onClick={() => { sfx.click(); tdVoice.stop(); onPresentation(); }}
            className="mb-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 py-2.5 font-black text-sm text-white active:scale-95 sm:py-3 sm:text-base"
          >
            📽️ Presentación para padres de familia
          </button>
          <button
            onClick={() => {
              sfx.click();
              alert(
                'Cómo instalar Aprende Jugando:\n\n' +
                '• Chrome / Edge: menú ⋮ → "Instalar app".\n' +
                '• Safari (iPhone/iPad): Compartir → "Añadir a inicio de pantalla".\n' +
                '• Samsung Internet: menú ⋮ → "Añadir a inicio de pantalla".\n' +
                '• Firefox: úsala directamente o márcala como favorita.\n\n' +
                'Tras la primera carga funciona sin internet.'
              );
            }}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-violet-500 to-purple-600 py-2.5 font-black text-sm text-white active:scale-95 sm:py-3 sm:text-base"
          >
            <Download className="h-5 w-5" /> Cómo instalar la app
          </button>
        </section>

        <p className="pb-4 text-center text-xs font-bold text-slate-400">Aprende Jugando v2 · Hecho con 💙 para pequeños grandes lectores</p>
      </div>
    </div>
  );
}
