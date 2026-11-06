# Batype UI

- 独立 React UI 包；禁止导入业务项目、SDK、路由、认证状态或服务端地址。
- 仅使用相对导入；样式限定为 `.bui-*` / `[data-bui-theme]`，不得全局重置 html/body。
- 新组件补文档及交互测试，保留来源署名；不得打包私有字体、截图和用户数据。
- 变更后运行 `pnpm check`；交互或布局变更运行 `pnpm test:browser`。
- 包名、仓库、发布权限需要在首次公开发布前确认；不能伪造发布状态、覆盖率或兼容性。

- API维护：改类型时同步 `docs/api-notes.json` 和 `docs/examples/`，运行 `pnpm docs:api`；不要手改 `docs/API.md` / `playground/api.generated.json`。默认值和运行时覆盖行为须核对实现。
