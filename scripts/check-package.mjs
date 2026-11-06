import { readFile, readdir } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { strict as assert } from 'node:assert'
import React from 'react'
import { renderToString } from 'react-dom/server'
const pkg = JSON.parse(await readFile('package.json', 'utf8'))
assert.equal(pkg.license, 'MIT')
assert.equal(pkg.private, undefined)
assert.deepEqual(
  Object.keys(pkg.dependencies || {}),
  [],
  'No business/runtime dependency is allowed',
)
for (const file of [
  'dist/index.js',
  'dist/index.cjs',
  'dist/index.d.ts',
  'dist/editors.js',
  'dist/editors.d.ts',
  'dist/markdown.js',
  'dist/markdown.d.ts',
  'dist/style.css',
  'LICENSE',
  'NOTICE',
  'README.md',
])
  assert((await readFile(file)).length > 0, file)
for (const entry of await readdir('dist', { recursive: true })) {
  if (!/\.(?:js|cjs)$/.test(entry)) continue
  const file = 'dist/' + entry
  const text = await readFile(file, 'utf8')
  assert(
    !/jiujiu-api|batype\.com|OSSAccessKeyId|usePermission|RootContext|APIs\.|\bfetch\s*\(|localStorage|sessionStorage/.test(
      text,
    ),
    'Business or private content in ' + file,
  )
  if (/^dist\/(index|editors|markdown)\.(js|cjs)$/.test(file))
    assert(text.includes('use client'), 'Client boundary must survive build')
}
for (const [peer, meta] of Object.entries(pkg.peerDependenciesMeta)) {
  assert(meta.optional === true && pkg.peerDependencies[peer], peer)
}
const optionalEditors = await import('../dist/editors.js')
const optionalMarkdown = await import('../dist/markdown.js')
assert(optionalEditors.CodeEditor && optionalEditors.RichTextEditor && optionalMarkdown.Markdown)
const esm = await import('../dist/index.js'),
  cjs = createRequire(import.meta.url)('../dist/index.cjs')
for (const name of ['Button', 'DataTable', 'DetailModal', 'UIProvider', 'StatusChip'])
  assert(esm[name] && cjs[name], name)
assert(
  renderToString(
    React.createElement(esm.UIProvider, null, React.createElement(esm.Button, null, 'SSR')),
  ).includes('SSR'),
)
const [report] = JSON.parse(
  execFileSync('npm', ['pack', '--dry-run', '--ignore-scripts', '--json'], { encoding: 'utf8' }),
)
for (const file of report.files) {
  assert(
    /^(dist\/|package\.json$|README(?:\.en)?\.md$|LICENSE$|NOTICE$)/.test(file.path),
    'Unexpected published file ' + file.path,
  )
}
assert(report.unpackedSize < 300000, 'Unexpected package size')
console.log(
  JSON.stringify(
    {
      name: pkg.name,
      version: pkg.version,
      exports: Object.keys(esm).length,
      files: report.files.length,
      unpackedBytes: report.unpackedSize,
      esm: true,
      cjs: true,
      ssr: true,
      published: false,
    },
    null,
    2,
  ),
)
