# 提取范围与来源

来源项目：`jiujiu-manager`（MIT）。这是一份提纯/适配后的库，不是对 `components` 目录的整体搬运，也不承诺原 API 原封不动可替换。原项目未被改动。

| 原路径/能力                                                            | 本库                                        | 去除或修正                                                               |
| ---------------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------ |
| `components/button/SmButton.tsx`、`StyledButton.tsx`                   | Button                                      | 去除 HeroUI/Tailwind，保留尺寸、视觉层级和加载状态，默认 type=button     |
| `components/button/ActionButton.tsx`                                   | ActionButton                                | 删除权限 hook，icon 改 ReactNode，补 aria-label                          |
| `components/button/CopyButton/index.tsx`（shaosong）                   | CopyButton                                  | 去掉私有图标字体；检查 API 是否存在；错误回调、卸载清理与防重入          |
| `components/Chip/StatusChip.tsx`                                       | StatusChip / Badge                          | 保留外部映射；不包含订单、支付状态常量                                   |
| `components/Input/GenericInput.tsx`、`PasswordInput.tsx`               | Input / PasswordInput                       | 使用原生受控/非受控语义，移除账号/手机号业务校验、正则与全局依赖         |
| `components/Modal/DetailModal.tsx`                                     | DetailModal / DescriptionList               | 声明式字段和插槽；隐藏空值时保留 0/false；原生 dialog 替代 HeroUI        |
| `components/NextTable/{Table,PcTable,MoblieTable}`（含 shaosong 署名） | DataTable                                   | 保留桌面表格/手机卡片；稳定 rowKey，选择状态在双端一致；排序由调用方控制 |
| `components/Pagination/index.tsx`（shaosong）                          | Pagination                                  | 去除 antd/i18next；明确受控页码和 pageSize 回调                          |
| `components/Spin/index.tsx`                                            | Spinner                                     | 只显示加载状态，不再包含应用标题、延时和全屏业务布局                     |
| 原后台布局与反馈模式                                                   | Card / EmptyState / Alert / Skeleton / Tabs | 为独立组合补充的展示原语，不带业务数据                                   |
| NextIcon 的展示入口                                                    | Icon / ReactNode icon slot                  | 不复制未确认分发授权的 iconfont；少量线条 SVG 为本库新绘制               |
| 主题 Provider 模式                                                     | UIProvider                                  | 只维护局部主题/密度/文案，不导入 RootContext 或用户偏好存储              |

保留原 MIT LICENSE 和作者说明。新适配代码遵循同一许可证。

## 0.2 覆盖补齐

| 原组件/模式                                | 独立组件                                                                                | 提纯边界                                                    |
| ------------------------------------------ | --------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| NextTable/TreeTable                        | TreeTable                                                                               | 去除业务树请求，仅处理层级、稳定键与展开                    |
| UploadVideo、UpdateImage                   | FileUpload / ImageUpload / VideoUpload                                                  | 不复制OSS接口；由适配器提供上传、进度与取消；不含原裁剪能力 |
| CodeEditor                                 | CodeEditor / CodeBlock                                                                  | 可选CodeMirror 6，保留编辑/只读能力，不带代码生成器         |
| RichTextEditor                             | RichTextEditor                                                                          | 可选wangEditor核心，移除上传服务与业务配置                  |
| NextMarkdown                               | Markdown                                                                                | 可选react-markdown/GFM；未迁移公式与原始HTML扩展            |
| DashBoard/*Menu、RouteTabs                 | NavigationMenu / RouteTabs                                                              | 只保留展示及事件，去除路由、权限、KeepAlive                 |
| ThemeToggle、LanguageSwitcher              | ThemeSwitch / LanguageSwitcher                                                          | 受控参数，不依赖RootContext、i18next或存储                  |
| ErrorPages                                 | ErrorState                                                                              | 不做404/403自动导航或服务器路由设置                         |
| MethodChip、RequestStatusChip、ItemCounter | 同名组件                                                                                | 不包含接口日志或用户数据                                    |
| ExternalLink、按钮变体                     | ExternalLink / Button / ActionButton                                                    | 多个按钮别名合并为variant/size/icon槽                       |
| 业务删除弹窗的纯交互模式                   | ConfirmDialog                                                                           | 不包含软删除、数据库操作与权限判断                          |
| 页面控件与媒体展示模式                     | Select / Textarea / Checkbox / Switch / Tooltip / Dropdown / ImagePreview / VideoPlayer | 为独立组合提供展示原语，不冒充原目录同名文件                |

当前源码有58个UI组件（包括可选Ant Design兼容Provider），每项都有可运行文档和真实导出；不等于原目录每个文件都另建一个组件。重复视觉变体通过参数表达。0.4.0接入兼容能力见ADOPTION.md。

## 明确排除或尚未迁移

SDK、RootContext、usePermission、withAuth、登录/注册、账户/支付表单、业务新增编辑弹窗、软删除动作、订单/彩票/公排/资金卡片、Sentry/埋点、锁屏、KeepAlive、业务全局搜索、Algolia凭据、CodeGenerator、SolidCaptcha验证服务、IP/地理位置请求、私有iconfont和真实截图。

EmailInput/PhoneInput/AccountInput等业务规则不进入库，调用方组合Input。本轮新增本地图片裁剪、上传前处理、表单、消息、高频筛选控件和页头；不带原业务规则。Markdown数学公式、编辑器更多语言和完整应用布局仍未提供。UI表格不包含无限滚动或虚拟化。排除这些不代表其功能已经用空壳组件实现。
