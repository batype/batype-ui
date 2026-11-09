import { useState, type Key, type ReactNode } from 'react'
import {
  ActionButton,
  DataTable,
  Pagination,
  adaptLegacyAction,
  adaptLegacyTable,
  adaptLegacyPagination,
} from '@batype/ui'

// The application supplies its current permission result and existing icon node.
export default function ManagerAdaptersExample({
  canDelete = false,
  deleteIcon = '×',
}: {
  canDelete?: boolean
  deleteIcon?: ReactNode
}) {
  const [page, setPage] = useState(1),
    [pageSize, setPageSize] = useState(10)
  const [selectedKeys, setSelectedKeys] = useState<Set<Key>>(new Set())
  const rows = [{ id: 0, name: '示例记录' }]
  const table = adaptLegacyTable({
    label: '旧列表兼容',
    items: rows,
    columns: [
      { key: 'name', title: '名称' },
      { key: 'actions', title: '操作' },
    ],
    selectedKeys,
    setSelectedKeys,
    selectionMode: 'multiple',
    renderCell: (row, key) => {
      if (key !== 'actions') return row.name
      const action = adaptLegacyAction({
        allowed: canDelete,
        tooltip: '删除记录',
        icon: deleteIcon,
        color: 'danger',
        onClick: () => {
          /* application opens its existing deletion confirmation */
        },
      })
      return action ? <ActionButton {...action} /> : null
    },
  })
  return (
    <>
      <DataTable {...table} />
      <Pagination
        {...adaptLegacyPagination({
          page,
          pageSize,
          total: rows.length,
          onChange: setPage,
          onPageSizeChange: (nextPage, size) => {
            setPage(nextPage)
            setPageSize(size)
          },
        })}
      />
    </>
  )
}
