import { useState } from 'react'
import { DateRangePicker } from '@batype/ui'
import '@batype/ui/style.css'

export default function DateRangePickerExample() {
  const [value, setValue] = useState<[string, string]>(['2026-11-01', '2026-11-06'])
  return (
    <DateRangePicker
      label="统计日期"
      value={value}
      onChange={setValue}
      hint="日期字符串不做时区转换"
    />
  )
}
