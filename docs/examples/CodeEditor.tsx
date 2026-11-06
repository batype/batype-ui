import { useState } from 'react'
import { CodeEditor } from '@batype/ui/editors'
import '@batype/ui/style.css'

export default function CodeEditorExample() {
  const [code, setCode] = useState('const count: number = 1')
  return (
    <CodeEditor label="代码" language="typescript" value={code} onChange={setCode} height={280} />
  )
}
