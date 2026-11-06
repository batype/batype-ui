import { Alert } from '@batype/ui'
import '@batype/ui/style.css'

export default function AlertExample() {
  return (
    <Alert tone="success" title="已保存">
      更改已生效。
    </Alert>
  )
}
