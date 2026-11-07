import { useState } from 'react'
import { Form, FormList, Button } from '@batype/ui'
import '@batype/ui/style.css'

export default function FormListExample() {
  const [result, setResult] = useState('')
  return (
    <>
      <Form
        initialValues={{ items: [{ name: '示例条目' }] }}
        onFinish={(values) => {
          setResult(JSON.stringify(values.items))
        }}
      >
        <FormList<{ name: string }> name="items">
          {(items, actions) => (
            <>
              {items.map((item) => (
                <div key={item.key}>
                  <label>
                    第 {item.index + 1} 项名称
                    <input
                      value={item.value.name}
                      disabled={actions.disabled}
                      onChange={(event) => actions.update(item.index, { name: event.target.value })}
                    />
                  </label>
                  <Button
                    tone="danger"
                    disabled={actions.disabled}
                    onClick={() => actions.remove(item.index)}
                  >
                    移除第 {item.index + 1} 项
                  </Button>
                </div>
              ))}
              <Button disabled={actions.disabled} onClick={() => actions.add({ name: '' })}>
                添加条目
              </Button>
            </>
          )}
        </FormList>
        <Button type="submit">保存条目</Button>
      </Form>
      <output aria-label="条目提交结果">{result}</output>
    </>
  )
}
