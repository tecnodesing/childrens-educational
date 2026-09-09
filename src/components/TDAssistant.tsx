import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
import TDRobot, { type TDMood } from './TDRobot';
import { tdVoice } from '../lib/td-voice';

export default function TDAssistant({
  message,
  mood = 'feliz',
  onReplay,
  compact = false,
  showBubble = true,
}: {
  message: string;
  mood?: TDMood;
  onReplay?: () => void;
  compact?: boolean;
  showBubble?: boolean;
}) {
  const [speaking, setSpeaking] = useState(false);
  const [soundOff, setSoundOff] = useState(false);

  useEffect(() => {
    const off = tdVoice.onChange(() => setSpeaking(tdVoice.isSpeaking()));
    return off;
  }, []);

  const toggleMute = () => {
    if (speaking) {
      tdVoice.stop();
      setSoundOff(true);
    } else {
      setSoundOff(false);
      if (message && onReplay) onReplay();
    }
  };

  return (
    <div className={`aj-bajo-seguro pointer-events-none fixed left-3 right-3 z-40 flex items-end gap-2 sm:left-5 sm:right-auto sm:max-w-md ${compact ? 'sm:max-w-xs' : ''}`}>
      <motion.button
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 16 }}
        onClick={() => message && onReplay?.()}
        className="pointer-events-auto relative shrink-0 rounded-full bg-white/90 p-1 shadow-xl shadow-sky-200 ring-4 ring-sky-300/60 backdrop-blur transition-transform active:scale-95"
        aria-label="TD: toca para escuchar de nuevo"
      >
        <TDRobot mood={speaking ? 'hablando' : mood} size={compact ? 56 : 72} />
        {speaking && (
          <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 text-white shadow">
            <Volume2 className="h-3.5 w-3.5 animate-pulse" />
          </span>
        )}
      </motion.button>

      <AnimatePresence mode="wait">
        {showBubble && message && (
          <motion.div
            key={message.slice(0, 60)}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            className="pointer-events-auto relative max-h-36 flex-1 overflow-hidden rounded-3xl rounded-bl-md border-2 border-sky-200 bg-white/95 p-3 shadow-xl shadow-sky-100 backdrop-blur sm:p-4"
          >
            <div className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" />
              <p className="font-body text-sm font-semibold leading-snug text-slate-800 sm:text-base">
                {message}
              </p>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => onReplay?.()}
                className="flex items-center gap-1.5 rounded-full bg-sky-500 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-white shadow transition active:scale-95"
              >
                <Volume2 className="h-3.5 w-3.5" /> Escuchar
              </button>
              <button
                onClick={toggleMute}
                className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-500 transition active:scale-95"
                aria-label={soundOff ? 'Activar voz' : 'Silenciar voz'}
              >
                {soundOff || speaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                {speaking ? 'Parar' : soundOff ? 'Voz off' : 'Voz on'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
