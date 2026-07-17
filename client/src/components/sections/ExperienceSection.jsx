import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useLanguage } from '../../context/LanguageContext'
import { translations } from '../../data/translations'
import { ExternalLink } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export default function ExperienceSection() {
  const sectionRef = useRef(null)
  const itemsRef = useRef([])
  const reducedMotion = useReducedMotion()
  const { language } = useLanguage()
  const t = translations[language]

  useEffect(() => {
    if (reducedMotion) return

    const ctx = gsap.context(() => {
      itemsRef.current.forEach((item) => {
        if (!item) return

        gsap.fromTo(
          item,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="py-16 lg:py-24 border-t border-border"
    >
      <div className="font-mono text-xs text-accent-red tracking-[0.3em] mb-6 uppercase">
        {t.experience.frame}
      </div>

      <h2 className="font-serif text-3xl md:text-4xl font-bold text-text-primary mb-12">
        {t.experience.title}
      </h2>

      <div className="space-y-10 max-w-2xl">
        {t.experience.items.map((item, index) => (
          <div
            key={index}
            ref={(el) => (itemsRef.current[index] = el)}
            className="group relative pl-6 border-l-2 border-border hover:border-accent-red transition-colors duration-300"
          >
            {/* 齿孔标记 */}
            <div className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-bg-primary border-2 border-accent-red-dark group-hover:border-accent-red group-hover:bg-accent-red transition-colors duration-300" />

            <div className="font-mono text-xs text-accent-red mb-1 tracking-wider">
              FRAME {String(index * 2 + 12).padStart(2, '0')}
            </div>

            <div className="flex flex-wrap items-baseline gap-3 mb-2">
              <h3 className="text-xl font-bold text-text-primary">
                {item.company}
              </h3>
              <span className="font-mono text-sm text-text-secondary">
                {item.year}
              </span>
            </div>

            <p className="text-accent-red-glow/90 mb-2 font-medium">
              {item.title}
            </p>

            <p className="text-text-secondary leading-relaxed">
              {item.desc}
            </p>

            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-3 font-mono text-xs text-text-secondary hover:text-accent-red transition-colors"
              >
                <ExternalLink size={12} />
                {item.link.replace(/^https?:\/\//, '')}
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
