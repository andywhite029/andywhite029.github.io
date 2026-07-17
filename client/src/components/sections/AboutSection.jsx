import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useLanguage } from '../../context/LanguageContext'
import { translations } from '../../data/translations'

gsap.registerPlugin(ScrollTrigger)

export default function AboutSection() {
  const sectionRef = useRef(null)
  const contentRef = useRef(null)
  const reducedMotion = useReducedMotion()
  const { language } = useLanguage()
  const t = translations[language]

  useEffect(() => {
    if (reducedMotion) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section
      id="about"
      ref={sectionRef}
      className="py-16 lg:py-24 border-t border-border"
    >
      <div className="font-mono text-xs text-accent-red tracking-[0.3em] mb-6 uppercase">
        {t.about.frame}
      </div>

      <div ref={contentRef}>
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-text-primary mb-8 whitespace-pre-line">
          {t.about.title}
        </h2>

        <div className="space-y-6 text-text-secondary leading-relaxed max-w-2xl">
          {t.about.paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          {t.about.tags.map((tag) => (
            <span
              key={tag}
              className="font-mono text-xs px-3 py-1.5 border border-border text-text-secondary rounded-full hover:border-accent-red hover:text-accent-red transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
