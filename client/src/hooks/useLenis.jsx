import { createContext, useContext, useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from './useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

const LenisContext = createContext(null)

export function useLenis() {
  return useContext(LenisContext)
}

export function LenisProvider({ children }) {
  const lenisRef = useRef(null)
  const [lenis, setLenis] = useState(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) return

    const lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    })

    lenisRef.current = lenisInstance
    setLenis(lenisInstance)

    // 让 GSAP ScrollTrigger 与 Lenis 同步
    lenisInstance.on('scroll', ScrollTrigger.update)

    const raf = (time) => {
      lenisInstance.raf(time * 1000)
    }
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenisInstance.destroy()
      gsap.ticker.remove(raf)
    }
  }, [reducedMotion])

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}
