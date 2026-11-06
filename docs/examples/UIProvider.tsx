import { UIProvider, Button } from '@batype/ui'
import '@batype/ui/style.css'

export default function UIProviderExample() {
  return (
    <UIProvider
      theme="light"
      locale="zh-CN"
      density="comfortable"
      tokens={{ '--bui-primary': '#2563eb', '--bui-primary-text': '#ffffff' }}
    >
      <Button>开始使用</Button>
    </UIProvider>
  )
}
