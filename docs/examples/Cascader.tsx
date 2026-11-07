import { useState } from 'react'
import { Cascader } from '@batype/ui'
import '@batype/ui/style.css'

export default function CascaderExample() {
  const [value, setValue] = useState<string[]>([])
  return (
    <Cascader
      label="选择区域"
      value={value}
      onChange={setValue}
      levelLabels={['省份', '城市', '区县']}
      options={[
        {
          value: 'east',
          label: '示例省',
          children: [
            { value: 'city', label: '示例市', children: [{ value: 'district', label: '示例区' }] },
          ],
        },
        { value: 'west', label: '其他省', children: [{ value: 'other', label: '其他市' }] },
      ]}
    />
  )
}
