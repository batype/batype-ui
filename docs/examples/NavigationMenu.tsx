import { useState } from 'react'
import { NavigationMenu } from '@batype/ui'
import '@batype/ui/style.css'

export default function NavigationMenuExample() {
  const [active, setActive] = useState('overview')
  return (
    <NavigationMenu
      label="示例导航"
      activeKey={active}
      onSelect={setActive}
      items={[
        { key: 'overview', label: '概览' },
        { key: 'settings', label: '设置', children: [{ key: 'theme', label: '主题' }] },
      ]}
    />
  )
}
