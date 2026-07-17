import { createContext, useContext, useEffect, useState } from 'react'
import { useLenis } from '../hooks/useLenis'

const ScrollProgressContext = createContext({
  scrollProgress: 0,
  currentSection: 0,
})

export function useScrollProgress() {
  return useContext(ScrollProgressContext)
}

const SECTIONS = ['hero', 'about', 'experience', 'transition', 'projects', 'contact']
const SECTION_THRESHOLDS = [0, 0.15, 0.32, 0.52, 0.62, 0.9]

export function ScrollProgressProvider({ children }) {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [currentSection, setCurrentSection] = useState(0)
  const lenis = useLenis()

  useEffect(() => {
    if (!lenis) {
      // Lenis 未启用时，回退到原生滚动
      const handleScroll = () => {
        const scrollTop = window.scrollY
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        const progress = docHeight > 0 ? scrollTop / docHeight : 0
        setScrollProgress(progress)

        const index = SECTION_THRESHOLDS.findLastIndex((t) => progress >= t)
        setCurrentSection(Math.max(0, index))
      }

      window.addEventListener('scroll', handleScroll, { passive: true })
      handleScroll()
      return () => window.removeEventListener('scroll', handleScroll)
    }

    const handleScroll = ({ progress }) => {
      setScrollProgress(progress)
      const index = SECTION_THRESHOLDS.findLastIndex((t) => progress >= t)
      setCurrentSection(Math.max(0, index))
    }

    lenis.on('scroll', handleScroll)
    return () => lenis.off('scroll', handleScroll)
  }, [lenis])

  return (
    <ScrollProgressContext.Provider
      value={{ scrollProgress, currentSection, sectionName: SECTIONS[currentSection] || 'hero' }}
    >
      {children}
    </ScrollProgressContext.Provider>
  )
}
