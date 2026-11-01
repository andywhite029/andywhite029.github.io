import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useLanguage } from '../context/LanguageContext'
import { translations } from '../data/translations'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { markIntroDone } from '../lib/intro'

const SESSION_KEY = 'andy-intro-seen'
const MIN_MS = 900
const MAX_WAIT_MS = 2600

/** 首次访问才播入场序列：减少动画偏好、详情深链、同一 tab 二次访问都直接跳过。 */
function shouldSkip(reducedMotion) {
  if (typeof window === 'undefined') return true
  if (reducedMotion) return true
  if (/^#(project|photo)\//.test(window.location.hash)) return true
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === 'seen'
  } catch {
    return false
  }
}

/**
 * 入场序列：暗场计数 → 幕布上下分离，同时首屏开始自己的入场动画。
 * 面板只是两层色块 + 一个 timeline，成本极低，也不会挡住 LCP 用的海报图。
 */
export default function Preloader() {
  const reducedMotion = useReducedMotion()
  const { language } = useLanguage()
  const t = translations[language]
  const ui = t.ui
  const rootRef = useRef(null)
  const countRef = useRef(null)
  const barRef = useRef(null)
  const [active, setActive] = useState(() => !shouldSkip(reducedMotion))

  // 跳过路径：立刻放行首屏动画
  useEffect(() => {
    if (active) return
    markIntroDone()
  }, [active])

  useEffect(() => {
    if (!active) return undefined
    const root = rootRef.current
    if (!root) return undefined

    try {
      window.sessionStorage.setItem(SESSION_KEY, 'seen')
    } catch {
      // 隐私模式下忽略
    }

    const overflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    let cancelled = false
    let reveal = null
    const counter = { value: 0 }

    const ctx = gsap.context(() => {
      gsap.to(counter, {
        value: 100,
        duration: 1.15,
        ease: 'power2.inOut',
        onUpdate: () => {
          if (countRef.current) {
            countRef.current.textContent = String(Math.round(counter.value)).padStart(3, '0')
          }
          if (barRef.current) {
            barRef.current.style.transform = `scaleX(${counter.value / 100})`
          }
        },
      })

      reveal = gsap.timeline({ paused: true, defaults: { ease: 'power4.inOut' } })
      reveal
        .to('[data-preload="content"]', { opacity: 0, y: -14, duration: 0.3, ease: 'power2.in' })
        .to('[data-preload="panel-top"]', { yPercent: -101, duration: 0.95 }, 0.16)
        .to('[data-preload="panel-bottom"]', { yPercent: 101, duration: 0.95 }, 0.16)
        // 幕布刚开口时放行首屏，让动画藏在幕布后面完成前半段
        .add(() => markIntroDone(), 0.34)
        .add(() => {
          if (!cancelled) setActive(false)
        })
    }, root)

    const minWait = new Promise(resolve => gsap.delayedCall(MIN_MS / 1000, resolve))
    const loadWait = new Promise(resolve => {
      if (document.readyState === 'complete') {
        resolve()
        return
      }
      window.addEventListener('load', resolve, { once: true })
      // 网络慢时不无限等待，避免入场序列变成阻塞
      gsap.delayedCall(MAX_WAIT_MS / 1000, resolve)
    })

    Promise.all([minWait, loadWait]).then(() => {
      if (!cancelled && reveal) reveal.play()
    })

    return () => {
      cancelled = true
      ctx.revert()
      document.documentElement.style.overflow = overflow
    }
  }, [active])

  if (!active) return null

  return (
    <div ref={rootRef} className="preloader" aria-hidden="true">
      <div data-preload="panel-top" className="preloader-panel preloader-panel--top" />
      <div data-preload="panel-bottom" className="preloader-panel preloader-panel--bottom" />
      <div data-preload="content" className="preloader-content">
        <div className="preloader-meta">
          <span className="tech-label">{ui.introTag}</span>
          <span ref={countRef} className="preloader-count tabular-nums">
            000
          </span>
        </div>

        <div className="preloader-center">
          <p className="preloader-word">ANDY</p>
          <p className="preloader-tagline">{t.footer.tagline}</p>
        </div>

        <div className="preloader-foot">
          <div className="preloader-track">
            <span ref={barRef} className="preloader-bar" />
          </div>
          <div className="preloader-meta">
            <span className="tech-label">{ui.loading}</span>
            <span className="tech-label">2026 · CN</span>
          </div>
        </div>
      </div>
    </div>
  )
}
