import { useState, type Key, type CSSProperties } from 'react'
import { DataTable, type DataTableProps, type TableColumn } from './DataTable.js'
import { ActionButton } from './Button.js'
import { Icon } from './Icon.js'
export interface TreeTableProps<T> extends Pick<
  DataTableProps<T>,
  'label' | 'loading' | 'selectionMode' | 'selectedKeys' | 'onSelectionChange'
> {
  data: readonly T[]
  columns: readonly TableColumn<T>[]
  rowKey: keyof T | ((row: T) => string | number)
  getChildren: (row: T) => readonly T[] | undefined
  expandedKeys?: ReadonlySet<Key>
  defaultExpandedKeys?: ReadonlySet<Key>
  onExpandedChange?: (keys: Set<Key>) => void
}
export function TreeTable<T>({
  data,
  columns,
  rowKey,
  getChildren,
  expandedKeys,
  defaultExpandedKeys = new Set(),
  onExpandedChange,
  ...props
}: TreeTableProps<T>) {
  const [internal, setInternal] = useState(new Set(defaultExpandedKeys)),
    expanded = expandedKeys ?? internal
  const getKey = (row: T) => {
    const key = typeof rowKey === 'function' ? rowKey(row) : row[rowKey]
    if (typeof key !== 'string' && typeof key !== 'number')
      throw new Error('TreeTable requires stable string/number keys')
    return key
  }
  const toggle = (key: Key) => {
    const next = new Set(expanded)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    if (expandedKeys === undefined) setInternal(next)
    onExpandedChange?.(next)
  }
  type Flat = { node: T; key: string | number; depth: number; hasChildren: boolean }
  const flat: Flat[] = [],
    seen = new Set<Key>()
  const walk = (nodes: readonly T[], depth: number) => {
    if (depth > 100) throw new Error('TreeTable maximum depth exceeded')
    for (const node of nodes) {
      const key = getKey(node)
      if (seen.has(key)) throw new Error('TreeTable duplicate key or cycle')
      seen.add(key)
      const children = getChildren(node) || []
      flat.push({ node, key, depth, hasChildren: children.length > 0 })
      if (expanded.has(key)) walk(children, depth + 1)
    }
  }
  walk(data, 0)
  const mapped: TableColumn<Flat>[] = columns.map((col, index) => ({
    ...col,
    render: (row) => {
      const value = col.render ? col.render(row.node) : String(row.node[col.key as keyof T] ?? '—')
      if (index > 0) return value
      return (
        <div className="bui-tree-cell" style={{ '--bui-tree-depth': row.depth } as CSSProperties}>
          {row.hasChildren ? (
            <ActionButton
              label={`${expanded.has(row.key) ? '收起' : '展开'} ${String(row.node[col.key as keyof T] ?? row.key)}`}
              icon={<Icon name={expanded.has(row.key) ? 'chevron-left' : 'chevron-right'} />}
              aria-expanded={expanded.has(row.key)}
              variant="ghost"
              onClick={() => toggle(row.key)}
            />
          ) : (
            <span className="bui-tree-spacer" />
          )}
          {value}
        </div>
      )
    },
  }))
  return <DataTable {...props} items={flat} columns={mapped} rowKey="key" />
}
