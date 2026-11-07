import { useState } from 'react'
import { RadioGroup } from '@batype/ui'
import '@batype/ui/style.css'

export default function RadioGroupExample() {
  const [value, setValue] = useState('active')
  return (
    <RadioGroup
      label="状态"
      value={value}
      onChange={setValue}
      options={[
        { value: 'active', label: '启用' },
        { value: 'inactive', label: '停用' },
        { value: 'unavailable', label: '不可选', disabled: true },
      ]}
    />
  )
}
