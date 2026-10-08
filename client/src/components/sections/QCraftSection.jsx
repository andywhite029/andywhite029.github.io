import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLanguage } from '../../context/LanguageContext'
import { translations } from '../../data/translations'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { ProjectLink } from '../ProjectDetails'

gsap.registerPlugin(ScrollTrigger)

/**
 * 轻舟智航章节：纸白 + 石墨灰 + 品牌绿 #15CC8A。
 * 主视觉为官网真实素材 hero-web：绿色道路引导视线，
 * 一条绿色路径线随滚动沿道路走势显现（装饰性设计元素）。
 */
export default function QCraftSection() {
  const { language } = useLanguage()
  const t = translations[language]
  const q = t.qcraft
  const reducedMotion = useReducedMotion()

  const figureRef = useRef(null)
  const pathRef = useRef(null)

  useEffect(() => {
    if (reducedMotion) return undefined
    const path = pathRef.current
    const figure = figureRef.current
    if (!path || !figure) return undefined

    const length = path.getTotalLength()
    path.style.strokeDasharray = String(length)
    path.style.strokeDashoffset = String(length)

    const ctx = gsap.context(() => {
      gsap.to(path, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: figure,
          start: 'top 85%',
          end: 'center 42%',
          scrub: 0.4,
        },
      })
    }, figure)
    return () => ctx.revert()
  }, [reducedMotion])

  const case0 = q.websiteCase.images[0]
  const caseImgs = q.websiteCase.images.slice(1)

  return (
    <section id="qcraft" className="bg-paper text-ink">
      {/* 章节头 */}
      <div className="mx-auto w-full max-w-content px-5 pb-14 pt-24 md:px-8 md:pb-20 md:pt-32">
        <p className="eyebrow text-qc-deep">{t.common.chapter} {q.index}</p>
        <h2 className="mt-5" aria-label={q.brand}>
          <img src="/assets-v2/brands/qcraft-logo.png" alt={q.brandAlt} className="chapter-brand-logo" loading="lazy" decoding="async" />
        </h2>
        <p className="mt-4 text-[17px] font-medium text-ink-soft md:text-lg">
          {q.role} · {q.period}
        </p>
        <p className="mt-6 max-w-2xl leading-relaxed text-ink-soft">{q.intro}</p>
      </div>

      {/* 主视觉：官网真实素材 + 绿色路径 */}
      <figure ref={figureRef} className="relative">
        <div className="relative h-[68vh] w-full overflow-hidden md:h-[86vh]">
          <picture>
            <source media="(max-width: 767px)" srcSet={case0.srcMobile} />
            <img src={case0.src} alt={case0.alt} className="h-full w-full object-cover" loading="lazy" decoding="async" />
          </picture>
          {/* 装饰性绿色路径线（非路测标注） */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 1440 810"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <path
              ref={pathRef}
              d="M -20 730 C 240 692 430 642 570 572 C 660 522 706 502 736 482"
              fill="none"
              stroke="#15CC8A"
              strokeWidth="3"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-0 px-5 pb-10 md:px-8 md:pb-14">
            <div className="mx-auto w-full max-w-content">
              <span className="rounded-full bg-qc-green px-3 py-1 text-[12px] font-bold uppercase tracking-[0.18em] text-white">
                {q.websiteCase.kicker}
              </span>
              <h3 className="mt-4 max-w-2xl text-[28px] font-bold leading-tight text-white [text-wrap:balance] md:text-[44px]">
                {q.websiteCase.title}
              </h3>
              <p className="mt-4 max-w-xl leading-relaxed text-white/85">{q.websiteCase.desc}</p>
              <div><ProjectLink id="qcraft-website" className="mt-5 text-white" /></div>
              <a
                href={q.websiteCase.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[14px] font-semibold text-ink transition-transform hover:scale-[1.03]"
              >
                {q.websiteCase.linkLabel}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M2 10 10 2M4 2h6v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </figure>

      {/* 官网真实素材 */}
      <div className="mx-auto w-full max-w-content px-5 py-14 md:px-8 md:py-20">
        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          {caseImgs.map((img) => (
            <figure key={img.src}>
              <img src={img.src} alt={img.alt} className="w-full" loading="lazy" decoding="async" />
            </figure>
          ))}
        </div>
      </div>

      {/* 成果数字（一次出现，不循环） */}
      <div className="bg-qc-soft">
        <div className="mx-auto grid w-full max-w-content gap-10 px-5 py-14 md:grid-cols-3 md:px-8 md:py-16">
          {q.stats.map((s) => (
            <div key={s.label}>
              <p className="text-[40px] font-bold leading-none text-qc-graphite md:text-[52px]">{s.value}</p>
              <p className="mt-3 max-w-[26ch] text-[15px] leading-relaxed text-qc-graphite/75">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 运营与传播条目 */}
      <div className="mx-auto w-full max-w-content px-5 pb-10 pt-6 md:px-8 md:pb-12">
        {q.entries.map((e, index) => (
          <article key={e.title} className="grid gap-3 border-t border-line py-9 md:grid-cols-12 md:gap-8">
            <h3 className="text-[21px] font-bold md:col-span-4 md:text-[24px]">{e.title}</h3>
            <div className="md:col-span-8">
              <p className="max-w-2xl leading-relaxed text-ink-soft">{e.desc}</p>
              <div><ProjectLink id={`qcraft-${index}`} className="mt-4" /></div>
              {e.link && (
                <a
                  href={e.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-[15px] font-semibold text-ink underline decoration-qc-green decoration-2 underline-offset-4 transition-colors hover:text-qc-deep"
                >
                  {e.linkLabel || t.common.viewOriginal}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2 10 10 2M4 2h6v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
