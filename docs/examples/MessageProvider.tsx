import { useRef } from 'react'
import { Button, MessageProvider, useMessage } from '@batype/ui'
import '@batype/ui/style.css'

function MessageActions() {
  const message = useMessage(),
    id = useRef('')
  return (
    <div>
      <Button onClick={() => message.success('操作成功')}>成功提示</Button>
      <Button onClick={() => message.error('操作失败，请重试')}>失败提示</Button>
      <Button
        onClick={() => {
          id.current = message.loading('处理中…')
        }}
      >
        开始处理
      </Button>
      <Button
        onClick={() =>
          message.update(id.current, {
            content: '处理完成',
            loading: false,
            tone: 'success',
            duration: 2000,
          })
        }
      >
        处理完成
      </Button>
    </div>
  )
}
export default function MessageProviderExample() {
  return (
    <MessageProvider duration={4000} maxCount={3}>
      <MessageActions />
    </MessageProvider>
  )
}
