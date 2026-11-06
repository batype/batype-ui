import { StatusChip } from '@batype/ui'
import '@batype/ui/style.css'

export default function StatusChipExample() {
  const map = {
    done: { label: '已完成', tone: 'success' as const },
    waiting: { label: '等待中', tone: 'warning' as const },
  }
  return <StatusChip value="done" map={map} fallbackLabel="未知状态" />
}
