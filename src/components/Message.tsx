import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { type Tone, useUI } from '../provider.js'
import { ActionButton } from './Button.js'
import { Icon } from './Icon.js'

export interface MessageOptions {
  content: ReactNode
  tone?: Tone
  loading?: boolean
  duration?: number
  closable?: boolean
}
export interface MessageAPI {
  show: (options: MessageOptions) => string
  success: (content: ReactNode, duration?: number) => string
  error: (content: ReactNode, duration?: number) => string
  warning: (content: ReactNode, duration?: number) => string
  loading: (content: ReactNode) => string
  update: (id: string, patch: Partial<MessageOptions>) => void
  close: (id: string) => void
  clear: () => void
}
export interface MessageProviderProps {
  children: ReactNode
  duration?: number
  maxCount?: number
  position?: 'top-right' | 'top-center' | 'bottom-right'
}
type Entry = MessageOptions & { id: string; revision: number }
const Context = createContext<MessageAPI | null>(null)

function MessageItem({
  entry,
  defaultDuration,
  close,
}: {
  entry: Entry
  defaultDuration: number
  close: (id: string) => void
}) {
  const { messages } = useUI()
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const remaining = useRef(0)
  const duration = entry.loading ? 0 : (entry.duration ?? defaultDuration)
  useEffect(() => {
    remaining.current = Math.max(0, Number.isFinite(duration) ? duration : 0)
  }, [duration, entry.revision])
  useEffect(() => {
    if (hovered || focused || duration <= 0 || !Number.isFinite(duration)) return
    const started = Date.now()
    const timer = setTimeout(() => close(entry.id), remaining.current)
    return () => {
      clearTimeout(timer)
      remaining.current = Math.max(0, remaining.current - (Date.now() - started))
    }
  }, [hovered, focused, duration, entry.revision, entry.id, close])
  return (
    <div
      className={`bui-message bui-tone-${entry.tone ?? 'primary'}`}
      role={entry.tone === 'danger' ? 'alert' : 'status'}
      aria-atomic="true"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false)
      }}
    >
      {entry.loading && <span className="bui-spinner" aria-hidden="true" />}
      <div>{entry.content}</div>
      {entry.closable !== false && (
        <ActionButton
          label={messages.close}
          icon={<Icon name="close" />}
          variant="ghost"
          onClick={() => close(entry.id)}
        />
      )}
    </div>
  )
}

export function MessageProvider({
  children,
  duration = 4000,
  maxCount = 5,
  position = 'top-right',
}: MessageProviderProps) {
  const [entries, setEntries] = useState<Entry[]>([])
  const prefix = useId(),
    sequence = useRef(0)
  const limit = Math.max(1, Number.isFinite(maxCount) ? Math.floor(maxCount) : 5)
  useEffect(() => setEntries((items) => items.slice(-limit)), [limit])
  const close = useCallback(
    (id: string) => setEntries((items) => items.filter((item) => item.id !== id)),
    [],
  )
  const show = useCallback(
    (options: MessageOptions) => {
      const id = `${prefix}-${++sequence.current}`
      setEntries((items) => [...items, { ...options, id, revision: 0 }].slice(-limit))
      return id
    },
    [prefix, limit],
  )
  const api = useMemo<MessageAPI>(
    () => ({
      show,
      success: (content, duration) => show({ content, tone: 'success', duration }),
      error: (content, duration) => show({ content, tone: 'danger', duration }),
      warning: (content, duration) => show({ content, tone: 'warning', duration }),
      loading: (content) => show({ content, loading: true }),
      update: (id, patch) =>
        setEntries((items) =>
          items.map((item) =>
            item.id === id ? { ...item, ...patch, revision: item.revision + 1 } : item,
          ),
        ),
      close,
      clear: () => setEntries([]),
    }),
    [show, close],
  )
  return (
    <Context.Provider value={api}>
      {children}
      <div className={`bui-messages bui-messages--${position}`}>
        {entries.slice(-limit).map((entry) => (
          <MessageItem key={entry.id} entry={entry} defaultDuration={duration} close={close} />
        ))}
      </div>
    </Context.Provider>
  )
}

export function useMessage(): MessageAPI {
  const context = useContext(Context)
  if (!context) throw new Error('useMessage requires MessageProvider inside UIProvider')
  return context
}
