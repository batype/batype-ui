import type { ReactNode } from 'react'
export interface PageHeaderProps {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  breadcrumb?: ReactNode
  className?: string
}
export function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
  className = '',
}: PageHeaderProps) {
  return (
    <header className={`bui-page-header ${className}`}>
      {breadcrumb && <div className="bui-page-header__breadcrumb">{breadcrumb}</div>}
      <div>
        <div>
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
        {actions && <div className="bui-page-header__actions">{actions}</div>}
      </div>
    </header>
  )
}
