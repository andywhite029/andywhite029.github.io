import { useEffect, useRef } from 'react'

export default function FlareOverlay() {
  const containerRef = useRef(null)
  const flare1Ref = useRef(null)
  const flare2Ref = useRef(null)
  const flare3Ref = useRef(null)

  useEffect(() => {
    let mouseX = window.innerWidth / 2
    let mouseY = window.innerHeight / 2
    let rafId

    const handleMouseMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    const animate = () => {
      if (!flare1Ref.current || !flare2Ref.current || !flare3Ref.current) {
        rafId = requestAnimationFrame(animate)
        return
      }

      const w = window.innerWidth
      const h = window.innerHeight
      const time = Date.now() * 0.0002

      // 主炫光：缓慢漂移 + 轻微跟随鼠标
      const x1 = w * 0.7 + Math.sin(time * 0.5) * w * 0.1 + (mouseX - w / 2) * 0.03
      const y1 = h * 0.3 + Math.cos(time * 0.7) * h * 0.08 + (mouseY - h / 2) * 0.03

      // 次炫光：反方向漂移
      const x2 = w * 0.2 + Math.sin(time * 0.3 + 2) * w * 0.08 - (mouseX - w / 2) * 0.02
      const y2 = h * 0.7 + Math.cos(time * 0.4 + 1) * h * 0.1 - (mouseY - h / 2) * 0.02

      // 小炫光：快速闪烁
      const x3 = w * 0.5 + Math.sin(time * 1.2) * w * 0.15
      const y3 = h * 0.5 + Math.cos(time * 0.9) * h * 0.12

      flare1Ref.current.style.transform = `translate(${x1}px, ${y1}px)`
      flare2Ref.current.style.transform = `translate(${x2}px, ${y2}px)`
      flare3Ref.current.style.transform = `translate(${x3}px, ${y3}px)`

      rafId = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', handleMouseMove)
    animate()

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* 大红炫光 */}
      <div
        ref={flare1Ref}
        className="absolute w-[600px] h-[600px] -ml-[300px] -mt-[300px] rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(204,17,0,0.4) 0%, rgba(204,17,0,0.1) 40%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* 小红炫光 */}
      <div
        ref={flare2Ref}
        className="absolute w-[400px] h-[400px] -ml-[200px] -mt-[200px] rounded-full opacity-25"
        style={{
          background: 'radial-gradient(circle, rgba(255,34,0,0.3) 0%, rgba(255,34,0,0.08) 40%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* 小亮点 */}
      <div
        ref={flare3Ref}
        className="absolute w-[200px] h-[200px] -ml-[100px] -mt-[100px] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(255,100,80,0.25) 0%, transparent 60%)',
          filter: 'blur(30px)',
        }}
      />
    </div>
  )
}
