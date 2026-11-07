# GitHub Pages 文档站

部署目标：https://batype.github.io/batype-ui/

- 发布源为 GitHub Actions，工作流是 `.github/workflows/pages.yml`。
- 推送 `main` 或手动触发工作流时，执行完整 `pnpm check`，仅在检查和文档构建成功后部署 `site/`。
- 构建任务只有源码/Pages读取权限；部署任务才申请Pages写入和OIDC，使用`github-pages`环境，无需私有部署令牌。
- 部署不会修改npm版本、重发npm包或触碰原后台。生成的`site/`不提交到Git。

## 子路径与本地开发

工作流从GitHub Pages元数据读取base_path，通过`BUI_DOCS_BASE`传给Vite。图片和视频演示使用`import.meta.env.BASE_URL`，避免落到域名根路径。组件导航继续使用hash，刷新`#Form`等地址不需要服务器重写。

未设置变量时默认`./`，本地`pnpm dev`及现有浏览器测试路径不变。可以模拟部署构建：

```sh
BUI_DOCS_BASE=/batype-ui/ pnpm build:docs
```

工作流通过后，核对Pages部署状态、站点HTML/JS/CSS、本地图片与视频、组件导航和编辑器懒加载。工作流成功不应单独作为页面实际可用的证明。
