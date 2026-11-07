import {
  createContext,
  useCallback,
  useContext,
  useId,
  useRef,
  useState,
  useEffect,
  type FormHTMLAttributes,
  type ReactNode,
} from 'react'
import { useUI } from '../provider.js'

export type FormValues = Record<string, unknown>
export type FormErrors = Record<string, string>
export type FieldValidator = (
  value: unknown,
  values: FormValues,
) => string | undefined | Promise<string | undefined>
export interface FormController<T extends object = FormValues> {
  values: T
  errors: FormErrors
  submitting: boolean
  disabled: boolean
  setFieldValue: (name: keyof T & string, value: unknown) => void
  reset: () => void
}
type Internal = FormController & {
  register: (name: string, validate: FieldValidator) => () => void
  validateField: (name: string) => void
}
const Context = createContext<Internal | null>(null)
function useInternal() {
  const context = useContext(Context)
  if (!context) throw new Error('FormField and FormList require Form')
  return context
}
export function useFormContext<T extends object = FormValues>(): FormController<T> {
  return useInternal() as unknown as FormController<T>
}
export interface FormProps<T extends object> extends Omit<
  FormHTMLAttributes<HTMLFormElement>,
  'onSubmit' | 'children' | 'onChange'
> {
  initialValues: T
  children: ReactNode | ((form: FormController<T>) => ReactNode)
  onFinish: (values: T) => void | Promise<unknown>
  onValuesChange?: (values: T) => void
  validate?: (values: T) => FormErrors | Promise<FormErrors>
  onFinishFailed?: (errors: FormErrors) => void
  onSubmitError?: (error: unknown) => void
  disabled?: boolean
}
export function Form<T extends object>({
  initialValues,
  children,
  onFinish,
  onValuesChange,
  validate,
  onFinishFailed,
  onSubmitError,
  disabled = false,
  className = '',
  onReset,
  ...props
}: FormProps<T>) {
  const [values, setValues] = useState<T>(() => ({ ...initialValues }))
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const initial = useRef(initialValues),
    current = useRef(values),
    version = useRef(0),
    busy = useRef(false)
  const mounted = useRef(true),
    element = useRef<HTMLFormElement>(null)
  const validators = useRef(new Map<string, FieldValidator>())
  const change = useRef(onValuesChange),
    disabledRef = useRef(disabled)
  const { locale } = useUI()
  change.current = onValuesChange
  disabledRef.current = disabled
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      version.current++
    }
  }, [])
  const setFieldValue = useCallback((name: string, value: unknown) => {
    if (disabledRef.current || busy.current) return
    const next = { ...current.current, [name]: value }
    current.current = next
    version.current++
    setValues(next)
    setErrors((old) => {
      const next = { ...old }
      delete next[name]
      return next
    })
    setSubmitError('')
    change.current?.(next)
  }, [])
  const reset = useCallback(() => {
    if (busy.current || disabledRef.current) return
    const next = { ...initial.current }
    current.current = next
    version.current++
    setValues(next)
    setErrors({})
    setSubmitError('')
    change.current?.(next)
  }, [])
  const register = useCallback((name: string, validator: FieldValidator) => {
    if (validators.current.has(name)) throw new Error(`Duplicate FormField: ${name}`)
    validators.current.set(name, validator)
    return () => {
      validators.current.delete(name)
    }
  }, [])
  const validateField = useCallback(async (name: string) => {
    const stamp = version.current,
      validator = validators.current.get(name)
    try {
      const error = await validator?.(
        (current.current as FormValues)[name],
        current.current as FormValues,
      )
      if (!mounted.current || stamp !== version.current || !validators.current.has(name)) return
      setErrors((old) => {
        const next = { ...old }
        if (error) next[name] = error
        else delete next[name]
        return next
      })
    } catch {
      /* Submission reports validator failures through onSubmitError. */
    }
  }, [])
  const state = {
    values,
    errors,
    submitting,
    disabled: disabled || submitting,
    setFieldValue,
    reset,
  }
  return (
    <Context.Provider value={{ ...state, values: values as FormValues, register, validateField }}>
      <form
        {...props}
        ref={element}
        className={`bui-form ${className}`}
        noValidate
        aria-busy={submitting || undefined}
        onReset={(event) => {
          onReset?.(event)
          if (!event.defaultPrevented) {
            event.preventDefault()
            reset()
          }
        }}
        onSubmit={async (event) => {
          event.preventDefault()
          if (disabled || busy.current) return
          busy.current = true
          setSubmitting(true)
          setSubmitError('')
          const snapshot = current.current,
            stamp = version.current
          try {
            const next: FormErrors = { ...(await validate?.(snapshot)) }
            for (const [name, validator] of validators.current) {
              const error = await validator((snapshot as FormValues)[name], snapshot as FormValues)
              if (error) next[name] = error
            }
            if (!mounted.current || disabledRef.current || stamp !== version.current) return
            setErrors(next)
            if (Object.values(next).some(Boolean)) {
              onFinishFailed?.(next)
              requestAnimationFrame(() => {
                if (mounted.current)
                  element.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
              })
              return
            }
            await onFinish(snapshot)
          } catch (error) {
            if (mounted.current) {
              setSubmitError(
                error instanceof Error
                  ? error.message
                  : locale === 'en'
                    ? 'Submission failed'
                    : '提交失败，请重试',
              )
              onSubmitError?.(error)
            }
          } finally {
            busy.current = false
            if (mounted.current) setSubmitting(false)
          }
        }}
      >
        <fieldset className="bui-form__fields" disabled={state.disabled}>
          {typeof children === 'function' ? children(state) : children}
        </fieldset>
        {submitError && (
          <p className="bui-field__hint" role="alert">
            {submitError}
          </p>
        )}
      </form>
    </Context.Provider>
  )
}

export interface FormFieldControl {
  id: string
  value: unknown
  onChange: (value: unknown) => void
  onBlur: () => void
  disabled: boolean
  'aria-invalid'?: true
  'aria-describedby'?: string
}
export interface FormFieldProps {
  name: string
  label: ReactNode
  required?: boolean
  requiredMessage?: string
  hint?: ReactNode
  validate?: FieldValidator
  children: (control: FormFieldControl) => ReactNode
}
export function FormField({
  name,
  label,
  required,
  requiredMessage,
  hint,
  validate,
  children,
}: FormFieldProps) {
  const form = useInternal(),
    id = useId(),
    latest = useRef({ required, requiredMessage, validate })
  const { locale } = useUI()
  latest.current = { required, requiredMessage, validate }
  const { register } = form
  useEffect(
    () =>
      register(name, (value, values) => {
        const rule = latest.current
        if (
          rule.required &&
          (value == null ||
            value === false ||
            (typeof value === 'string' && !value.trim()) ||
            (Array.isArray(value) && value.length === 0))
        )
          return (
            rule.requiredMessage || (locale === 'en' ? 'This field is required' : '此项为必填项')
          )
        return rule.validate?.(value, values)
      }),
    [name, register, locale],
  )
  const error = form.errors[name]
  return (
    <div className={`bui-field${error ? ' bui-field--error' : ''}`}>
      <label htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {children({
        id,
        value: form.values[name],
        onChange: (value) => form.setFieldValue(name, value),
        onBlur: () => form.validateField(name),
        disabled: form.disabled,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': error || hint ? `${id}-hint` : undefined,
      })}
      {(error || hint) && (
        <span id={`${id}-hint`} className="bui-field__hint" role={error ? 'alert' : undefined}>
          {error || hint}
        </span>
      )}
    </div>
  )
}

export interface FormListItem<T> {
  key: string
  index: number
  value: T
}
export interface FormListActions<T> {
  add: (value: T) => void
  remove: (index: number) => void
  update: (index: number, value: T) => void
  move: (from: number, to: number) => void
  disabled: boolean
}
export interface FormListProps<T> {
  name: string
  children: (items: readonly FormListItem<T>[], actions: FormListActions<T>) => ReactNode
}
export function FormList<T>({ name, children }: FormListProps<T>) {
  const form = useInternal(),
    prefix = useId(),
    sequence = useRef(0),
    keys = useRef<string[]>([])
  const values = (Array.isArray(form.values[name]) ? form.values[name] : []) as T[]
  while (keys.current.length < values.length) keys.current.push(`${prefix}-${++sequence.current}`)
  keys.current.length = values.length
  const valid = (index: number) => Number.isInteger(index) && index >= 0 && index < values.length
  return (
    <div className="bui-form-list">
      {children(
        values.map((value, index) => ({ key: keys.current[index]!, index, value })),
        {
          disabled: form.disabled,
          add: (value) => {
            if (form.disabled) return
            keys.current.push(`${prefix}-${++sequence.current}`)
            form.setFieldValue(name, [...values, value])
          },
          remove: (index) => {
            if (form.disabled || !valid(index)) return
            keys.current.splice(index, 1)
            form.setFieldValue(
              name,
              values.filter((_, i) => i !== index),
            )
          },
          update: (index, value) => {
            if (form.disabled || !valid(index)) return
            form.setFieldValue(
              name,
              values.map((item, i) => (i === index ? value : item)),
            )
          },
          move: (from, to) => {
            if (form.disabled || !valid(from) || !valid(to)) return
            const next = [...values]
            const [item] = next.splice(from, 1)
            next.splice(to, 0, item!)
            const [key] = keys.current.splice(from, 1)
            keys.current.splice(to, 0, key!)
            form.setFieldValue(name, next)
          },
        },
      )}
    </div>
  )
}
