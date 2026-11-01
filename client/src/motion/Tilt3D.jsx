import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useMediaQuery } from './useMediaQuery'

const PERSPECTIVE = 900
const INLINE_TAGS = new Set(['span', 'a', 'button', 'label', 'strong', 'em', 'b', 'i'])
const GLARE_STYLE = {
  position: 'absolute',
  inset: 0,
  zIndex: 1,
  pointerEvents: 'none',
  borderRadius: 'inherit',
  background:
    'radial-gradient(circle at var(--tilt-mx, 50%) var(--tilt-my, 50%), rgba(255,255,255,0.42), rgba(255,255,255,0) 62%)',
  mixBlendMode: 'soft-light',
  opacity: 0,
  transition: 'opacity 320ms ease',
}

/**
 * 指针驱动的 CSS 3D 倾斜 + 高光层。
 * 位移用 rAF 线性插值回中，不引入额外依赖；触摸设备与 reduced-motion 直接静态渲染。
 */
export default function Tilt3D({
  as: As = 'div',
  children,
  className = '',
  max = 8,
  scale = 1.01,
  glare = true,
}) {
  const reducedMotion = useReducedMotion()
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)')
  const enabled = !reducedMotion && finePointer

  const rootRef = useRef(null)
  const glareRef = useRef(null)
  const stateRef = useRef({
    rect: null,
    targetRotateX: 0,
    targetRotateY: 0,
    targetScale: 1,
    rotateX: 0,
    rotateY: 0,
    currentScale: 1,
    frame: 0,
  })

  useEffect(() => {
    if (!enabled) return undefined
    const root = rootRef.current
    if (!root) return undefined

    const state = stateRef.current
    const glareEl = glareRef.current

    state.rect = null
    state.targetRotateX = 0
    state.targetRotateY = 0
    state.targetScale = 1
    state.rotateX = 0
    state.rotateY = 0
    state.currentScale = 1
    state.frame = 0
    root.style.willChange = 'transform'

    const render = () => {
      const rotateX = state.rotateX.toFixed(3)
      const rotateY = state.rotateY.toFixed(3)
      const scaleValue = state.currentScale.toFixed(4)
      root.style.transform = `perspective(${PERSPECTIVE}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scaleValue})`
    }

    const tick = () => {
      state.frame = 0
      const ease = 0.18
      state.rotateX += (state.targetRotateX - state.rotateX) * ease
      state.rotateY += (state.targetRotateY - state.rotateY) * ease
      state.currentScale += (state.targetScale - state.currentScale) * ease
      const settled =
        Math.abs(state.targetRotateX - state.rotateX) < 0.01 &&
        Math.abs(state.targetRotateY - state.rotateY) < 0.01 &&
        Math.abs(state.targetScale - state.currentScale) < 0.0005
      if (settled) {
        state.rotateX = state.targetRotateX
        state.rotateY = state.targetRotateY
        state.currentScale = state.targetScale
      }
      render()
      if (!settled) state.frame = requestAnimationFrame(tick)
    }

    const ensureFrame = () => {
      if (state.frame === 0) state.frame = requestAnimationFrame(tick)
    }

    const onEnter = event => {
      if (event.pointerType === 'touch') return
      state.rect = root.getBoundingClientRect()
      state.targetScale = scale
      if (glareEl) glareEl.style.opacity = '1'
      ensureFrame()
    }

    const onMove = event => {
      if (event.pointerType === 'touch' || !state.rect) return
      const rect = state.rect
      if (rect.width === 0 || rect.height === 0) return
      const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
      const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height))
      state.targetRotateY = -((x - 0.5) * 2 * max)
      state.targetRotateX = (y - 0.5) * 2 * max
      if (glareEl) {
        glareEl.style.setProperty('--tilt-mx', `${(x * 100).toFixed(1)}%`)
        glareEl.style.setProperty('--tilt-my', `${(y * 100).toFixed(1)}%`)
      }
      ensureFrame()
    }

    const onLeave = () => {
      state.rect = null
      state.targetRotateX = 0
      state.targetRotateY = 0
      state.targetScale = 1
      if (glareEl) glareEl.style.opacity = '0'
      ensureFrame()
    }

    root.addEventListener('pointerenter', onEnter)
    root.addEventListener('pointermove', onMove)
    root.addEventListener('pointerleave', onLeave)
    root.addEventListener('pointercancel', onLeave)

    return () => {
      root.removeEventListener('pointerenter', onEnter)
      root.removeEventListener('pointermove', onMove)
      root.removeEventListener('pointerleave', onLeave)
      root.removeEventListener('pointercancel', onLeave)
      if (state.frame) cancelAnimationFrame(state.frame)
      state.frame = 0
      state.rect = null
      root.style.transform = ''
      root.style.willChange = ''
      if (glareEl) glareEl.style.opacity = '0'
    }
  }, [enabled, max, scale])

  const isInlineTag = typeof As === 'string' && INLINE_TAGS.has(As)

  return (
    <As
      ref={rootRef}
      className={className}
      style={{
        position: 'relative',
        display: isInlineTag ? 'inline-block' : undefined,
      }}
    >
      {children}
      {enabled && glare ? <span ref={glareRef} aria-hidden="true" style={GLARE_STYLE} /> : null}
    </As>
  )
}
