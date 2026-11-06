import { CodeBlock } from '@batype/ui'
import '@batype/ui/style.css'

export default function CodeBlockExample() {
  return <CodeBlock code={'const count = 1\nconsole.log(count)'} language="typescript" />
}
