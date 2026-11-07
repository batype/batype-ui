import { useState } from 'react'
import { ImageCropper } from '@batype/ui'
import '@batype/ui/style.css'

export default function ImageCropperExample() {
  const [file, setFile] = useState<File | null>(null),
    [result, setResult] = useState('')
  return (
    <>
      <label>
        选择裁剪图片
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null)
            event.target.value = ''
          }}
        />
      </label>
      <ImageCropper
        isOpen={!!file}
        file={file}
        onClose={() => setFile(null)}
        aspect={1}
        outputWidth={512}
        onCrop={(cropped) => {
          setResult(`${cropped.name} (${cropped.size} bytes)`)
          setFile(null)
        }}
      />
      <output aria-label="裁剪结果">{result}</output>
    </>
  )
}
