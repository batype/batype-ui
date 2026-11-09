import { test, expect } from '@playwright/test'

test('原生弹窗内旧复杂表单、多选、日期时间和消息均可操作', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/#AntdCompatibilityProvider')
  const trigger = page.getByRole('button', { name: '打开兼容表单' })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: '原有复杂表单' })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: '模拟编辑回填' }).click()
  await expect(dialog.getByLabel('商品名称')).toHaveValue('异步加载商品')
  await dialog.getByRole('button', { name: '增加赠品' }).click()
  await expect(dialog.getByLabel('赠品数量 2')).toHaveValue('1')
  await dialog.getByRole('button', { name: '删除赠品 1' }).click()
  await expect(dialog.getByLabel('赠品数量 1')).toHaveValue('1')
  await dialog.locator('.ant-select').click()
  const popup = dialog.locator('.ant-select-dropdown')
  await expect(popup).toBeVisible()
  await popup.locator('.ant-select-item-option').filter({ hasText: '选项甲' }).click()
  await popup.locator('.ant-select-item-option').filter({ hasText: '选项乙' }).click()
  await dialog.getByRole('heading', { name: '原有复杂表单' }).click()
  await dialog.getByLabel('原有日期时间').click()
  await expect(dialog.locator('.ant-picker-dropdown')).toBeVisible()
  await expect
    .poll(() =>
      dialog.locator('.ant-picker-dropdown').evaluate((el) => {
        const rect = el.getBoundingClientRect()
        return rect.width > 0 && rect.left >= 0 && rect.right <= innerWidth
      }),
    )
    .toBe(true)
  await dialog.getByRole('heading', { name: '原有复杂表单' }).click()
  await dialog.getByRole('button', { name: '保存兼容表单' }).click()
  await expect(dialog.getByLabel('兼容表单结果')).toContainText('"types":["a","b"]')
  await expect(dialog.getByLabel('兼容表单结果')).toContainText('"gifts":[{"quantity":1}]')
  const message = dialog.getByRole('alert').filter({ hasText: '保存完成' })
  await expect(message).toBeVisible()
  await expect
    .poll(() =>
      message.evaluate((el) => {
        const r = el.getBoundingClientRect()
        return el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2))
      }),
    )
    .toBe(true)
  await dialog.getByRole('button', { name: '重置兼容表单' }).click()
  await expect(dialog.getByLabel('商品名称')).toHaveValue('原有商品')
  await expect(dialog.getByLabel('赠品数量 1')).toHaveValue('2')
  expect(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true)
  await dialog
    .locator('.bui-modal__footer')
    .getByRole('button', { name: '关闭', exact: true })
    .click()
  await expect(dialog).not.toBeVisible()
  await expect(trigger).toBeFocused()
  expect(errors).toEqual([])
})

test('本地日期时间可保留秒，移动端控件不溢出', async ({ page }) => {
  await page.goto('/#DatePicker')
  const time = page.getByLabel('日期时间', { exact: true })
  await time.fill('2026-11-09T13:14:15')
  await expect(time).toHaveValue('2026-11-09T13:14:15')
  await page.goto('/#DateRangePicker')
  const range = page.getByRole('group', { name: '统计日期时间' })
  await range.getByLabel('开始日期').fill('2026-11-06T18:00:01')
  await expect(range.getByRole('alert')).toHaveText('开始日期不能晚于结束日期')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('富文本第三段缩进保持选区，段间距与行高一致', async ({ page }) => {
  await page.goto('/#RichTextEditor')
  const rich = page.getByRole('textbox', { name: '正文示例' })
  await expect(rich).toBeVisible()
  await rich.click()
  await page.keyboard.press('ControlOrMeta+A')
  await page.keyboard.insertText('第一段内容')
  await page.keyboard.press('Enter')
  await page.keyboard.insertText('第二段内容')
  await page.keyboard.press('Enter')
  await page.keyboard.insertText('第三段内容')
  const paragraphs = rich.locator('p')
  await expect(paragraphs).toHaveCount(3)
  const spacing = await paragraphs.evaluateAll((elements) =>
    elements.map((el) => {
      const s = getComputedStyle(el)
      return { top: s.marginTop, bottom: s.marginBottom, line: s.lineHeight, font: s.fontSize }
    }),
  )
  for (const s of spacing) {
    expect(s.top).toBe('0px')
    expect(s.bottom).toBe('0px')
    expect(parseFloat(s.line) / parseFloat(s.font)).toBe(1.5)
  }
  await page.locator('.bui-rich-editor button[data-menu-key="group-indent"]').click()
  await expect(page.locator('.bui-rich-editor button[data-menu-key="indent"]')).not.toHaveClass(
    /disabled/,
  )
  await page.locator('.bui-rich-editor button[data-menu-key="indent"]').click()
  await expect
    .poll(() => paragraphs.nth(2).evaluate((el) => (el as HTMLElement).style.textIndent))
    .toBe('2em')
  const indentation = await paragraphs.evaluateAll((elements) =>
    elements.map((el) => (el as HTMLElement).style.textIndent),
  )
  expect(indentation[0]).toBe('')
  expect(indentation[1]).toBe('')
  expect(indentation[2]).not.toBe('')
  await page.keyboard.insertText('追加')
  await expect(paragraphs.nth(2)).toContainText('追加')
  await expect(paragraphs.nth(0)).not.toContainText('追加')
  await paragraphs.nth(0).click()
  await page.keyboard.press('Home')
  await page.keyboard.press('Shift+ArrowDown')
  await page.keyboard.press('Shift+ArrowDown')
  const hoverbar = page.locator('.bui-rich-editor .w-e-hover-bar.w-e-bar-show')
  await expect(hoverbar).toBeVisible()
  await expect
    .poll(() =>
      hoverbar.evaluate((el) => {
        const range = window.getSelection()?.getRangeAt(0)
        const rects = range ? Array.from(range.getClientRects()).filter((r) => r.width) : []
        const last = rects[rects.length - 1]
        return !!last && el.getBoundingClientRect().top >= last.bottom
      }),
    )
    .toBe(true)
})
