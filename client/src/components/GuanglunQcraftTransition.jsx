import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useIsMobile } from '../hooks/useIsMobile'

gsap.registerPlugin(ScrollTrigger)

const CENTER_LINE = 'inset(calc(50% - 1px) 6% calc(50% - 1px) 6%)'

/**
 * 光轮智能 → 轻舟智航 的边界转场（方案 §6）：
 * 光轮影像收束为中心线，线条转绿后展开为轻舟道路图。
 * 移动端与 reduced-motion 下不渲染，两章直接相接。
 */
export default function GuanglunQcraftTransition() {
  const reducedMotion = useReducedMotion()
  const isMobile = useIsMobile()
  const enabled = !reducedMotion && !isMobile

  const sectionRef = useRef(null)
  const imageARef = useRef(null)
  const imageBRef = useRef(null)
  const lineRef = useRef(null)

  useEffect(() => {
    if (!enabled) return undefined
    const ctx = gsap.context(() => {
      const stage = imageARef.current
      const lineClip = () => {
        const vertical = stage.offsetHeight / 2 - 1
        const horizontal = stage.offsetWidth * 0.06
        return `inset(${vertical}px ${horizontal}px ${vertical}px ${horizontal}px)`
      }
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      })
      // 同一裁切位置完成交接，收拢前不露出下一章的画面。
      tl.fromTo(imageARef.current,
        { clipPath: 'inset(0px 0px 0px 0px)' },
        { clipPath: lineClip, duration: 0.38, ease: 'power1.inOut' }, 0.08)
        .to(lineRef.current, { opacity: 1, duration: 0.06 }, 0.4)
        .set(imageARef.current, { opacity: 0 }, 0.46)
        .to(lineRef.current, { backgroundColor: '#15CC8A', duration: 0.1 }, 0.42)
        .set(imageBRef.current, { opacity: 1 }, 0.5)
        .fromTo(imageBRef.current, { clipPath: lineClip }, {
          clipPath: 'inset(0px 0px 0px 0px)', duration: 0.38, ease: 'power1.inOut',
        }, 0.5)
        .to(lineRef.current, { opacity: 0, duration: 0.1 }, 0.52)
        .to(imageBRef.current, { opacity: 1, duration: 0.12 }, 0.88)
    }, sectionRef)
    return () => ctx.revert()
  }, [enabled])

  if (!enabled) return null

  return (
    <div ref={sectionRef} className="relative bg-gl-night" style={{ height: '200vh' }}>
      <div className="sticky top-0 h-screen overflow-hidden">
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
        <div
          ref={lineRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-[6%] right-[6%] top-1/2 h-[2px] -translate-y-1/2 bg-gl-blue opacity-0"
        />
      </div>
    </div>
  )
}
