import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useLanguage } from '../../context/LanguageContext'
import { translations } from '../../data/translations'
import { useShutterSound } from '../../hooks/useShutterSound'
import { ExternalLink, Loader2 } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export default function ProjectsSection() {
  const sectionRef = useRef(null)
  const cardsRef = useRef([])
  const reducedMotion = useReducedMotion()
  const playShutter = useShutterSound()
  const { language } = useLanguage()
  const t = translations[language]
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (reducedMotion) return

    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card) => {
        if (!card) return

        gsap.fromTo(
          card,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [reducedMotion])

  const activeProject = t.projects.items[activeIndex]

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="py-16 lg:py-24 border-t border-border"
    >
      <div className="font-mono text-xs text-accent-green tracking-[0.3em] mb-6 uppercase">
        {t.projects.frame}
      </div>

      <h2 className="font-serif text-3xl md:text-4xl font-bold text-text-primary mb-6">
        {t.projects.title}
      </h2>

      <div className="font-mono text-sm text-accent-green-dim mb-12">
        <span className="text-accent-green">{'>'}</span> {t.projects.command}
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* 命令列表 */}
        <div className="space-y-2">
          {t.projects.items.map((project, index) => (
            <button
              key={index}
              onClick={() => {
                setActiveIndex(index)
                playShutter()
              }}
              className={`w-full text-left p-4 border rounded-lg font-mono text-sm transition-all duration-300 ${
                activeIndex === index
                  ? 'border-accent-green bg-accent-green/5 text-text-primary'
                  : 'border-border text-text-secondary hover:border-accent-green-dim hover:text-text-primary'
              }`}
            >
              <span className="text-accent-green mr-3">{'>'}</span>
              {project.title}
              {project.status === 'developing' && (
                <span className="ml-3 inline-flex items-center gap-1 text-xs text-accent-red">
                  <Loader2 size={12} className="animate-spin" />
                  DEV-ING
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 项目详情 */}
        <div
          ref={(el) => (cardsRef.current[0] = el)}
          className="border border-border rounded-xl p-6 bg-bg-secondary/50"
        >
          <div className="flex flex-wrap gap-2 mb-4">
            {activeProject.tags.map((tag) => (
              <span
                key={tag}
                className="font-mono text-xs px-2 py-1 border border-accent-green/30 text-accent-green rounded"
              >
                {tag}
              </span>
            ))}
          </div>

          <h3 className="text-xl font-bold text-text-primary mb-3">
            {activeProject.title}
          </h3>

          <p className="text-text-secondary leading-relaxed mb-6">
            {activeProject.desc}
          </p>

          {activeProject.link && (
            <a
              href={activeProject.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-mono text-sm text-accent-green hover:text-accent-green-dim transition-colors"
            >
              <ExternalLink size={14} />
              {t.projects.viewOriginal}
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
