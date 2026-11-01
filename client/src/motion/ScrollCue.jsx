import { useLayoutEffect, useRef } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { gsap } from './gsapSetup'

/**
 * 首屏底部滚动提示：小字 + 循环下移的箭头。
 * 箭头为装饰性元素（aria-hidden），reduced-motion 时保持静态。
 */
export default function ScrollCue({ label, className = '' }) {
  const reducedMotion = useReducedMotion()
  const rootRef = useRef(null)
  const arrowRef = useRef(null)

  useLayoutEffect(() => {
    if (reducedMotion) return undefined
    const arrow = arrowRef.current
    if (!arrow) return undefined

    const ctx = gsap.context(() => {
      gsap.to(arrow, {
        y: 6,
        duration: 1.1,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })
    }, rootRef)

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <div ref={rootRef} className={`flex flex-col items-center gap-2 ${className}`}>
      {label ? (
        <span className="text-[11px] font-semibold uppercase tracking-[0.28em]">{label}</span>
      ) : null}
      <span ref={arrowRef} aria-hidden="true" className="block">
        <svg width="14" height="18" viewBox="0 0 14 18" fill="none">
          <path
            d="M7 1v14m-5.2-5.4L7 15l5.2-5.4"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>
  )
}
