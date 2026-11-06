import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
} from 'react'
import { cx } from '../provider.js'
export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  hint?: string
  error?: string
  options: readonly { value: string; label: string; disabled?: boolean }[]
}
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, options, id, className, ...props },
  ref,
) {
  const uid = useId(),
    key = id || uid
  return (
    <div className={cx('bui-field', !!error && 'bui-field--error', className)}>
      <label htmlFor={key}>{label}</label>
      <select
        {...props}
        id={key}
        ref={ref}
        className="bui-select"
        aria-invalid={!!error || props['aria-invalid'] || undefined}
        aria-describedby={
          [props['aria-describedby'], error || hint ? `${key}-hint` : null]
            .filter(Boolean)
            .join(' ') || undefined
        }
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
      </select>
      {(error || hint) && (
        <span id={`${key}-hint`} className="bui-field__hint">
          {error || hint}
        </span>
      )}
    </div>
  )
})
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  hint?: string
  error?: string
}
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, id, className, ...props },
  ref,
) {
  const uid = useId(),
    key = id || uid
  return (
    <div className={cx('bui-field', !!error && 'bui-field--error', className)}>
      <label htmlFor={key}>{label}</label>
      <textarea
        rows={4}
        {...props}
        id={key}
        ref={ref}
        className="bui-textarea"
        aria-invalid={!!error || props['aria-invalid'] || undefined}
        aria-describedby={
          [props['aria-describedby'], error || hint ? `${key}-hint` : null]
            .filter(Boolean)
            .join(' ') || undefined
        }
      />
      {(error || hint) && (
        <span id={`${key}-hint`} className="bui-field__hint">
          {error || hint}
        </span>
      )}
    </div>
  )
})
export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode
}
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, className, ...props },
  ref,
) {
  return (
    <label className={cx('bui-check-label', className)}>
      <input {...props} ref={ref} type="checkbox" className="bui-checkbox" />
      <span>{label}</span>
    </label>
  )
})
export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'role'> {
  label: ReactNode
}
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { label, className, ...props },
  ref,
) {
  return (
    <label className={cx('bui-check-label', className)}>
      <input {...props} ref={ref} type="checkbox" role="switch" className="bui-switch" />
      <span>{label}</span>
    </label>
  )
})
