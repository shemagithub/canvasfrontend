export function StainBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        background: `radial-gradient(ellipse 150% 120% at 50% -10%, var(--stain-glow) 0%, transparent 70%)`,
      }}
      aria-hidden
    />
  );
}
