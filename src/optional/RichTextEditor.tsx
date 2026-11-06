import { useEffect, useRef, useState } from 'react'
import type { IDomEditor, IToolbarConfig } from '@wangeditor/editor'
import { Alert, Spinner } from '../components/Feedback.js'
import { safeMediaSrc } from '../components/Media.js'
export interface RichTextEditorProps {
  value: string
  onChange?: (html: string) => void
  label: string
  placeholder?: string
  readOnly?: boolean
  height?: number
  uploadImage?: (file: File) => Promise<string>
  onError?: (error: unknown) => void
  toolbarKeys?: string[]
}
export function RichTextEditor(props: RichTextEditorProps) {
  const { value, label, readOnly = false, height = 300 } = props,
    host = useRef<HTMLDivElement>(null),
    toolbar = useRef<HTMLDivElement>(null),
    editor = useRef<IDomEditor | null>(null),
    latest = useRef(props),
    suppress = useRef(false),
    last = useRef(value),
    [ready, setReady] = useState(false),
    [error, setError] = useState('')
  latest.current = props
  useEffect(() => {
    let cancelled = false
    let toolbarInstance:
      ReturnType<(typeof import('@wangeditor/editor'))['createToolbar']> | undefined
    void (async () => {
      try {
        const { createEditor, createToolbar } = await import('@wangeditor/editor')
        if (cancelled || !host.current || !toolbar.current) return
        suppress.current = true
        const current = latest.current
        const instance = createEditor({
          selector: host.current,
          html: current.value,
          config: {
            placeholder: current.placeholder || '请输入内容…',
            readOnly: !!current.readOnly,
            onChange: (instance) => {
              const html = instance.getHtml()
              if (!suppress.current && html !== last.current) {
                last.current = html
                latest.current.onChange?.(html)
              }
            },
            MENU_CONF: current.uploadImage
              ? {
                  uploadImage: {
                    customUpload: async (
                      file: File,
                      insert: (url: string, alt: string, href: string) => void,
                    ) => {
                      try {
                        const url = await latest.current.uploadImage!(file)
                        if (!safeMediaSrc(url)) throw new Error('图片URL无效')
                        if (!cancelled) insert(url, file.name, '')
                      } catch (e) {
                        latest.current.onError?.(e)
                        throw e
                      }
                    },
                  },
                }
              : {},
          },
          mode: 'simple',
        })
        editor.current = instance
        const config: Partial<IToolbarConfig> = {
          excludeKeys: [
            'group-video',
            'fullScreen',
            ...(!current.uploadImage ? ['uploadImage', 'group-image'] : []),
          ],
        }
        if (current.toolbarKeys) config.toolbarKeys = current.toolbarKeys
        toolbarInstance = createToolbar({
          editor: instance,
          selector: toolbar.current,
          config,
          mode: 'simple',
        })
        const editable = instance.getEditableContainer().querySelector('[data-slate-editor]')
        editable?.setAttribute('role', 'textbox')
        editable?.setAttribute('aria-multiline', 'true')
        editable?.setAttribute('aria-label', current.label)
        for (const button of toolbar.current.querySelectorAll('button[data-tooltip]')) {
          button.setAttribute('aria-label', button.getAttribute('data-tooltip') || 'Editor action')
        }
        last.current = instance.getHtml()
        suppress.current = false
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
      toolbarInstance?.destroy()
      editor.current?.destroy()
      editor.current = null
    }
  }, [])
  useEffect(() => {
    const instance = editor.current
    if (!instance || value === last.current || value === instance.getHtml()) return
    suppress.current = true
    try {
      instance.setHtml(value)
      last.current = instance.getHtml()
    } finally {
      suppress.current = false
    }
  }, [ready, value])
  useEffect(() => {
    if (!editor.current) return
    if (readOnly) editor.current.disable()
    else editor.current.enable()
  }, [ready, readOnly])
  useEffect(() => {
    editor.current
      ?.getEditableContainer()
      .querySelector('[data-slate-editor]')
      ?.setAttribute('aria-label', label)
  }, [ready, label])
  return (
    <div className="bui-rich-editor">
      <span className="bui-editor-label">{label}</span>
      {error ? (
        <Alert tone="danger">{error}</Alert>
      ) : (
        !ready && <Spinner label="加载富文本编辑器" />
      )}
      <div className="bui-rich-editor__frame">
        <div ref={toolbar} />
        <div ref={host} style={{ height, overflowY: 'auto' }} />
      </div>
    </div>
  )
}
