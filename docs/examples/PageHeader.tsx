import { useState } from 'react'
import { PageHeader, Button } from '@batype/ui'
import '@batype/ui/style.css'

export default function PageHeaderExample() {
  const [count, setCount] = useState(0)
  return (
    <PageHeader
      title="示例页面"
      description={`已刷新 ${count} 次`}
      breadcrumb={<span>工作区 / 示例</span>}
      actions={<Button onClick={() => setCount((value) => value + 1)}>刷新页面</Button>}
    />
  )
}
