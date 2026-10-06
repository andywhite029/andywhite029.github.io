import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLanguage } from '../../context/LanguageContext'
import { translations, BRAND_STRIP } from '../../data/translations'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useIsMobile } from '../../hooks/useIsMobile'
import { scrollToSection } from '../../hooks/useLenis'
import { LoopVideo } from '../Media'

gsap.registerPlugin(ScrollTrigger)

function scrollToId(id) {
  scrollToSection(id)
}

/** 首屏底部的品牌目录：真实 Logo + 名称，已建成的章节可点击跳转。 */
function BrandStrip() {
  const { language } = useLanguage()
  const t = translations[language]
  const BUILT = ['guanglun', 'qcraft', 'momenta', 'zeekr', 'xiaomi']
  // 白色图形版本的 Logo 需要深色底衬才能在浅色条上显示
  const DARK_CHIP = ['guanglun', 'zeekr']

  return (
    <div className="border-t border-white/10 bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-content items-center gap-5 overflow-x-auto px-5 md:px-8">
        <span className="eyebrow whitespace-nowrap text-ink-faint">{t.hero.stripLabel}</span>
        <ul className="flex items-center gap-6 md:gap-9">
          {BRAND_STRIP.map((b) => {
            const inner = (
              <>
                {DARK_CHIP.includes(b.id) ? (
                  <span className="flex h-9 items-center rounded-lg bg-gl-night px-3">
                    <img
                      src={b.logo}
                      alt={b.logoAlt[language]}
                      className="h-4 w-auto max-w-[96px] object-contain md:h-[18px]"
                      loading="eager"
                      decoding="async"
                    />
                  </span>
                ) : (
                  <img
                    src={b.logo}
                    alt={b.logoAlt[language]}
                    className="h-5 w-auto max-w-[110px] object-contain md:h-6"
                    loading="eager"
                    decoding="async"
                  />
                )}
                <span className="whitespace-nowrap text-[13px] font-medium text-ink-soft">{b.name[language]}</span>
              </>
            )
            return (
              <li key={b.id} className="flex shrink-0 items-center">
                {BUILT.includes(b.id) ? (
                  <a
                    href={`#${b.id}`}
                    onClick={(e) => {
                      e.preventDefault()
                      scrollToId(b.id)
                    }}
                    className="flex items-center gap-2 opacity-80 transition-opacity hover:opacity-100"
                  >
                    {inner}
                  </a>
                ) : (
                  <span className="flex items-center gap-2 opacity-55">{inner}</span>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

/**
 * 首屏 + 开场→光轮智能的连续转场。
 * 桌面且允许动效时：滚动中背景影像保持在原位置，开场文字离场，
 * 光轮智能的品牌 / 职位 / 时间在同一影像上进入（方案 §6）。
 */
export default function HeroSection() {
  const { language } = useLanguage()
  const t = translations[language]
  const reducedMotion = useReducedMotion()
  const isMobile = useIsMobile()
  const expanded = !reducedMotion && !isMobile

  const sectionRef = useRef(null)
  const layerARef = useRef(null)
  const layerBRef = useRef(null)
  const veilRef = useRef(null)
  const mediaRef = useRef(null)
  const [userPaused, setUserPaused] = useState(false)

  // 初次入场：背景先显示，姓名与定位在 0.6–0.9 秒内出现
  useEffect(() => {
    if (reducedMotion) return undefined
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: 'power2.out' } })
        .fromTo('[data-hero="title"]', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7 }, 0.15)
        .fromTo('[data-hero="subtitle"]', { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.7 }, 0.45)
        .fromTo('[data-hero="roles"]', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.6 }, 0.6)
        .fromTo('[data-hero="ctas"]', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6 }, 0.75)
    }, sectionRef)
    return () => ctx.revert()
  }, [reducedMotion])

  // 开场 → 光轮智能：同一影像延续，文字离场、品牌进入
  useEffect(() => {
    if (!expanded) return undefined
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          // 与 sticky 行程一致：粘性结束 = 章节高 - 视口高
          end: () => `+=${sectionRef.current.offsetHeight - window.innerHeight}`,
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      })
      tl.to(mediaRef.current, { scale: 1.06, duration: 1 }, 0)
        .to(layerARef.current, { opacity: 0, y: -48, duration: 0.4 }, 0.04)
        .to(veilRef.current, { opacity: 1, duration: 0.45 }, 0.22)
        .fromTo(
          layerBRef.current,
          { opacity: 0, y: 44 },
          { opacity: 1, y: 0, duration: 0.35 },
          0.58,
        )
    }, sectionRef)
    return () => ctx.revert()
  }, [expanded])

  const g = translations[language].guanglun

  return (
    <section
      id="andy"
      ref={sectionRef}
      className="relative"
      style={{ height: expanded ? '190vh' : '100svh' }}
    >
      <div className="sticky top-0 h-screen overflow-hidden bg-gl-night">
        {/* 背景影像（首屏与转场共用同一画面） */}
        <div ref={mediaRef} className="absolute inset-0 will-change-transform">
          <LoopVideo
            src="/assets-v2/hero/andy-opening.mp4"
            poster="/assets-v2/hero/andy-opening-poster.webp"
            alt={t.hero.videoAlt}
            userPaused={userPaused}
            className="absolute inset-0"
          />
        </div>

        {/* 常驻轻量压暗，保证文字对比度 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/35" />
        {/* 转场时进入的深空蓝紫（保持半透明，让影像持续可见） */}
        <div
          ref={veilRef}
          className="absolute inset-0 opacity-0 bg-gradient-to-b from-gl-night/60 via-gl-purple/70 to-gl-night/80"
        />

        {/* 第一层：Andy 开场 */}
        <div ref={layerARef} className="absolute inset-0 flex flex-col">
          <div className="mx-auto flex w-full max-w-content flex-1 flex-col justify-end px-5 pb-10 md:px-8 md:pb-14">
            <h1 data-hero="title" className="hero-title text-white">
              Andy
            </h1>
            <p data-hero="subtitle" className="mt-4 max-w-xl text-[19px] font-medium leading-snug text-white/95 md:text-[26px]">
              {t.hero.subtitle}
            </p>
            <p data-hero="roles" className="eyebrow mt-5 text-white/60">
              {t.hero.roles}
            </p>
            <div data-hero="ctas" className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => scrollToId('guanglun')}
                className="rounded-full bg-white px-6 py-3 text-[15px] font-semibold text-ink transition-transform hover:scale-[1.03]"
              >
                {t.hero.ctaWorks}
              </button>
              <button
                type="button"
                onClick={() => scrollToId('contact')}
                className="rounded-full border border-white/40 px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
              >
                {t.hero.ctaContact}
              </button>
            </div>
          </div>
          <BrandStrip />
        </div>

        {/* 第二层：光轮智能品牌进入（桌面动效版） */}
        {expanded && (
          <div ref={layerBRef} className="absolute inset-0 flex items-center opacity-0">
            <div className="mx-auto w-full max-w-content px-5 md:px-8">
              <div className="max-w-2xl">
              <img
                src="/assets-v2/brands/guanglun-logo.png"
                alt={g.brandAlt}
                className="h-7 w-auto md:h-8"
                loading="lazy"
                decoding="async"
              />
              <p className="eyebrow mt-8 text-gl-mist">
                {t.common.chapter} {g.index}
              </p>
              <h2 className="chapter-title mt-3 text-white">{g.brand}</h2>
              <p className="mt-4 text-[17px] font-medium text-gl-silver/90 md:text-lg">
                {g.role} · {g.period}
              </p>
              <p className="mt-6 max-w-xl leading-relaxed text-gl-mist">{g.intro}</p>
              </div>
            </div>
          </div>
        )}

        {/* 背景视频暂停按钮 */}
        <button
          type="button"
          onClick={() => setUserPaused((v) => !v)}
          aria-pressed={userPaused}
          aria-label={userPaused ? t.hero.play : t.hero.pause}
          className="absolute bottom-24 right-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white backdrop-blur transition-colors hover:bg-black/50 md:bottom-28 md:right-8"
        >
          {userPaused ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5.14v13.72c0 .8.87 1.3 1.56.88l10.5-6.86a1.04 1.04 0 0 0 0-1.76L9.56 4.26A1.04 1.04 0 0 0 8 5.14Z" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />
            </svg>
          )}
        </button>
      </div>
    </section>
  )
}
