import { useState } from 'react'
import { Checkbox } from '@batype/ui'
import '@batype/ui/style.css'

export default function CheckboxExample() {
  const [checked, setChecked] = useState(false)
  return (
    <Checkbox
      label="启用功能"
      checked={checked}
      onChange={(event) => setChecked(event.target.checked)}
    />
  )
}
