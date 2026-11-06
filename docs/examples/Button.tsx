import { useState } from 'react'
import { Button } from '@batype/ui'
import '@batype/ui/style.css'

export default function ButtonExample() {
  const [saving, setSaving] = useState(false)
  async function save() {
    setSaving(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
    } finally {
      setSaving(false)
    }
  }
  return (
    <Button loading={saving} variant="solid" onClick={() => void save()}>
      保存示例
    </Button>
  )
}
