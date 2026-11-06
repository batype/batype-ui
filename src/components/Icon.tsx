import type { SVGProps } from 'react'
export type IconName =
  | 'plus'
  | 'close'
  | 'chevron-left'
  | 'chevron-right'
  | 'copy'
  | 'check'
  | 'search'
  | 'arrow-up'
  | 'arrow-down'
  | 'box'
const paths: Record<IconName, string[]> = {
  plus: ['M12 5v14M5 12h14'],
  close: ['m6 6 12 12M6 18 18 6'],
  'chevron-left': ['m15 5-7 7 7 7'],
  'chevron-right': ['m9 5 7 7-7 7'],
  copy: ['M8 8h12v12H8z', 'M16 8V4H4v12h4'],
  check: ['m5 12 4 4L19 6'],
  search: ['M20 20l-5-5', 'M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0'],
  'arrow-up': ['m6 12 6-6 6 6M12 6v13'],
  'arrow-down': ['m6 12 6 6 6-6M12 5v13'],
  box: ['m3 7 9-4 9 4v10l-9 4-9-4z', 'm3 7 9 4 9-4M12 11v10'],
}
export function Icon({
  name,
  size = 18,
  ...props
}: SVGProps<SVGSVGElement> & { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {paths[name].map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  )
}
