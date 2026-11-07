import { useState } from 'react'
import { act, fireEvent, render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderToString } from 'react-dom/server'
import * as UI from '../src'
import FormListExample from '../docs/examples/FormList'

afterEach(() => vi.useRealTimers())

describe('Message 容器', () => {
  function OtherDemo() {
    const message = UI.useMessage()
    return <button onClick={() => message.success('独立消息', 0)}>另一实例</button>
  }
  function Demo() {
    const message = UI.useMessage()
    const [id, setId] = useState('')
    return (
      <>
        <button onClick={() => message.success('成功', 1000)}>通知</button>
        <button onClick={() => setId(message.loading('等待'))}>开始</button>
        <button
          onClick={() => message.update(id, { content: '完成', loading: false, duration: 1000 })}
        >
          结束
        </button>
        <button onClick={message.clear}>清除</button>
      </>
    )
  }
  it('自动关闭、悬停剩余计时及卸载清理', () => {
    vi.useFakeTimers()
    const { unmount } = render(
      <UI.MessageProvider>
        <Demo />
      </UI.MessageProvider>,
    )
    fireEvent.click(screen.getByText('通知'))
    act(() => vi.advanceTimersByTime(400))
    fireEvent.mouseEnter(screen.getByRole('status'))
    act(() => vi.advanceTimersByTime(2000))
    expect(screen.getByText('成功')).toBeVisible()
    fireEvent.mouseLeave(screen.getByRole('status'))
    act(() => vi.advanceTimersByTime(599))
    expect(screen.getByText('成功')).toBeVisible()
    act(() => vi.advanceTimersByTime(1))
    expect(screen.queryByText('成功')).toBeNull()
    fireEvent.click(screen.getByText('通知'))
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
  it('loading 不自动结束，update 后开始倒计时，不跨容器清除', () => {
    vi.useFakeTimers()
    render(
      <>
        <UI.MessageProvider>
          <Demo />
        </UI.MessageProvider>
        <UI.MessageProvider>
          <OtherDemo />
        </UI.MessageProvider>
      </>,
    )
    fireEvent.click(screen.getByText('开始'))
    act(() => vi.advanceTimersByTime(10000))
    expect(screen.getByText('等待')).toBeVisible()
    fireEvent.click(screen.getByText('结束'))
    expect(screen.getByText('完成')).toBeVisible()
    act(() => vi.advanceTimersByTime(1000))
    expect(screen.queryByText('完成')).toBeNull()
    fireEvent.click(screen.getByText('另一实例'))
    fireEvent.click(screen.getByText('清除'))
    expect(screen.getByText('独立消息')).toBeVisible()
  })
})

describe('表单及动态列表', () => {
  it('必填校验、0 值、失焦错误、重置及校验失败不提交', async () => {
    const finish = vi.fn(),
      user = userEvent.setup()
    render(
      <UI.Form initialValues={{ name: '', count: 0 }} onFinish={finish}>
        <UI.FormField name="name" label="名称" required>
          {(control) => (
            <input
              {...control}
              value={String(control.value)}
              onChange={(event) => control.onChange(event.target.value)}
            />
          )}
        </UI.FormField>
        <UI.FormField name="count" label="数量" required>
          {(control) => (
            <input
              {...control}
              value={String(control.value)}
              onChange={(event) => control.onChange(Number(event.target.value))}
            />
          )}
        </UI.FormField>
        <UI.Button type="submit">保存</UI.Button>
        <UI.Button type="reset">重置</UI.Button>
      </UI.Form>,
    )
    await user.click(screen.getByText('保存'))
    expect(await screen.findByRole('alert')).toHaveTextContent('必填')
    expect(finish).not.toHaveBeenCalled()
    await user.type(screen.getByRole('textbox', { name: '名称' }), '测试')
    await user.click(screen.getByText('保存'))
    await waitFor(() => expect(finish).toHaveBeenCalledWith({ name: '测试', count: 0 }))
    await user.click(screen.getByText('重置'))
    expect(screen.getByRole('textbox', { name: '名称' })).toHaveValue('')
  })
  it('异步提交防重，失败可重试，不调用成功回调', async () => {
    let reject!: (reason: Error) => void
    const finish = vi.fn(
        () =>
          new Promise<void>((_, r) => {
            reject = r
          }),
      ),
      error = vi.fn()
    render(
      <UI.Form initialValues={{ value: 1 }} onFinish={finish} onSubmitError={error}>
        <UI.Button type="submit">保存</UI.Button>
      </UI.Form>,
    )
    fireEvent.click(screen.getByText('保存'))
    fireEvent.click(screen.getByText('保存'))
    await waitFor(() => expect(finish).toHaveBeenCalledOnce())
    expect(screen.getByText('保存')).toBeDisabled()
    await act(async () => reject(new Error('模拟失败')))
    expect(screen.getByRole('alert')).toHaveTextContent('模拟失败')
    expect(screen.getByText('保存')).not.toBeDisabled()
    expect(error).toHaveBeenCalledOnce()
  })
  it('动态列表移除、稳定字段及清空提交 []', async () => {
    const user = userEvent.setup()
    render(<FormListExample />)
    await user.click(screen.getByText('添加条目'))
    await user.type(screen.getByLabelText('第 2 项名称'), '第二项')
    const second = screen.getByLabelText('第 2 项名称')
    await user.click(screen.getByText('移除第 1 项'))
    expect(screen.getByLabelText('第 1 项名称')).toBe(second)
    expect(second).toHaveValue('第二项')
    await user.click(screen.getByText('移除第 1 项'))
    await user.click(screen.getByText('保存条目'))
    expect(await screen.findByLabelText('条目提交结果')).toHaveTextContent('[]')
  })
})

describe('选择和基础输入', () => {
  const options = [
    { value: 'a', label: 'Alpha' },
    { value: 'b', label: 'Beta', disabled: true },
    { value: 'c', label: 'Gamma' },
  ]
  it('搜索过滤、跳过禁用项、键盘选择和 Escape 不清空', async () => {
    const user = userEvent.setup()
    function Demo() {
      const [value, setValue] = useState('a')
      return <UI.SearchSelect label="搜索" options={options} value={value} onChange={setValue} />
    }
    render(<Demo />)
    const input = screen.getByRole('combobox', { name: '搜索' })
    await user.click(input)
    await user.keyboard('{ArrowDown}{Enter}')
    expect(input).toHaveValue('Gamma')
    await user.click(input)
    await user.type(input, 'does-not-exist')
    expect(screen.queryByRole('option')).toBeNull()
    await user.keyboard('{Escape}')
    expect(input).toHaveValue('Gamma')
    await user.click(screen.getByRole('button', { name: '清空' }))
    expect(input).toHaveValue('')
  })
  it('级联父项改变会清空所有下级，禁用项不可选择', async () => {
    const change = vi.fn(),
      user = userEvent.setup()
    const { rerender } = render(
      <UI.Cascader
        label="区域"
        levelLabels={['省', '市']}
        value={['a', 'c']}
        onChange={change}
        options={[
          { value: 'a', label: 'A', children: [{ value: 'c', label: 'C' }] },
          { value: 'b', label: 'B' },
        ]}
      />,
    )
    await user.selectOptions(screen.getByLabelText('省'), 'b')
    expect(change).toHaveBeenCalledWith(['b'])
    rerender(
      <UI.Cascader
        label="区域"
        levelLabels={['省', '市']}
        value={['b']}
        onChange={change}
        options={[
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
        ]}
      />,
    )
    expect(screen.queryByLabelText('市')).toBeNull()
  })
  it('数字空值为 null，失焦才规范范围与精度', async () => {
    const user = userEvent.setup()
    function Demo() {
      const [value, setValue] = useState<number | null>(0)
      return (
        <UI.NumberInput
          label="数量"
          value={value}
          onChange={setValue}
          min={0}
          max={10}
          precision={2}
        />
      )
    }
    render(<Demo />)
    const input = screen.getByLabelText('数量')
    expect(input).toHaveValue(0)
    await user.clear(input)
    expect(input).toHaveValue(null)
    await user.type(input, '12.345')
    expect(input).toHaveValue(12.345)
    await user.tab()
    expect(input).toHaveValue(10)
  })
  it('日期范围不交换或转换日期，反向区间可见错误', () => {
    const change = vi.fn()
    render(
      <UI.DateRangePicker label="区间" value={['2026-11-06', '2026-11-01']} onChange={change} />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('开始日期不能晚于结束日期')
    fireEvent.change(screen.getByLabelText('开始日期'), { target: { value: '' } })
    expect(change).toHaveBeenCalledWith(['', '2026-11-01'])
  })
  it('不同单选组独立且禁用项不能交互', async () => {
    const change = vi.fn(),
      user = userEvent.setup()
    render(
      <>
        <UI.RadioGroup label="组一" options={options} value="a" onChange={change} />
        <UI.RadioGroup label="组二" options={options} value="c" onChange={change} />
      </>,
    )
    const a = within(screen.getByRole('group', { name: '组一' })).getByLabelText('Alpha'),
      c = within(screen.getByRole('group', { name: '组二' })).getByLabelText('Gamma')
    expect(a.getAttribute('name')).not.toBe(c.getAttribute('name'))
    await user.click(within(screen.getByRole('group', { name: '组一' })).getByLabelText('Beta'))
    expect(change).not.toHaveBeenCalled()
  })
})

describe('上传、裁剪与表格兼容', () => {
  function UploadDemo({
    beforeUpload,
    upload,
  }: Pick<UI.FileUploadProps, 'beforeUpload' | 'upload'>) {
    const [files, setFiles] = useState<UI.UploadItem[]>([])
    return (
      <UI.FileUpload
        label="上传"
        files={files}
        onChange={setFiles}
        beforeUpload={beforeUpload}
        upload={upload}
        accept="image/png"
      />
    )
  }
  it('处理后文件传给上传适配器，取消处理不上传', async () => {
    const original = new File(['a'], 'original.png', { type: 'image/png' }),
      processed = new File(['b'], 'cropped.png', { type: 'image/png' })
    const before = vi.fn().mockResolvedValue(processed),
      upload = vi.fn().mockResolvedValue({ url: '/image.png' })
    const { unmount } = render(<UploadDemo beforeUpload={before} upload={upload} />)
    fireEvent.change(screen.getByLabelText('上传'), { target: { files: [original] } })
    await waitFor(() =>
      expect(upload).toHaveBeenCalledWith(
        processed,
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      ),
    )
    expect(await screen.findByText('已完成')).toBeVisible()
    unmount()
    upload.mockClear()
    render(<UploadDemo beforeUpload={() => null} upload={upload} />)
    fireEvent.change(screen.getByLabelText('上传'), { target: { files: [original] } })
    await waitFor(() => expect(screen.queryByText('original.png')).toBeNull())
    expect(upload).not.toHaveBeenCalled()
  })
  it('处理中移除发出 abort，迟到结果不上传或恢复条目', async () => {
    let resolve!: (file: File) => void, signal!: AbortSignal
    const file = new File(['a'], 'sample.png', { type: 'image/png' }),
      upload = vi.fn()
    render(
      <UploadDemo
        beforeUpload={(_, options) => {
          signal = options.signal
          return new Promise((r) => {
            resolve = r
          })
        }}
        upload={upload}
      />,
    )
    fireEvent.change(screen.getByLabelText('上传'), { target: { files: [file] } })
    fireEvent.click(screen.getByRole('button', { name: '移除 sample.png' }))
    expect(signal.aborted).toBe(true)
    await act(async () => resolve(file))
    expect(upload).not.toHaveBeenCalled()
    expect(screen.queryByText('sample.png')).toBeNull()
  })
  it('裁剪预览与导出使用同一坐标，非法尺寸明确失败', () => {
    expect(UI.calculateCrop(800, 400, 1, 1, 50, 50)).toEqual({
      x: 200,
      y: 0,
      width: 400,
      height: 400,
    })
    expect(UI.calculateCrop(800, 400, 2, 2, 100, 100)).toEqual({
      x: 400,
      y: 200,
      width: 400,
      height: 200,
    })
    expect(() => UI.calculateCrop(800, 400, 0, 1, 0, 0)).toThrow('Invalid')
  })
  it('操作列只隐藏移动标签，桌面表头与普通列不变', () => {
    const { container } = render(
      <UI.DataTable
        label="表格"
        rowKey="id"
        items={[{ id: 0, name: '示例' }]}
        columns={[
          { key: 'name', title: '名称' },
          {
            key: 'actions',
            title: '操作',
            kind: 'actions',
            render: () => <UI.Button>查看</UI.Button>,
          },
        ]}
      />,
    )
    expect(screen.getByRole('columnheader', { name: '操作' })).toBeVisible()
    const mobile = container.querySelector('.bui-table-mobile')!
    expect(within(mobile as HTMLElement).getByText('名称')).toBeInTheDocument()
    expect(within(mobile as HTMLElement).queryByText('操作')).toBeNull()
    expect(mobile.querySelector('.bui-table-mobile__wide button')).toHaveTextContent('查看')
  })
  it('新增控件可服务端渲染，不接入浏览器或业务状态', () => {
    expect(() =>
      renderToString(
        <UI.UIProvider>
          <UI.MessageProvider>
            <UI.SearchSelect label="选择" options={[]} value="" onChange={() => {}} />
            <UI.ImageCropper isOpen={false} file={null} onClose={() => {}} onCrop={() => {}} />
            <UI.PageHeader title="示例" />
          </UI.MessageProvider>
        </UI.UIProvider>,
      ),
    ).not.toThrow()
  })
})
