import { useEffect, useRef, useState } from 'react'
import { useUI } from '../provider.js'
import { ActionButton, type ActionButtonProps } from './Button.js'
import { Icon } from './Icon.js'
export interface CopyButtonProps extends Omit<
  ActionButtonProps,
  'label' | 'icon' | 'onClick' | 'loading'
> {
  value: string
  copy?: (text: string) => Promise<void>
  onCopied?: () => void
  onCopyError?: (error: unknown) => void
  label?: string
}
export function CopyButton({
  value,
  copy,
  onCopied,
  onCopyError,
  label,
  ...props
}: CopyButtonProps) {
  const { messages } = useUI(),
    [state, setState] = useState<'idle' | 'copying' | 'copied' | 'error'>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined),
    mounted = useRef(true),
    busy = useRef(false)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      clearTimeout(timer.current)
    }
  }, [])
  const handleCopy = async () => {
    if (busy.current) return
    busy.current = true
    setState('copying')
    try {
      if (copy) await copy(value)
      else {
        if (!globalThis.navigator?.clipboard?.writeText)
          throw new Error('Clipboard API unavailable. Supply the copy adapter or use HTTPS.')
        await navigator.clipboard.writeText(value)
      }
      if (mounted.current) {
        setState('copied')
        onCopied?.()
      }
    } catch (error) {
      if (mounted.current) {
        setState('error')
        onCopyError?.(error)
      }
    } finally {
      busy.current = false
      if (mounted.current) {
        clearTimeout(timer.current)
        timer.current = setTimeout(() => setState('idle'), 2000)
      }
    }
  }
  return (
    <span className="bui-copy">
      <ActionButton
        {...props}
        label={state === 'copied' ? messages.copied : (label ?? messages.copy)}
        loading={state === 'copying'}
        icon={<Icon name={state === 'copied' ? 'check' : 'copy'} />}
        onClick={() => void handleCopy()}
      />
      <span className="bui-sr-only" role="status">
        {state === 'copied' ? messages.copied : state === 'error' ? messages.copyFailed : ''}
      </span>
    </span>
  )
}
