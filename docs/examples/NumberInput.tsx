import { useState } from 'react'
import { NumberInput } from '@batype/ui'
import '@batype/ui/style.css'

export default function NumberInputExample() {
  const [value, setValue] = useState<number | null>(1)
  return (
    <NumberInput
      label="数量"
      value={value}
      onChange={setValue}
      min={0}
      max={100}
      precision={2}
      step={0.01}
      hint="失焦时规范精度及范围；清空为 null"
    />
  )
}
