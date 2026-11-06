import { useEffect, useState, type ImgHTMLAttributes, type VideoHTMLAttributes } from 'react'
import { DetailModal } from './DetailModal.js'
export function safeMediaSrc(value: string): string | undefined {
  try {
    if (!value.trim()) return undefined
    const url = new URL(value, 'https://ui.example/')
    if (['http:', 'https:', 'blob:'].includes(url.protocol)) return value
    if (/^data:(image\/(?:png|jpeg|gif|webp|avif)|video\/(?:mp4|webm));base64,/i.test(value))
      return value
    return undefined
  } catch {
    return undefined
  }
}
export function ImagePreview({
  src,
  alt,
  preview = true,
  className,
  ...props
}: Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> & {
  src: string
  alt: string
  preview?: boolean
}) {
  const [open, setOpen] = useState(false),
    [failed, setFailed] = useState(false),
    safe = safeMediaSrc(src)
  useEffect(() => {
    setFailed(false)
    setOpen(false)
  }, [src])
  const image =
    !safe || failed ? (
      <span className="bui-media-fallback">图片无法加载</span>
    ) : (
      <img
        {...props}
        src={safe}
        alt={alt}
        loading="lazy"
        onError={(e) => {
          setFailed(true)
          props.onError?.(e)
        }}
      />
    )
  return (
    <span className={`bui-image-preview ${className || ''}`}>
      {preview && safe && !failed ? (
        <button type="button" aria-label={`预览 ${alt}`} onClick={() => setOpen(true)}>
          {image}
        </button>
      ) : (
        image
      )}
      <DetailModal isOpen={open} title={alt} onClose={() => setOpen(false)} size="lg">
        <img className="bui-image-preview__large" src={safe} alt={alt} />
      </DetailModal>
    </span>
  )
}
export function VideoPlayer({
  src,
  label,
  captionSrc,
  ...props
}: Omit<VideoHTMLAttributes<HTMLVideoElement>, 'src'> & {
  src: string
  label: string
  captionSrc?: string
}) {
  const [failed, setFailed] = useState(false),
    safe = safeMediaSrc(src)
  useEffect(() => setFailed(false), [src])
  return (
    <div className="bui-video-player">
      {!safe || failed ? (
        <p role="alert">视频无法加载</p>
      ) : (
        <video
          controls
          preload="metadata"
          {...props}
          src={safe}
          aria-label={label}
          onError={(e) => {
            setFailed(true)
            props.onError?.(e)
          }}
        >
          {captionSrc && <track kind="captions" src={safeMediaSrc(captionSrc)} label="Captions" />}
        </video>
      )}
    </div>
  )
}
