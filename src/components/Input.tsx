import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { cx, useUI } from '../provider.js'
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: ReactNode
  error?: ReactNode
  startContent?: ReactNode
  endContent?: ReactNode
}
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    hint,
    error,
    id,
    className,
    startContent,
    endContent,
    'aria-describedby': described,
    ...props
  },
  ref,
) {
  const generated = useId(),
    inputId = id || generated
  const descriptionId = hint || error ? `${inputId}-description` : undefined
  return (
    <div className={cx('bui-field', !!error && 'bui-field--error', className)}>
      <label htmlFor={inputId}>
        {label}
        {props.required && <span aria-hidden="true"> *</span>}
      </label>
      <div className="bui-field__control">
        {startContent}
        <input
          {...props}
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : props['aria-invalid']}
          aria-describedby={[described, descriptionId].filter(Boolean).join(' ') || undefined}
        />
        {endContent}
      </div>
      {descriptionId && (
        <span id={descriptionId} className="bui-field__hint" role={error ? 'alert' : undefined}>
          {error || hint}
        </span>
      )}
    </div>
  )
})
export const PasswordInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type' | 'endContent'>>(
  function PasswordInput(props, ref) {
    const [visible, setVisible] = useState(false),
      { messages } = useUI()
    return (
      <Input
        {...props}
        ref={ref}
        type={visible ? 'text' : 'password'}
        endContent={
          <button
            type="button"
            className="bui-password-toggle"
            disabled={props.disabled}
            aria-label={visible ? messages.hidePassword : messages.showPassword}
            aria-pressed={visible}
            onClick={() => setVisible((v) => !v)}
          >
            {visible ? messages.hidePassword : messages.showPassword}
          </button>
        }
      />
    )
  },
)
