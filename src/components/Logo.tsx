export default function Logo({ size = 56, withText = false }: { size?: number; withText?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="relative flex items-center justify-center overflow-visible drop-shadow-lg"
        style={{ width: size, height: size }}
        aria-label="Aprende Jugando - logo TD"
      >
        <img
          src="/logo.png"
          alt="Logo TD"
          width={size}
          height={size}
          className="object-contain"
        />
      </div>
      {withText && (
        <div className="leading-tight">
          <div className="font-display text-xl font-black tracking-tight text-sky-950">
            Aprende <span className="text-sky-500">Jugando</span>
          </div>
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-600/70">con TD</div>
        </div>
      )}
    </div>
  );
}
