interface SpinnerProps {
  label?: string
}

export default function Spinner({ label = 'ACQUIRING SIGNAL…' }: SpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-400">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-edge border-t-accent" />
      <span className="text-xs tracking-[0.3em] uppercase">{label}</span>
    </div>
  )
}
