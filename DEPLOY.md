# Aprende Jugando con TD — Despliegue (hosting estático, sin backend)

## Requisitos
- Node 18+ para compilar. No se necesita servidor ni base de datos en producción.

## Compilar
```bash
npm install
npm run build   # genera dist/
```

## Publicar (cualquiera de estas opciones)
- **Netlify / Vercel / Cloudflare Pages**: arrastra la carpeta `dist/` o conecta el repo (build command `npm run build`, publish dir `dist`).
- **GitHub Pages / hosting compartido**: sube el contenido de `dist/` a la raíz pública.
- **Probar local**: `npx serve dist` o `npm run preview`.

> La app usa `localStorage` (`aprendeJugando_v1`) — funciona 100% sin conexión a servidor.

## PWA / Offline
- `public/manifest.webmanifest` + `public/sw.js` incluidos. El SW se registra solo en producción.
- Tras la primera carga, la app abre sin internet.
  - Chrome/Edge: ⋮ → "Instalar app"
  - Safari (iOS): Compartir → "Añadir a inicio de pantalla"
  - Samsung Internet: ⋮ → "Añadir a inicio de pantalla"

## Compatibilidad de navegadores
- **Chrome/Edge (Android y PC)**: voz completa (mejor experiencia), reconocimiento de voz para repetir sílabas.
- **Safari iOS**: voz del sistema (descarga voces en Ajustes → Accesibilidad), reconocimiento desde iOS 17.4; la voz se "destraba" con el primer toque (gesto).
- **Samsung Internet**: igual a Chrome (Chromium); el reconocimiento depende del dispositivo.
- **Firefox**: funciona; sin reconocimiento de voz → los ejercicios de repetición se generan en modo táctil automáticamente.
- La dicción de TD es transversal: `TDVoice.limpiarParaVoz` traduce frutas-emoji a palabras con cantidad ("🍎🍎" → "2 manzanas") y silencia emojis decorativos en TODOS los módulos.
- Safe-areas (notch/home indicator) aplicados a cabeceras y al asistente TD.

## Estructura
- `src/lib/td-voice.ts` — módulo independiente de voz (TDVoice: ready/speak/stop/getAvailableSpanishVoices/setVoiceByName/getCurrentVoiceName).
- `src/lib/store.ts` — esquema localStorage yhelpers (perfiles, progreso, introVistas, voz).
- `src/lib/content.ts` — banco de 96 actividades (24 semanas × 4 materias) en formato intro → ejemplo → guiada → independiente.
- `src/lib/trazos.ts` — checkpoints de trazo táctil por carácter.
- `src/lib/trazo-analitica.ts` — scoring DTW: cobertura + orden + dirección + suavidad, califica Logrado/Bien/Practica.
- `src/lib/td-listen.ts` — reconocimiento de voz (es-MX) para ejercicios de repetición en voz alta, con Levenshtein normalizado.
- `src/screens/ActivityRunner.tsx` — motor genérico del patrón pedagógico obligatorio.
- `src/components/TracingCanvas.tsx` — canvas con pointer events, presión del lápiz y validación DTW por trazo.
