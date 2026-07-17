import { useLanguage } from '../context/LanguageContext'

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage()

  return (
    <button
      onClick={toggleLanguage}
      className="fixed top-6 right-6 z-50 flex items-center gap-2 px-3 py-2 font-mono text-xs border border-border rounded-full bg-bg-secondary/80 backdrop-blur-sm text-text-secondary hover:text-text-primary hover:border-accent-red transition-colors"
      aria-label="切换语言"
    >
      <span className={language === 'en' ? 'text-accent-red' : ''}>EN</span>
      <span className="text-text-secondary/40">/</span>
      <span className={language === 'zh' ? 'text-accent-red' : ''}>中文</span>
    </button>
  )
}
