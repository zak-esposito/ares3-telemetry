interface ErrorBannerProps {
  message: string
  onRetry?: () => void
}

export default function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-md border border-danger/50 bg-danger/10 p-4 text-danger">
      <div className="flex items-center gap-2">
        <span className="text-lg leading-none">⚠</span>
        <span className="text-xs tracking-[0.25em] uppercase">
          Telemetry fault
        </span>
      </div>
      <p className="text-sm text-slate-200">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 rounded border border-danger/60 px-3 py-1 text-xs tracking-widest text-danger uppercase transition hover:bg-danger/20"
        >
          Retry
        </button>
      )}
    </div>
  )
}
