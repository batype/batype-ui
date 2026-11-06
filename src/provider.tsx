import {
  createContext,
  useEffect,
  useState,
  useContext,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
export type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger'
export type Size = 'sm' | 'md' | 'lg'
export type Locale = 'zh-CN' | 'en'
const messages = {
  'zh-CN': {
    loading: '加载中',
    empty: '暂无数据',
    close: '关闭',
    copy: '复制',
    copied: '已复制',
    copyFailed: '复制失败',
    previous: '上一页',
    next: '下一页',
    page: '页码',
    pageSize: '每页条数',
    total: '共',
    items: '条',
    selectAll: '选择当前页全部行',
    selectRow: '选择行',
    showPassword: '显示密码',
    hidePassword: '隐藏密码',
    clear: '清空',
  },
  en: {
    loading: 'Loading',
    empty: 'No data',
    close: 'Close',
    copy: 'Copy',
    copied: 'Copied',
    copyFailed: 'Copy failed',
    previous: 'Previous',
    next: 'Next',
    page: 'Page',
    pageSize: 'Rows per page',
    total: 'Total',
    items: 'items',
    selectAll: 'Select all rows on this page',
    selectRow: 'Select row',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    clear: 'Clear',
  },
}
export type Theme = 'light' | 'dark' | 'system'
const Context = createContext({
  locale: 'zh-CN' as Locale,
  theme: 'light' as Theme,
  messages: messages['zh-CN'],
})
export interface UIProviderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  theme?: 'light' | 'dark' | 'system'
  locale?: Locale
  density?: 'comfortable' | 'compact'
  tokens?: CSSProperties & { [key: `--bui-${string}`]: string | number }
}
export function UIProvider({
  theme = 'light',
  locale = 'zh-CN',
  density = 'comfortable',
  tokens,
  children,
  className = '',
  style,
  ...rest
}: UIProviderProps) {
  return (
    <Context.Provider value={{ locale, theme, messages: messages[locale] }}>
      <div
        {...rest}
        className={`bui-root ${className}`}
        data-bui-theme={theme}
        data-bui-density={density}
        style={{ ...tokens, ...style }}
      >
        {children}
      </div>
    </Context.Provider>
  )
}
export const useUI = () => useContext(Context)
export const cx = (...values: (string | undefined | false)[]) => values.filter(Boolean).join(' ')

export function useResolvedTheme(): 'light' | 'dark' {
  const { theme } = useUI(),
    [system, setSystem] = useState<'light' | 'dark'>('light')
  useEffect(() => {
    if (typeof matchMedia === 'undefined') return
    const media = matchMedia('(prefers-color-scheme: dark)')
    const update = () => setSystem(media.matches ? 'dark' : 'light')
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  return theme === 'system' ? system : theme
}
