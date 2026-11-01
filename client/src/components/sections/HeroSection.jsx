import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLanguage } from '../../context/LanguageContext'
import { translations, BRAND_STRIP } from '../../data/translations'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useIsMobile } from '../../hooks/useIsMobile'
import { scrollToSection } from '../../hooks/useLenis'
import { Magnetic, ScrollCue } from '../../motion'
import { LoopVideo } from '../Media'

// three.js 单独成块按需加载：海报在底下兜底，主包不必为首屏 3D 买单
const HeroScene = lazy(() => import('../../three/HeroScene'))

gsap.registerPlugin(ScrollTrigger)

const HERO_VIDEO = '/assets-v2/hero/andy-opening.mp4'
const HERO_POSTER = '/assets-v2/hero/andy-opening-poster.webp'

function scrollToId(id) {
  scrollToSection(id)
}

/** 首屏底部的品牌 Logo 目录，可点击跳转章节。 */
function BrandStrip() {
  const { language } = useLanguage()
  const BUILT = ['guanglun', 'qcraft', 'momenta', 'zeekr', 'xiaomi']
  // 白色图形版本的 Logo 需要深色底衬才能在浅色条上显示
  const DARK_CHIP = ['guanglun', 'zeekr']

  return (
    <div data-hero="strip" className="border-t border-white/10 bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[960px] items-center px-4 md:px-8">
        <ul className="brand-strip-list">
          {BRAND_STRIP.map(b => {
            const inner = (
              <>
                {DARK_CHIP.includes(b.id) ? (
                  <span
                    className={`brand-strip-logo-slot brand-strip-logo-slot--${b.id} flex items-center justify-center rounded bg-gl-night`}
                  >
                    <img
                      src={b.logo}
                      alt={b.logoAlt[language]}
                      className={`brand-strip-logo brand-strip-logo--${b.id} object-contain`}
                      loading="eager"
                      decoding="async"
                    />
                  </span>
                ) : (
                  <img
                    src={b.logo}
                    alt={b.logoAlt[language]}
                    className={`brand-strip-logo brand-strip-logo--${b.id} object-contain`}
                    loading="eager"
                    decoding="async"
                  />
                )}
              </>
            )
            return (
              <li key={b.id} className="flex min-w-0 items-center justify-center">
                {BUILT.includes(b.id) ? (
                  <a
                    href={`#${b.id}`}
                    onClick={e => {
                      e.preventDefault()
                      scrollToId(b.id)
                    }}
                    data-cursor="hover"
                    className="flex min-h-11 w-full items-center justify-center opacity-80 transition-opacity hover:opacity-100"
                  >
                    {inner}
                  </a>
                ) : (
                  <span className="flex w-full items-center justify-center opacity-55">{inner}</span>
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
 * 首屏：海报 + WebGL（视频纹理 / 粒子场）+ 分层文字入场。
 * 桌面且允许动效时，滚动中背景影像保持在原位置，开场文字离场，
 * 光轮智能的品牌 / 职位 / 时间在同一影像上进入（方案 §6）。
 */
export default function HeroSection() {
  const { language } = useLanguage()
  const t = translations[language]
  const ui = t.ui
  const reducedMotion = useReducedMotion()
  const isMobile = useIsMobile()
  const expanded = !reducedMotion && !isMobile

  const sectionRef = useRef(null)
  const layerARef = useRef(null)
  const layerBRef = useRef(null)
  const veilRef = useRef(null)
  const mediaRef = useRef(null)
  const [userPaused, setUserPaused] = useState(false)
  const [webglFailed, setWebglFailed] = useState(false)
  // WebGL 可用时画面完全由 three.js 接管，避免同一视频被两个 <video> 解码
  const webglEnabled = !reducedMotion && !webglFailed

  // 初次入场：在幕布后开始，姓名逐字升起，其余信息依次跟上
  useLayoutEffect(() => {
    if (reducedMotion) return undefined
    const root = sectionRef.current
    if (!root) return undefined
    // 直接持有元素引用：入场信号可能在若干秒后才到达，
    // 那时 gsap 的选择器已经不在 context 作用域内，用引用最稳。
    const group = key => Array.from(root.querySelectorAll(`[data-hero="${key}"]`))
    const chars = group('char')
    const eyebrow = group('eyebrow')
    const subtitle = group('subtitle')
    const roles = group('roles')
    const ctas = group('ctas')
    const strip = group('strip')
    const cue = group('cue')
    const details = [...eyebrow, ...subtitle, ...roles, ...ctas, ...strip, ...cue]
    if (!chars.length) return undefined

    const ctx = gsap.context(() => {
      // 入场序列在幕布后播放：页面顶部有 .preloader 时延后开始，
      // 否则（跳过入场/减少动画/二次访问）立即开始。
      const delay = document.querySelector('.preloader') ? 1.02 : 0.04
      gsap
        .timeline({ delay, defaults: { ease: 'power4.out' } })
        .to(chars, { yPercent: 0, duration: 1.05, stagger: 0.07 }, 0.05)
        .to(eyebrow, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.16)
        .to(subtitle, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0.34)
        .to(roles, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.46)
        .to(ctas, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.54)
        .to(strip, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0.58)
        .to(cue, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.82)

      gsap.set(chars, { yPercent: 112 })
      gsap.set(details, { opacity: 0, y: 18 })
    }, root)
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
      // 时间线尾部保留阅读距离，介绍完全显示后再离开 sticky 舞台。
      tl.to(mediaRef.current, { scale: 1.06, duration: 2 }, 0)
        .to(layerARef.current, { opacity: 0, y: -48, duration: 0.4 }, 0.3)
        .to(veilRef.current, { opacity: 1, duration: 0.45 }, 0.48)
        .fromTo(
          layerBRef.current,
          { opacity: 0, y: 44 },
          { opacity: 1, y: 0, duration: 0.35 },
          0.88,
        )
    }, sectionRef)
    return () => ctx.revert()
  }, [expanded])

  const g = translations[language].guanglun

  return (
    <section
      id="andy"
      ref={sectionRef}
      className="relative bg-gl-night"
      style={{ height: expanded ? '300vh' : '100svh' }}
    >
      <div className="sticky top-0 h-screen overflow-hidden bg-gl-night">
        {/* 背景影像：海报作为首帧，WebGL 可用时由 three.js 接管视频纹理 */}
        <div ref={mediaRef} className="absolute inset-0 will-change-transform">
          <img
            src={HERO_POSTER}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {webglEnabled ? (
            <Suspense fallback={null}>
              <HeroScene
                videoSrc={HERO_VIDEO}
                poster={HERO_POSTER}
                className="hero-webgl"
                onFail={() => setWebglFailed(true)}
              />
            </Suspense>
          ) : (
            <LoopVideo
              src={HERO_VIDEO}
              poster={HERO_POSTER}
              alt={t.hero.videoAlt}
              userPaused={userPaused}
              className="absolute inset-0"
            />
          )}
        </div>

        {/* 常驻轻量压暗 + 暗角，保证文字对比度 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/35" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(3,2,10,0.55)_100%)]" />
        {/* 转场时进入的深空蓝紫（保持半透明，让影像持续可见） */}
        <div
          ref={veilRef}
          className="absolute inset-0 bg-gradient-to-b from-gl-night/60 via-gl-purple/70 to-gl-night/80 opacity-0"
        />

        {/* 第一层：Andy 开场 */}
        <div ref={layerARef} className="absolute inset-0 flex flex-col">
          <div className="mx-auto flex w-full max-w-content flex-1 flex-col justify-end px-5 pb-10 md:px-8 md:pb-14">
            <p data-hero="eyebrow" className="tech-label text-white/55">
              Portfolio 2026 — {t.common.chapter} 01 / 07
            </p>
            <h1 className="hero-title mt-5 flex text-white" aria-label="Andy">
              {'ANDY'.split('').map((char, index) => (
                <span key={index} className="mask-line" aria-hidden="true">
                  <span data-hero="char" className="tracking-[-0.04em]">
                    {char}
                  </span>
                </span>
              ))}
            </h1>
            <p
              data-hero="subtitle"
              className="mt-4 max-w-xl text-[19px] font-medium leading-snug text-white/95 md:text-[26px]"
            >
              {t.hero.subtitle}
            </p>
            <p data-hero="roles" className="tech-label mt-6 text-white/55">
              {t.hero.roles}
            </p>
            <div data-hero="ctas" className="mt-8 flex flex-wrap items-center gap-4">
              <Magnetic strength={0.22}>
                <button
                  type="button"
                  onClick={() => scrollToId('guanglun')}
                  data-cursor="hover"
                  className="group relative overflow-hidden rounded-full bg-white px-6 py-3 text-[15px] font-semibold text-ink transition-transform hover:scale-[1.03]"
                >
                  <span className="relative z-10">{t.hero.ctaWorks}</span>
                  <span className="absolute inset-0 -translate-x-full bg-gl-blue/90 transition-transform duration-500 ease-out group-hover:translate-x-0" />
                </button>
              </Magnetic>
              <Magnetic strength={0.22}>
                <button
                  type="button"
                  onClick={() => scrollToId('contact')}
                  data-cursor="hover"
                  className="rounded-full border border-white/40 px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
                >
                  {t.hero.ctaContact}
                </button>
              </Magnetic>
            </div>
          </div>
          <BrandStrip />
        </div>

        {/* 第二层：光轮智能品牌进入（桌面动效版） */}
        {expanded && (
          <div ref={layerBRef} className="absolute inset-0 flex items-center opacity-0">
            <div className="mx-auto w-full max-w-content px-5 md:px-8">
              <div className="max-w-2xl">
                <p className="eyebrow text-gl-mist">
                  {t.common.chapter} {g.index}
                </p>
                <h2 className="mt-5" aria-label={g.brand}>
                  <img
                    src="/assets-v2/brands/guanglun-logo.png"
                    alt={g.brandAlt}
                    className="chapter-brand-logo"
                    loading="lazy"
                    decoding="async"
                  />
                </h2>
                <p className="mt-4 text-[17px] font-medium text-gl-silver/90 md:text-lg">
                  {g.role} · {g.period}
                </p>
                <p className="mt-6 max-w-xl leading-relaxed text-gl-mist">{g.intro}</p>
              </div>
            </div>
          </div>
        )}

        {/* 左侧竖向标识 */}
        <p className="pointer-events-none absolute left-4 top-1/2 hidden -translate-y-1/2 lg:block">
          <span className="tech-label text-white/30 [writing-mode:vertical-rl]">
            Through Technology
          </span>
        </p>

        {/* 滚动提示 */}
        <div
          data-hero="cue"
          className="pointer-events-none absolute bottom-24 right-5 hidden text-white/60 md:bottom-28 md:right-8 md:block"
        >
          <ScrollCue label={ui.scroll} className="tech-label" />
        </div>

        {/* 背景视频暂停按钮（WebGL 接管时不显示，因为没有可直接控制的原生控件语义） */}
        {!webglEnabled && (
          <button
            type="button"
            onClick={() => setUserPaused(v => !v)}
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
        )}
      </div>
    </section>
  )
}
