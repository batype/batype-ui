import { useId, useRef, type ReactNode } from 'react'
export interface TabItem {
  key: string
  label: ReactNode
  content: ReactNode
  disabled?: boolean
}
export interface TabsProps {
  value: string
  onChange: (key: string) => void
  items: readonly TabItem[]
  label: string
}
export function Tabs({ value, onChange, items, label }: TabsProps) {
  const id = useId(),
    refs = useRef<(HTMLButtonElement | null)[]>([])
  const active =
    items.find((i) => i.key === value && !i.disabled)?.key ?? items.find((i) => !i.disabled)?.key
  const move = (key: string, index: number) => {
    const enabled = items.map((item, i) => (!item.disabled ? i : -1)).filter((i) => i >= 0)
    const position = enabled.indexOf(index)
    const target =
      key === 'Home'
        ? enabled[0]
        : key === 'End'
          ? enabled.at(-1)
          : enabled[(position + (key === 'ArrowRight' ? 1 : -1) + enabled.length) % enabled.length]
    if (target !== undefined) {
      refs.current[target]?.focus()
      onChange(items[target]!.key)
    }
  }
  return (
    <div className="bui-tabs">
      <div role="tablist" aria-label={label} className="bui-tabs__list">
        {items.map((item, index) => (
          <button
            key={item.key}
            ref={(node) => {
              refs.current[index] = node
            }}
            type="button"
            role="tab"
            id={`${id}-tab-${index}`}
            aria-controls={`${id}-panel-${index}`}
            aria-selected={item.key === active}
            disabled={item.disabled}
            tabIndex={item.key === active ? 0 : -1}
            onClick={() => onChange(item.key)}
            onKeyDown={(e) => {
              if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
                e.preventDefault()
                move(e.key, index)
              }
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
      {items.map((item, index) => (
        <div
          key={item.key}
          role="tabpanel"
          id={`${id}-panel-${index}`}
          aria-labelledby={`${id}-tab-${index}`}
          hidden={item.key !== active}
          tabIndex={0}
          className="bui-tabs__panel"
        >
          {item.content}
        </div>
      ))}
    </div>
  )
}
