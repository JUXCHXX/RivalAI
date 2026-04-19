export function Logo({ className = "" }: { className?: string }) {
  return (
    <a
      href="/"
      className={`font-display text-2xl sm:text-3xl tracking-tight inline-flex items-center gap-1.5 ${className}`}
      aria-label="RivalAI inicio"
    >
      <span className="inline-block bg-foreground text-background px-2 py-0.5 leading-none">
        RIVAL
      </span>
      <span className="text-foreground leading-none">AI</span>
      <span className="ml-1 h-2.5 w-2.5 bg-acid animate-flicker" />
    </a>
  );
}
