import type { HTMLAttributes, ReactNode } from 'react'
import { cx, useUI, type Tone } from '../provider.js'
import { Icon } from './Icon.js'
import { Button } from './Button.js'
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone
}
export function Badge({ tone = 'neutral', className, children, ...props }: BadgeProps) {
  return (
    <span {...props} className={cx('bui-badge', `bui-tone-${tone}`, className)}>
      {children}
    </span>
  )
}
export interface StatusChipProps extends Omit<BadgeProps, 'children'> {
  value?: string | number | null
  map: Record<string, { label: ReactNode; tone?: Tone }>
  fallbackLabel?: ReactNode
}
export function StatusChip({ value, map, fallbackLabel, ...props }: StatusChipProps) {
  const key = value == null ? '' : String(value),
    item = map[key]
  return (
    <Badge {...props} tone={item?.tone ?? props.tone}>
      {item?.label ?? fallbackLabel ?? (key || '—')}
    </Badge>
  )
}
export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  tone?: Tone
  title?: string
}
export function Alert({ tone = 'primary', title, children, className, ...props }: AlertProps) {
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      {...props}
      className={cx('bui-alert', `bui-tone-${tone}`, className)}
    >
      {title && <strong>{title}</strong>}
      {children && <div>{children}</div>}
    </div>
  )
}
export interface EmptyStateProps {
  title?: string
  description?: ReactNode
  icon?: ReactNode
  actionLabel?: string
  onAction?: () => void
}
export function EmptyState({ title, description, icon, actionLabel, onAction }: EmptyStateProps) {
  const { messages } = useUI()
  return (
    <div className="bui-empty">
      <span className="bui-empty__icon" aria-hidden="true">
        {icon ?? <Icon name="box" size={30} />}
      </span>
      <strong>{title ?? messages.empty}</strong>
      {description && <p>{description}</p>}
      {actionLabel && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
export function Spinner({ label, ...props }: HTMLAttributes<HTMLDivElement> & { label?: string }) {
  const { messages } = useUI()
  return (
    <div role="status" {...props} className={cx('bui-loading', props.className)}>
      <span className="bui-spinner" aria-hidden="true" />
      <span>{label ?? messages.loading}</span>
    </div>
  )
}
export function Skeleton({
  lines = 3,
  ...props
}: HTMLAttributes<HTMLDivElement> & { lines?: number }) {
  const count = Math.max(1, Math.min(20, Math.floor(Number.isFinite(lines) ? lines : 3)))
  return (
    <div {...props} aria-hidden="true" className={cx('bui-skeleton', props.className)}>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} />
      ))}
    </div>
  )
}
