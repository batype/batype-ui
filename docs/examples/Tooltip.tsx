import { Tooltip, Button } from '@batype/ui'
import '@batype/ui/style.css'

export default function TooltipExample() {
  return (
    <Tooltip content="按钮的辅助说明">
      <Button variant="outline">悬停或聚焦</Button>
    </Tooltip>
  )
}
