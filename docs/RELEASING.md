# 正式公开发布检查

GitHub 源码仓库为 [batype/batype-ui](https://github.com/batype/batype-ui)，已确认仓库归属；npm 尚未发布。以下清单用于后续 npm 版本发布。

1. 确认 `@batype/ui` 的 npm scope 所有权及包名可用性；GitHub 仓库归属为 batype。
2. 核对 package.json 中的 repository/homepage/bugs；本仓库已填写真实地址，并在 SECURITY.md 提供 GitHub 私密漏洞报告及维护者入口。
3. 复核LICENSE/NOTICE及docs/EXTRACTION，确认有权公开来源代码。检查未提交业务文件、字体、账号和配置。
4. 使用Node20.19+/22+及锁文件安装，运行 `pnpm check`、`pnpm exec playwright install chromium`、`pnpm test:browser`、`pnpm audit`。React18/19消费环境分别验证。
5. `pnpm pack`，在全新React消费项目安装生成的tgz；验证样式、类型、ESM/CJS和SSR，不仅引用源码。`npm pack --dry-run --ignore-scripts`复核文件名单。
6. 更新CHANGELOG与版本，提交评审后打版本标签。禁止在CI或文档中写入npm令牌。
7. 获得明确发布授权后，使用维护者的受控发布流程执行 `npm publish --access public`；推荐配置npm trusted publishing，遵循官方当前要求。
8. 发布后验证npm安装、文档站部署、release说明与漏洞渠道。不要将本地build通过描述为已经发布成功。

## 当前验证记录

执行结果将记录在 `docs/VALIDATION.md`；所有未验证项必须如实保留。

## 参考资料

- [Vite library mode](https://vite.dev/guide/build.html#library-mode)：外部化React、分发CSS和ES/CJS。
- [React useId](https://react.dev/reference/react/useId)：标签和描述关系中的稳定ID。
- [HTML dialog 标准](https://html.spec.whatwg.org/multipage/interactive-elements.html#the-dialog-element)：模态对话框行为。
- [npm package.json](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/)：files、exports、peerDependencies和发布元数据。
