import { useUI } from '../provider.js'
import { Button } from './Button.js'
import { Icon } from './Icon.js'
export interface PaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: readonly number[]
  disabled?: boolean
}
export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  disabled,
}: PaginationProps) {
  const { messages } = useUI(),
    size = Math.max(1, Math.floor(pageSize) || 1),
    count = Math.max(0, Math.floor(total) || 0)
  const pages = Math.max(1, Math.ceil(count / size)),
    current = Math.max(1, Math.min(pages, Math.floor(page) || 1))
  const options = [
    ...new Set([size, ...pageSizeOptions.filter((n) => Number.isInteger(n) && n > 0)]),
  ].sort((a, b) => a - b)
  return (
    <nav className="bui-pagination" aria-label={messages.page}>
      <span className="bui-pagination__total">
        {messages.total} {count} {messages.items}
      </span>
      {onPageSizeChange && (
        <select
          aria-label={messages.pageSize}
          value={size}
          disabled={disabled}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
        >
          {options.map((n) => (
            <option key={n} value={n}>
              {n} / {messages.pageSize}
            </option>
          ))}
        </select>
      )}
      <Button
        tone="neutral"
        variant="outline"
        size="sm"
        aria-label={messages.previous}
        disabled={disabled || current <= 1}
        onClick={() => onPageChange(current - 1)}
      >
        <Icon name="chevron-left" />
      </Button>
      <span aria-live="polite">
        <span aria-current="page">{current}</span> / {pages}
      </span>
      <Button
        tone="neutral"
        variant="outline"
        size="sm"
        aria-label={messages.next}
        disabled={disabled || current >= pages}
        onClick={() => onPageChange(current + 1)}
      >
        <Icon name="chevron-right" />
      </Button>
    </nav>
  )
}
