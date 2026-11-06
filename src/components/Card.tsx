import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../provider.js'
export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode
  description?: ReactNode
  action?: ReactNode
  footer?: ReactNode
}
export function Card({
  title,
  description,
  action,
  footer,
  children,
  className,
  ...props
}: CardProps) {
  return (
    <section {...props} className={cx('bui-card', className)}>
      {(title || description || action) && (
        <header className="bui-card__header">
          <div>
            {title && <h2>{title}</h2>}
            {description && <p>{description}</p>}
          </div>
          {action}
        </header>
      )}
      <div className="bui-card__body">{children}</div>
      {footer && <footer className="bui-card__footer">{footer}</footer>}
    </section>
  )
}
