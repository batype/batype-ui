import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { catalog } from '../../playground/catalog'

test('所有密度下输入、选择、日期、数字、按钮和菜单高度一致', async ({ page }, info) => {
  await page.goto('/#UIProvider')
  for (const theme of ['light', 'dark']) {
    for (const [density, height] of [
      ['comfortable', 40],
      ['compact', 32],
    ] as const) {
      const panel = page.getByTestId(`style-${theme}-${density}`)
      await expect(panel).toBeVisible()
      for (const control of await panel
        .locator('.bui-field__control, .bui-select, .bui-dropdown > summary')
        .all()) {
        expect(await control.evaluate((node) => node.getBoundingClientRect().height)).toBe(height)
      }
      const button = panel.getByRole('button', { name: '主要操作', exact: true })
      expect(await button.evaluate((node) => node.getBoundingClientRect().height)).toBe(height)
      const action = panel.getByRole('button', { name: 'danger 操作', exact: true })
      expect(
        await action.evaluate((node) => [
          node.getBoundingClientRect().width,
          node.getBoundingClientRect().height,
        ]),
      ).toEqual([32, 32])
      expect(await action.evaluate((node) => getComputedStyle(node).backgroundColor)).toBe(
        'rgb(232, 0, 85)',
      )
      await panel.screenshot({
        path: `test-results/${info.project.name}-${theme}-${density}-controls.png`,
      })
    }
  }
  expect(
    (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
      .violations,
  ).toEqual([])
  for (const width of info.project.name === 'mobile' ? [320, 390] : [1280]) {
    await page.setViewportSize({ width, height: 900 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    )
  }
})

test('组件样式后加载也不覆盖宿主字体与焦点，库控件保留键盘焦点', async ({ page }) => {
  await page.goto('/#UIProvider')
  await page.addStyleTag({
    content:
      '.host-small-control { font: 600 11px/13px serif; } .host-small-control:focus-visible { outline: 1px dashed rgb(20, 100, 50); }',
  })
  await page.getByTestId('style-light-comfortable').evaluate((panel) => {
    const host = document.createElement('div')
    host.innerHTML =
      '<input class="host-small-control" aria-label="宿主输入框"><button class="host-small-control">宿主按钮</button>'
    panel.appendChild(host)
    const stylesheet = document.querySelector('style[data-vite-dev-id$="/src/styles.css"]')
    if (!stylesheet) throw new Error('Missing actual component stylesheet')
    document.head.appendChild(stylesheet)
  })
  for (const control of [
    page.getByRole('textbox', { name: '宿主输入框' }),
    page.getByRole('button', { name: '宿主按钮' }),
  ]) {
    expect(
      await control.evaluate((node) => {
        const style = getComputedStyle(node)
        return [style.fontSize, style.fontWeight, style.lineHeight, style.fontFamily]
      }),
    ).toEqual(['11px', '600', '13px', 'serif'])
  }
  await page.getByRole('button', { name: '宿主按钮' }).focus()
  expect(
    await page
      .getByRole('button', { name: '宿主按钮' })
      .evaluate((node) => getComputedStyle(node).outlineStyle),
  ).toBe('dashed')
  const own = page.getByTestId('style-light-comfortable').getByRole('button', { name: '主要操作' })
  await own.focus()
  expect(await own.evaluate((node) => getComputedStyle(node).outlineStyle)).toBe('solid')
})

test('全部组件布局走查、表格密度和窄屏操作不裁切', async ({ page }, info) => {
  test.setTimeout(90000)
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  const screenshots = new Set([
    'Button',
    'Input',
    'Select',
    'Textarea',
    'Checkbox',
    'Switch',
    'Badge',
    'Tabs',
    'Dropdown',
    'Pagination',
    'DataTable',
    'TreeTable',
    'FileUpload',
    'DetailModal',
  ])
  for (const { name } of catalog) {
    await page.goto(`/#${name}`)
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    )
    if (name === 'DataTable' && info.project.name === 'desktop') {
      const cell = page.getByRole('table', { name: '组件任务列表' }).locator('tbody td').first()
      expect(
        await cell.evaluate((node) => {
          const style = getComputedStyle(node)
          return [style.paddingTop, style.paddingBottom, style.borderBottomWidth]
        }),
      ).toEqual(['8px', '8px', '0px'])
    }
    if (name === 'DetailModal') {
      await page.getByRole('button', { name: '打开详情弹窗' }).click()
      const dialog = page.getByRole('dialog')
      await expect(dialog).toBeVisible()
      expect(
        await dialog.evaluate((node) => node.getBoundingClientRect().bottom <= innerHeight),
      ).toBe(true)
    }
    if (screenshots.has(name))
      await page.screenshot({ path: `test-results/${info.project.name}-${name}-appearance.png` })
  }
  expect(errors).toEqual([])
})
