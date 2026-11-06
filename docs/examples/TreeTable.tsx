import { useState, type Key } from 'react'
import { TreeTable, type TableColumn } from '@batype/ui'
import '@batype/ui/style.css'

export default function TreeTableExample() {
  type Node = { id: number; name: string; children?: Node[] }
  const data: Node[] = [{ id: 0, name: '父节点', children: [{ id: 1, name: '子节点' }] }]
  const columns: TableColumn<Node>[] = [{ key: 'name', title: '名称' }]
  const [expanded, setExpanded] = useState<Set<Key>>(new Set([0]))
  return (
    <TreeTable
      label="树结构"
      data={data}
      columns={columns}
      rowKey="id"
      getChildren={(row) => row.children}
      expandedKeys={expanded}
      onExpandedChange={setExpanded}
    />
  )
}
