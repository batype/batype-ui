import { DescriptionList, type DetailField } from '@batype/ui'
import '@batype/ui/style.css'

export default function DescriptionListExample() {
  const record = { id: 0, name: '演示记录', remark: '' }
  const fields: DetailField<typeof record>[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: '名称' },
    { key: 'remark', label: '备注' },
  ]
  return <DescriptionList data={record} fields={fields} hideEmpty />
}
