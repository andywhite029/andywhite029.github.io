import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { GALLERY_ARIA_LABEL, GALLERY_HINT, GALLERY_NEXT_LABEL, GALLERY_PREV_LABEL } from './labels'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
const mod = (value, length) => ((value % length) + length) % length
const pad = value => String(value).padStart(2, '0')

/** 把连续索引差收拢到 [-n/2, n/2)，让首尾卡片无缝衔接。 */
function wrapDelta(delta, length) {
  return mod(delta + length / 2, length) - length / 2
}

/** 按容器宽度推导卡片尺寸与环绕参数，窄桌面自动收缩。 */
function getGeometry(width) {
  const cardWidth = Math.round(clamp(width * 0.29, 170, 320))
  const cardHeight = Math.round(cardWidth * 0.75)
  return {
    cardWidth,
    cardHeight,
    spacing: Math.round(cardWidth * 0.58),
    depth: Math.round(cardWidth * 0.55),
    stageHeight: Math.round(cardHeight * 1.42),
    perspective: Math.round(clamp(width * 1.15, 880, 1800)),
  }
}

const DEFAULT_WIDTH = 1120

/**
 * 桌面 3D 封面流展廊：CSS 透视 + GSAP 补间，拖拽旋转带惯性衰减，
 * 方向键 ←/→ 切换，点击居中卡片触发 onOpen，点击侧边卡片先转到中间。
 * 不接管 wheel（不影响页面纵向滚动），也没有焦点陷阱。
 */
export default function PhotoCarousel3D({ photos, onOpen, className = '' }) {
  const count = photos.length
  const rootRef = useRef(null)
  const stageRef = useRef(null)
  const cardsRef = useRef([])
  const posRef = useRef(0)
  const activeRef = useRef(0)
  const countRef = useRef(count)
  const geomRef = useRef(getGeometry(DEFAULT_WIDTH))
  const tweenPosRef = useRef({ value: 0 })
  const rafRef = useRef(0)
  const listenersRef = useRef({ move: null, up: null })
  const dragRef = useRef({
    dragging: false,
    startX: 0,
    startPos: 0,
    lastX: 0,
    lastTime: 0,
    velocity: 0,
    moved: 0,
  })
  const applyRef = useRef(null)
  const stopLoopRef = useRef(null)
  const detachRef = useRef(null)

  const [width, setWidth] = useState(0)
  const [active, setActive] = useState(0)
  const [dragging, setDragging] = useState(false)

  countRef.current = count
  const geometry = getGeometry(width > 0 ? width : DEFAULT_WIDTH)
  geomRef.current = geometry

  /** 按连续位置刷新所有卡片的 3D 变换：直接写 style，避免每帧 re-render。 */
  function apply(position) {
    posRef.current = position
    const total = countRef.current
    if (!total) return
    const { spacing, depth } = geomRef.current
    for (let index = 0; index < total; index += 1) {
      const node = cardsRef.current[index]
      if (!node) continue
      const delta = wrapDelta(index - position, total)
      const distance = Math.abs(delta)
      const x = delta * spacing
      const y = distance * 6
      const z = -distance * depth
      const rotate = clamp(-delta * 26, -42, 42)
      const scale = clamp(1.06 - distance * 0.08, 0.7, 1.06)
      node.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateY(${rotate}deg) scale(${scale})`
      node.style.opacity = String(clamp(1 - distance * 0.28, 0.08, 1))
      node.style.zIndex = String(200 - Math.round(distance * 10))
      node.style.filter =
        distance < 0.05 ? 'none' : `brightness(${clamp(1 - distance * 0.2, 0.55, 1)})`
    }
    const next = mod(Math.round(position), total)
    if (next !== activeRef.current) {
      activeRef.current = next
      setActive(next)
    }
  }
  applyRef.current = apply

  function stopLoop() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
  }
  stopLoopRef.current = stopLoop

  /** 用 GSAP 把连续位置补间到整数索引；传入对象由 context 外的 kill 统一管理。 */
  function tweenTo(target, duration = 0.6) {
    stopLoop()
    const state = tweenPosRef.current
    gsap.killTweensOf(state)
    state.value = posRef.current
    gsap.to(state, {
      value: target,
      duration,
      ease: 'power3.out',
      overwrite: true,
      onUpdate: () => apply(state.value),
      onComplete: () => apply(target),
    })
  }

  function snapToNearest() {
    if (dragRef.current.dragging) return
    tweenTo(Math.round(posRef.current))
  }

  function rotateBy(direction) {
    stopLoop()
    tweenTo(Math.round(posRef.current) + direction)
  }

  function rotateTo(index) {
    const total = countRef.current
    if (!total) return
    const base = Math.round(posRef.current)
    tweenTo(base + wrapDelta(index - base, total), 0.65)
  }

  function inertiaStep() {
    const state = dragRef.current
    if (state.dragging) {
      rafRef.current = 0
      return
    }
    apply(posRef.current + state.velocity)
    state.velocity *= 0.93
    if (Math.abs(state.velocity) < 0.004) {
      state.velocity = 0
      rafRef.current = 0
      snapToNearest()
      return
    }
    rafRef.current = requestAnimationFrame(inertiaStep)
  }

  function detachDragListeners() {
    const { move, up } = listenersRef.current
    if (move) window.removeEventListener('pointermove', move)
    if (up) {
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
    listenersRef.current = { move: null, up: null }
  }
  detachRef.current = detachDragListeners

  function handleWindowMove(event) {
    const state = dragRef.current
    if (!state.dragging) return
    const spacing = geomRef.current.spacing
    const dx = event.clientX - state.startX
    state.moved = Math.max(state.moved, Math.abs(dx))
    apply(state.startPos - dx / spacing)
    const elapsed = Math.max(1, event.timeStamp - state.lastTime)
    const instant = -((event.clientX - state.lastX) / spacing) * (16.667 / elapsed)
    state.velocity = clamp(state.velocity * 0.65 + instant * 0.35, -0.5, 0.5)
    state.lastX = event.clientX
    state.lastTime = event.timeStamp
  }

  function handleWindowUp() {
    const state = dragRef.current
    detachDragListeners()
    if (!state.dragging) return
    state.dragging = false
    setDragging(false)
    if (Math.abs(state.velocity) > 0.02) {
      stopLoop()
      rafRef.current = requestAnimationFrame(inertiaStep)
      return
    }
    snapToNearest()
  }

  function handlePointerDown(event) {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    const state = dragRef.current
    stopLoop()
    gsap.killTweensOf(tweenPosRef.current)
    state.dragging = true
    state.startX = event.clientX
    state.startPos = posRef.current
    state.lastX = event.clientX
    state.lastTime = event.timeStamp
    state.velocity = 0
    state.moved = 0
    setDragging(true)
    detachDragListeners()
    listenersRef.current = { move: handleWindowMove, up: handleWindowUp }
    window.addEventListener('pointermove', handleWindowMove, { passive: true })
    window.addEventListener('pointerup', handleWindowUp)
    window.addEventListener('pointercancel', handleWindowUp)
  }

  function handleCardClick(event, index) {
    // 拖拽结束的 click 不当作点击；键盘触发的 click（detail 为 0）永远有效。
    if (event.detail > 0 && dragRef.current.moved > 8) return
    if (index !== activeRef.current) {
      rotateTo(index)
      return
    }
    onOpen?.(photos[index].id)
  }

  function handleCardFocus(event, index) {
    // 只有键盘聚焦才转场，鼠标点击聚焦不抢先旋转（避免误开）。
    if (!event.target.matches?.(':focus-visible')) return
    if (index !== activeRef.current) rotateTo(index)
  }

  function handleKeyDown(event) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      rotateBy(-1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      rotateBy(1)
    }
  }

  // 宽度测量：ResizeObserver 优先，环境不支持时退回 window resize。
  useEffect(() => {
    const node = stageRef.current
    if (!node) return undefined
    const measure = () => setWidth(node.clientWidth)
    measure()
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure)
      return () => window.removeEventListener('resize', measure)
    }
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  // 尺寸变化后重排；layout effect 保证首帧就位，避免卡片堆叠闪烁。
  useLayoutEffect(() => {
    applyRef.current?.(posRef.current)
  }, [width, photos.length])

  // 入场的标题淡入，用 gsap.context 统一回收。
  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-gallery-caption]',
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.12, ease: 'power2.out' }
      )
    }, root)
    return () => ctx.revert()
  }, [])

  // 卸载清理：移除拖拽监听、取消 rAF、终止未完成补间。
  useEffect(
    () => () => {
      detachRef.current?.()
      stopLoopRef.current?.()
      gsap.killTweensOf(tweenPosRef.current)
    },
    []
  )

  const safeActive = Math.min(active, count - 1)
  const activePhoto = photos[safeActive]

  return (
    <div ref={rootRef} className={`relative ${className}`.trim()}>
      <div
        ref={stageRef}
        role="region"
        aria-roledescription="carousel"
        aria-label={GALLERY_ARIA_LABEL}
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
        onDragStart={event => event.preventDefault()}
        className={`relative w-full select-none overflow-hidden ${
          dragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{
          height: geometry.stageHeight,
          perspective: `${geometry.perspective}px`,
          perspectiveOrigin: '50% 44%',
          touchAction: 'pan-y',
        }}
      >
        {photos.map((photo, index) => (
          <div
            key={photo.id || index}
            ref={node => {
              cardsRef.current[index] = node
            }}
            className="absolute left-1/2 top-1/2 will-change-transform"
            style={{
              width: geometry.cardWidth,
              height: geometry.cardHeight,
              marginLeft: -geometry.cardWidth / 2,
              marginTop: -geometry.cardHeight / 2,
            }}
          >
            <button
              type="button"
              onClick={event => handleCardClick(event, index)}
              onFocus={event => handleCardFocus(event, index)}
              aria-label={photo.caption}
              aria-current={index === safeActive ? 'true' : undefined}
              className="group relative block h-full w-full text-left"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <span
                className={`relative block h-full w-full overflow-hidden bg-paper transition-[transform,box-shadow] duration-300 ease-out group-hover:-translate-y-2 ${
                  index === safeActive
                    ? 'shadow-[0_30px_70px_-24px_rgba(23,23,27,0.55)]'
                    : 'shadow-[0_18px_46px_-22px_rgba(23,23,27,0.4)]'
                }`}
              >
                <img
                  src={photo.src}
                  alt={photo.caption}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className="block h-full w-full object-cover"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/15"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-0 w-1/2 -translate-x-[160%] rotate-12 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[320%]"
                />
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-0 border transition-colors duration-300 ${
                    index === safeActive ? 'border-black/15' : 'border-black/5'
                  }`}
                />
              </span>
            </button>
          </div>
        ))}
      </div>

      <div data-gallery-caption className="mt-6 flex flex-col items-center gap-4 md:mt-8">
        <p
          aria-live="polite"
          className="text-center text-[15px] font-medium leading-snug md:text-base"
        >
          <span className="mr-3 tabular-nums text-[13px] font-normal text-ink-faint">
            {pad(safeActive + 1)} / {pad(count)}
          </span>
          {activePhoto?.caption}
        </p>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => rotateBy(-1)}
            aria-label={GALLERY_PREV_LABEL}
            className="inline-flex h-10 w-10 items-center justify-center border border-ink/15 text-ink transition-colors duration-200 hover:border-ink/40 hover:bg-ink/5"
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <span className="text-[12px] text-ink-faint">{GALLERY_HINT}</span>
          <button
            type="button"
            onClick={() => rotateBy(1)}
            aria-label={GALLERY_NEXT_LABEL}
            className="inline-flex h-10 w-10 items-center justify-center border border-ink/15 text-ink transition-colors duration-200 hover:border-ink/40 hover:bg-ink/5"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
