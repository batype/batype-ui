import { mkdtemp, writeFile, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'
const root = process.cwd(),
  work = await mkdtemp(join(tmpdir(), 'batype-ui-consumer-'))
try {
  execFileSync('pnpm', ['pack', '--pack-destination', work], { cwd: root, stdio: 'pipe' })
  const tarball = join(
    work,
    (await readdir(work)).find((f) => f.endsWith('.tgz')),
  )
  for (const major of [18, 19]) {
    const cwd = join(work, 'react-' + major)
    await import('node:fs/promises').then((fs) => fs.mkdir(cwd))
    await writeFile(
      join(cwd, 'package.json'),
      JSON.stringify({ name: 'ui-consumer-smoke', private: true, type: 'module' }),
    )
    execFileSync(
      'npm',
      [
        'install',
        '--ignore-scripts',
        '--no-audit',
        '--no-fund',
        tarball,
        `react@${major}`,
        `react-dom@${major}`,
        'typescript@5.9.3',
        `@types/react@${major}`,
        `@types/react-dom@${major}`,
      ],
      { cwd, stdio: 'pipe' },
    )
    await writeFile(
      join(cwd, 'index.tsx'),
      `import { Button, UIProvider, DataTable, type TableColumn } from '@batype/ui'\nconst columns: TableColumn<{id:number,name:string}>[] = [{key:'name',title:'Name',render:row=>row.name}]\nexport const demo=<UIProvider><Button>Consumer</Button><DataTable label="Rows" rowKey="id" columns={columns} items={[{id:0,name:'Zero'}]}/></UIProvider>\n// @ts-expect-error unsupported visual variant must not typecheck\nexport const invalid=<Button variant="not-a-variant"/>\n`,
    )
    execFileSync(
      join(cwd, 'node_modules/.bin/tsc'),
      [
        '--noEmit',
        '--strict',
        '--jsx',
        'react-jsx',
        '--module',
        'NodeNext',
        '--moduleResolution',
        'NodeNext',
        '--target',
        'ES2022',
        'index.tsx',
      ],
      { cwd, stdio: 'pipe' },
    )
    await writeFile(
      join(cwd, 'smoke.mjs'),
      `import {createRequire} from 'node:module';import {strict as assert} from 'node:assert';import React from 'react';import {renderToString} from 'react-dom/server';import {Button,UIProvider} from '@batype/ui';const require=createRequire(import.meta.url);assert(require('@batype/ui').DataTable);assert(require.resolve('@batype/ui/style.css'));assert(renderToString(React.createElement(UIProvider,null,React.createElement(Button,null,'Consumer'))).includes('Consumer'));console.log('React '+React.version+' installed-tarball ESM/CJS/SSR/types/CSS passed');`,
    )
    process.stdout.write(execFileSync('node', ['smoke.mjs'], { cwd, encoding: 'utf8' }))
    // First prove the root package works without installing optional engines.
    const peers = JSON.parse(
      await import('node:fs/promises').then((fs) =>
        fs.readFile(join(root, 'package.json'), 'utf8'),
      ),
    )
    const optional = Object.keys(peers.peerDependenciesMeta).map(
      (name) => name + '@' + peers.peerDependencies[name],
    )
    execFileSync('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', ...optional], {
      cwd,
      stdio: 'pipe',
    })
    await writeFile(
      join(cwd, 'optional.tsx'),
      `import {CodeEditor, RichTextEditor} from '@batype/ui/editors'\nimport {Markdown} from '@batype/ui/markdown'\nexport const optional=<><CodeEditor value="text" label="Code"/><RichTextEditor value="<p>Text</p>" label="Body"/><Markdown>**Text**</Markdown></>\n`,
    )
    execFileSync(
      join(cwd, 'node_modules/.bin/tsc'),
      [
        '--noEmit',
        '--strict',
        '--jsx',
        'react-jsx',
        '--module',
        'NodeNext',
        '--moduleResolution',
        'NodeNext',
        '--target',
        'ES2022',
        'optional.tsx',
      ],
      { cwd, stdio: 'pipe' },
    )
    await writeFile(
      join(cwd, 'optional.mjs'),
      `import React from 'react';import {renderToString} from 'react-dom/server';import {strict as assert} from 'node:assert';import {CodeEditor,RichTextEditor} from '@batype/ui/editors';import {Markdown} from '@batype/ui/markdown';assert(renderToString(React.createElement(CodeEditor,{value:'text',label:'Code'})).includes('Code'));assert(renderToString(React.createElement(RichTextEditor,{value:'<p>Text</p>',label:'Body'})).includes('Body'));assert(renderToString(React.createElement(Markdown,null,'**Text**')).includes('<strong>Text</strong>'));console.log('React '+React.version+' optional-entry ESM/SSR/NodeNext types passed');`,
    )
    process.stdout.write(execFileSync('node', ['optional.mjs'], { cwd, encoding: 'utf8' }))
  }
} catch (error) {
  if (error.stdout) process.stderr.write(String(error.stdout))
  if (error.stderr) process.stderr.write(String(error.stderr))
  throw error
} finally {
  await rm(work, { recursive: true, force: true })
}
