import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useLanguage } from '../../context/LanguageContext'
import { translations } from '../../data/translations'
import { ExternalLink } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export default function ProjectsSection() {
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
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 85%',
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
      id="projects"
      ref={sectionRef}
      className="py-16 lg:py-24 border-t border-border"
    >
      <div className="font-mono text-xs text-accent-green tracking-[0.3em] mb-6 uppercase">
        {t.projects.frame}
      </div>

      <h2 className="font-serif text-3xl md:text-4xl font-bold text-text-primary mb-10">
        {t.projects.title}
      </h2>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        {t.projects.items.map((project, index) => (
          <li
            key={project.title}
            ref={(el) => (itemsRef.current[index] = el)}
            className="group flex h-full flex-col border border-border bg-bg-secondary/60 p-5 md:p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent-red hover:shadow-[0_12px_30px_rgba(204,17,0,0.12)]"
          >
            <div className="flex items-center justify-between gap-4 mb-5">
              <span className="font-mono text-xs tracking-[0.2em] text-accent-red">
                PROJECT {String(index + 1).padStart(2, '0')}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-text-secondary">
                {project.status === 'developing' ? 'In progress' : 'Completed'}
              </span>
            </div>

            <h3 className="font-serif text-xl md:text-2xl font-bold leading-tight text-text-primary mb-4">
              {project.title}
            </h3>

            <p className="text-text-secondary leading-relaxed mb-6">
              {project.desc}
            </p>

            <div className="mt-auto">
              <div className="flex flex-wrap gap-2 mb-6">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-xs px-2.5 py-1 border border-accent-red/40 text-accent-red-glow"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-mono text-xs text-text-secondary underline decoration-border underline-offset-4 transition-colors hover:text-accent-red hover:decoration-accent-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-red"
                >
                  <ExternalLink size={14} />
                  {t.projects.viewOriginal}
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
