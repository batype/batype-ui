import { useState } from 'react'
import { Tabs } from '@batype/ui'
import '@batype/ui/style.css'

export default function TabsExample() {
  const [tab, setTab] = useState('preview')
  return (
    <Tabs
      label="示例内容"
      value={tab}
      onChange={setTab}
      items={[
        { key: 'preview', label: '预览', content: <p>预览内容</p> },
        { key: 'code', label: '代码', content: <p>代码内容</p> },
      ]}
    />
  )
}
