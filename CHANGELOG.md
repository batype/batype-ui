# Changelog

源码仓库：[batype/batype-ui](https://github.com/batype/batype-ui)。公开发布状态以 npm 注册表和 GitHub Releases 为准。

## 0.4.0 — 2026-11-09

- 新增可选 `@batype/ui/antd` 兼容入口，保留原有复杂表单、多选与日期控件API；弹出层和上下文消息使用当前原生dialog容器，手机日期时间弹层可滚动。
- 新增旧操作按钮、表格和分页参数适配器；应用显式传入权限与全选范围，保留稳定行键、移动操作区及页大小回调。
- 日期和范围组件支持本地日期时间与秒精度；不隐式转换业务时区。
- 富文本支持完整工具栏模式、1.5段落行高、多行选区工具栏避让；保留受控回显的光标保护。
- Markdown可选peer同时支持9.x与10.x；核心仍无Ant Design、SDK或业务运行时依赖。
- 58个组件、27个共享类型及完整接入示例；62项单元测试、30项桌面/手机回归通过。React18/19及后台实际构建环境验证通过。
- 可选Ant Design入口按后台既有配置使用skipLibCheck处理上游声明问题；核心/编辑器/Markdown保持严格消费检查。未批量替换后台业务页面。

## 0.3.0 — 2026-11-07

- 新增 MessageProvider/useMessage、Form/FormField/FormList、SearchSelect、Cascader、DatePicker/DateRangePicker、NumberInput、RadioGroup、ImageCropper 和 PageHeader，组件总数为57。
- 动态表单支持校验、异步提交防重、重置及列表增删；原有 Select 保留原生事件 API。
- 上传增加可取消的 beforeUpload 预处理；裁剪在本地导出 File，不接入业务服务。
- 移动表格支持操作列隐藏标签、按钮占满整行和换行，旧列默认显示不变。
- 同步57个完整示例、22个共享类型和生成式API文档，改善窄屏代码区域键盘可达性。
- 核心无新增运行时依赖；React18/19仍为peer。业务权限、路由与SDK留在调用方。
- Markdown公式、更多编辑语言及原后台富文本悬浮工具栏定制仍为后续可选增强。

## 0.2.0 文档完善 — Unreleased

- 45个组件补齐参数/事件表、必填标记、真实默认值、原生属性、11个关联数据类型和使用约定。
- 所有使用示例改为可编译的完整TSX，包含导入、状态、数据及回调定义。
- 文档页增加API筛选、可选依赖安装命令、展开式原生参数和数据结构说明。
- 从TypeScript实际签名生成类型/必填项，新增check:api一致性检查，并由typecheck检查示例。
- 本次只改文档与其验证工具，不改变库组件行为。

## 0.2.0 — Unreleased

- 从19扩展为45个独立可运行UI组件，补齐树表、原生表单控件、浮层、上传/媒体、导航和错误状态。
- 编辑器使用CodeMirror 6及wangEditor 5，Markdown使用react-markdown/GFM，以可选ESM入口导出；核心无需安装它们。
- 左侧菜单直接使用组件名称，增加中英文搜索、独立示例和hash链接，手机使用组件选择器。
- 上传适配器支持进度、格式/数量/大小限制、移除取消和迟到结果防护；不包含业务存储服务。
- 补齐交互测试、提取覆盖映射、可选入口API和发布检查。尚未发布 npm。

## 0.1.0 — Unreleased

- 从jiujiu-manager提取并适配按钮、状态、输入、响应式表格、详情和分页等模式。
- 新增独立主题/文案Provider及组合原语，共19个公开组件。
- 去除SDK、权限状态、路由、私有字体及业务数据依赖。
- 增加交互文档站、类型声明、ESM/CJS构建、包验收和测试。
- MIT保留原始许可证与作者署名。尚未发布 npm。
