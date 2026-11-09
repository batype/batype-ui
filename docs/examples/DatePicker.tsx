import { useState } from 'react'
import { DatePicker } from '@batype/ui'
import '@batype/ui/style.css'

export default function DatePickerExample() {
  const [value, setValue] = useState('2026-11-06')
  const [time, setTime] = useState('2026-11-06T12:30:15')
  return (
    <>
      <DatePicker
        label="日期"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        min="2026-01-01"
        max="2026-12-31"
      />
      <DatePicker
        label="日期时间"
        showTime
        step={1}
        value={time}
        onChange={(event) => setTime(event.target.value)}
      />
    </>
  )
}
