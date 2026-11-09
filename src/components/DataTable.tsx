import { useEffect, useId, useRef, type CSSProperties, type Key, type ReactNode } from 'react'
import { cx, useUI } from '../provider.js'
import { EmptyState, Spinner } from './Feedback.js'
import { Icon } from './Icon.js'
export interface TableColumn<T> {
  key: string
  title: ReactNode
  render?: (row: T) => ReactNode
  align?: 'left' | 'center' | 'right'
  width?: CSSProperties['width']
  sortable?: boolean
  mobileHidden?: boolean
  mobileLabel?: boolean
  kind?: 'data' | 'actions'
  style?: CSSProperties
  mobileRowClassName?: string
  mobileValueClassName?: string
}
export interface DataTableProps<T> {
  items: readonly T[]
  columns: readonly TableColumn<T>[]
  rowKey: keyof T | ((row: T) => Key)
  label: string
  loading?: boolean
  emptyContent?: ReactNode
  caption?: string
  className?: string
  selectionMode?: 'none' | 'single' | 'multiple'
  selectedKeys?: ReadonlySet<Key>
  onSelectionChange?: (keys: Set<Key>) => void
  sort?: { key: string; direction: 'asc' | 'desc' }
  onSortChange?: (sort: { key: string; direction: 'asc' | 'desc' }) => void
}
function Checkbox({
  mixed,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { mixed?: boolean }) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = !!mixed
  }, [mixed])
  return <input {...props} ref={ref} type="checkbox" className="bui-checkbox" />
}
export function DataTable<T>({
  items,
  columns,
  rowKey,
  label,
  loading,
  emptyContent,
  caption,
  className,
  selectionMode = 'none',
  selectedKeys = new Set(),
  onSelectionChange,
  sort,
  onSortChange,
}: DataTableProps<T>) {
  const { messages } = useUI(),
    id = useId(),
    selectable = selectionMode !== 'none'
  const keys = items.map((row) => {
    const value = typeof rowKey === 'function' ? rowKey(row) : row[rowKey]
    if (typeof value !== 'string' && typeof value !== 'number')
      throw new Error('DataTable rowKey must resolve to a string or number.')
    return value
  })
  if (new Set(keys).size !== keys.length) throw new Error('DataTable rowKey values must be unique.')
  const all = keys.length > 0 && keys.every((key) => selectedKeys.has(key)),
    some = keys.some((key) => selectedKeys.has(key))
  const toggle = (key: Key) => {
    const next = selectionMode === 'single' ? new Set<Key>() : new Set(selectedKeys)
    if (!selectedKeys.has(key)) next.add(key)
    else next.delete(key)
    onSelectionChange?.(next)
  }
  const selectAll = () => {
    const next = new Set(selectedKeys)
    for (const key of keys) {
      if (all) next.delete(key)
      else next.add(key)
    }
    onSelectionChange?.(next)
  }
  const cell = (row: T, column: TableColumn<T>): ReactNode => {
    if (column.render) return column.render(row)
    const value = row[column.key as keyof T]
    return value == null
      ? '—'
      : typeof value === 'boolean'
        ? String(value)
        : typeof value === 'string' || typeof value === 'number'
          ? value
          : '—'
  }
  const rowSelector = (key: Key, index: number, layout: string) => (
    <Checkbox
      checked={selectedKeys.has(key)}
      onChange={() => toggle(key)}
      aria-label={`${messages.selectRow} ${index + 1}`}
      name={`${id}-${layout}`}
    />
  )
  return (
    <div className={cx('bui-table-wrap', className)} aria-busy={loading || undefined}>
      {loading && <Spinner />}
      {!items.length ? (
        !loading && <div role="status">{emptyContent ?? <EmptyState />}</div>
      ) : (
        <>
          <div className="bui-table-scroll">
            <table className="bui-table" aria-label={label}>
              {caption && <caption>{caption}</caption>}
              <thead>
                <tr>
                  {selectable && (
                    <th scope="col" className="bui-table-select">
                      {selectionMode === 'multiple' ? (
                        <Checkbox
                          checked={all}
                          mixed={some && !all}
                          onChange={selectAll}
                          aria-label={messages.selectAll}
                        />
                      ) : (
                        <span className="bui-sr-only">{messages.selectRow}</span>
                      )}
                    </th>
                  )}
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      scope="col"
                      style={{ width: column.width, textAlign: column.align, ...column.style }}
                      aria-sort={
                        sort?.key === column.key
                          ? sort.direction === 'asc'
                            ? 'ascending'
                            : 'descending'
                          : undefined
                      }
                    >
                      {column.sortable && onSortChange ? (
                        <button
                          type="button"
                          className="bui-table-sort"
                          onClick={() =>
                            onSortChange({
                              key: column.key,
                              direction:
                                sort?.key === column.key && sort.direction === 'asc'
                                  ? 'desc'
                                  : 'asc',
                            })
                          }
                        >
                          {column.title}
                          {sort?.key === column.key && (
                            <Icon
                              name={sort.direction === 'asc' ? 'arrow-up' : 'arrow-down'}
                              size={14}
                            />
                          )}
                        </button>
                      ) : (
                        column.title
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((row, index) => (
                  <tr key={keys[index]} data-selected={selectedKeys.has(keys[index]!)}>
                    {selectable && <td>{rowSelector(keys[index]!, index, 'desktop')}</td>}
                    {columns.map((column) => (
                      <td key={column.key} style={{ textAlign: column.align }}>
                        {cell(row, column)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="bui-table-mobile" aria-label={label}>
            {items.map((row, index) => (
              <li key={keys[index]} data-selected={selectedKeys.has(keys[index]!)}>
                {selectable && rowSelector(keys[index]!, index, 'mobile')}
                <dl>
                  {columns
                    .filter((c) => !c.mobileHidden)
                    .map((column) => (
                      <div
                        key={column.key}
                        className={cx(
                          column.mobileRowClassName,
                          column.kind === 'actions' || column.mobileLabel === false
                            ? 'bui-table-mobile__wide'
                            : undefined,
                        )}
                      >
                        {column.kind !== 'actions' && column.mobileLabel !== false && (
                          <dt>{column.title}</dt>
                        )}
                        <dd className={column.mobileValueClassName}>{cell(row, column)}</dd>
                      </div>
                    ))}
                </dl>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
