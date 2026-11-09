import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('表单校验、动态列表清空与键盘搜索', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/#Form')
  await page.getByRole('button', { name: '提交表单', exact: true }).click()
  await expect(page.getByRole('alert')).toHaveText('此项为必填项')
  await page.getByRole('textbox', { name: /名称/ }).fill('新的表单值')
  await page.getByRole('button', { name: '提交表单', exact: true }).click()
  await expect(page.getByLabel('提交结果')).toHaveText('新的表单值')
  await page.goto('/#FormList')
  await page.getByRole('button', { name: '添加条目', exact: true }).click()
  await page.getByLabel('第 2 项名称').fill('保留第二项')
  await page.getByRole('button', { name: '移除第 1 项', exact: true }).click()
  await expect(page.getByLabel('第 1 项名称')).toHaveValue('保留第二项')
  await page.getByRole('button', { name: '移除第 1 项', exact: true }).click()
  await page.getByRole('button', { name: '保存条目', exact: true }).click()
  await expect(page.getByLabel('条目提交结果')).toHaveText('[]')
  await page.goto('/#SearchSelect')
  const combo = page.getByRole('combobox', { name: '搜索组件', exact: true })
  await combo.fill('table')
  await combo.press('ArrowDown')
  await combo.press('Enter')
  await expect(combo).toHaveValue('表格 DataTable')
  await combo.click()
  await combo.fill('不存在')
  await expect(page.getByText('没有匹配的选项', { exact: true })).toBeVisible()
  await combo.press('Escape')
  await expect(combo).toHaveValue('表格 DataTable')
  expect(errors).toEqual([])
})

test('级联选择、范围输入、消息提示及移动操作列', async ({ page }, info) => {
  await page.goto('/#Cascader')
  await page.getByLabel('省份', { exact: true }).selectOption('east')
  await page.getByLabel('城市', { exact: true }).selectOption('city')
  await page.getByLabel('区县', { exact: true }).selectOption('district')
  await page.getByLabel('省份', { exact: true }).selectOption('west')
  await expect(page.getByLabel('城市', { exact: true })).toHaveValue('')
  await expect(page.getByLabel('区县', { exact: true })).toHaveCount(0)
  await page.goto('/#NumberInput')
  await page.getByLabel('数量', { exact: true }).fill('123')
  await page.getByLabel('数量', { exact: true }).blur()
  await expect(page.getByLabel('数量', { exact: true })).toHaveValue('100')
  await page.goto('/#DateRangePicker')
  await page
    .getByRole('group', { name: '统计日期', exact: true })
    .getByLabel('开始日期', { exact: true })
    .fill('2026-12-01')
  await expect(page.getByRole('alert')).toHaveText('开始日期不能晚于结束日期')
  await page.goto('/#MessageProvider')
  await page.getByRole('button', { name: '开始处理', exact: true }).click()
  await expect(page.locator('.bui-message[role="status"]')).toContainText('处理中')
  await page.getByRole('button', { name: '处理完成', exact: true }).click()
  await expect(page.locator('.bui-message[role="status"]')).toContainText('处理完成')
  await page.goto('/')
  if (info.project.name === 'mobile') {
    const actions = page.locator('.bui-table-mobile__wide').first()
    await expect(actions.locator('dt')).toHaveCount(0)
    await expect(actions.getByRole('button', { name: '查看详情' })).toBeVisible()
  } else await expect(page.getByRole('columnheader', { name: '操作' })).toBeVisible()
})

test('本地图片裁剪实际导出 File，弹窗可滚动且取消可恢复焦点', async ({ page }, info) => {
  await page.goto('/#ImageCropper')
  const input = page.getByLabel('选择裁剪图片', { exact: true })
  await input.setInputFiles({
    name: 'sample.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aL1sAAAAASUVORK5CYII=',
      'base64',
    ),
  })
  const dialog = page.getByRole('dialog', { name: '裁剪图片', exact: true })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('button', { name: '应用裁剪', exact: true })).toBeEnabled()
  await dialog.getByLabel('缩放', { exact: true }).fill('2')
  await dialog.getByRole('button', { name: '应用裁剪', exact: true }).click()
  await expect(dialog).not.toBeVisible()
  await expect(page.getByLabel('裁剪结果')).toContainText('sample-crop.png')
  await input.focus()
  await input.setInputFiles({
    name: 'sample.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aL1sAAAAASUVORK5CYII=',
      'base64',
    ),
  })
  await dialog.getByRole('button', { name: '取消', exact: true }).click()
  await expect(dialog).not.toBeVisible()
  await expect(input).toBeFocused()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true,
  )
  await page.screenshot({
    path: `test-results/${info.project.name}-completion.png`,
    fullPage: true,
  })
})

test('新增组件基础可访问性、窄屏与深色模式', async ({ page }, info) => {
  for (const name of [
    'Form',
    'SearchSelect',
    'Cascader',
    'DateRangePicker',
    'RadioGroup',
    'PageHeader',
  ]) {
    await page.goto('/#' + name)
    expect(
      (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
        .violations,
    ).toEqual([])
    if (info.project.name === 'mobile') {
      await page.setViewportSize({ width: 320, height: 844 })
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      ).toBe(true)
    }
  }
  await page.getByRole('button', { name: '深色模式', exact: true }).click()
  await expect(page.locator('.bui-root').first()).toHaveAttribute('data-bui-theme', 'dark')
})
