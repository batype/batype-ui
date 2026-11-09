import ts from 'typescript'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve, relative } from 'node:path'
import { format } from 'prettier'
import { strict as assert } from 'node:assert'
const check = process.argv.includes('--check')
const configPath = ts.findConfigFile('.', ts.sys.fileExists)
const config = ts.readConfigFile(configPath, ts.sys.readFile)
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, '.')
const program = ts.createProgram(parsed.fileNames, parsed.options)
const checker = program.getTypeChecker()
const notes = JSON.parse(await readFile('docs/api-notes.json', 'utf8'))
const catalogFile =
  program.getSourceFile(resolve('playground/catalog.ts')) ||
  program.getSourceFile('playground/catalog.ts')
const names = []
function findCatalog(node) {
  if (
    ts.isPropertyAssignment(node) &&
    (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name)) &&
    node.name.text === 'name' &&
    ts.isStringLiteral(node.initializer)
  )
    names.push(node.initializer.text)
  ts.forEachChild(node, findCatalog)
}
findCatalog(catalogFile)
assert(names.length > 0)
assert.equal(new Set(names).size, names.length, 'Catalog names must be unique')
assert.deepEqual(
  Object.keys(notes.components).sort(),
  [...names].sort(),
  'Every component needs documented behavior',
)
const exports = new Map()
for (const path of ['src/index.ts', 'src/editors.ts', 'src/markdown.ts', 'src/antd.tsx']) {
  const file = program.getSourceFile(resolve(path)) || program.getSourceFile(path)
  for (const symbol of checker.getExportsOfModule(checker.getSymbolAtLocation(file))) {
    exports.set(
      symbol.name,
      symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol,
    )
  }
}
const nativeCommon = new Set([
  'children',
  'id',
  'className',
  'style',
  'disabled',
  'type',
  'value',
  'defaultValue',
  'checked',
  'defaultChecked',
  'onClick',
  'onChange',
  'onError',
  'placeholder',
  'required',
  'readOnly',
  'autoComplete',
  'rows',
  'name',
  'ref',
  'controls',
  'preload',
  'poster',
  'muted',
  'loop',
  'autoPlay',
  'aria-label',
  'aria-describedby',
  'aria-invalid',
])
const typeFlags =
  ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope
function rowsOf(type, location, meta = {}) {
  return checker.getPropertiesOfType(type).map((prop) => {
    const declaration = prop.valueDeclaration || prop.declarations?.[0] || location
    const local =
      prop.declarations?.some((d) =>
        relative(process.cwd(), d.getSourceFile().fileName).startsWith('src/'),
      ) || false
    const name = prop.name
    const override = meta.properties?.[name] || {}
    const description =
      override.description ||
      notes.properties[name] ||
      (local ? null : 'React 原生属性；遵循相应 DOM 元素的 React 类型及浏览器语义。')
    assert(description, `${meta.name || 'model'}.${name} requires a description`)
    const required = !(prop.flags & ts.SymbolFlags.Optional)
    const typeText = checker
      .typeToString(checker.getTypeOfSymbolAtLocation(prop, declaration), location, typeFlags)
      .replace(/import\("[^"]*"\)\./g, '')
    return {
      name,
      type: typeText,
      required,
      defaultValue:
        override.defaultValue ?? meta.defaults?.[name] ?? (required ? '—（必填）' : '未设置'),
      description,
      native: !local,
      event: /^on[A-Z]/.test(name),
      primary: local || nativeCommon.has(name),
    }
  })
}
const output = { common: notes.common, components: {}, models: {} }
for (const name of names) {
  const symbol = exports.get(name)
  assert(symbol, `${name} not exported`)
  const declaration = symbol.valueDeclaration
  const type = checker.getTypeOfSymbolAtLocation(symbol, declaration)
  const signature = type.getCallSignatures()[0]
  assert(signature, `${name} must be callable`)
  const parameter = signature.parameters[0]
  const props = checker.getTypeOfSymbolAtLocation(parameter, declaration)
  const meta = { name, defaults: {}, properties: {}, models: [], ...notes.components[name] }
  const rows = rowsOf(props, declaration, meta)
  for (const prop of Object.keys(meta.defaults || {}))
    assert(
      rows.some((row) => row.name === prop),
      `${name}.${prop} default not in API`,
    )
  for (const prop of Object.keys(meta.properties || {}))
    assert(
      rows.some((row) => row.name === prop),
      `${name}.${prop} note not in API`,
    )
  const example = await readFile(`docs/examples/${name}.tsx`, 'utf8')
  assert(example.includes(`function ${name}Example`), `${name} example must be a complete function`)
  output.components[name] = {
    entry:
      name === 'AntdCompatibilityProvider'
        ? '@batype/ui/antd'
        : name === 'CodeEditor' || name === 'RichTextEditor'
          ? '@batype/ui/editors'
          : name === 'Markdown'
            ? '@batype/ui/markdown'
            : '@batype/ui',
    source: relative(process.cwd(), declaration.getSourceFile().fileName),
    signature: checker.signatureToString(signature, declaration, typeFlags),
    ...meta,
    props: rows.filter((row) => row.primary && !row.event),
    events: rows.filter((row) => row.primary && row.event),
    native: rows.filter((row) => !row.primary),
    example,
  }
}
for (const name of notes.models) {
  const symbol = exports.get(name)
  assert(symbol, `${name} model not exported`)
  const declaration = symbol.declarations[0]
  const type = checker.getDeclaredTypeOfSymbol(symbol)
  output.models[name] = {
    definition: declaration.getText(),
    properties: ts.isInterfaceDeclaration(declaration)
      ? rowsOf(type, declaration, notes.modelNotes?.[name])
      : [],
  }
}
const escape = (text) => String(text).replace(/\|/g, '&#124;').replace(/\r?\n/g, '<br>')
const table = (rows) =>
  rows.length
    ? '| 参数 | 类型 | 必填 | 默认值 | 说明 |\n| --- | --- | --- | --- | --- |\n' +
      rows
        .map(
          (row) =>
            `| \`${row.name}\` | \`${escape(row.type)}\` | ${row.required ? '是' : '否'} | ${escape(row.defaultValue)} | ${escape(row.description)} |`,
        )
        .join('\n')
    : '无。'
let markdown =
  '# 完整组件 API\n\n<!-- Generated by pnpm docs:api. Edit docs/api-notes.json and docs/examples/*.tsx, not this file. -->\n\n'
markdown +=
  notes.common.map((note) => '- ' + note).join('\n') +
  '\n\n## 目录\n\n' +
  names.map((name) => `- [${name}](#${name.toLowerCase()})`).join('\n') +
  '\n\n'
for (const [name, doc] of Object.entries(output.components)) {
  markdown += `## ${name}\n\n导入：\`${doc.entry}\`。源码：\`${doc.source}\`。\n\n${doc.summary}\n\n### 使用示例\n\n\`\`\`tsx\n${doc.example.trim()}\n\`\`\`\n\n### 参数\n\n${table(doc.props)}\n\n### 事件回调\n\n${table(doc.events)}\n\n### 使用约定\n\n${doc.notes.map((note) => '- ' + note).join('\n')}\n\n`
  if (doc.models?.length)
    markdown +=
      '关联数据结构：' +
      doc.models.map((name) => `[${name}](#${name.toLowerCase()})`).join('、') +
      '。\n\n'
  if (doc.native.length)
    markdown += `<details>\n<summary>其他 React 原生属性（${doc.native.length} 项）</summary>\n\n${table(doc.native)}\n\n</details>\n\n`
}
markdown += '## 公共数据结构\n\n'
for (const [name, model] of Object.entries(output.models))
  markdown += `### ${name}\n\n\`\`\`ts\n${model.definition}\n\`\`\`\n\n${model.properties.length ? table(model.properties) + '\n\n' : ''}`
// Deduplicate inherited React attributes across components so the catalog does not
// download the same HTML/event contracts dozens of times.
output.nativeAttributes = []
const nativePool = new Map()
for (const doc of Object.values(output.components)) {
  doc.native = doc.native.map((row) => {
    const key = JSON.stringify(row)
    if (!nativePool.has(key)) {
      nativePool.set(key, output.nativeAttributes.length)
      output.nativeAttributes.push(row)
    }
    return nativePool.get(key)
  })
}
for (const [path, source, parser] of [
  ['playground/api.generated.json', JSON.stringify(output), 'json'],
  ['docs/API.md', markdown, 'markdown'],
]) {
  const formatted = await format(source, {
    parser,
    singleQuote: true,
    semi: false,
    printWidth: 100,
  })
  if (check)
    assert.equal(await readFile(path, 'utf8'), formatted, `${path} is stale; run pnpm docs:api`)
  else await writeFile(path, formatted)
}
console.log(
  `${check ? 'Checked' : 'Generated'} API contracts for ${names.length} components and ${notes.models.length} shared models`,
)
