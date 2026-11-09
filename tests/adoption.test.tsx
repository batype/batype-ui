import { useState } from 'react'
import { createPortal } from 'react-dom'
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import {
  adaptLegacyAction,
  adaptLegacyTable,
  adaptLegacyPagination,
  ActionButton,
  DataTable,
  DatePicker,
  DateRangePicker,
  DetailModal,
  getPopupContainer,
  usePopupContainer,
} from '../src'

describe('渐进接入兼容契约', () => {
  it('权限由调用方明确传入，拒绝时无按钮且不执行动作', () => {
    const action = vi.fn()
    expect(
      adaptLegacyAction({ allowed: false, tooltip: '删除', icon: 'X', onClick: action }),
    ).toBeNull()
    const props = adaptLegacyAction({
      allowed: true,
      tooltip: '删除',
      icon: 'X',
      color: 'danger',
      onClick: action,
    })!
    render(<ActionButton {...props} />)
    fireEvent.click(screen.getByRole('button', { name: '删除' }))
    expect(action).toHaveBeenCalledOnce()
    expect(props.tone).toBe('danger')
    expect(adaptLegacyAction({ allowed: true, tooltip: '查看', icon: 'O' })?.tone).toBe('neutral')
  })
  it('保留列渲染、id=0、移动端操作区与跨页已选集合，不修改输入', () => {
    const change = vi.fn(),
      original = new Set([9])
    const props = adaptLegacyTable({
      label: '旧记录',
      items: [{ id: 0, name: '零号' }],
      columns: [
        { key: 'name', title: '名称', style: { width: 120 } },
        { key: 'actions', title: 'ACTIONS' },
      ],
      renderCell: (row, key) => (key === 'actions' ? '查看记录' : row.name),
      selectionMode: 'multiple',
      selectedKeys: original,
      setSelectedKeys: change,
    })
    render(<DataTable {...props} />)
    fireEvent.click(
      within(screen.getByRole('table')).getByRole('checkbox', { name: '选择当前页全部行' }),
    )
    expect(change).toHaveBeenCalledWith(new Set([9, 0]))
    expect(original).toEqual(new Set([9]))
    const mobile = screen.getByRole('list', { name: '旧记录' })
    expect(within(mobile).queryByText('ACTIONS')).toBeNull()
    expect(within(mobile).getByText('查看记录').closest('div')).toHaveClass(
      'bui-table-mobile__wide',
    )
    expect(props.columns[0]?.style?.width).toBe(120)
  })
  it('全选必须给出明确范围，不把当前页冒充全部记录；缺少稳定键时失败', () => {
    expect(() => adaptLegacyTable({ label: '范围', selectedKeys: 'all' })).toThrow(
      'allSelectionKeys',
    )
    const scope = new Set([1, 2, 100])
    expect(
      adaptLegacyTable({ label: '范围', selectedKeys: 'all', allSelectionKeys: scope })
        .selectedKeys,
    ).toEqual(scope)
    const props = adaptLegacyTable<{ name: string }>({ label: '缺键', items: [{ name: '记录' }] })
    expect(() => (props.rowKey as (row: { name: string }) => number)({ name: '记录' })).toThrow(
      'stable rowKey',
    )
    expect(adaptLegacyTable({ label: '订单', items: [{ orderId: 21 }] }).rowKey).toBeTypeOf(
      'function',
    )
  })
  it('旧分页页码通知不变，修改每页数量以两个参数通知并回到第一页', () => {
    const page = vi.fn(),
      size = vi.fn()
    const props = adaptLegacyPagination({
      page: 4,
      pageSize: 10,
      total: 100,
      onChange: page,
      onPageSizeChange: size,
    })
    props.onPageChange(5)
    props.onPageSizeChange?.(20)
    expect(page).toHaveBeenCalledExactlyOnceWith(5)
    expect(size).toHaveBeenCalledExactlyOnceWith(1, 20)
    expect(props.pageSizeOptions).toEqual([5, 10, 20, 50])
  })
  it('日期默认仍是date；日期时间保留秒与本地值，不做UTC转换', () => {
    const change = vi.fn()
    render(
      <>
        <DatePicker label="原日期" value="2026-11-09" readOnly />
        <DatePicker
          label="日期时间"
          showTime
          step={1}
          value="2026-11-09T12:34:56"
          onChange={(e) => change(e.target.value)}
        />
      </>,
    )
    expect(screen.getByLabelText('原日期')).toHaveAttribute('type', 'date')
    expect(screen.getByLabelText('日期时间')).toHaveAttribute('type', 'datetime-local')
    fireEvent.change(screen.getByLabelText('日期时间'), {
      target: { value: '2026-11-10T01:02:03' },
    })
    expect(change).toHaveBeenCalledWith('2026-11-10T01:02:03.000')
  })
  it('日期时间范围检测时分秒，清空一端保留另一端', () => {
    const change = vi.fn()
    render(
      <DateRangePicker
        label="范围"
        showTime
        step={1}
        value={['2026-11-09T12:30:00', '2026-11-09T12:29:59']}
        onChange={change}
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('开始日期不能晚于结束日期')
    fireEvent.change(screen.getByLabelText('开始日期'), { target: { value: '' } })
    expect(change).toHaveBeenCalledWith(['', '2026-11-09T12:29:59'])
  })
  it('同一时间的省略秒与零毫秒视为相等，不误报反向范围', () => {
    render(
      <DateRangePicker
        label="相等范围"
        showTime
        value={['2026-11-09T12:30:00.000', '2026-11-09T12:30']}
        onChange={() => {}}
      />,
    )
    expect(screen.queryByRole('alert')).toBeNull()
  })
  it('原生弹窗提供当前容器，Portal进入弹窗；旧详情可保留空字段', async () => {
    function Popup() {
      const container = usePopupContainer()
      return container ? createPortal(<span>弹层内容</span>, container) : null
    }
    function Demo() {
      const [open, setOpen] = useState(true)
      return (
        <DetailModal
          isOpen={open}
          onClose={() => setOpen(false)}
          title="详情"
          data={{ empty: '' }}
          fields={[{ key: 'empty', label: '空字段' }]}
          hideEmpty={false}
          emptyValue="-"
          extra={<Popup />}
        />
      )
    }
    render(<Demo />)
    const dialog = screen.getByRole('dialog')
    await waitFor(() => expect(within(dialog).getByText('弹层内容')).toBeVisible())
    expect(
      getPopupContainer(within(dialog).getAllByRole('button', { name: '关闭' })[0]!.parentElement!),
    ).toBe(dialog)
    expect(within(dialog).getByText('空字段')).toBeVisible()
    expect(within(dialog).getByText('-')).toBeVisible()
    fireEvent.click(within(dialog).getAllByRole('button', { name: '关闭' })[0]!)
    expect(dialog).not.toHaveAttribute('open')
    expect(getPopupContainer(document.createElement('div'))).toBe(document.body)
  })
})
