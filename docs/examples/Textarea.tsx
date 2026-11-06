import { useState } from 'react'
import { Textarea } from '@batype/ui'
import '@batype/ui/style.css'

export default function TextareaExample() {
  const [value, setValue] = useState('')
  return (
    <Textarea
      label="说明"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      hint="输入后由父组件保存状态"
    />
  )
}
