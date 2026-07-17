import { Github, Mail } from 'lucide-react'
import { useScrollProgress } from '../context/ScrollProgressContext'
import { useLanguage } from '../context/LanguageContext'
import { translations } from '../data/translations'

const NAV_ITEMS = [
  { id: 'hero', frame: '00' },
  { id: 'about', frame: '04' },
  { id: 'experience', frame: '12' },
  { id: 'projects', frame: '28' },
  { id: 'contact', frame: '36' },
]

export default function Sidebar() {
  const { currentSection, sectionName } = useScrollProgress()
  const { language } = useLanguage()
  const t = translations[language]

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <aside className="hidden lg:flex lg:w-[320px] xl:w-[360px] lg:min-h-screen lg:flex-col lg:justify-between lg:py-16 lg:pl-12 lg:pr-8 lg:sticky lg:top-0 lg:h-screen">
      <div>
        {/* 顶部标识 */}
        <div className="mb-2 font-mono text-xs text-accent-red tracking-[0.3em] uppercase">
          Frame {NAV_ITEMS[currentSection]?.frame || '00'} / 36
        </div>

        <h1 className="font-serif text-4xl font-bold text-text-primary mb-4">
          {t.sidebar.title}
        </h1>

        <p className="font-mono text-sm text-text-secondary mb-8 leading-relaxed whitespace-pre-line">
          {t.sidebar.tagline}
        </p>

        {/* 导航 */}
        <nav className="space-y-4">
          {NAV_ITEMS.map((item, index) => {
            const isActive = index === currentSection
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`group flex items-center gap-3 text-left transition-colors duration-300 ${
                  isActive ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <span className={`font-mono text-xs ${isActive ? 'text-accent-red' : 'text-text-secondary/50'}`}>
                  {item.frame}
                </span>
                <span className={`h-[1px] transition-all duration-300 ${
                  isActive ? 'w-12 bg-accent-red' : 'w-6 bg-text-secondary/30 group-hover:w-10 group-hover:bg-text-secondary'
                }`} />
                <span className="text-sm tracking-wide">{t.nav[item.id]}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* 底部社交与状态 */}
      <div className="mt-16">
        <div className="font-mono text-xs text-text-secondary mb-4">
          <span className="text-accent-green">{'>'}</span> {t.sidebar.currentSection} {sectionName}
        </div>

        <div className="flex gap-4">
          <a
            href="https://github.com/andywhite029"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-secondary hover:text-accent-red transition-colors"
            aria-label="GitHub"
          >
            <Github size={18} />
          </a>
          <a
            href="mailto:andywhite029@gmail.com"
            className="text-text-secondary hover:text-accent-red transition-colors"
            aria-label="Email"
          >
            <Mail size={18} />
          </a>
        </div>
      </div>
    </aside>
  )
}
