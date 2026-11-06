import { useState } from 'react'
import { UIProvider, LanguageSwitcher, Spinner, type Locale } from '@batype/ui'
import '@batype/ui/style.css'

export default function LanguageSwitcherExample() {
  const [locale, setLocale] = useState<Locale>('zh-CN')
  return (
    <UIProvider locale={locale}>
      <LanguageSwitcher value={locale} onChange={setLocale} />
      <Spinner />
    </UIProvider>
  )
}
