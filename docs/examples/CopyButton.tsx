import { useState } from 'react'
import { CopyButton } from '@batype/ui'
import '@batype/ui/style.css'

export default function CopyButtonExample() {
  const [message, setMessage] = useState('')
  return (
    <>
      <CopyButton
        value="COPY-DEMO"
        onCopied={() => setMessage('复制成功')}
        onCopyError={() => setMessage('复制失败，请检查浏览器权限')}
      />
      <p role="status">{message}</p>
    </>
  )
}
