export function SplashScreen() {
  return (
    <div className="grid min-h-dvh place-items-center bg-bg">
      <div className="flex flex-col items-center gap-4 [animation:yq-fade-in_400ms_ease]">
        <Logo />
        <span className="text-[13px] text-faint">Загружаем дневник…</span>
      </div>
    </div>
  );
}

export function Logo({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" aria-label="Yomiq">
      <rect width="56" height="56" rx="16" fill="var(--accent)" />
      <path
        d="M17 18.5 28 32m0 0 11-13.5M28 32v7"
        stroke="var(--on-accent)"
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
