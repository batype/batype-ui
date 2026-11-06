import { useState } from 'react'
import { PasswordInput } from '@batype/ui'
import '@batype/ui/style.css'

export default function PasswordInputExample() {
  const [value, setValue] = useState('')
  return (
    <PasswordInput
      label="密码"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      hint="输入后由父组件保存状态"
    />
  )
}
