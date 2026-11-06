import { type ReactNode } from 'react'
import { Button, ActionButton } from './Button.js'
import { Icon } from './Icon.js'
import { useUI, type Locale } from '../provider.js'
export interface NavigationItem {
  key: string
  label: string
  icon?: ReactNode
  disabled?: boolean
  children?: readonly NavigationItem[]
}
export function NavigationMenu({
  label,
  items,
  activeKey,
  onSelect,
}: {
  label: string
  items: readonly NavigationItem[]
  activeKey?: string
  onSelect: (key: string) => void
}) {
  const render = (nodes: readonly NavigationItem[], depth = 0): ReactNode => {
    if (depth > 20) throw new Error('NavigationMenu maximum depth exceeded')
    return (
      <ul>
        {nodes.map((item) => (
          <li key={item.key}>
            {item.children?.length ? (
              <details open>
                <summary>
                  {item.icon}
                  {item.label}
                </summary>
                {render(item.children, depth + 1)}
              </details>
            ) : (
              <button
                type="button"
                disabled={item.disabled}
                aria-current={activeKey === item.key ? 'page' : undefined}
                onClick={() => onSelect(item.key)}
              >
                {item.icon}
                {item.label}
              </button>
            )}
          </li>
        ))}
      </ul>
    )
  }
  return (
    <nav className="bui-navigation" aria-label={label}>
      {render(items)}
    </nav>
  )
}
export interface RouteTab {
  key: string
  label: string
  icon?: ReactNode
  closable?: boolean
}
export function RouteTabs({
  items,
  activeKey,
  onSelect,
  onClose,
  label = '工作区页签',
}: {
  items: readonly RouteTab[]
  activeKey: string
  onSelect: (key: string) => void
  onClose?: (key: string) => void
  label?: string
}) {
  const { messages } = useUI()
  return (
    <nav className="bui-route-tabs" aria-label={label}>
      <ul>
        {items.map((item) => (
          <li key={item.key} data-active={item.key === activeKey}>
            <button
              type="button"
              aria-current={item.key === activeKey ? 'page' : undefined}
              onClick={() => onSelect(item.key)}
            >
              {item.icon}
              {item.label}
            </button>
            {item.closable && onClose && (
              <ActionButton
                variant="ghost"
                label={`${messages.close} ${item.label}`}
                icon={<Icon name="close" size={12} />}
                onClick={() => onClose(item.key)}
              />
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}
export function ThemeSwitch({
  value,
  onChange,
}: {
  value: 'light' | 'dark'
  onChange: (theme: 'light' | 'dark') => void
}) {
  const { locale } = useUI(),
    label =
      value === 'dark'
        ? locale === 'en'
          ? 'Use light theme'
          : '切换浅色主题'
        : locale === 'en'
          ? 'Use dark theme'
          : '切换深色主题'
  return (
    <Button
      tone="neutral"
      variant="soft"
      aria-label={label}
      aria-pressed={value === 'dark'}
      onClick={() => onChange(value === 'light' ? 'dark' : 'light')}
    >
      {value === 'dark' ? '☾' : '☀'} {label}
    </Button>
  )
}
export function LanguageSwitcher({
  value,
  onChange,
}: {
  value: Locale
  onChange: (locale: Locale) => void
}) {
  return (
    <select
      className="bui-select"
      aria-label="Language / 语言"
      value={value}
      onChange={(e) => onChange(e.target.value as Locale)}
    >
      <option value="zh-CN">简体中文</option>
      <option value="en">English</option>
    </select>
  )
}
