interface SpinnerProps {
  label?: string
}

/**
 * "Acquiring signal" scanner — concentric dishes with a sweeping accent arc and
 * a ticking label. Reads as an intentional instrument state, not a generic
 * loading spinner.
 */
export default function Spinner({ label = 'ACQUIRING SIGNAL…' }: SpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-16 text-slate-400">
      <div className="relative h-16 w-16">
        <span className="absolute inset-0 rounded-full border border-edge" />
        <span className="absolute inset-2 rounded-full border border-edge/60" />
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-accent [animation-duration:1.1s]" />
        <span className="absolute inset-[42%] rounded-full bg-accent shadow-[var(--shadow-glow-accent)]" />
      </div>
      <span
        className="text-xs tracking-[0.35em] text-slate-400 uppercase"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {label}
        <span className="a-caret ml-1 text-accent">_</span>
      </span>
    </div>
  )
}
