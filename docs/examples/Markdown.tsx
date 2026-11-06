import { Markdown } from '@batype/ui/markdown'
import '@batype/ui/style.css'

export default function MarkdownExample() {
  return <Markdown>{'# 标题\n\n- 第一项\n- 第二项\n\n**重点内容**'}</Markdown>
}
