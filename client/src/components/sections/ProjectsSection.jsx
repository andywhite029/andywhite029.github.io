import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useLanguage } from '../../context/LanguageContext'
import { translations } from '../../data/translations'
import { useShutterSound } from '../../hooks/useShutterSound'
import { ExternalLink } from 'lucide-react'
import TerminalCursor from '../TerminalCursor'

gsap.registerPlugin(ScrollTrigger)

export default function ProjectsSection() {
  const sectionRef = useRef(null)
  const terminalRef = useRef(null)
  const reducedMotion = useReducedMotion()
  const playShutter = useShutterSound()
  const { language } = useLanguage()
  const t = translations[language]

  const [history, setHistory] = useState([
    { id: 1, type: 'command', text: 'ls projects/' },
    { id: 2, type: 'output', text: '' },
  ])
  const [currentProject, setCurrentProject] = useState(null)
  const nextId = useRef(3)
  const terminalBodyRef = useRef(null)

  // 历史记录变化时自动滚到底部
  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight
    }
  }, [history])

  useEffect(() => {
    if (reducedMotion) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        terminalRef.current,
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

  const runCommand = (command, project = null) => {
    playShutter()

    setHistory((prev) => {
      const newHistory = [...prev]
      // 移除最后一行的光标
      if (newHistory[newHistory.length - 1]?.type === 'output') {
        newHistory.pop()
      }

      newHistory.push({ id: nextId.current++, type: 'command', text: command })

      if (project) {
        newHistory.push({ id: nextId.current++, type: 'project', project })
      } else {
        newHistory.push({ id: nextId.current++, type: 'list', items: t.projects.items })
      }

      newHistory.push({ id: nextId.current++, type: 'output', text: '' })
      return newHistory
    })

    setCurrentProject(project)
  }

  useEffect(() => {
    // 初始加载项目列表
    const timer = setTimeout(() => {
      setHistory([
        { id: 1, type: 'command', text: 'ls projects/' },
        { id: 2, type: 'list', items: t.projects.items },
        { id: 3, type: 'output', text: '' },
      ])
      nextId.current = 4
    }, 500)

    return () => clearTimeout(timer)
  }, [t.projects.items])

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

      {/* 终端窗口 */}
      <div
        ref={terminalRef}
        className="max-w-3xl rounded-lg border border-accent-green/30 bg-bg-terminal overflow-hidden shadow-[0_0_40px_rgba(0,255,65,0.1)]"
      >
        {/* 标题栏 */}
        <div className="flex items-center gap-2 px-4 py-3 bg-bg-secondary border-b border-accent-green/20">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-accent-red/80" />
            <div className="w-3 h-3 rounded-full bg-accent-red/60" />
            <div className="w-3 h-3 rounded-full bg-accent-green/80" />
          </div>
          <span className="ml-2 font-mono text-xs text-text-secondary">
            andy@darkroom: ~/projects
          </span>
        </div>

        {/* 终端内容 */}
        <div
          ref={terminalBodyRef}
          data-lenis-prevent
          className="p-4 md:p-6 font-mono text-sm min-h-[320px] max-h-[65vh] overflow-y-auto"
        >
          {history.map((entry) => {
            if (entry.type === 'command') {
              return (
                <div key={entry.id} className="flex items-start mb-2">
                  <span className="text-accent-green mr-2">{'>'}</span>
                  <span className="text-text-primary">{entry.text}</span>
                </div>
              )
            }

            if (entry.type === 'list') {
              return (
                <div key={entry.id} className="ml-4 mb-4 space-y-1">
                  {entry.items.map((project, i) => (
                    <button
                      key={i}
                      onClick={() => runCommand(`cat ${project.title.toLowerCase().replace(/\s+/g, '-')}`, project)}
                      className="block w-full text-left text-text-secondary hover:text-accent-green transition-colors"
                    >
                      {project.title}
                      {project.status === 'developing' && (
                        <span className="ml-2 text-accent-red text-xs">[DEV-ING]</span>
                      )}
                    </button>
                  ))}
                </div>
              )
            }

            if (entry.type === 'project') {
              const project = entry.project
              return (
                <div key={entry.id} className="ml-4 mb-4 text-text-secondary leading-relaxed">
                  <div className="mb-3">
                    <span className="text-accent-green">$</span> {project.title}
                  </div>

                  <div className="mb-3 text-sm">
                    {project.desc}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 border border-accent-green/40 text-accent-green"
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
                      className="inline-flex items-center gap-2 text-accent-green hover:text-accent-green-dim text-sm"
                    >
                      <ExternalLink size={14} />
                      {t.projects.viewOriginal}
                    </a>
                  )}
                </div>
              )
            }

            if (entry.type === 'output') {
              return (
                <div key={entry.id} className="flex items-start">
                  <span className="text-accent-green mr-2">{'>'}</span>
                  <TerminalCursor />
                </div>
              )
            }

            return null
          })}

          {/* 快捷命令提示 */}
          {!currentProject && history.length <= 3 && (
            <div className="mt-6 text-text-secondary/50 text-xs">
              <span className="text-accent-green-dim">tip:</span> click a project to view details
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
