import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useMediaQuery } from './useMediaQuery'

const DOT_SIZE = 6
const RING_SIZE = 30

const BASE_STYLE = {
  position: 'fixed',
  top: 0,
  left: 0,
  pointerEvents: 'none',
  mixBlendMode: 'difference',
  borderRadius: '9999px',
  willChange: 'transform, opacity',
  opacity: 0,
  transition: 'opacity 180ms ease',
}

/**
 * 自定义光标：实心小圆点 + 滞后圆环（mix-blend-mode: difference）。
 * 仅 (pointer: fine) 且非 reduced-motion 时启用；启用期间给 body 加
 * `has-custom-cursor` class（原生光标由全局 CSS 隐藏），卸载时移除并清理全部监听与 rAF。
 * 触摸/粗指针设备完全不渲染，因此不会丢失可用性。
 */
export default function CursorHalo({
  zIndex = 9999,
  hoverSelector = '[data-cursor="hover"]',
} = {}) {
  const reducedMotion = useReducedMotion()
  const finePointer = useMediaQuery('(pointer: fine)')
  const enabled = finePointer && !reducedMotion

  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const stateRef = useRef({
    x: 0,
    y: 0,
    ringX: 0,
    ringY: 0,
    dotScale: 1,
    ringScale: 1,
    hovered: false,
    down: false,
    visible: false,
  })

  useEffect(() => {
    if (!enabled) return undefined
    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return undefined

    const state = stateRef.current
    const body = document.body
    // 首次移动时才接管原生光标，避免页面刚加载、指针未移动时出现“没有光标”的状态。
    let active = false
    const activate = () => {
      if (active) return
      active = true
      body.classList.add('has-custom-cursor')
    }

    let frame = 0

    const apply = () => {
      dot.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) translate(-50%, -50%) scale(${state.dotScale})`
      ring.style.transform = `translate3d(${state.ringX}px, ${state.ringY}px, 0) translate(-50%, -50%) scale(${state.ringScale})`
      dot.style.opacity = state.visible ? '1' : '0'
      ring.style.opacity = state.visible ? '0.85' : '0'
    }

    const tick = () => {
      frame = requestAnimationFrame(tick)
      state.ringX += (state.x - state.ringX) * 0.18
      state.ringY += (state.y - state.ringY) * 0.18
      const ringTarget = state.hovered ? 2.4 : state.down ? 1.5 : 1
      const dotTarget = state.hovered ? 0.45 : state.down ? 1.7 : 1
      state.ringScale += (ringTarget - state.ringScale) * 0.18
      state.dotScale += (dotTarget - state.dotScale) * 0.24
      apply()
    }

    const onPointerMove = event => {
      if (event.pointerType === 'touch') return
      activate()
      if (!state.visible) {
        state.visible = true
        state.ringX = event.clientX
        state.ringY = event.clientY
      }
      state.x = event.clientX
      state.y = event.clientY
      const target = event.target
      state.hovered = target instanceof Element ? Boolean(target.closest(hoverSelector)) : false
    }

    const onPointerDown = event => {
      if (event.pointerType === 'touch') return
      state.down = true
    }

    const onPointerUp = event => {
      if (event.pointerType === 'touch') return
      state.down = false
    }

    const hide = () => {
      state.visible = false
      state.down = false
      state.hovered = false
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    window.addEventListener('pointerup', onPointerUp, { passive: true })
    window.addEventListener('blur', hide)
    document.addEventListener('pointerleave', hide)
    frame = requestAnimationFrame(tick)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('blur', hide)
      document.removeEventListener('pointerleave', hide)
      body.classList.remove('has-custom-cursor')
    }
  }, [enabled, hoverSelector])

  if (!enabled || typeof document === 'undefined') return null

  const dotStyle = {
    ...BASE_STYLE,
    zIndex,
    width: DOT_SIZE,
    height: DOT_SIZE,
    backgroundColor: '#ffffff',
  }

  const ringStyle = {
    ...BASE_STYLE,
    zIndex,
    width: RING_SIZE,
    height: RING_SIZE,
    boxSizing: 'border-box',
    border: '1px solid rgba(255, 255, 255, 0.9)',
  }

  return createPortal(
    <>
      <span ref={ringRef} aria-hidden="true" style={ringStyle} />
      <span ref={dotRef} aria-hidden="true" style={dotStyle} />
    </>,
    document.body
  )
}
