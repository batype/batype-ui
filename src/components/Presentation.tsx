import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { Button } from './Button.js'
import { CopyButton } from './CopyButton.js'
import { Badge, type BadgeProps } from './Feedback.js'
import { cx, type Tone } from '../provider.js'
export function safeHref(value: string): string | undefined {
  try {
    const url = new URL(value, 'https://ui.example/')
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol) ? value : undefined
  } catch {
    return undefined
  }
}
export function ExternalLink({
  href,
  title,
  description,
  children,
  className,
  ...props
}: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'title' | 'href'> & {
  href: string
  title?: string
  description?: string
}) {
  const safe = safeHref(href)
  return (
    <a
      {...props}
      href={safe}
      target="_blank"
      rel="noopener noreferrer"
      aria-disabled={!safe || undefined}
      className={cx('bui-external-link', className)}
    >
      {title && (
        <strong>
          {title} <span aria-hidden="true">↗</span>
        </strong>
      )}
      {description && <span>{description}</span>}
      {children}
    </a>
  )
}
export function ItemCounter({ count, label = '条记录' }: { count: number; label?: string }) {
  return (
    <span className="bui-item-counter">
      <strong>{Number.isFinite(count) ? count : 0}</strong> {label}
    </span>
  )
}
export function MethodChip({ value, ...props }: Omit<BadgeProps, 'children'> & { value: string }) {
  const tones: Record<string, Tone> = {
    GET: 'success',
    POST: 'primary',
    PUT: 'warning',
    PATCH: 'warning',
    DELETE: 'danger',
  }
  return (
    <Badge {...props} tone={tones[value.toUpperCase()] || 'neutral'}>
      {value.toUpperCase()}
    </Badge>
  )
}
export function RequestStatusChip({
  status,
  ...props
}: Omit<BadgeProps, 'children'> & { status: number }) {
  return (
    <Badge
      {...props}
      tone={
        status >= 500
          ? 'danger'
          : status >= 400
            ? 'warning'
            : status >= 200 && status < 300
              ? 'success'
              : 'neutral'
      }
    >
      {status}
    </Badge>
  )
}
export function ErrorState({
  title = '出现了一点问题',
  description,
  code,
  onRetry,
  onBack,
  retryLabel = '重试',
  backLabel = '返回',
}: {
  title?: string
  description?: ReactNode
  code?: string | number
  onRetry?: () => void
  onBack?: () => void
  retryLabel?: string
  backLabel?: string
}) {
  return (
    <section className="bui-error-state" aria-label={title}>
      {code && <span className="bui-error-state__code">{code}</span>}
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      <div>
        {onBack && (
          <Button variant="outline" tone="neutral" onClick={onBack}>
            {backLabel}
          </Button>
        )}
        {onRetry && <Button onClick={onRetry}>{retryLabel}</Button>}
      </div>
    </section>
  )
}
export function CodeBlock({
  code,
  language = 'text',
  copyable = true,
}: {
  code: string
  language?: string
  copyable?: boolean
}) {
  return (
    <figure className="bui-code-block">
      <figcaption>
        <span>{language}</span>
        {copyable && <CopyButton value={code} />}
      </figcaption>
      <pre>
        <code>{code}</code>
      </pre>
    </figure>
  )
}
