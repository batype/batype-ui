import { useState } from 'react'
import { Badge, Card, CopyButton, Input } from '../src'
import api from './api.generated.json'
import type { ComponentName } from './catalog'
export interface ApiRow {
  name: string
  type: string
  required: boolean
  defaultValue: string
  description: string
}
export function ApiTable({ rows, label }: { rows: readonly ApiRow[]; label: string }) {
  if (!rows.length) return <p className="code-note">无对应参数。</p>
  return (
    <div
      className="api-table-scroll"
      role="region"
      aria-label={`${label}横向滚动区域`}
      tabIndex={0}
    >
      <table className="api-table" aria-label={label}>
        <thead>
          <tr>
            <th scope="col">参数</th>
            <th scope="col">类型</th>
            <th scope="col">必填</th>
            <th scope="col">默认值</th>
            <th scope="col">说明</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <th scope="row">
                <code>{row.name}</code>
              </th>
              <td>
                <code>{row.type}</code>
              </td>
              <td>{row.required ? <Badge tone="warning">是</Badge> : '否'}</td>
              <td>{row.defaultValue}</td>
              <td>{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
export function UsageDocs({ name }: { name: ComponentName }) {
  const doc = api.components[name]
  return (
    <>
      <Card title="接入前准备">
        <p className="code-note">{doc.summary}</p>
        <ul className="api-notes">
          {api.common.slice(1, 4).map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
        <p className="api-import">
          导入路径：<code>{doc.entry}</code>
        </p>
        {name === 'CodeEditor' && (
          <pre className="api-install" tabIndex={0} aria-label="CodeEditor 安装命令">
            <code>
              pnpm add @codemirror/state @codemirror/view @codemirror/commands
              @codemirror/lang-javascript @codemirror/lang-json
            </code>
          </pre>
        )}
        {name === 'RichTextEditor' && (
          <pre className="api-install" tabIndex={0} aria-label="RichTextEditor 安装命令">
            <code>pnpm add @wangeditor/editor</code>
          </pre>
        )}
        {name === 'Markdown' && (
          <pre className="api-install" tabIndex={0} aria-label="Markdown 安装命令">
            <code>pnpm add react-markdown remark-gfm</code>
          </pre>
        )}
      </Card>
      <Card
        className="code-card"
        title="完整使用示例"
        action={<CopyButton value={doc.example} label="复制示例代码" />}
      >
        <pre tabIndex={0} aria-label={`${name} 完整示例代码`}>
          <code>{doc.example}</code>
        </pre>
      </Card>
    </>
  )
}
export function ApiDocs({ name }: { name: ComponentName }) {
  const doc = api.components[name]
  const [query, setQuery] = useState('')
  const filter = (rows: readonly ApiRow[]) =>
    rows.filter((row) =>
      `${row.name} ${row.description} ${row.type}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    )
  const props = filter(doc.props),
    events = filter(doc.events),
    native = filter(doc.native.map((index) => api.nativeAttributes[index]!))
  const matched = props.length + events.length + native.length
  return (
    <Card
      className="api-docs"
      title="API 参数与事件"
      description="参数类型、必填项来自实际 TypeScript 签名；默认值与使用约定按当前实现维护。"
    >
      <Input
        label="筛选 API 参数"
        placeholder="参数名、类型或说明，例如 onChange"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <p className="code-note" role="status">
        {query.trim()
          ? `共匹配 ${matched} 项；未设置表示未赋默认 prop，运行时回退见说明。`
          : `常用参数 ${doc.props.length} 项 · 主要事件 ${doc.events.length} 项 · 其他原生属性 ${doc.native.length} 项（可展开）`}
      </p>
      <section aria-label={`${name}参数说明`}>
        <h3>参数</h3>
        <ApiTable rows={props} label={`${name} 参数`} />
      </section>
      <section aria-label={`${name}事件说明`}>
        <h3>事件回调</h3>
        <ApiTable rows={events} label={`${name} 事件`} />
      </section>
      {!!doc.native.length && (
        <details className="api-native" key={`${name}-${query}`} open={!!query}>
          <summary>其他 React 原生属性（{native.length} 项）</summary>
          <p className="code-note">
            仅包含类型签名支持的原生属性；组件覆盖的属性及具体挂载节点见下方约定。
          </p>
          <ApiTable rows={native} label={`${name} 原生属性`} />
        </details>
      )}
      <section>
        <h3>使用约定与注意事项</h3>
        <ul className="api-notes">
          {doc.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>
      {!!doc.models.length && (
        <section>
          <h3>关联数据结构</h3>
          {doc.models.map((name) => {
            const model = api.models[name as keyof typeof api.models]
            return (
              <details key={name} className="api-model" open>
                <summary>{name}</summary>
                <pre tabIndex={0} aria-label={`${name} 类型定义`}>
                  <code>{model.definition}</code>
                </pre>
                {!!model.properties.length && (
                  <ApiTable rows={model.properties} label={`${name} 字段`} />
                )}
              </details>
            )
          })}
        </section>
      )}
      <details className="api-signature">
        <summary>完整函数签名</summary>
        <pre tabIndex={0} aria-label={`${name} 函数签名`}>
          <code>{doc.signature}</code>
        </pre>
        <p className="code-note">源码：{doc.source}。表单原生事件与直接返回值的回调不可混用。</p>
      </details>
    </Card>
  )
}
