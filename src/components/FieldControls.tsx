import { useEffect, useId, useState } from 'react'
import { Input, type InputProps } from './Input.js'
import { useUI } from '../provider.js'
import type { SelectOption } from './SearchSelect.js'

export type DatePickerProps = Omit<InputProps, 'type'>
/** Native calendar. Values are date-only strings; no implicit UTC/local conversion. */
export function DatePicker(props: DatePickerProps) {
  return <Input {...props} type="date" />
}

export interface DateRangePickerProps {
  label: string
  value: readonly [string, string]
  onChange: (value: [string, string]) => void
  min?: string
  max?: string
  disabled?: boolean
  required?: boolean
  error?: string
  hint?: string
}
export function DateRangePicker({
  label,
  value,
  onChange,
  min,
  max,
  disabled,
  required,
  error,
  hint,
}: DateRangePickerProps) {
  const id = useId(),
    { locale } = useUI()
  const invalid = value[0] && value[1] && value[0] > value[1]
  const problem =
    error ||
    (invalid
      ? locale === 'en'
        ? 'Start date must not exceed end date'
        : '开始日期不能晚于结束日期'
      : '')
  return (
    <fieldset className="bui-date-range" disabled={disabled}>
      <legend>{label}</legend>
      <div>
        <DatePicker
          label={locale === 'en' ? 'Start date' : '开始日期'}
          value={value[0]}
          required={required}
          min={min}
          max={max}
          aria-invalid={!!problem || undefined}
          aria-describedby={problem || hint ? id : undefined}
          onChange={(event) => onChange([event.target.value, value[1]])}
        />
        <DatePicker
          label={locale === 'en' ? 'End date' : '结束日期'}
          value={value[1]}
          required={required}
          min={min}
          max={max}
          aria-invalid={!!problem || undefined}
          aria-describedby={problem || hint ? id : undefined}
          onChange={(event) => onChange([value[0], event.target.value])}
        />
      </div>
      {(problem || hint) && (
        <span id={id} className="bui-field__hint" role={problem ? 'alert' : undefined}>
          {problem || hint}
        </span>
      )}
    </fieldset>
  )
}

export interface NumberInputProps extends Omit<
  InputProps,
  'type' | 'value' | 'defaultValue' | 'onChange' | 'min' | 'max' | 'step'
> {
  value: number | null
  onChange: (value: number | null) => void
  min?: number
  max?: number
  step?: number | 'any'
  precision?: number
}
export function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 'any',
  precision,
  onBlur,
  disabled,
  readOnly,
  ...props
}: NumberInputProps) {
  const [draft, setDraft] = useState(value == null ? '' : String(value))
  useEffect(() => {
    setDraft(value == null || !Number.isFinite(value) ? '' : String(value))
  }, [value])
  return (
    <Input
      {...props}
      type="number"
      disabled={disabled}
      readOnly={readOnly}
      value={draft}
      min={min}
      max={max}
      step={step}
      onChange={(event) => {
        if (disabled || readOnly) return
        const raw = event.target.value
        setDraft(raw)
        if (raw === '') onChange(null)
        else {
          const next = Number(raw)
          if (Number.isFinite(next)) onChange(next)
        }
      }}
      onBlur={(event) => {
        if (!disabled && !readOnly && draft !== '' && Number.isFinite(Number(draft))) {
          let next = Number(draft)
          if (Number.isInteger(precision) && precision! >= 0 && precision! <= 15)
            next = Number(next.toFixed(precision))
          if (min != null) next = Math.max(min, next)
          if (max != null) next = Math.min(max, next)
          setDraft(String(next))
          if (next !== value) onChange(next)
        }
        onBlur?.(event)
      }}
    />
  )
}

export interface RadioGroupProps {
  label: string
  options: readonly SelectOption[]
  value: string
  onChange: (value: string) => void
  name?: string
  disabled?: boolean
  required?: boolean
  error?: string
}
export function RadioGroup({
  label,
  options,
  value,
  onChange,
  name,
  disabled,
  required,
  error,
}: RadioGroupProps) {
  const id = useId()
  return (
    <fieldset
      className="bui-radio-group"
      disabled={disabled}
      aria-describedby={error ? `${id}-error` : undefined}
    >
      <legend>{label}</legend>
      <div>
        {options.map((option) => (
          <label key={option.value} className="bui-check-label">
            <input
              type="radio"
              name={name ?? id}
              value={option.value}
              checked={value === option.value}
              disabled={disabled || option.disabled}
              required={required}
              aria-invalid={!!error || undefined}
              onChange={() => onChange(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
      {error && (
        <span id={`${id}-error`} className="bui-field__hint" role="alert">
          {error}
        </span>
      )}
    </fieldset>
  )
}
