import { useState } from 'react'
import { DetailModal, Button } from '@batype/ui'
import '@batype/ui/style.css'

export default function DetailModalExample() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>查看详情</Button>
      <DetailModal isOpen={open} onClose={() => setOpen(false)} title="记录详情">
        <p>
          自定义详情内容。第三方弹出层通过 usePopupContainer 或可选 AntdCompatibilityProvider 接入。
        </p>
      </DetailModal>
    </>
  )
}
