import { useState } from 'react'
import { VideoUpload, type UploadItem, type FileUploadProps } from '@batype/ui'
import '@batype/ui/style.css'

export default function VideoUploadExample({ upload }: { upload?: FileUploadProps['upload'] }) {
  const [error, setError] = useState('')
  const [files, setFiles] = useState<UploadItem[]>([])
  return (
    <VideoUpload
      label="选择视频"
      files={files}
      onChange={setFiles}
      upload={upload}
      maxSize={10 * 1024 * 1024}
      onError={(message) => setError(message)}
      hint={error || '每个文件不超过10 MiB'}
    />
  )
}
