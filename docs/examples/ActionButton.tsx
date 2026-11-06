import { useState } from 'react'
import { ActionButton, Icon } from '@batype/ui'
import '@batype/ui/style.css'

export default function ActionButtonExample() {
  const [count, setCount] = useState(0)
  return (
    <>
      <ActionButton
        label="添加一项"
        icon={<Icon name="plus" />}
        onClick={() => setCount(count + 1)}
      />
      <span>已添加 {count} 项</span>
    </>
  )
}
