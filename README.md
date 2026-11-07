# Batype UI

**从真实管理后台提取、可独立使用的 React UI 组件库。**

57 个组件，TypeScript 类型，作用域 CSS 令牌，深浅色/系统主题，基础组件中英文文案，桌面表格与移动卡片。移除了原项目的 SDK、权限、路由、账号、订单与环境配置；不依赖 HeroUI、Ant Design、Tailwind 或私有字体。

[English](README.en.md) · [组件 API](docs/API.md) · [提取来源](docs/EXTRACTION.md) · [迁移指南](docs/MIGRATION.md) · [发布检查](docs/RELEASING.md)

[在线组件文档](https://batype.github.io/batype-ui/) · [文档站部署说明](docs/PAGES.md)

> 源码仓库：[batype/batype-ui](https://github.com/batype/batype-ui)。当前版本 `0.3.0`；公开发布状态以 [npm 注册表](https://www.npmjs.com/package/@batype/ui) 为准。

## 快速体验

Node.js >=20.19，pnpm 9.3：

```sh
git clone https://github.com/batype/batype-ui.git
cd batype-ui
pnpm install --frozen-lockfile
pnpm dev
# http://127.0.0.1:5192
```

文档站包含可运行的按钮、输入、表格筛选/排序/选择/分页、弹窗、主题及键盘页签示例。所有数据都在内存中，不会连接原后台。

## 安装到另一个项目

```sh
npm install @batype/ui@0.3.0
```

也可以从源码构建本地安装包：

```sh
# 本仓库
pnpm pack
# 目标项目：使用生成的实际文件路径
pnpm add /path/to/batype-ui/batype-ui-0.3.0.tgz
```

```tsx
import { UIProvider, Button } from '@batype/ui'
import '@batype/ui/style.css'

export function App() {
  return (
    <UIProvider theme="light" locale="zh-CN">
      <Button onClick={() => console.info('clicked')}>新建项目</Button>
    </UIProvider>
  )
}
```

**必须导入 CSS 并使用 `UIProvider`**。`tokens` 支持局部覆盖；不修改宿主页面的 `html/body`。不必安装原后台的依赖。核心入口提供 ESM/CJS 与 `.d.ts`，可选编辑入口提供 ESM 与 `.d.ts`，React/ReactDOM 是 peer dependencies，不捆绑第二份 React。

## 组件

| 分类 | 组件                                                                                                                                                       |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 基础 | UIProvider、Button、ActionButton、Icon、Card、CopyButton、ExternalLink、ItemCounter、Tooltip                                                               |
| 新增 | MessageProvider/useMessage、Form/FormField/FormList、SearchSelect、Cascader、DatePicker/DateRangePicker、NumberInput、RadioGroup、ImageCropper、PageHeader |
| 表单 | Input、PasswordInput、Textarea、Select、Checkbox、Switch                                                                                                   |
| 数据 | DataTable、TreeTable、Pagination、DescriptionList、Badge、StatusChip、MethodChip、RequestStatusChip                                                        |
| 浮层 | DetailModal、ConfirmDialog、Dropdown                                                                                                                       |
| 媒体 | FileUpload、ImageUpload、VideoUpload、ImagePreview、VideoPlayer                                                                                            |
| 编辑 | CodeBlock、CodeEditor、RichTextEditor、Markdown                                                                                                            |
| 导航 | NavigationMenu、RouteTabs、Tabs、ThemeSwitch、LanguageSwitcher                                                                                             |
| 反馈 | Alert、EmptyState、ErrorState、Spinner、Skeleton                                                                                                           |

文档侧栏按组件名展示，支持中英文搜索、每个组件独立演示/API/完整导入示例、`#TreeTable` 等直接地址，手机端使用组件选择器。

## 按需编辑组件

核心入口不加载以下引擎，只使用普通控件无需安装。各引擎保留上游许可；可选入口仅提供 ESM。

```sh
# CodeEditor / RichTextEditor
pnpm add @codemirror/state @codemirror/view @codemirror/commands @codemirror/lang-javascript @codemirror/lang-json @wangeditor/editor
# Markdown
pnpm add react-markdown remark-gfm
```

```tsx
import { CodeEditor, RichTextEditor } from '@batype/ui/editors'
import { Markdown } from '@batype/ui/markdown'
import '@wangeditor/editor/dist/css/style.css'
// 仍需引入 @batype/ui/style.css，并由 UIProvider 包裹。
```

CodeEditor 使用 CodeMirror 6，支持 JavaScript/TypeScript/JSON/纯文本、受控值、只读和主题。RichTextEditor 使用 wangEditor 5，支持受控 HTML、只读、自定义图片上传；没有适配器时不提供图片上传。Markdown 使用 react-markdown + GFM，默认跳过原始 HTML，非富文本编辑器。

文件上传仅管理选择、校验、进度和取消；实际请求由 `upload` 适配器负责。未提供适配器时只显示“已选择”，不会假报上传完成。所有演示使用本地生成的素材，无业务接口。

`useUI` 提供当前文案/语言。组件只发事件，不调用 API。`ActionButton` 不判断删除权限；调用方自行决定是否渲染。表格使用稳定的 `rowKey`，不以数组索引猜测记录。

## 如何查阅 API

打开文档站，按组件名选择后可直接查看：完整TSX示例、参数类型/必填/默认值/说明、事件回调、关联数据结构、使用约定。继承的原生属性在折叠表中逐项列出；支持按参数名、类型和说明筛选。

例如 `#Input` 的 onChange 接收原生事件，`#CodeEditor` 的 onChange 直接接收字符串；受控值的更新写法在每个完整示例中给出。共享结构如 TableColumn、UploadItem、DetailField 也有字段表。可选组件页面附安装命令。

源码中的说明入口为 `docs/api-notes.json`，57个可编译示例位于 `docs/examples/`。参数类型/必填项由TypeScript提取，生成文档站契约及 [完整 API](docs/API.md)。

```sh
pnpm docs:api   # 更新文档契约和Markdown
pnpm check:api  # 检查文档与当前源码/示例是否一致
```

不要直接修改生成的 API.md / api.generated.json。`pnpm typecheck`同时检查文档示例，`pnpm check`包含文档一致性检查。

## 验证

```sh
pnpm check            # 类型、交互测试、库构建、包检查、文档构建
pnpm exec playwright install chromium
pnpm test:browser     # 桌面/手机交互、焦点、主题、溢出、axe 扫描
pnpm test:consumer    # 真实tarball安装到React18/19项目
pnpm pack            # 构建并生成本地可安装 tarball
```

测试结果以实际运行和 CI 为准。浏览器测试中的 axe 扫描仅覆盖示例场景，不等于完整 WCAG 认证。包检查不替代 `pnpm audit`，具体发布步骤见 [RELEASING](docs/RELEASING.md)。

## 支持边界

- React 18.3+ / 19；浏览器端 UI。提供 SSR 安全渲染，交互组件在客户端使用，构建保留 `use client`。
- 依赖原生 `<dialog>.showModal()`、Clipboard API 和现代 CSS。复制功能需要 HTTPS/localhost，或传入 `copy` 适配器。
- 目标为现代 Chrome、Edge、Firefox、Safari；未做所有浏览器/辅助技术的人工验证，不支持 IE、React Native 或 uni-app。
- `DataTable` 不内置请求、虚拟滚动、无限列表或业务权限；树数据使用独立 `TreeTable`；数据分页、排序和选择状态由调用方管理。
- 新增上传/媒体组件的默认提示及富文本引擎工具栏目前主要为中文；`locale` 不会翻译调用方文案，不宣称所有可选引擎完整双语。
- 不宣称为原后台直接替换包，API 的差异见迁移指南。原后台没有被修改为使用本库。

## 开源与贡献

MIT，保留原项目 `Copyright (c) 2025 batype` 和作者来源说明，详见 [LICENSE](LICENSE)、[NOTICE](NOTICE)、[CONTRIBUTING](CONTRIBUTING.md)。第三方工具不被重新许可；不分发原项目字体或业务素材。
