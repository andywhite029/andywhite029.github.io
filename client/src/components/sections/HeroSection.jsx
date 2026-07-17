import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useLanguage } from '../../context/LanguageContext'
import { translations } from '../../data/translations'
import TerminalCursor from '../TerminalCursor'

export default function HeroSection() {
  const sectionRef = useRef(null)
  const titleRef = useRef(null)
  const subtitleRef = useRef(null)
  const reducedMotion = useReducedMotion()
  const { language } = useLanguage()
  const t = translations[language]

  useEffect(() => {
    if (reducedMotion) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: 'power2.out', delay: 0.2 }
      )
      gsap.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, ease: 'power2.out', delay: 0.6 }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="min-h-[60vh] flex flex-col justify-center py-16 lg:py-24"
    >
      <div className="font-mono text-xs text-accent-red tracking-[0.3em] mb-6 uppercase">
        {t.hero.frame}
      </div>

      <h1
        ref={titleRef}
        className="font-serif text-5xl md:text-7xl font-bold text-text-primary leading-tight mb-6"
      >
        {t.hero.title}
      </h1>

      <div ref={subtitleRef}>
        <p className="text-2xl md:text-3xl text-text-secondary mb-8 font-light">
          {t.hero.subtitle}
          <TerminalCursor className="ml-2" />
        </p>

        <p className="text-text-secondary leading-relaxed max-w-2xl">
          {t.hero.description}
        </p>
      </div>
    </section>
  )
}
