# 本地验收记录

## 0.4.0 发布前验证 — 2026-11-09

- `pnpm check`：格式、严格类型、58组件/27共享类型API契约、62项单元测试、库构建、包边界和文档构建通过。
- `pnpm test:browser`：桌面/手机共30项通过；最后保留Ant Design主题容器后，新增6项再次通过。覆盖旧复杂表单回填/重置、Form.List增删、多选、日期时间弹层、dialog内消息实际命中、窄屏弹层宽度、秒精度、第三段缩进及继续输入、多行选区工具栏避让。原表格/分页/焦点/裁剪/编辑器等场景继续通过。
- `pnpm test:consumer`：React18.3.1/19.3.1安装本地tarball，核心ESM/CJS/SSR/类型/CSS通过；编辑器和Markdown9.1.0/10.1.0保持完整严格类型检查通过；Ant Design5.29.0/6.4.3可选入口的ESM/SSR/应用参数类型通过。
- 可选Ant Design桥接入口沿用后台现有`skipLibCheck: true`，规避Ant Design/rc-picker的上游声明错误；仍检查应用参数并用`@ts-expect-error`验证非法mode被拒绝。此限制不扩散到核心或原有可选入口。
- 使用后台实际React19.2.6、TypeScript5.7.3、Vite8.0.13、Ant Design6.4.3与全局样式，在临时目录构建消费页：类型/构建通过，旧Select在新dialog中可点击选择，390px布局无横向溢出，pageerror为空。未调用业务接口，后台工作区保持未修改。
- 此节记录发布前源码与本地安装包的验证结果，不代表npm或Pages已发布；实际发布状态以注册表和Actions为准。本轮未批量替换后台页面。

## 0.3.0 发布前验证 — 2026-11-07

- `pnpm check`：格式、严格类型、57组件/22共享类型的API契约、54项单元测试、库构建、包边界检查和文档构建全部通过。
- `pnpm test:browser`：Chromium桌面及手机共24项通过，包含表单、动态列表清空、搜索/级联、消息、真实Canvas裁剪导出/取消焦点恢复、320px窄屏及基础axe扫描；旧表格、上传和编辑器继续回归。
- `pnpm test:consumer`：0.3.0本地tarball分别安装到全新React18.3.1/19.3.1消费项目，新增组件类型及核心ESM/CJS/SSR/CSS通过，可选编辑/Markdown入口也通过。
- `pnpm audit --audit-level high`：No known vulnerabilities found。
- 已确认npm账号shaosong为batype组织owner，GitHub账号具有batype/batype-ui仓库ADMIN权限；未在源码中写入令牌。
- 以上为本地验证，不代表npm发布或远程CI完成；实际发布状态以npm注册表和GitHub Releases为准。未验证范围仍包括Firefox、Safari、全部辅助技术及非Web平台。

## 0.2.0 历史验收记录

日期：2026-11-06。版本0.2.0验收记录。源码仓库：[batype/batype-ui](https://github.com/batype/batype-ui)；尚未发布 npm。

| 检查                 | 结果                                                                                                                                                                       |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm check`         | 格式、严格类型、39项组件/文档测试、库构建、包检查、文档构建通过                                                                                                            |
| `pnpm test:browser`  | Chromium桌面/手机共16项通过，覆盖组件名导航/搜索/直接访问、原有表格筛选分页选择、树表展开、上传取消/本地预览、真实CodeMirror与wangEditor编辑/只读、主题与320/390px页面溢出 |
| `pnpm check:api`     | 45个组件与11个共享类型的签名/必填契约、生成文档、完整TSX示例一致性通过；示例纳入严格类型检查                                                                               |
| axe                  | 示例首页和详情弹窗的WCAG2A/AA/2.1AA规则扫描通过；不等于全部组件或上游编辑器的完整认证                                                                                      |
| `pnpm test:consumer` | tarball分别安装到全新React18.3.1和19.3.1项目，核心ESM/CJS/SSR/NodeNext类型/CSS通过；随后安装可选peer，编辑器和Markdown的ESM/SSR/NodeNext类型通过                           |
| `pnpm audit --json`  | 当前锁文件已知critical/high/moderate/low漏洞均为0                                                                                                                          |
| 包边界               | 扫描所有dist JS/CJS，检查业务配置/SDK/直接HTTP调用/存储耦合；编辑器和Markdown引擎外部化，不进入核心包                                                                      |
| 数据与外部操作       | 未调用业务接口、改数据库、替换原后台组件或发布npm；GitHub源码上传由用户明确授权                                                                                            |

目录有45个UI组件（42个核心、3个可选），每项对应真实导出、运行示例、导入方式、完整参数/事件表及使用约定。详细提取/排除范围见EXTRACTION.md。组件数不是代码覆盖率。

本地环境：Node24.13.0、pnpm9.3.0、TypeScript5.9.3、React19.3.1、Vite7.3.7、Vitest4.1.12。React18消费项目独立验证，浏览器编辑交互测试使用React19。wangEditor5的工具栏/HTML实现保留上游行为，服务端仍需净化HTML。

CI配置Node22/24及上述检查；远程结果以仓库Actions的实际运行状态为准，本地通过不代表远程已通过。未验证：Firefox、Safari、全部屏幕阅读器、React Native/uni-app。待维护者确认：npm scope及npm发布权限；仓库URL、私密漏洞报告渠道及维护者入口已经配置。公开发布前按RELEASING.md操作。

本次API文档完善不改src组件行为。新增桌面/手机逐项浏览45个API页面、筛选原生参数、事件签名、默认值与共享类型检查；原有表格、弹窗、编辑器、上传场景继续回归。React18/19 tarball消费验证沿用本版本此前记录，本次未因纯文档更新重复执行。
