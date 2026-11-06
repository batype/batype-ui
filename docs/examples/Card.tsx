import { Card, Button } from '@batype/ui'
import '@batype/ui/style.css'

export default function CardExample() {
  return (
    <Card
      title="概览"
      description="卡片说明"
      action={<Button size="sm">查看</Button>}
      footer="更新时间：刚刚"
    >
      <p>卡片正文</p>
    </Card>
  )
}
