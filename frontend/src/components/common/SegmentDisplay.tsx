interface SegmentDisplayProps {
  value: number | string
  /** Minimum digit count — pads the ghost layer so short values still read as a readout. */
  digits?: number
  /** Font size for the lit segments, e.g. "4.5rem". */
  size?: string
  /** Segment colour (lit). Defaults to mission green. */
  color?: string
  className?: string
}

/**
 * A seven-segment instrument readout. A dim "ghost" layer renders the unlit
 * segments (all 8s) behind the live value, so the display reads like a real LCD
 * even when only a couple of digits are lit. Falls back to the mono stack via
 * --font-seg if the DSEG7 webfont is unavailable.
 */
export default function SegmentDisplay({
  value,
  digits = 0,
  size = '4.5rem',
  color = 'var(--color-accent)',
  className = '',
}: SegmentDisplayProps) {
  const text = String(value)
  const ghost = '8'.repeat(Math.max(text.length, digits))

  return (
    <div
      className={`seg-screen relative grid place-items-end overflow-hidden rounded-sm px-4 py-3 ${className}`}
    >
      <span
        aria-hidden
        className="seg-ghost pointer-events-none col-start-1 row-start-1 leading-none tracking-[0.06em] tabular-nums select-none"
        style={{ fontFamily: 'var(--font-seg)', fontSize: size }}
      >
        {ghost}
      </span>
      <span
        className="seg-flicker col-start-1 row-start-1 leading-none tracking-[0.06em] tabular-nums"
        style={{
          fontFamily: 'var(--font-seg)',
          fontSize: size,
          color,
          textShadow: `0 0 14px ${color}66`,
        }}
      >
        {text}
      </span>
    </div>
  )
}
