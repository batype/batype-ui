import { useState } from 'react'
import { EmptyState } from '@batype/ui'
import '@batype/ui/style.css'

export default function EmptyStateExample() {
  const [message, setMessage] = useState('')
  return (
    <>
      <EmptyState
        title="暂无项目"
        description="创建第一条记录"
        actionLabel="新建"
        onAction={() => setMessage('在此接入新建流程')}
      />
      <p role="status">{message}</p>
    </>
  )
}
