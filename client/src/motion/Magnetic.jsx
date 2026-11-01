import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useMediaQuery } from './useMediaQuery'

/**
 * 磁吸包裹器：指针进入元素周围半径时，元素向指针轻微偏移，离开回弹。
 * 外层默认 inline-block（transform/translate 对非替换 inline 元素无效），
 * 键盘与触屏不受影响；reduced-motion 或粗指针时完全静态。
 */
export default function Magnetic({
  as: As = 'span',
  children,
  strength = 0.3,
  className = '',
  style,
}) {
  const reducedMotion = useReducedMotion()
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)')
  const enabled = !reducedMotion && finePointer

  const rootRef = useRef(null)
  const stateRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, frame: 0 })

  useEffect(() => {
    if (!enabled) return undefined
    const root = rootRef.current
    if (!root) return undefined

    const state = stateRef.current
    state.x = 0
    state.y = 0
    state.targetX = 0
    state.targetY = 0
    state.frame = 0

    const tick = () => {
      state.frame = 0
      const ease = 0.18
      state.x += (state.targetX - state.x) * ease
      state.y += (state.targetY - state.y) * ease
      const settled =
        Math.abs(state.targetX - state.x) < 0.05 && Math.abs(state.targetY - state.y) < 0.05
      if (settled) {
        state.x = state.targetX
        state.y = state.targetY
      }
      root.style.translate = `${state.x.toFixed(2)}px ${state.y.toFixed(2)}px`
      if (!settled) state.frame = requestAnimationFrame(tick)
    }

    const ensureFrame = () => {
      if (state.frame === 0) state.frame = requestAnimationFrame(tick)
    }

    const reset = () => {
      state.targetX = 0
      state.targetY = 0
      if (Math.abs(state.x) > 0.05 || Math.abs(state.y) > 0.05) ensureFrame()
    }

    const onPointerMove = event => {
      if (event.pointerType === 'touch') return
      const rect = root.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      // getBoundingClientRect 包含当前位移，减回去以得到未位移的中心，避免反馈抖动。
      const centerX = rect.left + rect.width / 2 - state.x
      const centerY = rect.top + rect.height / 2 - state.y
      const deltaX = event.clientX - centerX
      const deltaY = event.clientY - centerY
      const radius = Math.max(rect.width, rect.height) * 0.75 + 32
      const distance = Math.hypot(deltaX, deltaY)
      if (distance > radius) {
        reset()
        return
      }
      const falloff = 1 - distance / radius
      state.targetX = deltaX * strength * falloff
      state.targetY = deltaY * strength * falloff
      ensureFrame()
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.addEventListener('pointerleave', reset)
    window.addEventListener('blur', reset)

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerleave', reset)
      window.removeEventListener('blur', reset)
      if (state.frame) cancelAnimationFrame(state.frame)
      state.frame = 0
      root.style.translate = ''
    }
  }, [enabled, strength])

  return (
    <As
      ref={rootRef}
      className={className}
      style={{ display: 'inline-block', willChange: 'translate', ...style }}
    >
      {children}
    </As>
  )
}
