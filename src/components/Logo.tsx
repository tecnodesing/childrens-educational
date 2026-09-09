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
        <div className="min-w-0 leading-tight">
          <div className="font-display text-base font-black tracking-tight text-sky-950 sm:text-xl">
            Aprende <span className="text-sky-500">Jugando</span>
          </div>
          <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-sky-600/70 sm:text-[11px]">con TD</div>
        </div>
      )}
    </div>
  );
}
