import { useState } from 'react'
import { Form, FormField, Button } from '@batype/ui'
import '@batype/ui/style.css'

export default function FormFieldExample() {
  const [result, setResult] = useState('')
  return (
    <>
      <Form
        initialValues={{ email: '' }}
        onFinish={(values) => {
          setResult(values.email)
        }}
      >
        <FormField
          name="email"
          label="邮箱"
          required
          hint="用于接收通知"
          validate={(value) => (String(value).includes('@') ? undefined : '请输入有效邮箱')}
        >
          {(control) => (
            <input
              {...control}
              type="email"
              value={String(control.value ?? '')}
              onChange={(event) => control.onChange(event.target.value)}
            />
          )}
        </FormField>
        <Button type="submit">校验邮箱</Button>
      </Form>
      <output>{result}</output>
    </>
  )
}
