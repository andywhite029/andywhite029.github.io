import { createContext, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'andy-site-language'

const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  toggleLanguage: () => {},
})

export function useLanguage() {
  return useContext(LanguageContext)
}

function getInitialLanguage() {
  if (typeof window === 'undefined') return 'en'
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    return saved === 'zh' || saved === 'en' ? saved : 'en'
  } catch {
    return 'en'
  }
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(getInitialLanguage)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, language)
    } catch {
      // 隐私模式等场景下静默失败
    }
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en'
  }, [language])

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'zh' : 'en'))
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}
