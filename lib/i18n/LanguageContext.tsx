'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { translations, type Language, type TranslationKey } from './translations'

interface LanguageContextValue {
  lang: Language
  setLang: (lang: Language) => void
  toggleLang: () => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('zh')

  useEffect(() => {
    const saved = localStorage.getItem('app-lang') as Language | null
    if (saved === 'zh' || saved === 'en') {
      setLangState(saved)
    }
  }, [])

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang)
    localStorage.setItem('app-lang', newLang)
  }, [])

  const toggleLang = useCallback(() => {
    setLangState(prev => {
      const next = prev === 'zh' ? 'en' : 'zh'
      localStorage.setItem('app-lang', next)
      return next
    })
  }, [])

  const t = useCallback((key: TranslationKey): string => {
    return translations[lang][key] ?? translations.en[key] ?? key
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
