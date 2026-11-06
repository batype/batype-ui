import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cx, type Tone, type Size, useUI } from '../provider.js'
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: Tone
  variant?: 'solid' | 'soft' | 'outline' | 'ghost'
  size?: Size
  loading?: boolean
  startContent?: ReactNode
  endContent?: ReactNode
  fullWidth?: boolean
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    tone = 'primary',
    variant = 'solid',
    size = 'md',
    loading = false,
    disabled,
    startContent,
    endContent,
    fullWidth,
    children,
    className,
    type = 'button',
    ...props
  },
  ref,
) {
  const { messages } = useUI()
  return (
    <button
      {...props}
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(
        'bui-button',
        `bui-tone-${tone}`,
        `bui-button--${variant}`,
        `bui-button--${size}`,
        fullWidth && 'bui-button--full',
        className,
      )}
    >
      {loading ? <span className="bui-spinner" aria-hidden="true" /> : startContent}
      {children ?? (loading ? messages.loading : null)}
      {endContent}
    </button>
  )
})
export interface ActionButtonProps extends Omit<ButtonProps, 'children' | 'aria-label'> {
  label: string
  icon: ReactNode
}
/** 仅负责UI：删除/编辑权限必须由调用方判断。 */
export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(function ActionButton(
  { label, icon, className, variant = 'soft', size = 'sm', tone = 'neutral', ...props },
  ref,
) {
  return (
    <Button
      {...props}
      ref={ref}
      variant={variant}
      size={size}
      tone={tone}
      className={cx('bui-action', className)}
      aria-label={label}
      title={label}
    >
      {icon}
    </Button>
  )
})
