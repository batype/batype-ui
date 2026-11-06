import { useState } from 'react'
import { ConfirmDialog, Button } from '@batype/ui'
import '@batype/ui/style.css'

export default function ConfirmDialogExample() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  async function confirm() {
    await new Promise((resolve) => setTimeout(resolve, 300))
    setMessage('操作已确认')
  }
  return (
    <>
      <Button onClick={() => setOpen(true)}>确认操作</Button>
      <ConfirmDialog
        title="是否继续？"
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={confirm}
      >
        异步成功后关闭；抛出Error时保留并展示错误。
      </ConfirmDialog>
      <p role="status">{message}</p>
    </>
  )
}
