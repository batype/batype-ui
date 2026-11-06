import { useEffect, useId, useRef, type ReactNode } from 'react'
import { useUI } from '../provider.js'
import { Button, ActionButton } from './Button.js'
import { Icon } from './Icon.js'
import { DescriptionList, type DetailField } from './DescriptionList.js'
import { Spinner, EmptyState } from './Feedback.js'
export interface DetailModalProps<T> {
  isOpen: boolean
  onClose: () => void
  title: ReactNode
  description?: string
  data?: T | null
  fields?: readonly DetailField<T>[]
  loading?: boolean
  children?: ReactNode
  extra?: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  dismissible?: boolean
}
/** 原生dialog负责模态、焦点约束及焦点恢复；不依赖业务Portal或全局DOM操作。 */
export function DetailModal<T>({
  isOpen,
  onClose,
  title,
  description,
  data,
  fields = [],
  loading,
  children,
  extra,
  footer,
  size = 'md',
  dismissible = true,
}: DetailModalProps<T>) {
  const dialog = useRef<HTMLDialogElement>(null),
    id = useId(),
    { messages } = useUI()
  useEffect(() => {
    const node = dialog.current
    if (!node) return
    if (isOpen && !node.open) node.showModal()
    if (!isOpen && node.open) node.close()
    return () => {
      if (node.open) node.close()
    }
  }, [isOpen])
  return (
    <dialog
      ref={dialog}
      className={`bui-modal bui-modal--${size}`}
      aria-labelledby={`${id}-title`}
      aria-describedby={description ? `${id}-desc` : undefined}
      aria-modal="true"
      onCancel={(event) => {
        event.preventDefault()
        if (dismissible) onClose()
      }}
      onClick={(event) => {
        if (!dismissible || event.target !== event.currentTarget) return
        const rect = event.currentTarget.getBoundingClientRect()
        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        )
          onClose()
      }}
    >
      <header className="bui-modal__header">
        <div>
          <h2 id={`${id}-title`}>{title}</h2>
          {description && <p id={`${id}-desc`}>{description}</p>}
        </div>
        {dismissible && (
          <ActionButton
            label={messages.close}
            icon={<Icon name="close" />}
            onClick={onClose}
            variant="ghost"
          />
        )}
      </header>
      <div className="bui-modal__body">
        {loading ? (
          <Spinner />
        ) : (
          (children ??
          (data ? (
            <>
              <DescriptionList data={data} fields={fields} />
              {extra}
            </>
          ) : (
            <EmptyState />
          )))
        )}
      </div>
      <footer className="bui-modal__footer">
        {footer ?? (
          <Button tone="neutral" variant="soft" onClick={onClose}>
            {messages.close}
          </Button>
        )}
      </footer>
    </dialog>
  )
}
