import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { catalog } from '../../playground/catalog'
async function component(page: Page, name: string) {
  if (await page.getByLabel('选择组件文档').isVisible())
    await page.getByLabel('选择组件文档').selectOption(name)
  else
    await page
      .getByRole('navigation', { name: '组件文档' })
      .getByRole('link', { name: new RegExp('^' + name + ' ') })
      .click()
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
}
test('响应式表格筛选、分页、选择与详情焦点', async ({ page }, info) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto('/')
  const list =
    info.project.name === 'mobile'
      ? page.locator('.bui-table-mobile')
      : page.getByRole('table', { name: '组件任务列表' })
  await page.getByLabel('筛选任务').fill('Lin')
  await expect(list.getByText('组件设计规范', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: '重置', exact: true }).click()
  await page.getByRole('button', { name: '下一页' }).click()
  await expect(list.getByText('主题预设')).toBeVisible()
  await page.getByRole('button', { name: '上一页' }).click()
  await list.getByLabel('选择行 1', { exact: true }).check()
  await expect(page.getByText('1 项已选择')).toBeVisible()
  const trigger = list.getByRole('button', { name: '查看详情' }).first()
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: '任务详情' })
  await expect(dialog).toBeVisible()
  await page.keyboard.press('Tab')
  expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true)
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expect(trigger).toBeFocused()
  expect(errors).toEqual([])
})
test('组件名导航、搜索、直接访问和页面覆盖', async ({ page }, info) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto('/#TreeTable')
  await expect(page.getByRole('heading', { name: 'TreeTable', exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'TreeTable', exact: true })).toBeVisible()
  if (info.project.name === 'desktop') {
    await page.getByLabel('搜索组件').fill('button')
    const links = page.getByRole('navigation', { name: '组件文档' }).getByRole('link')
    await expect(links).toHaveCount(4)
    await page.getByLabel('搜索组件').fill('')
    await expect(links).toHaveCount(catalog.length + 1)
  } else
    await expect(page.getByLabel('选择组件文档').locator('option')).toHaveCount(catalog.length + 1)
  for (const name of [
    'Button',
    'Select',
    'Textarea',
    'Checkbox',
    'Switch',
    'Badge',
    'DescriptionList',
    'ConfirmDialog',
    'Dropdown',
    'NavigationMenu',
    'RouteTabs',
    'ThemeSwitch',
    'LanguageSwitcher',
    'ErrorState',
    'MethodChip',
    'CodeBlock',
    'ImagePreview',
    'VideoPlayer',
    'Markdown',
  ]) {
    await component(page, name)
    await expect(page.locator('main')).not.toContainText('编辑器加载失败')
  }
  expect(errors).toEqual([])
})
test('新增控件、树表、确认弹窗与页签操作', async ({ page }, info) => {
  await page.goto('/')
  await component(page, 'Select')
  await page.getByLabel('状态', { exact: true }).selectOption('disabled')
  await expect(page.getByLabel('状态', { exact: true })).toHaveValue('disabled')
  await component(page, 'TreeTable')
  const list =
    info.project.name === 'mobile' ? page.locator('.bui-table-mobile') : page.getByRole('table')
  await list.getByRole('button', { name: '展开 基础组件' }).click()
  await expect(list.getByText('Button', { exact: true })).toBeVisible()
  await list.getByRole('button', { name: '收起 基础组件' }).click()
  await expect(list.getByText('Button', { exact: true })).not.toBeVisible()
  await component(page, 'ConfirmDialog')
  await page.getByRole('button', { name: '打开确认弹窗' }).click()
  await page.getByRole('dialog').getByRole('button', { name: '确认', exact: true }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await expect(page.getByText('确认回调已完成')).toBeVisible()
  await component(page, 'Tabs')
  await page.getByRole('tab', { name: '预览' }).focus()
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('tab', { name: '代码', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  )
})
test('上传模拟、图片预览和视频为本地资源', async ({ page }) => {
  const external: string[] = []
  page.on('request', (r) => {
    if (!r.url().startsWith('http://127.0.0.1:5193') && !/^(blob:|data:)/.test(r.url()))
      external.push(r.url())
  })
  await page.goto('/')
  await component(page, 'FileUpload')
  await page.getByLabel('选择文件', { exact: true }).setInputFiles({
    name: 'note.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('Local UI demo'),
  })
  await expect(page.getByText('已完成', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: '移除 note.txt' }).click()
  await expect(page.getByText('note.txt')).not.toBeVisible()
  await component(page, 'ImagePreview')
  await page.getByRole('button', { name: '预览 Batype UI 预览示例' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await component(page, 'VideoPlayer')
  await expect(page.getByLabel('Batype UI 演示视频')).toBeVisible()
  expect(external).toEqual([])
})
test('真实代码及富文本编辑器受控回显', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto('/')
  await component(page, 'CodeEditor')
  const code = page.getByRole('textbox', { name: '代码示例' })
  await expect(code).toBeVisible({ timeout: 30000 })
  await code.fill('const edited = 42')
  await expect(page.getByTestId('code-output')).toHaveText('const edited = 42')
  await component(page, 'RichTextEditor')
  const rich = page.getByRole('textbox', { name: '正文示例' })
  await expect(rich).toBeVisible({ timeout: 30000 })
  await rich.click()
  await page.keyboard.press('End')
  await page.keyboard.type(' EDITED')
  await expect(page.locator('.bui-code-block code')).toContainText('EDITED')
  await page.getByRole('switch', { name: '允许编辑' }).uncheck()
  await expect(rich).toHaveAttribute('contenteditable', 'false')
  expect(errors).toEqual([])
})
test('主题、手机溢出和基础可访问性', async ({ page }, info) => {
  await page.goto('/')
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect(results.violations).toEqual([])
  await component(page, 'DetailModal')
  await page.getByRole('button', { name: '打开详情弹窗' }).click()
  expect(
    (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
      .violations,
  ).toEqual([])
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: '深色模式', exact: true }).click()
  await expect(page.locator('.bui-root').first()).toHaveAttribute('data-bui-theme', 'dark')
  for (const width of info.project.name === 'mobile' ? [320, 390] : [1280]) {
    await page.setViewportSize({ width, height: 900 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)).toBe(
      false,
    )
  }
  await page.screenshot({
    path: `test-results/${info.project.name}-components-dark.png`,
    fullPage: true,
  })
  await page.goto('/#TreeTable')
  await page.screenshot({ path: `test-results/${info.project.name}-catalog.png`, fullPage: true })
})

test('所有组件都有完整API表、可复制示例和适用约定', async ({ page }) => {
  test.setTimeout(90000)
  await page.goto('/')
  for (const { name } of catalog) {
    await component(page, name)
    await expect(page.getByRole('heading', { name: '完整使用示例', exact: true })).toBeVisible()
    await expect(page.getByRole('table', { name: `${name} 参数`, exact: true })).toBeAttached()
    await expect(page.getByRole('heading', { name: '使用约定与注意事项' })).toBeAttached()
    await expect(page.locator('.code-card pre code')).toContainText(`function ${name}Example`)
  }
})
test('API筛选、事件签名、默认值和嵌套类型可查阅', async ({ page }, info) => {
  await page.goto('/#Select')
  const events = page.getByRole('table', { name: 'Select 事件', exact: true })
  await expect(events.getByRole('rowheader', { name: 'onChange', exact: true })).toBeAttached()
  await expect(events).toContainText('ChangeEventHandler<HTMLSelectElement')
  await page.getByLabel('筛选 API 参数').fill('aria-controls')
  await expect(page.getByRole('table', { name: 'Select 原生属性', exact: true })).toContainText(
    'aria-controls',
  )
  await page.getByLabel('筛选 API 参数').fill('no-such-api')
  await expect(
    page.getByText('共匹配 0 项；未设置表示未赋默认 prop，运行时回退见说明。'),
  ).toBeVisible()
  await component(page, 'CodeEditor')
  await expect(page.getByLabel('筛选 API 参数')).toHaveValue('')
  await expect(page.getByRole('table', { name: 'CodeEditor 事件', exact: true })).toContainText(
    '(value: string) => void',
  )
  await expect(page.getByRole('table', { name: 'CodeEditor 参数', exact: true })).toContainText(
    '260',
  )
  await component(page, 'DataTable')
  await expect(page.getByRole('table', { name: 'TableColumn 字段', exact: true })).toContainText(
    'mobileHidden',
  )
  await page.screenshot({ path: `test-results/${info.project.name}-api.png`, fullPage: true })
  if (info.project.name === 'mobile') {
    await page.setViewportSize({ width: 320, height: 850 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)).toBe(
      false,
    )
  }
})
