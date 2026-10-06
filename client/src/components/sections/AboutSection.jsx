import { useLanguage } from '../../context/LanguageContext'
import { translations } from '../../data/translations'
import PhotographySection from './PhotographySection'

/** 关于：三项能力 + 一段自述 + 两行早期经历（安静的文字版面）。 */
export default function AboutSection() {
  const { language } = useLanguage()
  const t = translations[language]
  const a = t.about

  return (
    <section id="about" className="bg-paper-warm text-ink">
      <PhotographySection />
      <div className="mx-auto w-full max-w-content px-5 py-24 md:px-8 md:py-32">
        <p className="eyebrow text-ink-faint">
          {t.common.chapter} {a.index}
        </p>
        <h2 className="chapter-title mt-3 max-w-2xl">{a.title}</h2>

        <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {a.capabilities.map((c, i) => (
            <div key={c.title} className="border-t-2 border-ink/80 pt-5">
              <p className="text-[13px] font-semibold text-ink-faint">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="mt-2 text-[20px] font-bold md:text-[22px]">{c.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{c.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 max-w-3xl md:mt-20">
          {a.bio.map((p) => (
            <p key={p.slice(0, 24)} className="text-[19px] font-medium leading-relaxed text-ink md:text-[22px]">
              {p}
            </p>
          ))}
        </div>

        <div className="mt-14 max-w-3xl">
          {a.early.map((e) => (
            <div key={e.org} className="grid gap-1 border-t border-ink/10 py-5 sm:grid-cols-12 sm:gap-4">
              <p className="text-[13px] font-medium text-ink-faint sm:col-span-3">{e.time}</p>
              <p className="text-[15px] font-semibold sm:col-span-3">{e.org}</p>
              <p className="text-[14px] leading-relaxed text-ink-soft sm:col-span-6">{e.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
