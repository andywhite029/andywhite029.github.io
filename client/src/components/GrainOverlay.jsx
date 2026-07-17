import { useEffect, useRef } from 'react'

export default function GrainOverlay() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let animationId

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const noise = () => {
      const imageData = ctx.createImageData(canvas.width, canvas.height)
      const data = imageData.data

      for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() * 255
        data[i] = value
        data[i + 1] = value
        data[i + 2] = value
        data[i + 3] = 8
      }

      ctx.putImageData(imageData, 0, 0)
    }

    const loop = () => {
      noise()
      animationId = requestAnimationFrame(loop)
    }

    resize()
    window.addEventListener('resize', resize)
    loop()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none mix-blend-overlay opacity-50"
      aria-hidden="true"
    />
  )
}
