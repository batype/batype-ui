import { useState } from 'react'
import { ErrorState } from '@batype/ui'
import '@batype/ui/style.css'

export default function ErrorStateExample() {
  const [retried, setRetried] = useState(false)
  return retried ? (
    <p>已触发重试回调</p>
  ) : (
    <ErrorState
      code={500}
      title="加载失败"
      description="稍后重试"
      onRetry={() => setRetried(true)}
    />
  )
}
