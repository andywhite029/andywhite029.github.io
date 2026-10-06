import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useIsMobile } from '../hooks/useIsMobile'

gsap.registerPlugin(ScrollTrigger)

/**
 * 光轮智能 → 轻舟智航 的边界转场（方案 §6）：
 * 深色影像收束为横向窗口，绿色道路图从同一窗口扩展，绿色细线扫入。
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
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5,
        },
      })
      // 阶段一：暗色影像收束为横向窗口
      tl.to(imageARef.current, { clipPath: 'inset(22% 6% 22% 6%)', scale: 0.98, duration: 0.42 }, 0)
        // 阶段二：窗口内交叉淡化为绿色道路图
        .to(imageARef.current, { opacity: 0, duration: 0.12 }, 0.46)
        .fromTo(
          imageBRef.current,
          { clipPath: 'inset(22% 6% 22% 6%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.45 },
          0.46,
        )
        // 绿色细线扫入后淡出
        .fromTo(lineRef.current, { scaleX: 0, opacity: 1 }, { scaleX: 1, duration: 0.3 }, 0.55)
        .to(lineRef.current, { opacity: 0, duration: 0.12 }, 0.9)
    }, sectionRef)
    return () => ctx.revert()
  }, [enabled])

  if (!enabled) return null

  return (
    <div ref={sectionRef} className="relative bg-paper" style={{ height: '170vh' }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        <img
          ref={imageBRef}
          src="/assets-v2/qcraft/hero-road-1920.webp"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ clipPath: 'inset(22% 6% 22% 6%)' }}
          loading="lazy"
          decoding="async"
        />
        <img
          ref={imageARef}
          src="/assets-v2/guanglun/continuous-learning-poster.webp"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover will-change-transform"
          loading="lazy"
          decoding="async"
        />
        <div
          ref={lineRef}
          aria-hidden="true"
          className="absolute left-0 right-0 top-1/2 h-[2px] origin-left bg-qc-green"
          style={{ transform: 'scaleX(0)' }}
        />
      </div>
    </div>
  )
}
