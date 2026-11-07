# Batype UI

A business-independent React UI package extracted and adapted from Batype Manager.

57 typed components, scoped CSS tokens, light/dark/system themes, localized core strings, responsive tables, native dialogs, and controlled interaction APIs. No SDK, router, authorization state, private fonts, HeroUI, Ant Design, or Tailwind runtime dependency.

**Source repository: [batype/batype-ui](https://github.com/batype/batype-ui). Version 0.3.0.** Check the [npm registry](https://www.npmjs.com/package/@batype/ui) for public release availability.

```sh
npm install @batype/ui@0.3.0
```

```sh
git clone https://github.com/batype/batype-ui.git
cd batype-ui
pnpm install --frozen-lockfile
pnpm dev
pnpm check
pnpm exec playwright install chromium
pnpm test:browser
pnpm pack
```

Alternatively, install the locally generated tarball in your app, then:

```tsx
import { UIProvider, Button } from '@batype/ui'
import '@batype/ui/style.css'

;<UIProvider theme="light" locale="en">
  <Button onClick={handleCreate}>Create project</Button>
</UIProvider>
```

React 18.3+/19 are peers. The core entry provides ESM/CommonJS/declarations; optional editor and Markdown entries are ESM-only. UIProvider and the stylesheet are required. Native `dialog.showModal()` and modern CSS are required. Clipboard copying needs a secure context or the `copy` adapter. React Native, IE, business workflows and all-browser certification are outside this release.

See [API](docs/API.md), [extraction provenance](docs/EXTRACTION.md), [migration guide](docs/MIGRATION.md), [release checklist](docs/RELEASING.md), and [contribution guide](CONTRIBUTING.md).

MIT. Original copyright and source attribution are preserved in LICENSE and NOTICE. No private assets or service configuration are distributed.

## Component catalog and optional entries

The sidebar now uses actual component names, with English/Chinese search, dedicated demos, API notes and hash links such as `#TreeTable`. Core additions include native controls, TreeTable, ConfirmDialog, Dropdown, upload adapters, media previews, navigation and closable tabs.

`@batype/ui/editors` exports CodeEditor (CodeMirror 6) and RichTextEditor (wangEditor 5). Install their optional peers: `@codemirror/state @codemirror/view @codemirror/commands @codemirror/lang-javascript @codemirror/lang-json @wangeditor/editor`. Rich text additionally needs `@wangeditor/editor/dist/css/style.css`.

`@batype/ui/markdown` exports Markdown; install `react-markdown remark-gfm`. Raw HTML is skipped by default. None of these engines loads from the core entry. Uploads use a caller-supplied adapter, never a built-in service URL. Rich-text HTML still requires server-side validation/sanitization. Some upload/media default strings and the editor toolbar currently use Chinese; core locale support is not a full translation guarantee for optional engines.

## Complete API documentation

Every component page now includes a complete typed example, prop and callback tables (type, required status, default, description), behavior notes and related model schemas. Native React attributes are available in expandable tables. Search by parameter, type or description. Event objects and direct value callbacks are explicitly distinguished.

`pnpm docs:api` extracts TypeScript contracts and combines them with `docs/api-notes.json` and 57 checked TSX examples. `pnpm check:api` detects stale documentation; the standard `check` command includes it. `docs/API.md` and `playground/api.generated.json` are generated outputs.
