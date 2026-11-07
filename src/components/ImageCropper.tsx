import { useEffect, useRef, useState } from 'react'
import { DetailModal } from './DetailModal.js'
import { Button } from './Button.js'
import { Alert } from './Feedback.js'
import { useUI } from '../provider.js'

export interface CropRect {
  x: number
  y: number
  width: number
  height: number
}
/** Pixel coordinates shared by the preview and canvas export. */
export function calculateCrop(
  width: number,
  height: number,
  aspect: number,
  zoom: number,
  x: number,
  y: number,
): CropRect {
  if (
    ![width, height, aspect, zoom, x, y].every(Number.isFinite) ||
    width <= 0 ||
    height <= 0 ||
    aspect <= 0 ||
    zoom < 1
  )
    throw new Error('Invalid crop dimensions')
  const cropWidth = Math.min(width, height * aspect) / zoom,
    cropHeight = cropWidth / aspect
  return {
    x: ((width - cropWidth) * Math.min(100, Math.max(0, x))) / 100,
    y: ((height - cropHeight) * Math.min(100, Math.max(0, y))) / 100,
    width: cropWidth,
    height: cropHeight,
  }
}
export interface ImageCropperProps {
  isOpen: boolean
  file: File | null
  onClose: () => void
  onCrop: (file: File) => void | Promise<unknown>
  aspect?: number
  outputWidth?: number
  outputType?: 'image/png' | 'image/jpeg' | 'image/webp'
  quality?: number
  title?: string
}
export function ImageCropper({
  isOpen,
  file,
  onClose,
  onCrop,
  aspect = 1,
  outputWidth = 1024,
  outputType = 'image/png',
  quality = 0.92,
  title,
}: ImageCropperProps) {
  const [source, setSource] = useState(''),
    [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [zoom, setZoom] = useState(1),
    [x, setX] = useState(50),
    [y, setY] = useState(50)
  const [error, setError] = useState(''),
    [saving, setSaving] = useState(false)
  const image = useRef<HTMLImageElement>(null),
    generation = useRef(0),
    busy = useRef(false)
  const { locale } = useUI(),
    english = locale === 'en'
  const valid =
    Number.isFinite(aspect) &&
    aspect > 0 &&
    Number.isFinite(outputWidth) &&
    outputWidth >= 1 &&
    outputWidth <= 4096 &&
    Number.isFinite(quality) &&
    quality >= 0 &&
    quality <= 1
  useEffect(() => {
    const stamp = ++generation.current
    setSource('')
    setDimensions({ width: 0, height: 0 })
    setError('')
    setZoom(1)
    setX(50)
    setY(50)
    setSaving(false)
    busy.current = false
    if (!isOpen || !file) return
    if (
      !['image/png', 'image/jpeg', 'image/webp'].includes(file.type) ||
      file.size > 20 * 1024 * 1024
    ) {
      setError(
        english
          ? 'Choose a PNG, JPEG or WebP image up to 20MB'
          : '请选择 20MB 以内的 PNG、JPEG 或 WebP 图片',
      )
      return
    }
    const url = URL.createObjectURL(file)
    setSource(url)
    return () => {
      URL.revokeObjectURL(url)
      if (generation.current === stamp) generation.current++
    }
  }, [isOpen, file, english])
  const crop =
    valid && dimensions.width > 0
      ? calculateCrop(dimensions.width, dimensions.height, aspect, zoom, x, y)
      : null
  const save = async () => {
    if (!crop || !file || !image.current || busy.current) return
    const stamp = generation.current
    busy.current = true
    setSaving(true)
    setError('')
    try {
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(Math.min(outputWidth, crop.width)))
      canvas.height = Math.max(1, Math.round(canvas.width / aspect))
      if (canvas.height > 4096)
        throw new Error(
          english ? 'Output height exceeds 4096 pixels' : '输出高度不能超过 4096 像素',
        )
      const context = canvas.getContext('2d')
      if (!context) throw new Error(english ? 'Canvas is unavailable' : '当前浏览器不支持 Canvas')
      context.drawImage(
        image.current,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        canvas.width,
        canvas.height,
      )
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (blob) =>
            blob
              ? resolve(blob)
              : reject(new Error(english ? 'Image export failed' : '图片导出失败')),
          outputType,
          quality,
        ),
      )
      if (generation.current !== stamp) return
      const extension = blob.type === 'image/jpeg' ? 'jpg' : blob.type.split('/')[1] || 'png'
      await onCrop(
        new File([blob], `${file.name.replace(/\.[^.]+$/, '')}-crop.${extension}`, {
          type: blob.type,
          lastModified: Date.now(),
        }),
      )
    } catch (error) {
      if (generation.current === stamp)
        setError(error instanceof Error ? error.message : english ? 'Crop failed' : '裁剪失败')
    } finally {
      if (generation.current === stamp) {
        busy.current = false
        setSaving(false)
      }
    }
  }
  return (
    <DetailModal
      isOpen={isOpen}
      onClose={onClose}
      title={title ?? (english ? 'Crop image' : '裁剪图片')}
      dismissible={!saving}
      size="md"
      footer={
        <>
          <Button variant="soft" tone="neutral" disabled={saving} onClick={onClose}>
            {english ? 'Cancel' : '取消'}
          </Button>
          <Button loading={saving} disabled={!crop || !valid} onClick={() => void save()}>
            {english ? 'Apply crop' : '应用裁剪'}
          </Button>
        </>
      }
    >
      {(!valid || error) && (
        <Alert tone="danger">
          {error || (english ? 'Invalid crop settings' : '裁剪比例、输出尺寸或质量参数无效')}
        </Alert>
      )}
      {source && (
        <>
          <div
            className="bui-crop-preview"
            style={{
              aspectRatio: valid ? aspect : 1,
              width: valid ? `min(100%, 400px, ${Math.min(10000, 50 * aspect)}dvh)` : undefined,
            }}
          >
            <img
              ref={image}
              src={source}
              alt={english ? 'Crop preview' : '裁剪预览'}
              style={
                crop
                  ? {
                      width: `${(dimensions.width / crop.width) * 100}%`,
                      height: `${(dimensions.height / crop.height) * 100}%`,
                      left: `${(-crop.x / crop.width) * 100}%`,
                      top: `${(-crop.y / crop.height) * 100}%`,
                    }
                  : { width: '100%' }
              }
              onLoad={(event) => {
                const node = event.currentTarget
                if (node.naturalWidth * node.naturalHeight > 64_000_000) {
                  setError(english ? 'Image dimensions are too large' : '图片像素尺寸过大')
                  return
                }
                setDimensions({ width: node.naturalWidth, height: node.naturalHeight })
              }}
              onError={() => setError(english ? 'Cannot decode image' : '无法读取图片')}
            />
          </div>
          <fieldset className="bui-crop-controls" disabled={saving || !crop}>
            {[
              {
                label: english ? 'Zoom' : '缩放',
                value: zoom,
                min: 1,
                max: 4,
                step: 0.05,
                change: setZoom,
              },
              {
                label: english ? 'Horizontal position' : '水平位置',
                value: x,
                min: 0,
                max: 100,
                step: 1,
                change: setX,
              },
              {
                label: english ? 'Vertical position' : '垂直位置',
                value: y,
                min: 0,
                max: 100,
                step: 1,
                change: setY,
              },
            ].map((control) => (
              <label key={control.label}>
                {control.label}
                <input
                  type="range"
                  value={control.value}
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  onChange={(event) => control.change(Number(event.target.value))}
                />
              </label>
            ))}
          </fieldset>
        </>
      )}
    </DetailModal>
  )
}
