import { lazy, Suspense, useEffect, useRef, useState, type Key } from 'react'
import * as UI from '../src'
import type { TableColumn, DetailField, UploadItem, Locale, RouteTab } from '../src'
import type { ComponentName } from './catalog'
import '@wangeditor/editor/dist/css/style.css'
const CodeEditor = lazy(() => import('../src/editors').then((m) => ({ default: m.CodeEditor })))
const RichTextEditor = lazy(() =>
  import('../src/editors').then((m) => ({ default: m.RichTextEditor })),
)
const Markdown = lazy(() => import('../src/markdown').then((m) => ({ default: m.Markdown })))
export type Task = { id: string; name: string; owner: string; status: string; updated: string }
const tasks: Task[] = [
  { id: 'CMP-001', name: '组件设计规范', owner: 'Lin', status: 'done', updated: '2026-11-01' },
  { id: 'CMP-002', name: '可访问性检查', owner: 'Alex', status: 'review', updated: '2026-11-02' },
  {
    id: 'CMP-003',
    name: '响应式文档站',
    owner: 'River',
    status: 'progress',
    updated: '2026-11-03',
  },
  { id: 'CMP-004', name: '发布包验收', owner: 'Sam', status: 'review', updated: '2026-11-04' },
  { id: 'CMP-005', name: '类型与文档同步', owner: 'Lin', status: 'done', updated: '2026-11-05' },
  { id: 'CMP-006', name: '主题预设', owner: 'Alex', status: 'progress', updated: '2026-11-06' },
]
const statuses = {
  done: { label: '已完成', tone: 'success' as const },
  review: { label: '待检查', tone: 'warning' as const },
  progress: { label: '进行中', tone: 'primary' as const },
}
const fields: DetailField<Task>[] = [
  { key: 'id', label: '任务编号' },
  { key: 'name', label: '名称' },
  { key: 'owner', label: '负责人' },
  {
    key: 'status',
    label: '状态',
    render: (_, row) => <UI.StatusChip value={row.status} map={statuses} />,
  },
  { key: 'updated', label: '更新日期' },
]
export function TableExample() {
  const [filter, setFilter] = useState(''),
    [page, setPage] = useState(1),
    [size, setSize] = useState(5),
    [selected, setSelected] = useState<Set<Key>>(new Set()),
    [detail, setDetail] = useState<Task | null>(null),
    [sort, setSort] = useState<{ key: string; direction: 'asc' | 'desc' }>({
      key: 'id',
      direction: 'asc',
    })
  const filtered = tasks
    .filter((t) => `${t.name} ${t.owner} ${t.id}`.toLowerCase().includes(filter.toLowerCase()))
    .sort(
      (a, b) =>
        String(a[sort.key as keyof Task]).localeCompare(String(b[sort.key as keyof Task])) *
        (sort.direction === 'asc' ? 1 : -1),
    )
  const columns: TableColumn<Task>[] = [
    {
      key: 'name',
      title: '项目 / 名称',
      sortable: true,
      render: (row) => (
        <div>
          <strong>{row.name}</strong>
          <small className="row-id">{row.id}</small>
        </div>
      ),
    },
    { key: 'owner', title: '负责人' },
    {
      key: 'status',
      title: '状态',
      render: (row) => <UI.StatusChip value={row.status} map={statuses} />,
    },
    { key: 'updated', title: '更新日期', sortable: true },
    {
      key: 'actions',
      title: '操作',
      render: (row) => (
        <UI.Button size="sm" tone="neutral" variant="ghost" onClick={() => setDetail(row)}>
          查看详情
        </UI.Button>
      ),
    },
  ]
  return (
    <>
      <UI.Card
        title="组件任务"
        description="桌面表格 / 移动端卡片 · 同一数据源"
        action={<UI.Badge>{selected.size} 项已选择</UI.Badge>}
      >
        <div className="table-filter">
          <UI.Input
            label="筛选任务"
            value={filter}
            placeholder="搜索名称、负责人或编号"
            onChange={(e) => {
              setFilter(e.target.value)
              setPage(1)
            }}
          />
          <UI.Button
            size="sm"
            variant="outline"
            tone="neutral"
            onClick={() => {
              setFilter('')
              setSelected(new Set())
              setPage(1)
            }}
          >
            重置
          </UI.Button>
        </div>
        <UI.DataTable
          label="组件任务列表"
          items={filtered.slice((page - 1) * size, page * size)}
          columns={columns}
          rowKey="id"
          selectionMode="multiple"
          selectedKeys={selected}
          onSelectionChange={setSelected}
          sort={sort}
          onSortChange={setSort}
        />
        <UI.Pagination
          page={page}
          pageSize={size}
          total={filtered.length}
          onPageChange={setPage}
          onPageSizeChange={(n) => {
            setSize(n)
            setPage(1)
          }}
          pageSizeOptions={[5, 10, 20]}
        />
      </UI.Card>
      <UI.DetailModal
        title="任务详情"
        description="数据与交互由调用方提供"
        isOpen={!!detail}
        onClose={() => setDetail(null)}
        data={detail}
        fields={fields}
      />
    </>
  )
}
interface Node {
  id: number
  name: string
  kind: string
  children?: Node[]
}
const tree: Node[] = [
  {
    id: 1,
    name: '设计系统',
    kind: '分组',
    children: [
      {
        id: 11,
        name: '基础组件',
        kind: '目录',
        children: [
          { id: 111, name: 'Button', kind: '组件' },
          { id: 112, name: 'Input', kind: '组件' },
        ],
      },
      { id: 12, name: '文档站', kind: '目录' },
    ],
  },
  { id: 2, name: '发布流程', kind: '分组', children: [{ id: 21, name: '包验收', kind: '步骤' }] },
]
export function ComponentExample({
  name,
  theme,
  onThemeChange,
  locale,
  onLocaleChange,
}: {
  name: ComponentName
  theme: 'light' | 'dark'
  onThemeChange: (v: 'light' | 'dark') => void
  locale: Locale
  onLocaleChange: (v: Locale) => void
}) {
  const [text, setText] = useState('Batype workspace'),
    [checked, setChecked] = useState(true),
    [option, setOption] = useState('active'),
    [tab, setTab] = useState('preview'),
    [open, setOpen] = useState(false),
    [result, setResult] = useState(''),
    [files, setFiles] = useState<UploadItem[]>([]),
    [active, setActive] = useState('overview'),
    [page, setPage] = useState(1),
    [tabs, setTabs] = useState<RouteTab[]>([
      { key: 'overview', label: '总览' },
      { key: 'components', label: '组件', closable: true },
      { key: 'settings', label: '设置', closable: true },
    ]),
    [code, setCode] = useState('const greeting: string = "Hello UI"\nconsole.log(greeting)\n'),
    [html, setHtml] = useState(
      '<p>欢迎使用 <strong>Batype UI</strong>。</p><p style="text-indent: 2em;">富文本样式与空白保持原样。</p>',
    )
  const urls = useRef<string[]>([])
  useEffect(() => () => urls.current.forEach(URL.revokeObjectURL), [])
  const upload = async (
    file: File,
    { signal, onProgress }: { signal: AbortSignal; onProgress: (n: number) => void },
  ) => {
    onProgress(50)
    await new Promise<void>((resolve, reject) => {
      const cancel = () => {
        clearTimeout(timer)
        reject(new DOMException('Aborted', 'AbortError'))
      }
      const timer = setTimeout(() => {
        signal.removeEventListener('abort', cancel)
        resolve()
      }, 250)
      signal.addEventListener('abort', cancel, { once: true })
    })
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError')
    const url = URL.createObjectURL(file)
    urls.current.push(url)
    return { url }
  }
  let demo: React.ReactNode
  switch (name) {
    case 'UIProvider':
      demo = (
        <div className="dual-demo">
          <UI.UIProvider theme="light">
            <UI.Card title="Light">
              <UI.Button>浅色主题</UI.Button>
            </UI.Card>
          </UI.UIProvider>
          <UI.UIProvider theme="dark">
            <UI.Card title="Dark">
              <UI.Button>深色主题</UI.Button>
            </UI.Card>
          </UI.UIProvider>
        </div>
      )
      break
    case 'Button':
      demo = (
        <div className="demo-row">
          <UI.Button onClick={() => setResult('已触发点击')}>主按钮</UI.Button>
          <UI.Button variant="soft">次要按钮</UI.Button>
          <UI.Button variant="outline" tone="neutral">
            边框按钮
          </UI.Button>
          <UI.Button variant="ghost">文字按钮</UI.Button>
          <UI.Button loading>加载中</UI.Button>
          <UI.Button disabled>不可用</UI.Button>
        </div>
      )
      break
    case 'ActionButton':
      demo = (
        <div className="demo-row">
          <UI.ActionButton
            label="添加条目"
            icon={<UI.Icon name="plus" />}
            onClick={() => setResult('已添加条目')}
          />
          <UI.ActionButton label="确认" tone="success" icon={<UI.Icon name="check" />} />
          <UI.ActionButton label="关闭" tone="danger" icon={<UI.Icon name="close" />} />
        </div>
      )
      break
    case 'Icon':
      demo = (
        <div className="icon-gallery">
          {(
            [
              'plus',
              'close',
              'chevron-left',
              'chevron-right',
              'copy',
              'check',
              'search',
              'arrow-up',
              'arrow-down',
              'box',
            ] as const
          ).map((icon) => (
            <span key={icon}>
              <UI.Icon name={icon} size={24} />
              <code>{icon}</code>
            </span>
          ))}
        </div>
      )
      break
    case 'Card':
      demo = (
        <UI.Card
          title="卡片标题"
          description="描述、正文、操作和页脚可独立组合"
          action={<UI.Badge tone="primary">示例</UI.Badge>}
          footer={<UI.Button size="sm">保存</UI.Button>}
        >
          这里是任意 React 内容。
        </UI.Card>
      )
      break
    case 'CopyButton':
      demo = (
        <div className="demo-row">
          <code>npm install @batype/ui</code>
          <UI.CopyButton value="npm install @batype/ui" onCopied={() => setResult('复制成功')} />
        </div>
      )
      break
    case 'ExternalLink':
      demo = (
        <UI.ExternalLink
          href="https://react.dev"
          title="React 官方文档"
          description="安全的新窗口链接，业务地址由调用方传入"
        />
      )
      break
    case 'ItemCounter':
      demo = <UI.ItemCounter count={128} label="个组件示例" />
      break
    case 'Tooltip':
      demo = (
        <UI.Tooltip content="键盘聚焦或鼠标悬停时展示说明">
          <UI.Button variant="outline">查看说明</UI.Button>
        </UI.Tooltip>
      )
      break
    case 'Input':
      demo = (
        <div className="form">
          <UI.Input
            label="项目名称"
            value={text}
            onChange={(e) => setText(e.target.value)}
            hint="受控输入，使用原生事件"
          />
          <UI.Input label="工作邮箱" error="演示错误：请填写有效邮箱" />
          <UI.Input label="只读字段" value="只读内容" readOnly />
        </div>
      )
      break
    case 'PasswordInput':
      demo = (
        <UI.PasswordInput label="访问口令" autoComplete="new-password" hint="点击按钮切换可见性" />
      )
      break
    case 'Textarea':
      demo = (
        <UI.Textarea
          label="说明"
          value={text}
          onChange={(e) => setText(e.target.value)}
          hint="支持原生rows、maxLength和ref"
        />
      )
      break
    case 'Select':
      demo = (
        <UI.Select
          label="状态"
          value={option}
          onChange={(e) => setOption(e.target.value)}
          options={[
            { value: 'active', label: '启用' },
            { value: 'disabled', label: '停用' },
            { value: 'archived', label: '已归档', disabled: true },
          ]}
        />
      )
      break
    case 'Checkbox':
      demo = (
        <UI.Checkbox
          label="接收更新通知"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
      )
      break
    case 'Switch':
      demo = (
        <UI.Switch
          label="启用自动保存"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
      )
      break
    case 'DataTable':
      demo = <TableExample />
      break
    case 'TreeTable':
      demo = (
        <UI.TreeTable
          label="组件结构"
          data={tree}
          rowKey="id"
          getChildren={(row) => row.children}
          columns={[
            { key: 'name', title: '名称' },
            { key: 'kind', title: '类型' },
          ]}
          defaultExpandedKeys={new Set([1])}
        />
      )
      break
    case 'Pagination':
      demo = <UI.Pagination page={page} total={120} pageSize={10} onPageChange={setPage} />
      break
    case 'DescriptionList':
      demo = (
        <UI.DescriptionList
          data={{ name: 'Batype UI', count: 0, enabled: false, empty: '' }}
          fields={[
            { key: 'name', label: '名称' },
            { key: 'count', label: '数量' },
            { key: 'enabled', label: '启用' },
            { key: 'empty', label: '空值' },
          ]}
        />
      )
      break
    case 'Badge':
      demo = (
        <div className="demo-row">
          {(['neutral', 'primary', 'success', 'warning', 'danger'] as const).map((t) => (
            <UI.Badge key={t} tone={t}>
              {t}
            </UI.Badge>
          ))}
        </div>
      )
      break
    case 'StatusChip':
      demo = (
        <div className="demo-row">
          {Object.keys(statuses).map((status) => (
            <UI.StatusChip key={status} value={status} map={statuses} />
          ))}
        </div>
      )
      break
    case 'MethodChip':
      demo = (
        <div className="demo-row">
          {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((method) => (
            <UI.MethodChip key={method} value={method} />
          ))}
        </div>
      )
      break
    case 'RequestStatusChip':
      demo = (
        <div className="demo-row">
          {[200, 201, 302, 404, 500].map((status) => (
            <UI.RequestStatusChip key={status} status={status} />
          ))}
        </div>
      )
      break
    case 'DetailModal':
      demo = (
        <>
          <UI.Button onClick={() => setOpen(true)}>打开详情弹窗</UI.Button>
          <UI.DetailModal
            isOpen={open}
            title="任务详情"
            description="数据与交互由调用方提供"
            onClose={() => setOpen(false)}
            data={tasks[0]!}
            fields={fields}
          />
        </>
      )
      break
    case 'ConfirmDialog':
      demo = (
        <>
          <UI.Button tone="danger" variant="soft" onClick={() => setOpen(true)}>
            打开确认弹窗
          </UI.Button>
          <UI.ConfirmDialog
            isOpen={open}
            title="确认示例操作"
            onClose={() => setOpen(false)}
            onConfirm={async () => {
              await new Promise((r) => setTimeout(r, 300))
              setResult('确认回调已完成')
            }}
          >
            这只是本地演示，不会删除真实数据。
          </UI.ConfirmDialog>
        </>
      )
      break
    case 'Dropdown':
      demo = (
        <UI.Dropdown
          label="更多操作"
          items={[
            { key: 'view', label: '查看详情' },
            { key: 'copy', label: '复制编号' },
            { key: 'disabled', label: '不可用操作', disabled: true },
          ]}
          onSelect={(key) => setResult(`已选择 ${key}`)}
        />
      )
      break
    case 'FileUpload':
      demo = (
        <UI.FileUpload
          label="选择文件"
          files={files}
          onChange={setFiles}
          upload={upload}
          maxSize={1024 * 1024}
          hint="仅生成本地Blob地址，模拟进度，不发送网络请求"
        />
      )
      break
    case 'ImageUpload':
      demo = (
        <UI.ImageUpload
          label="选择图片"
          files={files}
          onChange={setFiles}
          upload={upload}
          maxCount={3}
          hint="选择本地图片后可预览"
        />
      )
      break
    case 'VideoUpload':
      demo = (
        <UI.VideoUpload
          label="选择视频"
          files={files}
          onChange={setFiles}
          upload={upload}
          hint="只选择一个视频，不请求上传服务"
        />
      )
      break
    case 'ImagePreview':
      demo = <UI.ImagePreview src="/preview.svg" alt="Batype UI 预览示例" style={{ width: 360 }} />
      break
    case 'VideoPlayer':
      demo = <UI.VideoPlayer src="/demo.webm" label="Batype UI 演示视频" />
      break
    case 'CodeBlock':
      demo = <UI.CodeBlock code={code} language="typescript" />
      break
    case 'CodeEditor':
      demo = (
        <>
          <CodeEditor label="代码示例" value={code} onChange={setCode} language="typescript" />
          <p className="code-note">外部受控值：</p>
          <code data-testid="code-output">{code}</code>
        </>
      )
      break
    case 'RichTextEditor':
      demo = (
        <>
          <RichTextEditor label="正文示例" value={html} onChange={setHtml} readOnly={!checked} />
          <UI.Switch
            label="允许编辑"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          <div className="spacer" />
          <UI.CodeBlock code={html} language="html" />
        </>
      )
      break
    case 'Markdown':
      demo = (
        <Markdown>
          {
            '# Markdown 示例\n\n支持 **强调**、列表、表格与代码。\n\n| 组件 | 状态 |\n| --- | --- |\n| Button | 可用 |\n\n- [x] 主题适配\n- [ ] 业务逻辑由调用方负责\n\n```ts\nconst ui = "Batype"\n```\n\n<script>alert("不会执行")</script>'
          }
        </Markdown>
      )
      break
    case 'NavigationMenu':
      demo = (
        <UI.NavigationMenu
          label="示例导航"
          activeKey={active}
          onSelect={setActive}
          items={[
            { key: 'overview', label: '总览', icon: <UI.Icon name="box" /> },
            {
              key: 'system',
              label: '系统管理',
              children: [
                { key: 'components', label: '组件列表' },
                { key: 'settings', label: '设置' },
              ],
            },
          ]}
        />
      )
      break
    case 'RouteTabs':
      demo = (
        <UI.RouteTabs
          items={tabs}
          activeKey={active}
          onSelect={setActive}
          onClose={(key) => {
            setTabs(tabs.filter((t) => t.key !== key))
            if (active === key) setActive('overview')
          }}
        />
      )
      break
    case 'Tabs':
      demo = (
        <UI.Tabs
          label="内容展示模式"
          value={tab}
          onChange={setTab}
          items={[
            {
              key: 'preview',
              label: '预览',
              content: <UI.Alert title="预览已就绪">内容与页签同步。</UI.Alert>,
            },
            { key: 'code', label: '代码', content: '事件和状态由调用方管理。' },
            { key: 'disabled', label: '暂不可用', disabled: true, content: null },
          ]}
        />
      )
      break
    case 'ThemeSwitch':
      demo = <UI.ThemeSwitch value={theme} onChange={onThemeChange} />
      break
    case 'LanguageSwitcher':
      demo = <UI.LanguageSwitcher value={locale} onChange={onLocaleChange} />
      break
    case 'Alert':
      demo = (
        <div className="feedback">
          {(['primary', 'success', 'warning', 'danger'] as const).map((t) => (
            <UI.Alert key={t} tone={t} title={t}>
              明确的状态反馈，业务文案由调用方传入。
            </UI.Alert>
          ))}
        </div>
      )
      break
    case 'EmptyState':
      demo = (
        <UI.EmptyState
          title="没有匹配的内容"
          description="调整筛选条件，或创建新记录。"
          actionLabel="重试演示"
          onAction={() => setResult('已触发重试')}
        />
      )
      break
    case 'ErrorState':
      demo = (
        <UI.ErrorState
          code={404}
          title="页面未找到"
          description="路由操作由调用方提供"
          onBack={() => setResult('返回回调已触发')}
          onRetry={() => setResult('重试回调已触发')}
        />
      )
      break
    case 'Spinner':
      demo = <UI.Spinner label="正在加载示例" />
      break
    case 'Skeleton':
      demo = <UI.Skeleton lines={4} />
      break
  }
  return (
    <Suspense fallback={<UI.Spinner label="加载可选组件" />}>
      {demo}
      {result && (
        <div className="spacer">
          <UI.Alert tone="success">{result}</UI.Alert>
        </div>
      )}
    </Suspense>
  )
}
