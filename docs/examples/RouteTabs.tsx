import { useState } from 'react'
import { RouteTabs, type RouteTab } from '@batype/ui'
import '@batype/ui/style.css'

export default function RouteTabsExample() {
  const [tabs, setTabs] = useState<RouteTab[]>([
    { key: 'home', label: '首页' },
    { key: 'detail', label: '详情', closable: true },
  ])
  const [active, setActive] = useState('detail')
  function close(key: string) {
    const next = tabs.filter((tab) => tab.key !== key)
    setTabs(next)
    if (active === key) setActive(next[0]?.key || '')
  }
  return <RouteTabs items={tabs} activeKey={active} onSelect={setActive} onClose={close} />
}
