import { useState, type Key } from 'react'
import { DataTable, type TableColumn } from '@batype/ui'
import '@batype/ui/style.css'

export default function DataTableExample() {
  type Row = { id: number; name: string }
  const rows: Row[] = [
    { id: 0, name: 'Alpha' },
    { id: 1, name: 'Beta' },
  ]
  const columns: TableColumn<Row>[] = [{ key: 'name', title: '名称', sortable: true }]
  const [selected, setSelected] = useState<Set<Key>>(new Set())
  const [sort, setSort] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'name',
    direction: 'asc',
  })
  const sorted = [...rows].sort(
    (a, b) => a.name.localeCompare(b.name) * (sort.direction === 'asc' ? 1 : -1),
  )
  return (
    <DataTable
      label="示例记录"
      rowKey="id"
      items={sorted}
      columns={columns}
      selectionMode="multiple"
      selectedKeys={selected}
      onSelectionChange={setSelected}
      sort={sort}
      onSortChange={setSort}
    />
  )
}
