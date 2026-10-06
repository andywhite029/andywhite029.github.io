import { createContext, useContext, useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from './useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

const LenisContext = createContext(null)

let lenisInstance = null

/** 平滑滚动到指定章节；Lenis 不可用时回退到原生滚动。 */
export function scrollToSection(id) {
  const el = document.getElementById(id)
  if (!el) return
  if (lenisInstance) {
    lenisInstance.scrollTo(el, { offset: -56, duration: 1.4 })
  } else {
    el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' })
  }
}

export function useLenis() {
  return useContext(LenisContext)
}

export function LenisProvider({ children }) {
  const lenisRef = useRef(null)
  const [lenis, setLenis] = useState(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) {
      setLenis(null)
      return undefined
    }

    const lenisInstanceLocal = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    })

    lenisRef.current = lenisInstanceLocal
    lenisInstance = lenisInstanceLocal
    setLenis(lenisInstanceLocal)

    // 让 GSAP ScrollTrigger 与 Lenis 同步
    lenisInstanceLocal.on('scroll', ScrollTrigger.update)

    const raf = (time) => {
      lenisInstanceLocal.raf(time * 1000)
    }
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenisInstance = null
      lenisInstanceLocal.destroy()
      gsap.ticker.remove(raf)
    }
  }, [reducedMotion])

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}
