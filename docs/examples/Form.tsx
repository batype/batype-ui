import { useState } from 'react'
import { Form, FormField, Button } from '@batype/ui'
import '@batype/ui/style.css'

interface ExampleValues {
  name: string
}
const initialValues: ExampleValues = { name: '' }

export default function FormExample() {
  const [result, setResult] = useState('')
  return (
    <>
      <Form
        initialValues={initialValues}
        onFinish={(values) => {
          setResult(values.name)
        }}
      >
        {(form) => (
          <>
            <FormField name="name" label="名称" required>
              {(control) => (
                <input
                  {...control}
                  value={String(control.value ?? '')}
                  onChange={(event) => control.onChange(event.target.value)}
                />
              )}
            </FormField>
            <Button type="submit" loading={form.submitting}>
              提交表单
            </Button>
            <Button type="reset" variant="soft">
              重置表单
            </Button>
          </>
        )}
      </Form>
      <output aria-label="提交结果">{result}</output>
    </>
  )
}
