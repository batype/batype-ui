import { render, screen, fireEvent, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderToString } from 'react-dom/server'
import { useState } from 'react'
import { describe, it, expect, vi } from 'vitest'
import {
  UIProvider,
  Button,
  ActionButton,
  Input,
  PasswordInput,
  DescriptionList,
  DetailModal,
  DataTable,
  Pagination,
  Tabs,
  StatusChip,
  CopyButton,
  Icon,
  Skeleton,
} from '../src'

describe('纯 UI 组件契约', () => {
  it('首次加载表格只展示加载态，不误报空数据', () => {
    render(<DataTable loading label="加载示例" items={[]} rowKey="id" columns={[]} />)
    expect(screen.getByText('加载中')).toBeVisible()
    expect(screen.queryByText('暂无数据')).toBeNull()
  })

  it('按钮默认不提交表单，加载和禁用状态不会触发操作', async () => {
    const click = vi.fn(),
      user = userEvent.setup()
    const { rerender } = render(<Button onClick={click}>保存</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
    await user.click(screen.getByRole('button'))
    expect(click).toHaveBeenCalledTimes(1)
    rerender(
      <Button loading onClick={click}>
        保存
      </Button>,
    )
    await user.click(screen.getByRole('button'))
    expect(click).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true')
  })
  it('图标操作有可访问名称，不包含删除权限逻辑', async () => {
    const click = vi.fn()
    render(<ActionButton label="删除示例" icon={<Icon name="close" />} onClick={click} />)
    await userEvent.click(screen.getByRole('button', { name: '删除示例' }))
    expect(click).toHaveBeenCalledOnce()
  })
  it('输入框正确关联label、hint、error，受控更新立即回显', () => {
    const change = vi.fn(),
      { rerender } = render(<Input label="姓名" value="A" onChange={change} hint="输入姓名" />)
    const input = screen.getByRole('textbox', { name: '姓名' })
    expect(input).toHaveAccessibleDescription('输入姓名')
    fireEvent.change(input, { target: { value: 'B' } })
    expect(change).toHaveBeenCalledOnce()
    rerender(<Input label="姓名" value="B" onChange={change} error="填写错误" />)
    expect(input).toHaveValue('B')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription('填写错误')
  })
  it('非受控输入保留原生defaultValue行为，ref可访问真实输入', async () => {
    render(<Input label="搜索" defaultValue="起始" />)
    await userEvent.type(screen.getByLabelText('搜索'), '内容')
    expect(screen.getByLabelText('搜索')).toHaveValue('起始内容')
  })
  it('密码切换不丢失内容，不触发表单提交', async () => {
    render(<PasswordInput label="密码" defaultValue="sample-password" />)
    const input = screen.getByLabelText('密码')
    expect(input).toHaveAttribute('type', 'password')
    await userEvent.click(screen.getByRole('button', { name: '显示密码' }))
    expect(input).toHaveAttribute('type', 'text')
    expect(input).toHaveValue('sample-password')
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })
  it('详情列表隐藏空值但保留0和false；复杂值必须显式render', () => {
    render(
      <DescriptionList
        data={{ zero: 0, flag: false, empty: '  ', obj: { id: 1 } }}
        fields={[
          { key: 'zero', label: '数量' },
          { key: 'flag', label: '启用' },
          { key: 'empty', label: '空' },
          { key: 'obj', label: '对象', render: (v) => JSON.stringify(v) },
        ]}
      />,
    )
    expect(screen.getByText('0')).toBeVisible()
    expect(screen.getByText('false')).toBeVisible()
    expect(screen.queryByText('空')).toBeNull()
    expect(screen.getByText('{"id":1}')).toBeVisible()
  })
  it('字段级hideEmpty可覆盖全局选项', () => {
    render(
      <DescriptionList
        data={{ value: null }}
        fields={[{ key: 'value', label: '保留空值', hideEmpty: false }]}
      />,
    )
    expect(screen.getByText('—')).toBeVisible()
  })
  it('未知状态回显原始值，0不会当作空值', () => {
    render(<StatusChip value={0} map={{}} />)
    expect(screen.getByText('0')).toBeVisible()
  })
  it('Provider支持中英文及局部theme，不改document主题', () => {
    render(
      <UIProvider locale="en" theme="dark">
        <CopyButton value="x" />
      </UIProvider>,
    )
    expect(screen.getByRole('button', { name: 'Copy' })).toBeVisible()
    expect(document.documentElement).not.toHaveAttribute('data-bui-theme')
  })
  it('复制适配器成功后反馈；浏览器API缺失时不假报成功', async () => {
    const copy = vi.fn().mockResolvedValue(undefined),
      copied = vi.fn(),
      failed = vi.fn()
    const { unmount } = render(<CopyButton value="hello" copy={copy} onCopied={copied} />)
    await userEvent.click(screen.getByRole('button', { name: '复制' }))
    expect(copy).toHaveBeenCalledWith('hello')
    expect(copied).toHaveBeenCalledOnce()
    unmount()
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined })
    render(<CopyButton value="x" onCopyError={failed} onCopied={copied} />)
    fireEvent.click(screen.getByRole('button', { name: '复制' }))
    await waitFor(() => expect(failed).toHaveBeenCalledOnce())
    expect(copied).toHaveBeenCalledOnce()
    expect(screen.getByRole('status')).toHaveTextContent('复制失败')
  })
  it('复制处理中防重入，卸载后不执行状态回调', async () => {
    let resolve!: () => void
    const copy = vi.fn(
        () =>
          new Promise<void>((r) => {
            resolve = r
          }),
      ),
      copied = vi.fn()
    const { unmount } = render(<CopyButton value="x" copy={copy} onCopied={copied} />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    fireEvent.click(button)
    expect(copy).toHaveBeenCalledOnce()
    unmount()
    resolve()
    await Promise.resolve()
    expect(copied).not.toHaveBeenCalled()
  })
  it('分页钳制无效页码，空数据不会触发下一页', () => {
    const change = vi.fn()
    render(<Pagination page={99} pageSize={10} total={0} onPageChange={change} />)
    expect(screen.getByRole('button', { name: '上一页' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '下一页' })).toBeDisabled()
  })
  it('分页和大小修改只发出回调，不隐式请求数据', async () => {
    const change = vi.fn(),
      size = vi.fn()
    render(
      <Pagination
        page={1}
        pageSize={10}
        total={50}
        onPageChange={change}
        onPageSizeChange={size}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: '下一页' }))
    expect(change).toHaveBeenCalledWith(2)
    await userEvent.selectOptions(screen.getByLabelText('每页条数'), '20')
    expect(size).toHaveBeenCalledWith(20)
  })
  it('页签支持键盘、跳过禁用项，panel与tab正确关联', async () => {
    function Demo() {
      const [value, setValue] = useState('a')
      return (
        <Tabs
          label="模式"
          value={value}
          onChange={setValue}
          items={[
            { key: 'a', label: '一', content: 'first' },
            { key: 'b', label: '二', content: 'disabled', disabled: true },
            { key: 'c', label: '三', content: 'last' },
          ]}
        />
      )
    }
    render(<Demo />)
    screen.getByRole('tab', { name: '一' }).focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: '三' })).toHaveFocus()
    expect(screen.getByRole('tabpanel')).toHaveTextContent('last')
    await userEvent.keyboard('{Home}')
    expect(screen.getByRole('tab', { name: '一' })).toHaveFocus()
  })
  it('详情弹窗正确开启、关闭和回调，Escape可禁用', () => {
    const close = vi.fn(),
      { rerender } = render(
        <DetailModal isOpen title="详情" onClose={close}>
          内容
        </DetailModal>,
      )
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAccessibleName('详情')
    fireEvent(dialog, new Event('cancel', { cancelable: true }))
    expect(close).toHaveBeenCalledOnce()
    rerender(
      <DetailModal isOpen title="详情" dismissible={false} onClose={close}>
        内容
      </DetailModal>,
    )
    fireEvent(dialog, new Event('cancel', { cancelable: true }))
    expect(close).toHaveBeenCalledOnce()
    rerender(<DetailModal isOpen={false} title="详情" onClose={close} />)
    expect(dialog).not.toHaveAttribute('open')
  })
  it('表格键为数字0时稳定；全选只改变本页键，保留其他页选择', () => {
    const change = vi.fn()
    render(
      <DataTable
        label="示例"
        rowKey="id"
        items={[
          { id: 0, name: 'Zero' },
          { id: 1, name: 'One' },
        ]}
        columns={[{ key: 'name', title: '名称' }]}
        selectionMode="multiple"
        selectedKeys={new Set([99])}
        onSelectionChange={change}
      />,
    )
    const table = screen.getByRole('table')
    fireEvent.click(within(table).getByLabelText('选择当前页全部行'))
    expect(change).toHaveBeenCalledWith(new Set([99, 0, 1]))
    expect(within(table).getByText('Zero')).toBeVisible()
  })
  it('单选状态只发一个键，排序显式回调不改变输入数组', () => {
    const select = vi.fn(),
      sort = vi.fn(),
      items = [
        { id: 1, name: 'B' },
        { id: 2, name: 'A' },
      ]
    render(
      <DataTable
        label="示例"
        rowKey="id"
        items={items}
        columns={[{ key: 'name', title: '名称', sortable: true }]}
        selectionMode="single"
        selectedKeys={new Set([1])}
        onSelectionChange={select}
        onSortChange={sort}
      />,
    )
    const table = screen.getByRole('table')
    fireEvent.click(within(table).getByLabelText('选择行 2'))
    expect(select).toHaveBeenCalledWith(new Set([2]))
    fireEvent.click(within(table).getByRole('button', { name: '名称' }))
    expect(sort).toHaveBeenCalledWith({ key: 'name', direction: 'asc' })
    expect(items[0]!.name).toBe('B')
  })
  it('重复rowKey明确报错，不回退到不稳定的数组索引', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() =>
      render(<DataTable label="重复" rowKey="id" items={[{ id: 1 }, { id: 1 }]} columns={[]} />),
    ).toThrow('unique')
  })
  it('Skeleton限制异常行数，主题组件可在服务器渲染', () => {
    const { container } = render(<Skeleton lines={Infinity} />)
    expect(container.querySelectorAll('.bui-skeleton span')).toHaveLength(3)
    expect(() =>
      renderToString(
        <UIProvider>
          <Button>SSR</Button>
          <DetailModal isOpen={false} title="Closed" onClose={() => {}} />
        </UIProvider>,
      ),
    ).not.toThrow()
  })
})
