import { useState } from 'react'
import { UIProvider, ThemeSwitch } from '@batype/ui'
import '@batype/ui/style.css'

export default function ThemeSwitchExample() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  return (
    <UIProvider theme={theme}>
      <ThemeSwitch value={theme} onChange={setTheme} />
    </UIProvider>
  )
}
