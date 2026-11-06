import { useState } from 'react'
import { Input } from '@batype/ui'
import '@batype/ui/style.css'

export default function InputExample() {
  const [value, setValue] = useState('')
  return (
    <Input
      label="名称"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      hint="输入后由父组件保存状态"
    />
  )
}
