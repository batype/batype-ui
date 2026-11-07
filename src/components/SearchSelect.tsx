import { useEffect, useId, useRef, useState } from 'react'
import { useUI } from '../provider.js'
import { ActionButton } from './Button.js'
import { Icon } from './Icon.js'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}
export interface SearchSelectProps {
  label: string
  options: readonly SelectOption[]
  value: string
  onChange: (value: string) => void
  onSearch?: (query: string) => void
  placeholder?: string
  emptyLabel?: string
  disabled?: boolean
  clearable?: boolean
  name?: string
  hint?: string
  error?: string
}
export function SearchSelect({
  label,
  options,
  value,
  onChange,
  onSearch,
  placeholder,
  emptyLabel,
  disabled = false,
  clearable = true,
  name,
  hint,
  error,
}: SearchSelectProps) {
  const [open, setOpen] = useState(false),
    [query, setQuery] = useState(''),
    [active, setActive] = useState('')
  const root = useRef<HTMLDivElement>(null),
    input = useRef<HTMLInputElement>(null),
    id = useId()
  const { messages, locale } = useUI()
  const selected = options.find((option) => option.value === value)
  const matched = options.filter((option) =>
    option.label.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
  )
  const enabled = matched.filter((option) => !option.disabled)
  const activeIndex = matched.findIndex((option) => option.value === active && !option.disabled)
  useEffect(() => {
    if (open && activeIndex >= 0)
      document.getElementById(`${id}-option-${activeIndex}`)?.scrollIntoView?.({ block: 'nearest' })
  }, [id, open, activeIndex])
  useEffect(() => {
    if (!open) return
    const dismiss = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', dismiss)
    return () => document.removeEventListener('pointerdown', dismiss)
  }, [open])
  useEffect(() => {
    if (disabled) setOpen(false)
  }, [disabled])
  const expand = () => {
    if (!disabled) {
      setQuery('')
      setActive(selected && !selected.disabled ? value : '')
      setOpen(true)
    }
  }
  const choose = (option: SelectOption) => {
    if (disabled || option.disabled) return
    onChange(option.value)
    setOpen(false)
    input.current?.focus()
  }
  return (
    <div
      ref={root}
      className={`bui-field bui-search-select${error ? ' bui-field--error' : ''}`}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
      }}
    >
      <label htmlFor={id}>{label}</label>
      {name && <input type="hidden" name={name} value={value} disabled={disabled} />}
      <div className="bui-field__control">
        <input
          ref={input}
          id={id}
          role="combobox"
          autoComplete="off"
          disabled={disabled}
          placeholder={placeholder}
          value={open ? query : (selected?.label ?? value)}
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls={`${id}-list`}
          aria-activedescendant={
            open && activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined
          }
          aria-invalid={!!error || undefined}
          aria-describedby={error || hint ? `${id}-hint` : undefined}
          onClick={() => {
            if (!open) expand()
          }}
          onChange={(event) => {
            setQuery(event.target.value)
            setActive('')
            setOpen(true)
            onSearch?.(event.target.value)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault()
              setOpen(false)
              return
            }
            if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
              if (!open && ['Home', 'End'].includes(event.key)) return
              event.preventDefault()
              if (!open) {
                expand()
                return
              }
              const index = enabled.findIndex((option) => option.value === active)
              const next =
                event.key === 'Home'
                  ? enabled[0]
                  : event.key === 'End'
                    ? enabled.at(-1)
                    : event.key === 'ArrowDown'
                      ? enabled[(index + 1) % enabled.length]
                      : enabled[index <= 0 ? enabled.length - 1 : index - 1]
              setActive(next?.value ?? '')
            } else if (event.key === 'Enter' && open) {
              event.preventDefault()
              const option = enabled.find((option) => option.value === active) ?? enabled[0]
              if (option) choose(option)
            }
          }}
        />
        {clearable && value && (
          <ActionButton
            label={messages.clear}
            disabled={disabled}
            icon={<Icon name="close" />}
            variant="ghost"
            onClick={() => {
              onChange('')
              setQuery('')
              setOpen(false)
              input.current?.focus()
            }}
          />
        )}
      </div>
      {open && !disabled && (
        <ul id={`${id}-list`} role="listbox" aria-label={label} className="bui-search-select__list">
          {matched.map((option, index) => (
            <li
              key={option.value}
              id={`${id}-option-${index}`}
              role="option"
              aria-selected={option.value === value}
              aria-disabled={option.disabled || undefined}
              data-active={option.value === active}
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => choose(option)}
            >
              {option.label}
            </li>
          ))}
          {!matched.length && (
            <li role="presentation">
              {emptyLabel ?? (locale === 'en' ? 'No matching options' : '没有匹配的选项')}
            </li>
          )}
        </ul>
      )}
      {(error || hint) && (
        <span id={`${id}-hint`} className="bui-field__hint">
          {error || hint}
        </span>
      )}
    </div>
  )
}

export interface CascaderOption extends SelectOption {
  children?: readonly CascaderOption[]
}
export interface CascaderProps {
  label: string
  options: readonly CascaderOption[]
  value: readonly string[]
  onChange: (value: string[]) => void
  levelLabels?: readonly string[]
  placeholder?: string
  disabled?: boolean
  error?: string
}
export function Cascader({
  label,
  options,
  value,
  onChange,
  levelLabels = [],
  placeholder,
  disabled,
  error,
}: CascaderProps) {
  const id = useId(),
    { locale } = useUI()
  const levels: { options: readonly CascaderOption[]; selected: string; blocked: boolean }[] = []
  let choices = options,
    blocked = !!disabled
  for (let depth = 0; choices.length && depth < 32; depth++) {
    const selected = choices.find((option) => option.value === value[depth])
    levels.push({ options: choices, selected: selected?.value ?? '', blocked })
    if (!selected?.children?.length) break
    blocked ||= !!selected.disabled
    choices = selected.children
  }
  return (
    <fieldset className="bui-cascader" disabled={disabled}>
      <legend>{label}</legend>
      <div className="bui-cascader__levels">
        {levels.map((level, depth) => (
          <div className="bui-field" key={depth}>
            <label htmlFor={`${id}-${depth}`}>
              {levelLabels[depth] ??
                (locale === 'en' ? `Level ${depth + 1}` : `第 ${depth + 1} 级`)}
            </label>
            <select
              id={`${id}-${depth}`}
              className="bui-select"
              value={level.selected}
              disabled={level.blocked}
              aria-invalid={!!error || undefined}
              aria-describedby={error ? `${id}-error` : undefined}
              onChange={(event) => {
                const next = event.target.value
                const option = level.options.find((item) => item.value === next)
                if (!level.blocked && !option?.disabled)
                  onChange([
                    ...levels.slice(0, depth).map((item) => item.selected),
                    ...(next ? [next] : []),
                  ])
              }}
            >
              <option value="">
                {placeholder ?? (locale === 'en' ? 'Please select' : '请选择')}
              </option>
              {level.options.map((option) => (
                <option key={option.value} value={option.value} disabled={option.disabled}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
      {error && (
        <span id={`${id}-error`} role="alert" className="bui-field__hint">
          {error}
        </span>
      )}
    </fieldset>
  )
}
