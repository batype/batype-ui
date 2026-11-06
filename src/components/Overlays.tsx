import {
  useEffect,
  useId,
  useRef,
  useState,
  cloneElement,
  isValidElement,
  type ReactNode,
} from 'react'
import { Button } from './Button.js'
import { DetailModal } from './DetailModal.js'
import { Alert } from './Feedback.js'
import { useUI, type Tone } from '../provider.js'
export function Tooltip({ content, children }: { content: string; children: ReactNode }) {
  const id = useId()
  const trigger = isValidElement<{ 'aria-describedby'?: string }>(children) ? (
    cloneElement(children, {
      'aria-describedby': [children.props['aria-describedby'], id].filter(Boolean).join(' '),
    })
  ) : (
    <span tabIndex={0} aria-describedby={id}>
      {children}
    </span>
  )
  return (
    <span className="bui-tooltip">
      {trigger}
      <span className="bui-tooltip__content" role="tooltip" id={id}>
        {content}
      </span>
    </span>
  )
}

export interface DropdownItem {
  key: string
  label: string
  disabled?: boolean
  tone?: Tone
}
export function Dropdown({
  label,
  items,
  onSelect,
}: {
  label: string
  items: readonly DropdownItem[]
  onSelect: (key: string) => void
}) {
  const ref = useRef<HTMLDetailsElement>(null)
  useEffect(() => {
    const close = (event: Event) => {
      if (event instanceof KeyboardEvent && event.key === 'Escape') {
        ref.current?.removeAttribute('open')
        ref.current?.querySelector('summary')?.focus()
      } else if (event.type === 'pointerdown' && !ref.current?.contains(event.target as Node))
        ref.current?.removeAttribute('open')
    }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', close)
    }
  }, [])
  return (
    <details className="bui-dropdown" ref={ref}>
      <summary>
        {label}
        <span aria-hidden="true">⌄</span>
      </summary>
      <div className="bui-dropdown__content" role="group" aria-label={label}>
        {items.map((i) => (
          <button
            type="button"
            key={i.key}
            disabled={i.disabled}
            className={i.tone ? `bui-text-${i.tone}` : undefined}
            onClick={() => {
              onSelect(i.key)
              ref.current?.removeAttribute('open')
              ref.current?.querySelector('summary')?.focus()
            }}
          >
            {i.label}
          </button>
        ))}
      </div>
    </details>
  )
}
export interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  children?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  tone?: Tone
}
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmLabel,
  cancelLabel,
  tone = 'danger',
}: ConfirmDialogProps) {
  const { locale } = useUI(),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    active = useRef(true),
    lock = useRef(false),
    epoch = useRef(0)
  useEffect(() => {
    active.current = true
    return () => {
      active.current = false
    }
  }, [])
  useEffect(() => {
    epoch.current++
    setError('')
  }, [isOpen])
  const confirm = async () => {
    if (lock.current || !isOpen) return
    lock.current = true
    setBusy(true)
    setError('')
    const ticket = epoch.current
    try {
      await onConfirm()
      if (active.current && ticket === epoch.current) onClose()
    } catch (e) {
      if (active.current && ticket === epoch.current)
        setError(e instanceof Error ? e.message : locale === 'en' ? 'Action failed' : '操作失败')
    } finally {
      lock.current = false
      if (active.current) setBusy(false)
    }
  }
  return (
    <DetailModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      dismissible={!busy}
      footer={
        <>
          <Button tone="neutral" variant="soft" disabled={busy} onClick={onClose}>
            {cancelLabel || (locale === 'en' ? 'Cancel' : '取消')}
          </Button>
          <Button tone={tone} loading={busy} onClick={() => void confirm()}>
            {confirmLabel || (locale === 'en' ? 'Confirm' : '确认')}
          </Button>
        </>
      }
    >
      {children}
      {error && <Alert tone="danger">{error}</Alert>}
    </DetailModal>
  )
}
