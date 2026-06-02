interface ErrorBannerProps {
  message: string
  onRetry?: () => void
}

export default function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="relative flex flex-col items-start gap-3 border border-danger/50 bg-danger/10 p-4 text-danger shadow-[var(--shadow-glow-danger)]">
      {/* corner brackets */}
      <span className="pointer-events-none absolute top-0 left-0 h-3 w-3 border-t border-l border-danger" />
      <span className="pointer-events-none absolute right-0 bottom-0 h-3 w-3 border-r border-b border-danger" />

      <div className="flex items-center gap-2">
        <span className="a-blink text-lg leading-none">⚠</span>
        <span
          className="text-xs tracking-[0.3em] uppercase"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Telemetry fault
        </span>
      </div>
      <p className="font-mono text-sm text-slate-200">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 border border-danger/60 px-3 py-1 text-xs tracking-[0.2em] text-danger uppercase transition-colors hover:bg-danger/20"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Retry
        </button>
      )}
    </div>
  )
}
