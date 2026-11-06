import { useState } from 'react'
import { Dropdown } from '@batype/ui'
import '@batype/ui/style.css'

export default function DropdownExample() {
  const [selected, setSelected] = useState('')
  return (
    <>
      <Dropdown
        label="更多操作"
        items={[
          { key: 'edit', label: '编辑' },
          { key: 'remove', label: '删除', tone: 'danger' },
        ]}
        onSelect={setSelected}
      />
      <p>选择：{selected || '无'}</p>
    </>
  )
}
