import { useState } from 'react'
import { Button, DetailModal, Input } from '@batype/ui'
import {
  AntdCompatibilityProvider,
  AntdForm,
  AntdSelect,
  AntdDatePicker,
  AntdInputNumber,
  useAntdApp,
} from '@batype/ui/antd'
import '@batype/ui/style.css'

function ExistingForm() {
  const [form] = AntdForm.useForm()
  const { message } = useAntdApp()
  const [result, setResult] = useState('')
  return (
    <AntdForm
      form={form}
      initialValues={{ title: '原有商品', gifts: [{ quantity: 2 }] }}
      onFinish={(values) => {
        setResult(JSON.stringify(values))
        void message.success('保存完成')
      }}
    >
      <AntdForm.Item name="title" rules={[{ required: true, message: '请输入商品名称' }]}>
        <Input label="商品名称" />
      </AntdForm.Item>
      <AntdForm.Item name="types">
        <AntdSelect
          aria-label="原有多选"
          mode="multiple"
          options={[
            { value: 'a', label: '选项甲' },
            { value: 'b', label: '选项乙' },
          ]}
        />
      </AntdForm.Item>
      <AntdForm.Item name="startsAt">
        <AntdDatePicker aria-label="原有日期时间" showTime />
      </AntdForm.Item>
      <AntdForm.List name="gifts">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field) => (
              <div key={field.key}>
                <AntdForm.Item name={[field.name, 'quantity']}>
                  <AntdInputNumber aria-label={`赠品数量 ${field.name + 1}`} min={1} />
                </AntdForm.Item>
                <Button onClick={() => remove(field.name)}>删除赠品 {field.name + 1}</Button>
              </div>
            ))}
            <Button onClick={() => add({ quantity: 1 })}>增加赠品</Button>
          </>
        )}
      </AntdForm.List>
      <Button type="submit">保存兼容表单</Button>
      <Button onClick={() => form.setFieldsValue({ title: '异步加载商品' })}>模拟编辑回填</Button>
      <Button onClick={() => form.resetFields()}>重置兼容表单</Button>
      <output aria-label="兼容表单结果">{result}</output>
    </AntdForm>
  )
}

export default function AntdCompatibilityProviderExample() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>打开兼容表单</Button>
      <DetailModal isOpen={open} onClose={() => setOpen(false)} title="原有复杂表单">
        <AntdCompatibilityProvider>
          <ExistingForm />
        </AntdCompatibilityProvider>
      </DetailModal>
    </>
  )
}
