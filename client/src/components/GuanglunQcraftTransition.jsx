import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLanguage } from '../context/LanguageContext'
import { translations } from '../data/translations'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useIsMobile } from '../hooks/useIsMobile'

gsap.registerPlugin(ScrollTrigger)

const CENTER_LINE = 'inset(calc(50% - 1px) 6% calc(50% - 1px) 6%)'
const RING_COUNT = 14
const RINGS = Array.from({ length: RING_COUNT }, (_, index) => index)

/**
 * 光轮智能 → 轻舟智航 的边界转场：
 * 光轮影像先收束为中心线，露出后面的 CSS 3D 光带隧道（世界向镜头推进，
 * 环带由光蓝渐变为轻舟绿），随后道路影像从中心线展开接管画面。
 * 全部由 ScrollTrigger 的 scrub 驱动，不额外占用主线程；
 * 移动端与 reduced-motion 下不渲染，两章直接相接。
 */
export default function GuanglunQcraftTransition() {
  const { language } = useLanguage()
  const t = translations[language]
  const reducedMotion = useReducedMotion()
  const isMobile = useIsMobile()
  const enabled = !reducedMotion && !isMobile

  const sectionRef = useRef(null)
  const worldRef = useRef(null)
  const glowRef = useRef(null)
  const imageARef = useRef(null)
  const imageBRef = useRef(null)
  const lineRef = useRef(null)

  useEffect(() => {
    if (!enabled) return undefined
    const section = sectionRef.current
    const world = worldRef.current
    const imageA = imageARef.current
    const imageB = imageBRef.current
    if (!section || !world || !imageA || !imageB) return undefined

    const rings = gsap.utils.toArray('.tunnel-ring', world)

    const ctx = gsap.context(() => {
      const lineClip = () => {
        const vertical = section.offsetHeight / 2 - 1
        const horizontal = section.offsetWidth * 0.06
        return `inset(${vertical}px ${horizontal}px ${vertical}px ${horizontal}px)`
      }

      // 环带的初始纵深：从镜头前方一路排到远处
      gsap.set(rings, {
        z: index => -260 - index * 300,
        color: 'rgba(124, 92, 255, 0.5)',
      })
      gsap.set(world, { z: 0 })
      gsap.set(imageB, { clipPath: CENTER_LINE, opacity: 0 })
      gsap.set(glowRef.current, { opacity: 0, scale: 0.7 })

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      })

      // 1) 光轮影像收束为一条线，露出隧道
      tl.fromTo(
        imageA,
        { clipPath: 'inset(0px 0px 0px 0px)' },
        { clipPath: lineClip, duration: 0.26, ease: 'power2.inOut' },
        0.02,
      )
        .to(lineRef.current, { opacity: 1, duration: 0.05 }, 0.26)
        .set(imageA, { opacity: 0 }, 0.3)
        // 2) 隧道飞行：整个世界向镜头推进
        .to(world, { z: 2700, duration: 0.72 }, 0.06)
        .to(glowRef.current, { opacity: 1, scale: 1.15, duration: 0.32 }, 0.18)
        // 3) 光蓝色 → 轻舟绿
        .to(rings, { color: 'rgba(21, 204, 138, 0.5)', duration: 0.22, stagger: 0.008 }, 0.34)
        .to(lineRef.current, { backgroundColor: '#15CC8A', duration: 0.12 }, 0.4)
        // 4) 道路影像从中心线展开接管
        .set(imageB, { opacity: 1 }, 0.62)
        .fromTo(
          imageB,
          { clipPath: lineClip },
          { clipPath: 'inset(0px 0px 0px 0px)', duration: 0.3, ease: 'power2.inOut' },
          0.64,
        )
        .to([...rings], { opacity: 0.15, duration: 0.24 }, 0.64)
        .to(glowRef.current, { opacity: 0, duration: 0.2 }, 0.72)
        .to(lineRef.current, { opacity: 0, duration: 0.1 }, 0.68)
    }, section)

    return () => ctx.revert()
  }, [enabled])

  if (!enabled) return null

  return (
    <section ref={sectionRef} className="relative bg-gl-night" style={{ height: '220vh' }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* CSS 3D 光带隧道：环带在镜头前方逐层显现 */}
        <div className="tunnel-stage" aria-hidden="true">
          <div ref={worldRef} className="tunnel-world">
            {RINGS.map(index => (
              <div key={index} className="tunnel-ring" />
            ))}
          </div>
          <div ref={glowRef} className="tunnel-glow" />
        </div>

        {/* 光轮影像（收束）与轻舟影像（展开） */}
        <img
          ref={imageBRef}
          src="/assets-v2/qcraft/hero-road-1920.webp"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ clipPath: CENTER_LINE, opacity: 0 }}
          loading="lazy"
          decoding="async"
        />
        <img
          ref={imageARef}
          src="/assets-v2/guanglun/continuous-learning-poster.webp"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />

        {/* 收束线 / 光带 */}
        <div
          ref={lineRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-[6%] right-[6%] top-1/2 h-[2px] -translate-y-1/2 bg-gl-blue opacity-0 shadow-[0_0_28px_6px_rgba(65,35,245,0.55)]"
        />

        <p className="pointer-events-none absolute inset-x-0 bottom-8 px-6 md:px-10" aria-hidden="true">
          <span className="tech-label text-white/45">
            {t.guanglun.brand} → {t.qcraft.brand}
          </span>
        </p>
      </div>
    </section>
  )
}
