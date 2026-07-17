import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { useScrollProgress } from '../context/ScrollProgressContext'
import { useLanguage } from '../context/LanguageContext'
import { translations } from '../data/translations'

const NAV_ITEMS = ['hero', 'about', 'experience', 'projects', 'contact']

export default function MobileHeader() {
  const [open, setOpen] = useState(false)
  const { currentSection } = useScrollProgress()
  const { language } = useLanguage()
  const t = translations[language]

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setOpen(false)
    }
  }

  return (
    <header className="lg:hidden sticky top-0 z-40 bg-bg-primary/90 backdrop-blur-md border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-serif text-xl font-bold">Andy</div>
          <div className="font-mono text-[10px] text-text-secondary tracking-wider">
            暗房与终端
          </div>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="p-2 text-text-secondary hover:text-text-primary"
          aria-label="打开菜单"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <nav className="mt-4 space-y-3 pb-2">
          {NAV_ITEMS.map((item, index) => (
            <button
              key={item}
              onClick={() => scrollToSection(item)}
              className={`block w-full text-left py-2 text-sm ${
                index === currentSection ? 'text-accent-red' : 'text-text-secondary'
              }`}
            >
              {t.nav[item]}
            </button>
          ))}
        </nav>
      )}
    </header>
  )
}
