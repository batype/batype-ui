import { describe, it, expect } from 'vitest'
import { render, screen, within, fireEvent } from '@testing-library/react'
import { ApiDocs, UsageDocs } from '../playground/ApiDocs'
import api from '../playground/api.generated.json'
import { catalog } from '../playground/catalog'
describe('公开API文档', () => {
  it('所有组件有对应契约、独立完整示例和使用说明', () => {
    expect(Object.keys(api.components).sort()).toEqual(catalog.map((row) => row.name).sort())
    for (const { name } of catalog) {
      const doc = api.components[name]
      expect(doc.example).toContain(`function ${name}Example`)
      expect(doc.example).toContain("import '@batype/ui/style.css'")
      expect(doc.notes.length).toBeGreaterThan(0)
      for (const row of [...doc.props, ...doc.events]) {
        expect(row.description).toBeTruthy()
        expect(row.type).toBeTruthy()
        expect(row.defaultValue).toBeTruthy()
      }
    }
  })
  it('参数必填与默认值清楚区分，事件可按名称搜索', () => {
    render(<ApiDocs name="Input" />)
    const props = screen.getByRole('table', { name: 'Input 参数' })
    const label = within(props).getByRole('rowheader', { name: 'label' }).closest('tr')!
    expect(label).toHaveTextContent('—（必填）')
    fireEvent.change(screen.getByLabelText('筛选 API 参数'), { target: { value: 'onChange' } })
    expect(screen.getByRole('table', { name: 'Input 事件' })).toHaveTextContent(
      'ChangeEventHandler<HTMLInputElement',
    )
    expect(within(props).queryByRole('rowheader', { name: 'label' })).toBeNull()
  })
  it('完整用例包含状态及回调定义，而非悬空变量片段', () => {
    const { container } = render(<UsageDocs name="DetailModal" />)
    expect(container.querySelector('pre code')).toHaveTextContent('setOpen(false)')
  })
})
