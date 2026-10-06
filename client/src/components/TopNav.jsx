import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { translations, SECTIONS } from '../data/translations'
import { scrollToSection, useLenis } from '../hooks/useLenis'

const WORK_SECTIONS = SECTIONS.filter((s) => ['guanglun', 'qcraft', 'momenta', 'zeekr', 'xiaomi'].includes(s.id))

function scrollToId(id) {
  scrollToSection(id)
}

function LanguageButton({ dark = false, className = '' }) {
  const { language, toggleLanguage } = useLanguage()
  const t = translations[language]
  const skin = dark
    ? 'border-white/30 text-white hover:border-white'
    : 'border-ink/15 text-ink hover:border-ink/40'
  return (
    <button
      type="button"
      onClick={toggleLanguage}
      lang={language === 'zh' ? 'en' : 'zh'}
      aria-label={t.nav.languageButton}
      className={`rounded-full border px-3 py-1 text-[13px] font-semibold tracking-wide transition-colors ${skin} ${className}`}
    >
      {language === 'zh' ? 'EN' : '中'}
    </button>
  )
}

export default function TopNav() {
  const { language } = useLanguage()
  const t = translations[language]
  const [scrolled, setScrolled] = useState(false)
  const [worksOpen, setWorksOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const worksTimer = useRef(null)
  const mobileDialog = useRef(null)
  const menuTrigger = useRef(null)
  const lenis = useLenis()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // 移动端菜单打开时锁定滚动
  useEffect(() => {
    if (!mobileOpen) return undefined
    const node = mobileDialog.current
    const trigger = menuTrigger.current
    const overflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    lenis?.stop()
    node.showModal()
    const desktop = window.matchMedia('(min-width: 768px)')
    const closeOnDesktop = () => { if (desktop.matches) setMobileOpen(false) }
    desktop.addEventListener('change', closeOnDesktop)
    return () => {
      desktop.removeEventListener('change', closeOnDesktop)
      node.close()
      document.documentElement.style.overflow = overflow
      lenis?.start()
      trigger?.focus({ preventScroll: true })
    }
  }, [mobileOpen, lenis])

  useEffect(() => () => clearTimeout(worksTimer.current), [])

  const openWorks = () => {
    clearTimeout(worksTimer.current)
    setWorksOpen(true)
  }
  const closeWorksSoon = () => {
    worksTimer.current = setTimeout(() => setWorksOpen(false), 160)
  }

  const navLink = `text-[14px] font-medium transition-colors ${
    scrolled ? 'text-ink/80 hover:text-ink' : 'text-white/85 hover:text-white'
  }`

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        {t.nav.skipToContent}
      </a>

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
          scrolled
            ? 'border-b border-line bg-paper/85 text-ink backdrop-blur-md'
            : 'border-b border-transparent bg-gradient-to-b from-black/70 via-black/35 to-transparent text-white'
        }`}
      >
        <nav className="mx-auto flex h-14 max-w-content items-center justify-between px-5 md:px-8" aria-label="Main">
          <button
            type="button"
            onClick={() => scrollToId('andy')}
            className="text-[17px] font-bold tracking-tight"
          >
            Andy
          </button>

          {/* 桌面导航 */}
          <div className="hidden items-center gap-7 md:flex">
            <div className="relative" onMouseEnter={openWorks} onMouseLeave={closeWorksSoon}
              onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setWorksOpen(false) }}
              onKeyDown={event => { if (event.key === 'Escape') { setWorksOpen(false); event.currentTarget.querySelector('button').focus() } }}>
              <button
                type="button"
                aria-expanded={worksOpen}
                aria-controls="works-navigation"
                onClick={() => setWorksOpen((v) => !v)}
                className={`${navLink} flex items-center gap-1.5`}
              >
                {t.nav.works}
                <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" className={`transition-transform ${worksOpen ? 'rotate-180' : ''}`}>
                  <path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
              {worksOpen && (
                <div id="works-navigation" className="absolute right-1/2 top-full w-56 translate-x-1/2 pt-2" aria-label={t.nav.openWorks}>
                  <div className="overflow-hidden rounded-lg border border-line bg-paper py-2 text-ink shadow-xl shadow-ink/10">
                    {WORK_SECTIONS.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setWorksOpen(false)
                          scrollToId(s.id)
                        }}
                        className="flex w-full items-baseline justify-between px-4 py-2.5 text-left text-[14px] font-medium hover:bg-paper-warm"
                      >
                        <span>{s.label[language]}</span>
                        <span className="text-[12px] text-ink-faint">{s.label[language === 'zh' ? 'en' : 'zh']}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button type="button" onClick={() => scrollToId('about')} className={navLink}>
              {t.nav.about}
            </button>
            <button type="button" onClick={() => scrollToId('contact')} className={navLink}>
              {t.nav.contact}
            </button>
            <LanguageButton dark={!scrolled} />
          </div>

          {/* 移动端：语言 + 菜单 */}
          <div className="flex items-center gap-3 md:hidden">
            <LanguageButton dark={!scrolled} />
            <button
              type="button"
              aria-label={t.nav.menu}
              ref={menuTrigger}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
              className="flex h-10 w-10 flex-col items-center justify-center gap-1.5"
            >
              <span className={`h-[2px] w-5 bg-current transition-transform ${mobileOpen ? 'translate-y-[4px] rotate-45' : ''}`} />
              <span className={`h-[2px] w-5 bg-current transition-transform ${mobileOpen ? '-translate-y-[4px] -rotate-45' : ''}`} />
            </button>
          </div>
        </nav>
      </header>

      {/* 移动端全屏菜单 */}
      {mobileOpen && (
        <dialog ref={mobileDialog} aria-label={t.nav.menu}
          onCancel={event => { event.preventDefault(); setMobileOpen(false) }}
          onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); setMobileOpen(false) } }}
          className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto bg-paper px-6 pb-10 pt-20 text-ink" data-lenis-prevent>
          <button className="icon-button absolute right-5 top-3" aria-label={t.detail.close} onClick={() => setMobileOpen(false)}><X size={22} /></button>
          <div className="flex flex-col gap-2">
            <p className="eyebrow text-ink-faint">{t.nav.openWorks}</p>
            {WORK_SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setMobileOpen(false)
                  setTimeout(() => scrollToId(s.id), 60)
                }}
                className="border-b border-line py-4 text-left text-2xl font-semibold"
              >
                {s.label[language]}
              </button>
            ))}
            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false)
                  setTimeout(() => scrollToId('about'), 60)
                }}
                className="py-3 text-left text-lg font-medium text-ink-soft"
              >
                {t.nav.about}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false)
                  setTimeout(() => scrollToId('contact'), 60)
                }}
                className="py-3 text-left text-lg font-medium text-ink-soft"
              >
                {t.nav.contact}
              </button>
            </div>
          </div>
        </dialog>
      )}
    </>
  )
}
