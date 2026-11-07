import { useState } from 'react'
import { DatePicker } from '@batype/ui'
import '@batype/ui/style.css'

export default function DatePickerExample() {
  const [value, setValue] = useState('2026-11-06')
  return (
    <DatePicker
      label="日期"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      min="2026-01-01"
      max="2026-12-31"
    />
  )
}
