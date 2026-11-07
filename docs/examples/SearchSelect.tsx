import { useState } from 'react'
import { SearchSelect } from '@batype/ui'
import '@batype/ui/style.css'

export default function SearchSelectExample() {
  const [value, setValue] = useState('')
  return (
    <SearchSelect
      label="搜索组件"
      value={value}
      onChange={setValue}
      placeholder="输入名称搜索"
      options={[
        { value: 'button', label: '按钮 Button' },
        { value: 'table', label: '表格 DataTable' },
        { value: 'disabled', label: '禁用示例', disabled: true },
      ]}
    />
  )
}
