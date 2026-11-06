import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { renderToString } from 'react-dom/server'
import * as Core from '../src'
import * as Editors from '../src/editors'
import * as MarkdownEntry from '../src/markdown'
import { catalog } from '../playground/catalog'
import api from '../playground/api.generated.json'
describe('组件覆盖及新增交互', () => {
  it('45个组件都有独立文档、真实导出和代码示例，没有占位菜单', () => {
    expect(catalog).toHaveLength(45)
    expect(new Set(catalog.map((c) => c.name)).size).toBe(45)
    const all = { ...Core, ...Editors, ...MarkdownEntry }
    for (const entry of catalog) {
      expect(all[entry.name]).toBeTruthy()
      expect(api.components[entry.name].example).toContain(entry.name)
      expect(entry.props).toBeTruthy()
    }
  })
  it('Select/Textarea使用原生受控事件和标签，开关与复选框可访问', async () => {
    const user = userEvent.setup()
    function Demo() {
      const [v, setV] = useState('a'),
        [text, setText] = useState(''),
        [checked, setChecked] = useState(false)
      return (
        <>
          <Core.Select
            label="选择状态"
            value={v}
            onChange={(e) => setV(e.target.value)}
            options={[
              { value: 'a', label: 'A' },
              { value: 'b', label: 'B' },
            ]}
          />
          <Core.Textarea label="说明" value={text} onChange={(e) => setText(e.target.value)} />
          <Core.Switch
            label="启用"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          <Core.Checkbox label="已读" defaultChecked />
        </>
      )
    }
    render(<Demo />)
    await user.selectOptions(screen.getByLabelText('选择状态'), 'b')
    expect(screen.getByLabelText('选择状态')).toHaveValue('b')
    await user.type(screen.getByLabelText('说明'), 'hello')
    expect(screen.getByLabelText('说明')).toHaveValue('hello')
    await user.click(screen.getByRole('switch', { name: '启用' }))
    expect(screen.getByRole('switch')).toBeChecked()
    expect(screen.getByLabelText('已读')).toBeChecked()
  })
  it('Tooltip给实际触发按钮绑定描述', () => {
    render(
      <Core.Tooltip content="辅助说明">
        <Core.Button>帮助</Core.Button>
      </Core.Tooltip>,
    )
    expect(screen.getByRole('button', { name: '帮助' })).toHaveAccessibleDescription('辅助说明')
  })
  it('Dropdown选择、禁用和Escape收起，不硬编码路由', () => {
    const select = vi.fn()
    const { container } = render(
      <Core.Dropdown
        label="操作"
        items={[
          { key: 'a', label: '查看' },
          { key: 'b', label: '禁用', disabled: true },
        ]}
        onSelect={select}
      />,
    )
    const details = container.querySelector('details')!
    details.open = true
    expect(screen.getByRole('button', { name: '禁用' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: '查看' }))
    expect(select).toHaveBeenCalledWith('a')
    expect(details.open).toBe(false)
    details.open = true
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(details.open).toBe(false)
  })
  it('TreeTable展开、收起、受控展开及数字0行键', () => {
    type N = { id: number; name: string; children?: N[] }
    const tree: N[] = [{ id: 0, name: 'Parent', children: [{ id: 1, name: 'Child' }] }]
    const { rerender } = render(
      <Core.TreeTable
        label="树"
        data={tree}
        rowKey="id"
        getChildren={(n) => n.children}
        columns={[{ key: 'name', title: '名称' }]}
      />,
    )
    const table = screen.getByRole('table')
    expect(within(table).queryByText('Child')).toBeNull()
    fireEvent.click(within(table).getByRole('button', { name: '展开 Parent' }))
    expect(within(table).getByText('Child')).toBeVisible()
    fireEvent.click(within(table).getByRole('button', { name: '收起 Parent' }))
    expect(within(table).queryByText('Child')).toBeNull()
    const change = vi.fn()
    rerender(
      <Core.TreeTable
        label="树"
        data={tree}
        rowKey="id"
        getChildren={(n) => n.children}
        columns={[{ key: 'name', title: '名称' }]}
        expandedKeys={new Set([0])}
        onExpandedChange={change}
      />,
    )
    fireEvent.click(within(table).getByRole('button', { name: '收起 Parent' }))
    expect(change).toHaveBeenCalledWith(new Set())
  })
  it('TreeTable循环或重复键明确失败，不无限递归', () => {
    type N = { id: number; name: string; children?: N[] }
    const node: N = { id: 1, name: 'Cycle' }
    node.children = [node]
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() =>
      render(
        <Core.TreeTable
          label="树"
          data={[node]}
          rowKey="id"
          getChildren={(n) => n.children}
          columns={[]}
          expandedKeys={new Set([1])}
        />,
      ),
    ).toThrow(/duplicate|cycle/)
  })
  it('确认弹窗异步防重、错误后可重试，成功才关闭', async () => {
    let reject!: (e: Error) => void
    const close = vi.fn(),
      confirm = vi.fn(
        () =>
          new Promise<void>((_, r) => {
            reject = r
          }),
      )
    render(
      <Core.ConfirmDialog isOpen title="确认" onClose={close} onConfirm={confirm}>
        示例
      </Core.ConfirmDialog>,
    )
    const button = screen.getByRole('button', { name: '确认' })
    fireEvent.click(button)
    fireEvent.click(button)
    expect(confirm).toHaveBeenCalledOnce()
    expect(close).not.toHaveBeenCalled()
    reject(new Error('重试信息'))
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('重试信息'))
    expect(button).not.toBeDisabled()
  })
  it('导航、可关闭页签只发送对应回调；关闭不误触选中', () => {
    const select = vi.fn(),
      close = vi.fn()
    render(
      <>
        <Core.NavigationMenu
          label="导航"
          items={[{ key: 'a', label: 'A' }]}
          activeKey="a"
          onSelect={select}
        />
        <Core.RouteTabs
          items={[{ key: 'a', label: 'A', closable: true }]}
          activeKey="a"
          onSelect={select}
          onClose={close}
        />
      </>,
    )
    fireEvent.click(screen.getByRole('button', { name: '关闭 A' }))
    expect(close).toHaveBeenCalledWith('a')
    expect(select).not.toHaveBeenCalled()
    fireEvent.click(
      within(screen.getByRole('navigation', { name: '导航' })).getByRole('button', { name: 'A' }),
    )
    expect(select).toHaveBeenCalledWith('a')
  })
  it('链接和媒体拒绝脚本URL，保留外部链接保护', () => {
    const { container } = render(
      <>
        <Core.ExternalLink href="javascript:alert(1)" title="无效链接" />
        <Core.ExternalLink href="https://example.com" title="文档" />
        <Core.ImagePreview src="javascript:alert(1)" alt="图片" />
        <Core.VideoPlayer src="javascript:alert(1)" label="视频" />
      </>,
    )
    expect(screen.getByText('无效链接').closest('a')).not.toHaveAttribute('href')
    expect(screen.getByRole('link', { name: /文档/ })).toHaveAttribute('rel', 'noopener noreferrer')
    expect(container.querySelector('video')).toBeNull()
    expect(screen.getByText('图片无法加载')).toBeVisible()
  })
  it('MethodChip/RequestStatusChip和数量0正确展示', () => {
    render(
      <>
        <Core.MethodChip value="get" />
        <Core.RequestStatusChip status={404} />
        <Core.ItemCounter count={0} />
      </>,
    )
    expect(screen.getByText('GET')).toBeVisible()
    expect(screen.getByText('404')).toBeVisible()
    expect(screen.getByText('0')).toBeVisible()
  })
  it('可选编辑器在SSR时不加载浏览器引擎', () => {
    expect(() =>
      renderToString(
        <Core.UIProvider>
          <Editors.CodeEditor value="let x=1" label="代码" />
          <Editors.RichTextEditor value="<p>Hello</p>" label="正文" />
        </Core.UIProvider>,
      ),
    ).not.toThrow()
  })
  it('Markdown支持GFM，默认不渲染原始HTML或脚本链接', () => {
    const { container } = render(
      <MarkdownEntry.Markdown>
        {
          '# Title\n\n| A | B |\n| - | - |\n| 1 | 2 |\n\n<script>alert(1)</script>\n\n[unsafe](javascript:alert(1))'
        }
      </MarkdownEntry.Markdown>,
    )
    expect(screen.getByRole('heading', { name: 'Title' })).toBeVisible()
    expect(screen.getByRole('table')).toBeVisible()
    expect(container.querySelector('script')).toBeNull()
    const link = screen.getByText('unsafe').closest('a')
    expect(link?.getAttribute('href') || '').not.toMatch(/^javascript:/)
  })
})

describe('上传适配器边界', () => {
  function Harness({
    upload,
    maxCount = 2,
    accept = 'text/plain',
    maxSize = 10,
  }: {
    upload?: Core.FileUploadProps['upload']
    maxCount?: number
    accept?: string
    maxSize?: number
  }) {
    const [files, setFiles] = useState<Core.UploadItem[]>([])
    return (
      <Core.FileUpload
        label="文件"
        files={files}
        onChange={setFiles}
        upload={upload}
        accept={accept}
        maxCount={maxCount}
        maxSize={maxSize}
      />
    )
  }
  it('没有适配器时仅选择，不假报上传完成', () => {
    render(<Harness />)
    fireEvent.change(screen.getByLabelText('文件'), {
      target: { files: [new File(['ok'], 'note.txt', { type: 'text/plain' })] },
    })
    expect(screen.getByText('note.txt')).toBeVisible()
    expect(screen.getByText('已选择')).toBeVisible()
    expect(screen.queryByText('已完成')).toBeNull()
  })
  it('格式/大小/数量检查先于上传', () => {
    const upload = vi.fn()
    render(<Harness upload={upload} />)
    fireEvent.change(screen.getByLabelText('文件'), {
      target: {
        files: [
          new File(['way too long for max size'], 'large.txt', { type: 'text/plain' }),
          new File(['x'], 'bad.png', { type: 'image/png' }),
        ],
      },
    })
    expect(upload).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('格式不支持')
  })
  it('上传进度、成功和移除可用；上传中移除会abort且不接受迟到结果', async () => {
    let resolve!: (result: { url: string }) => void
    let signal!: AbortSignal
    const upload = vi.fn<NonNullable<Core.FileUploadProps['upload']>>((_, options) => {
      signal = options.signal
      options.onProgress(50)
      return new Promise((r) => {
        resolve = r
      })
    })
    render(<Harness upload={upload} />)
    fireEvent.change(screen.getByLabelText('文件'), {
      target: { files: [new File(['ok'], 'note.txt', { type: 'text/plain' })] },
    })
    expect(screen.getByText('上传中 50%')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: '移除 note.txt' }))
    expect(signal.aborted).toBe(true)
    resolve({ url: 'blob:test' })
    await waitFor(() => expect(screen.queryByText('note.txt')).toBeNull())
  })
  it('适配器失败展示错误，可拒绝脚本URL结果', async () => {
    render(<Harness upload={async () => ({ url: 'javascript:alert(1)' })} />)
    fireEvent.change(screen.getByLabelText('文件'), {
      target: { files: [new File(['ok'], 'note.txt', { type: 'text/plain' })] },
    })
    await waitFor(() => expect(screen.getByText('上传结果URL无效')).toBeVisible())
  })
})
