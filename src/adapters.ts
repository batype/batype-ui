import type { CSSProperties, Key, ReactNode } from 'react'
import type { ActionButtonProps } from './components/Button.js'
import type { DataTableProps, TableColumn } from './components/DataTable.js'
import type { PaginationProps } from './components/Pagination.js'

export type LegacyColor = 'default' | 'primary' | 'success' | 'warning' | 'danger'
export interface LegacyActionOptions {
  /** Permission is evaluated by the application, never inferred by the UI package. */
  allowed: boolean
  tooltip: string
  icon: ReactNode
  color?: LegacyColor
  onClick?: () => void
}
export function adaptLegacyAction({
  allowed,
  tooltip,
  icon,
  color = 'default',
  onClick,
}: LegacyActionOptions): ActionButtonProps | null {
  if (!allowed) return null
  return { label: tooltip, icon, tone: color === 'default' ? 'neutral' : color, onClick }
}

export interface LegacyColumn<T> {
  key: string
  title: ReactNode
  style?: CSSProperties
  mobileRowClassName?: string
  mobileValueClassName?: string
  renderCell?: (row: T, key: string) => ReactNode
}
export interface LegacyTableOptions<T> {
  label: string
  items?: readonly T[]
  columns?: readonly LegacyColumn<T>[]
  _key?: keyof T
  rowKey?: DataTableProps<T>['rowKey']
  renderCell?: (row: T, key: string) => ReactNode
  selectionMode?: DataTableProps<T>['selectionMode']
  selectedKeys?: ReadonlySet<Key> | 'all'
  /** Explicit scope required for legacy global selection; never infer it from one page. */
  allSelectionKeys?: ReadonlySet<Key>
  setSelectedKeys?: (keys: Set<Key>) => void
  loading?: boolean
}
export function adaptLegacyTable<T>({
  label,
  items = [],
  columns = [],
  _key,
  rowKey,
  renderCell,
  selectionMode,
  selectedKeys,
  allSelectionKeys,
  setSelectedKeys,
  loading,
}: LegacyTableOptions<T>): DataTableProps<T> {
  if (selectedKeys === 'all' && !allSelectionKeys)
    throw new Error('Legacy "all" selection requires explicit allSelectionKeys.')
  const mapped: TableColumn<T>[] = columns.map((column) => ({
    ...column,
    align: column.key === 'actions' ? 'center' : undefined,
    kind: column.key === 'actions' ? 'actions' : 'data',
    render: renderCell
      ? (row) => renderCell(row, column.key)
      : column.renderCell
        ? (row) => column.renderCell!(row, column.key)
        : undefined,
  }))
  return {
    label,
    items,
    columns: mapped,
    rowKey:
      rowKey ??
      _key ??
      ((row: T) => {
        const record = row as Record<string, unknown>
        const key = record.id ?? record.orderId
        if (typeof key !== 'string' && typeof key !== 'number')
          throw new Error('Provide a stable rowKey or _key; array indices are not supported.')
        return key
      }),
    selectionMode,
    selectedKeys: selectedKeys === 'all' ? new Set(allSelectionKeys) : selectedKeys,
    onSelectionChange: setSelectedKeys,
    loading,
  }
}

export interface LegacyPaginationOptions {
  page?: number
  pageSize?: number
  total?: number
  onChange?: (page: number) => void
  onPageSizeChange?: (page: number, pageSize: number) => void
}
export function adaptLegacyPagination({
  page = 1,
  pageSize = 10,
  total = 0,
  onChange,
  onPageSizeChange,
}: LegacyPaginationOptions): PaginationProps {
  return {
    page,
    pageSize,
    total,
    pageSizeOptions: [5, 10, 20, 50],
    onPageChange: (next) => onChange?.(next),
    onPageSizeChange: onPageSizeChange ? (size) => onPageSizeChange(1, size) : undefined,
  }
}
