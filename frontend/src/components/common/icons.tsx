import type { SVGProps } from 'react'

/**
 * Minimal stroke icons for the sidebar nav — inline SVG, no dependency, all
 * `currentColor` so they inherit the nav item's active/inactive colour.
 */

type IconProps = SVGProps<SVGSVGElement>

const base = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function MissionIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
      <path d="M12 1v3M12 20v3M1 12h3M20 12h3" />
    </svg>
  )
}

export function LogIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="4" width="18" height="16" rx="1" />
      <path d="M7 9l3 3-3 3M13 15h4" />
    </svg>
  )
}

export function RoverIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 8h3l1.5-2h6L15 8h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 1-2z" />
      <circle cx="11" cy="13" r="3.5" />
    </svg>
  )
}

export function ForecastIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 3v18h18" />
      <path d="M7 14l4-5 3 3 5-7" />
    </svg>
  )
}
