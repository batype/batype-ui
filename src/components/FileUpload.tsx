import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Button } from './Button.js'
import { ImagePreview, VideoPlayer, safeMediaSrc } from './Media.js'
export interface UploadItem {
  id: string
  name: string
  status: 'selected' | 'processing' | 'uploading' | 'done' | 'error'
  progress?: number
  url?: string
  error?: string
  file?: File
}
export interface FileUploadProps {
  label: string
  files: readonly UploadItem[]
  onChange: (files: UploadItem[]) => void
  upload?: (
    file: File,
    options: { signal: AbortSignal; onProgress: (progress: number) => void },
  ) => Promise<{ url: string }>
  beforeUpload?: (
    file: File,
    options: { signal: AbortSignal },
  ) => File | null | Promise<File | null>
  accept?: string
  maxCount?: number
  maxSize?: number
  disabled?: boolean
  onError?: (message: string) => void
  hint?: ReactNode
}
export function matchesAccept(file: File, accept: string): boolean {
  return (
    !accept.trim() ||
    accept.split(',').some((raw) => {
      const type = raw.trim().toLowerCase()
      return type.startsWith('.')
        ? file.name.toLowerCase().endsWith(type)
        : type.endsWith('/*')
          ? file.type.toLowerCase().startsWith(type.slice(0, -1))
          : file.type.toLowerCase() === type
    })
  )
}
let sequence = 0
export function FileUpload({
  label,
  files,
  onChange,
  upload,
  beforeUpload,
  accept = '',
  maxCount = 5,
  maxSize = 10 * 1024 * 1024,
  disabled,
  onError,
  hint,
}: FileUploadProps) {
  const id = useId(),
    current = useRef(files),
    change = useRef(onChange),
    controllers = useRef(new Map<string, AbortController>()),
    mounted = useRef(true),
    [error, setError] = useState('')
  current.current = files
  change.current = onChange
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      for (const controller of controllers.current.values()) controller.abort()
    }
  }, [])
  const publish = (next: UploadItem[]) => {
    if (mounted.current) {
      current.current = next
      change.current(next)
    }
  }
  const update = (key: string, values: Partial<UploadItem>) => {
    if (!current.current.some((f) => f.id === key)) return
    publish(current.current.map((f) => (f.id === key ? { ...f, ...values } : f)))
  }
  const reject = (message: string) => {
    setError(message)
    onError?.(message)
  }
  const choose = async (selected: File[]) => {
    if (disabled) return
    setError('')
    const added: UploadItem[] = []
    for (const file of selected) {
      if (current.current.length + added.length >= maxCount) {
        reject(`最多选择 ${maxCount} 个文件`)
        break
      }
      if (file.size > maxSize) {
        reject(`${file.name} 超过大小限制`)
        continue
      }
      if (!matchesAccept(file, accept)) {
        reject(`${file.name} 格式不支持`)
        continue
      }
      added.push({
        id: `file-${Date.now()}-${++sequence}`,
        name: file.name,
        file,
        status: beforeUpload ? 'processing' : upload ? 'uploading' : 'selected',
        progress: 0,
      })
    }
    publish([...current.current, ...added])
    if (!upload && !beforeUpload) return
    await Promise.all(
      added.map(async (item) => {
        const controller = new AbortController()
        controllers.current.set(item.id, controller)
        try {
          const prepared = beforeUpload
            ? await beforeUpload(item.file!, { signal: controller.signal })
            : item.file!
          if (controller.signal.aborted || !mounted.current) return
          if (!prepared) {
            publish(current.current.filter((file) => file.id !== item.id))
            return
          }
          if (
            !(prepared instanceof File) ||
            prepared.size > maxSize ||
            !matchesAccept(prepared, accept)
          )
            throw new Error('处理后的文件格式或大小不符合要求')
          update(item.id, {
            file: prepared,
            name: prepared.name,
            status: upload ? 'uploading' : 'selected',
          })
          if (!upload) return
          const result = await upload(prepared, {
            signal: controller.signal,
            onProgress: (progress) => {
              if (!controller.signal.aborted)
                update(item.id, {
                  progress: Math.max(0, Math.min(100, Number.isFinite(progress) ? progress : 0)),
                })
            },
          })
          if (!controller.signal.aborted) {
            if (!safeMediaSrc(result.url)) throw new Error('上传结果URL无效')
            update(item.id, { status: 'done', url: result.url, progress: 100 })
          }
        } catch (e) {
          if (!controller.signal.aborted) {
            const message = e instanceof Error ? e.message : '上传失败'
            update(item.id, { status: 'error', error: message })
            onError?.(message)
          }
        } finally {
          controllers.current.delete(item.id)
        }
      }),
    )
  }
  return (
    <div className="bui-file-upload">
      <label
        className="bui-file-upload__drop"
        htmlFor={id}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          void choose(Array.from(e.dataTransfer.files))
        }}
      >
        <strong>{label}</strong>
        <span>点击选择或将文件拖入这里</span>
        <input
          id={id}
          aria-label={label}
          type="file"
          accept={accept}
          multiple={maxCount > 1}
          disabled={disabled || files.length >= maxCount}
          onChange={(e) => {
            void choose(Array.from(e.target.files || []))
            e.target.value = ''
          }}
        />
      </label>
      {hint && <p className="bui-upload-hint">{hint}</p>}
      {error && <p role="alert">{error}</p>}
      <ul>
        {files.map((file) => (
          <li key={file.id}>
            <span>
              {file.name}
              <small>
                {file.status === 'processing'
                  ? '处理中'
                  : file.status === 'uploading'
                    ? `上传中 ${file.progress || 0}%`
                    : file.status === 'done'
                      ? '已完成'
                      : file.status === 'error'
                        ? file.error
                        : '已选择'}
              </small>
            </span>
            <Button
              size="sm"
              tone="neutral"
              variant="ghost"
              disabled={disabled}
              aria-label={`移除 ${file.name}`}
              onClick={() => {
                controllers.current.get(file.id)?.abort()
                publish(current.current.filter((f) => f.id !== file.id))
              }}
            >
              移除
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
export function ImageUpload(props: Omit<FileUploadProps, 'accept'>) {
  return (
    <div className="bui-image-upload">
      <FileUpload {...props} accept="image/*" />
      <div className="bui-upload-previews">
        {props.files
          .filter((f) => f.url)
          .map((file) => (
            <ImagePreview key={file.id} src={file.url!} alt={file.name} />
          ))}
      </div>
    </div>
  )
}
export function VideoUpload(props: Omit<FileUploadProps, 'accept' | 'maxCount'>) {
  const video = props.files.find((f) => f.url)
  return (
    <div>
      <FileUpload {...props} accept="video/*" maxCount={1} />
      {video && <VideoPlayer src={video.url!} label={video.name} />}
    </div>
  )
}
