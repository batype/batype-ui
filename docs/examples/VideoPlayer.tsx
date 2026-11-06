import { VideoPlayer } from '@batype/ui'
import '@batype/ui/style.css'

export default function VideoPlayerExample() {
  // 替换为自己的媒体与字幕文件。
  return <VideoPlayer src="/example.webm" label="演示视频" captionSrc="/captions.vtt" controls />
}
