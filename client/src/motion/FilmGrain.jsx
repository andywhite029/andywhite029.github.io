import { useReducedMotion } from '../hooks/useReducedMotion'

// 160px 的 SVG 噪声平铺：浏览器只栅格化一次，每帧不重绘 canvas。
const NOISE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="160" height="160" filter="url(#grain)"/></svg>`

const NOISE_URI = `url("data:image/svg+xml,${encodeURIComponent(NOISE_SVG)}")`

/**
 * 固定全屏胶片颗粒覆盖层，pointer-events: none，z-index 由外部通过 props 或 className 决定。
 * reduced-motion 时完全不渲染。
 */
export default function FilmGrain({ opacity = 0.045, zIndex = 60, className = '' }) {
  const reducedMotion = useReducedMotion()
  if (reducedMotion) return null

  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex,
        pointerEvents: 'none',
        opacity,
        backgroundImage: NOISE_URI,
        backgroundRepeat: 'repeat',
        backgroundSize: '160px 160px',
        mixBlendMode: 'soft-light',
      }}
    />
  )
}
