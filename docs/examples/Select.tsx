import { useState } from 'react'
import { Select } from '@batype/ui'
import '@batype/ui/style.css'

export default function SelectExample() {
  const [status, setStatus] = useState('enabled')
  return (
    <Select
      label="状态"
      value={status}
      onChange={(event) => setStatus(event.target.value)}
      options={[
        { value: 'enabled', label: '启用' },
        { value: 'disabled', label: '停用' },
      ]}
    />
  )
}
