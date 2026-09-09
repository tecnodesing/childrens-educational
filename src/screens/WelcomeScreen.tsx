import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Map } from 'lucide-react';
import TDRobot from '../components/TDRobot';
import { PERSONAJES } from '../lib/content';
import { tdVoice } from '../lib/td-voice';
import { sfx } from '../lib/audio';
import confetti from 'canvas-confetti';
import type { Perfil } from '../lib/types';

export default function WelcomeScreen({ perfil, onGo }: { perfil: Perfil; onGo: () => void }) {
  const pj = PERSONAJES.find((p) => p.id === perfil.personaje) ?? PERSONAJES[0];

  useEffect(() => {
    const t = setTimeout(() => {
      tdVoice.speak(`¡Bienvenido a Aprende Jugando, ${perfil.nombre}! Soy TD y seré tu compañero. Mira tu mapa de aventura. ¡Vamos a divertirnos!`);
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
    }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-sky-300 via-sky-100 to-amber-100 px-4">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl">
        <div className="flex items-center justify-center gap-4">
          <TDRobot mood="fiesta" size={110} />
          <span className={`flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-b ${pj.gradiente} text-6xl shadow-lg`}>{pj.emoji}</span>
        </div>
        <h1 className="font-display mt-4 text-3xl font-black text-sky-950">¡Hola, {perfil.nombre}! 👋</h1>
        <p className="font-body mt-2 font-bold text-slate-600">
          {pj.nombre} y TD te acompañarán por 24 semanas de juegos: leer 📖, escribir ✏️, sumar ➕ y restar ➖.
        </p>
        <div className="mt-4 grid grid-cols-4 gap-2 text-3xl">
          {['🌳', '🌊', '⛰️', '🏰'].map((e, i) => (
            <motion.div key={i} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 + i * 0.15 }} className="rounded-2xl bg-sky-50 p-2">
              {e}
            </motion.div>
          ))}
        </div>
        <button onClick={() => { sfx.fanfare(); tdVoice.stop(); onGo(); }} className="font-display mt-5 flex min-h-[64px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-amber-400 to-orange-500 text-xl font-black text-white shadow-xl active:scale-[0.98]">
          <Map className="h-6 w-6" /> ¡Ver mi mapa!
        </button>
      </motion.div>
    </div>
  );
}
