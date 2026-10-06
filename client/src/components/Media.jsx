import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'

/**
 * 全幅循环背景视频：
 * - 默认静音循环自动播放，50% 可见且页面在前台时才播放（屏幕外暂停）
 * - prefers-reduced-motion 或加载失败时降级为静态海报
 */
export function LoopVideo({ src, poster, alt, className = '', videoClassName = '', userPaused = false }) {
  const reducedMotion = useReducedMotion()
  const videoRef = useRef(null)
  const wrapRef = useRef(null)
  const [failed, setFailed] = useState(false)
  const inViewRef = useRef(false)

  useEffect(() => {
    if (reducedMotion) return undefined
    const el = wrapRef.current
    if (!el) return undefined

    const io = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting
        const video = videoRef.current
        if (!video) return
        if (entry.isIntersecting && !userPaused && !document.hidden) {
          video.play().catch(() => {})
        } else {
          video.pause()
        }
      },
      { threshold: 0.5 },
    )
    io.observe(el)

    const onVisibility = () => {
      const video = videoRef.current
      if (!video) return
      if (document.hidden || userPaused || !inViewRef.current) {
        video.pause()
      } else {
        video.play().catch(() => {})
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [reducedMotion, userPaused])

  if (reducedMotion || failed) {
    return (
      <img ref={wrapRef} src={poster} alt={alt} className={`${className} object-cover`} loading="eager" />
    )
  }

  return (
    <div ref={wrapRef} className={className} role="img" aria-label={alt}>
      <video
        ref={videoRef}
        className={`h-full w-full object-cover ${videoClassName}`}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        onError={() => setFailed(true)}
      />
    </div>
  )
}

/**
 * 点击播放的项目视频：海报 + 播放按钮，点击后才加载视频。
 */
export function PlayOnDemandVideo({ src, poster, alt, playLabel }) {
  const videoRef = useRef(null)
  const [mounted, setMounted] = useState(false) // 点击后才挂载 <video>（不进入首载）
  const [status, setStatus] = useState('idle') // idle | loading | playing | paused | failed

  const start = () => {
    if (mounted) {
      if (status === 'failed') {
        setMounted(false)
        setStatus('idle')
        return
      }
      videoRef.current?.play().catch(() => setStatus('failed'))
      return
    }
    setMounted(true)
    setStatus('loading')
  }

  // <video> 挂载后自动播放
  useEffect(() => {
    if (mounted && status === 'loading') {
      videoRef.current?.play().catch(() => setStatus('failed'))
    }
  }, [mounted, status])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return undefined
    const onPlaying = () => setStatus('playing')
    const onPause = () => setStatus((s) => (s === 'playing' || s === 'loading' ? 'paused' : s))
    const onError = () => setStatus('failed')
    video.addEventListener('playing', onPlaying)
    video.addEventListener('pause', onPause)
    video.addEventListener('error', onError)
    return () => {
      video.removeEventListener('playing', onPlaying)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('error', onError)
    }
  }, [mounted])

  return (
    <div className="group relative h-full w-full overflow-hidden bg-black">
      {!mounted || status === 'failed' ? (
        <img src={poster} alt={alt} className="h-full w-full object-cover" loading="lazy" decoding="async" />
      ) : (
        <video
          ref={videoRef}
          className="h-full w-full object-contain"
          src={src}
          poster={poster}
          controls
          playsInline
          preload="auto"
        />
      )}
      {!mounted && (
        <button
          type="button"
          onClick={start}
          aria-label={playLabel}
          className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors hover:bg-black/25"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-ink shadow-lg transition-transform group-hover:scale-105">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5.14v13.72c0 .8.87 1.3 1.56.88l10.5-6.86a1.04 1.04 0 0 0 0-1.76L9.56 4.26A1.04 1.04 0 0 0 8 5.14Z" />
            </svg>
          </span>
        </button>
      )}
      {mounted && status === 'failed' && (
        <button
          type="button"
          onClick={start}
          className="absolute inset-0 flex items-center justify-center bg-black/25 text-[14px] font-semibold text-white"
        >
          {playLabel}
        </button>
      )}
      {mounted && status === 'loading' && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30" aria-live="polite">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        </div>
      )}
    </div>
  )
}
