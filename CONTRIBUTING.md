# 参与贡献

欢迎改进可复用UI、类型、文档、可访问性和测试。业务接口、订单逻辑、认证、平台配置与用户数据不属于此仓库。

1. 创建独立分支，描述触发条件和预期变化。
2. 组件使用具名导出、准确TypeScript类型、原生语义与受控状态；避免无必要的运行时依赖。
3. 增加可运行示例与针对性交互测试；布局/交互变更运行浏览器回归。
4. 执行 `pnpm check` 和 `pnpm test:browser`，报告未验证的平台。
5. 不提交 `.env`、令牌、真实账号、截图、业务数据库数据或未确认许可的图标字体。
6. 原组件改编需保留版权和来源；新增贡献按MIT许可提交。破坏性API修改需更新CHANGELOG与迁移文档。

提交前检查 `pnpm pack` 的内容，只允许包构建产物、说明、许可证及必要元数据进入npm包。

## API 文档同步

修改组件类型后，更新 `docs/api-notes.json` 的默认值/行为说明及 `docs/examples/<组件名>.tsx` 完整示例，再运行 `pnpm format`、`pnpm docs:api`、`pnpm check`。`docs/API.md` 和 `playground/api.generated.json` 是生成文件，请勿手工修改。原生属性由TypeScript签名提取；默认值及运行时覆盖行为需作者核对实现。所有示例纳入typecheck，CI的check:api检查生成结果是否过期。
