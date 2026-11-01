import { useLayoutEffect, useRef } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { gsap } from './gsapSetup'
import { revealOnScroll } from './revealOnScroll'

/**
 * 通用滚动入场包裹器：进入视口时 opacity + y 揭示，沿用项目 GSAP + ScrollTrigger。
 * reduced-motion 时静态渲染，不做任何隐藏。
 */
export default function Reveal({ children, y = 24, delay = 0, once = true, className = '' }) {
  const reducedMotion = useReducedMotion()
  const rootRef = useRef(null)

  useLayoutEffect(() => {
    if (reducedMotion) return undefined
    const root = rootRef.current
    if (!root) return undefined

    const ctx = gsap.context(() => {
      revealOnScroll({
        targets: root,
        trigger: root,
        from: { autoAlpha: 0, y },
        to: { autoAlpha: 1, y: 0 },
        duration: 0.9,
        delay,
        start: 'top 88%',
        once,
      })
    }, root)

    return () => ctx.revert()
  }, [reducedMotion, y, delay, once])

  return (
    <div ref={rootRef} className={className}>
      {children}
    </div>
  )
}
