import { useState } from 'react'
import { RichTextEditor } from '@batype/ui/editors'
import '@batype/ui/style.css'
import '@wangeditor/editor/dist/css/style.css'

export default function RichTextEditorExample() {
  const [html, setHtml] = useState('<p>开始编辑</p>')
  return (
    <RichTextEditor
      label="正文"
      value={html}
      onChange={setHtml}
      height={300}
      mode="default"
      hoverbarPlacement="below"
      lineHeight={1.5}
    />
  )
}
