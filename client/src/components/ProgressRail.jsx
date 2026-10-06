import { useEffect, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { translations, SECTIONS } from '../data/translations'
import { useActiveSection } from '../hooks/useActiveSection'

const SECTION_IDS = SECTIONS.map((s) => s.id)

/**
 * 桌面右侧纤细进度线 + 当前章节名称。
 * 章节状态由 useActiveSection 依据实际 DOM 位置给出。
 */
export default function ProgressRail() {
  const { language } = useLanguage()
  const t = translations[language]
  const active = useActiveSection(SECTION_IDS)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let raf = 0
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0)
    }
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const current = SECTIONS.find((s) => s.id === active)

  return (
    <div className="pointer-events-none fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 items-center gap-3 lg:flex" aria-hidden="true">
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-faint [writing-mode:vertical-rl]">
        {current ? current.label[language] : ''}
      </span>
      <div className="relative h-40 w-px bg-ink/15">
        <div
          className="absolute left-0 top-0 w-px bg-ink transition-[height] duration-150 ease-out"
          style={{ height: `${progress * 100}%` }}
        />
      </div>
      <span className="text-[11px] tabular-nums text-ink-faint [writing-mode:vertical-rl]">
        {t.common.chapter} {String((SECTIONS.findIndex((s) => s.id === active) ?? 0) + 1).padStart(2, '0')} / {String(SECTIONS.length).padStart(2, '0')}
      </span>
    </div>
  )
}
