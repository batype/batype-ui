import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { UIProvider, Button, Icon, Badge, Card, Input, type Locale } from '../src'
import { catalog, groups, isComponentName, type ComponentName } from './catalog'
import { ComponentExample, TableExample } from './examples'
import { UsageDocs, ApiDocs } from './ApiDocs'
import { version } from '../package.json'
import '../src/styles.css'
import './site.css'
type Page = 'overview' | ComponentName
const initial = (): Page => {
  const value = decodeURIComponent(location.hash.slice(1))
  return isComponentName(value) ? value : 'overview'
}
function App() {
  const [page, setPage] = useState<Page>(initial),
    [search, setSearch] = useState(''),
    [theme, setTheme] = useState<'light' | 'dark'>('light'),
    [locale, setLocale] = useState<Locale>('zh-CN')
  useEffect(() => {
    const change = () => setPage(initial())
    window.addEventListener('hashchange', change)
    return () => window.removeEventListener('hashchange', change)
  }, [])
  const current = catalog.find((c) => c.name === page),
    matched = catalog.filter((c) =>
      `${c.name} ${c.chinese}`.toLowerCase().includes(search.trim().toLowerCase()),
    )
  const navigate = (next: Page) => {
    setPage(next)
    location.hash = next
    document.querySelector('main')?.focus({ preventScroll: true })
  }
  return (
    <UIProvider theme={theme} locale={locale}>
      <div className="site-shell">
        <a href="#main-content" className="skip">
          跳到正文
        </a>
        <header className="site-header">
          <a className="logo" href="#overview" onClick={() => setPage('overview')}>
            <span className="mark">B</span>
            <strong>
              batype<span> / ui</span>
            </strong>
            <Badge>{version}</Badge>
          </a>
          <div className="header-actions">
            <span>REACT COMPONENT LIBRARY</span>
            <Button
              variant="ghost"
              tone="neutral"
              size="sm"
              onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
            >
              {theme === 'light' ? '深色模式' : '浅色模式'}
            </Button>
          </div>
        </header>
        <div className="layout">
          <aside className="sidebar">
            <Input
              label="搜索组件"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="组件名称或中文名称"
              startContent={<Icon name="search" size={15} />}
            />
            <select
              className="mobile-doc-select"
              aria-label="选择组件文档"
              value={page}
              onChange={(e) => navigate(e.target.value as Page)}
            >
              <option value="overview">开始使用</option>
              {catalog.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} · {c.chinese}
                </option>
              ))}
            </select>
            <nav aria-label="组件文档">
              <a
                className="overview-link"
                href="#overview"
                aria-current={page === 'overview' ? 'page' : undefined}
                onClick={() => setPage('overview')}
              >
                开始使用
              </a>
              {groups.map((group) => {
                const entries = matched.filter((c) => c.group === group)
                return entries.length ? (
                  <section key={group} className="doc-nav-group">
                    <h2>
                      {group}
                      <span>{entries.length}</span>
                    </h2>
                    {entries.map((c) => (
                      <a
                        key={c.name}
                        href={`#${c.name}`}
                        aria-current={page === c.name ? 'page' : undefined}
                        onClick={() => setPage(c.name)}
                      >
                        <span>{c.name}</span>
                        <small>{c.chinese}</small>
                      </a>
                    ))}
                  </section>
                ) : null
              })}
              {!matched.length && <p className="code-note">没有匹配的组件</p>}
            </nav>
            <div className="sidebar-footer">{catalog.length} 个组件 · 独立于业务</div>
          </aside>
          <main id="main-content" tabIndex={-1}>
            <div className="breadcrumb">
              文档 / <span>{current?.name || '开始使用'}</span>
            </div>
            <div className="page-heading">
              <div>
                <span className="eyebrow">BATYPE UI / REACT</span>
                <h1>{current?.name || '让组件，回归界面。'}</h1>
                <p>
                  {current
                    ? `${current.chinese} · 每个组件均有独立示例、导入路径及属性说明。`
                    : '从真实管理后台提取，为下一个项目准备。'}
                </p>
              </div>
              <Badge tone={current && current.entry !== '@batype/ui' ? 'warning' : 'success'}>
                {current?.entry === '@batype/ui' || !current ? 'Core' : 'Optional'}
              </Badge>
            </div>
            {current ? (
              <>
                <Card title={`${current.name} 示例`} description={current.chinese}>
                  <ComponentExample
                    key={current.name}
                    name={current.name}
                    theme={theme}
                    onThemeChange={setTheme}
                    locale={locale}
                    onLocaleChange={setLocale}
                  />
                </Card>
                <UsageDocs name={current.name} />
                <ApiDocs key={current.name} name={current.name} />
              </>
            ) : (
              <>
                <div className="intro">
                  <div>
                    <span className="eyebrow">FROM REAL INTERFACES</span>
                    <h2>
                      为日常工作，
                      <br />
                      留出更清晰的界面。
                    </h2>
                    <p>
                      按真实组件名浏览。基础组件不携带后台依赖，编辑器与 Markdown 通过可选入口加载。
                    </p>
                    <div className="actions">
                      <Button
                        onClick={() => navigate('Button')}
                        endContent={<Icon name="chevron-right" />}
                      >
                        浏览组件
                      </Button>
                      <Button
                        tone="neutral"
                        variant="outline"
                        onClick={() => navigate('UIProvider')}
                      >
                        定制主题
                      </Button>
                    </div>
                  </div>
                  <div className="swatch-card">
                    <span>ONE SYSTEM. YOUR STYLE.</span>
                    <div className="swatches">
                      <i />
                      <i />
                      <i />
                      <i />
                    </div>
                    <strong>
                      少一些耦合。
                      <br />
                      多一些组合。
                    </strong>
                    <small>TypeScript · CSS tokens · MIT</small>
                  </div>
                </div>
                <div className="proof">
                  <span>
                    <b>{catalog.length}</b>个独立组件示例
                  </span>
                  <span>
                    <b>0</b>个业务运行时依赖
                  </span>
                  <span>
                    <b>3</b>个按需导入入口
                  </span>
                  <span>
                    <b>MIT</b>保留来源署名
                  </span>
                </div>
                <TableExample />
                <Card className="code-card" title="开始使用">
                  <pre>
                    <code>
                      {
                        "import { UIProvider, Button } from '@batype/ui'\nimport '@batype/ui/style.css'\n\n<UIProvider><Button>开始</Button></UIProvider>"
                      }
                    </code>
                  </pre>
                  <p className="code-note">npm 尚未公开发布。使用 pnpm pack 生成本地安装包。</p>
                </Card>
              </>
            )}
            <footer className="site-footer">
              <span>Batype UI · MIT licensed</span>
              <span>UI is shared. Business stays yours.</span>
            </footer>
          </main>
        </div>
      </div>
    </UIProvider>
  )
}
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
