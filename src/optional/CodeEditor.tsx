import { useEffect, useRef, useState } from 'react'
import type { EditorView } from '@codemirror/view'
import type { Compartment, Extension } from '@codemirror/state'
import { useResolvedTheme } from '../provider.js'
import { Alert, Spinner } from '../components/Feedback.js'
const EMPTY_EXTENSIONS: readonly Extension[] = []
export interface CodeEditorProps {
  value: string
  onChange?: (value: string) => void
  label: string
  language?: 'text' | 'javascript' | 'typescript' | 'json'
  readOnly?: boolean
  height?: number
  extensions?: readonly Extension[]
  onError?: (error: unknown) => void
}
async function languageSupport(language: CodeEditorProps['language']): Promise<Extension> {
  if (language === 'javascript' || language === 'typescript') {
    const { javascript } = await import('@codemirror/lang-javascript')
    return javascript({ typescript: language === 'typescript' })
  }
  if (language === 'json') {
    const { json } = await import('@codemirror/lang-json')
    return json()
  }
  return []
}
export function CodeEditor(props: CodeEditorProps) {
  const {
    value,
    label,
    language = 'text',
    readOnly = false,
    height = 260,
    extensions = EMPTY_EXTENSIONS,
  } = props
  const theme = useResolvedTheme(),
    host = useRef<HTMLDivElement>(null),
    view = useRef<EditorView | null>(null),
    config = useRef<Compartment | null>(null),
    lang = useRef<Compartment | null>(null),
    latest = useRef(props),
    suppress = useRef(false),
    [ready, setReady] = useState(false),
    [error, setError] = useState('')
  latest.current = props
  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const [
          { EditorState, Compartment },
          { EditorView, keymap, lineNumbers },
          { defaultKeymap, history, historyKeymap },
        ] = await Promise.all([
          import('@codemirror/state'),
          import('@codemirror/view'),
          import('@codemirror/commands'),
        ])
        if (cancelled || !host.current) return
        config.current = new Compartment()
        lang.current = new Compartment()
        const support = await languageSupport(latest.current.language)
        if (cancelled || !host.current) return
        view.current = new EditorView({
          parent: host.current,
          state: EditorState.create({
            doc: latest.current.value,
            extensions: [
              lineNumbers(),
              history(),
              keymap.of([...defaultKeymap, ...historyKeymap]),
              EditorView.lineWrapping,
              EditorView.contentAttributes.of({ 'aria-label': latest.current.label }),
              config.current.of([
                EditorState.readOnly.of(!!latest.current.readOnly),
                EditorView.editable.of(!latest.current.readOnly),
              ]),
              lang.current.of(support),
              EditorView.updateListener.of((update) => {
                if (update.docChanged && !suppress.current)
                  latest.current.onChange?.(update.state.doc.toString())
              }),
            ],
          }),
        })
        setReady(true)
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : '编辑器加载失败')
          latest.current.onError?.(e)
        }
      }
    })()
    return () => {
      cancelled = true
      view.current?.destroy()
      view.current = null
    }
  }, [])
  useEffect(() => {
    const editor = view.current
    if (!editor || editor.state.doc.toString() === value) return
    suppress.current = true
    try {
      editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: value } })
    } finally {
      suppress.current = false
    }
  }, [ready, value])
  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        if (!view.current || !config.current || !lang.current) return
        const [{ EditorState }, { EditorView }, support] = await Promise.all([
          import('@codemirror/state'),
          import('@codemirror/view'),
          languageSupport(language),
        ])
        if (cancelled || !view.current) return
        view.current.dispatch({
          effects: [
            config.current.reconfigure([
              EditorState.readOnly.of(readOnly),
              EditorView.editable.of(!readOnly),
              EditorView.theme(
                {
                  '&': {
                    color: 'var(--bui-text)',
                    backgroundColor: 'var(--bui-surface)',
                    height: '100%',
                  },
                  '.cm-content': { fontFamily: 'ui-monospace,monospace', fontSize: '13px' },
                  '.cm-gutters': {
                    backgroundColor: 'var(--bui-subtle)',
                    color: 'var(--bui-muted)',
                    borderRight: '1px solid var(--bui-border)',
                  },
                  '.cm-scroller': { overflow: 'auto' },
                  '.cm-cursor': { borderLeftColor: 'var(--bui-text)' },
                },
                { dark: theme === 'dark' },
              ),
              ...extensions,
            ]),
            lang.current.reconfigure(support),
          ],
        })
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : '编辑器配置失败')
          latest.current.onError?.(e)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [ready, readOnly, language, theme, extensions])
  useEffect(() => {
    view.current?.contentDOM.setAttribute('aria-label', label)
  }, [ready, label])
  return (
    <div className="bui-code-editor">
      <span className="bui-editor-label">{label}</span>
      {error ? <Alert tone="danger">{error}</Alert> : !ready && <Spinner label="加载代码编辑器" />}
      <div ref={host} style={{ height }} />
    </div>
  )
}
