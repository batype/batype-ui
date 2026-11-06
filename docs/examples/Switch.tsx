import { useState } from 'react'
import { Switch } from '@batype/ui'
import '@batype/ui/style.css'

export default function SwitchExample() {
  const [checked, setChecked] = useState(false)
  return (
    <Switch
      label="启用功能"
      checked={checked}
      onChange={(event) => setChecked(event.target.checked)}
    />
  )
}
