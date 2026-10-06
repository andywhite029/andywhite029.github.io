import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Check, ChevronLeft, ChevronRight, Copy, Languages, X } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { translations, PHOTO_IDS } from '../data/translations'
import { useLenis } from '../hooks/useLenis'
import { PlayOnDemandVideo } from './Media'

export function ProjectLink({ id, className = '' }) {
  const { language } = useLanguage()
  return <a href={`#project/${id}`} className={`project-link ${className}`}>{translations[language].detail.open}<ArrowUpRight size={17} aria-hidden="true" /></a>
}

function getProject(id, t) {
  if (/^lightwheel-[0-2]$/.test(id)) {
    const p = t.guanglun.projects[Number(id.at(-1))]
    return { ...p, section: 'guanglun', role: t.guanglun.role }
  }
  if (id === 'qcraft-website') return { ...t.qcraft.websiteCase, section: 'qcraft', time: t.qcraft.period, role: t.qcraft.role, context: t.detail.websiteContext, images: t.qcraft.websiteCase.images }
  if (/^qcraft-[0-1]$/.test(id)) return { ...t.qcraft.entries[Number(id.at(-1))], section: 'qcraft', time: t.qcraft.period, role: t.qcraft.role }
  if (['momenta', 'zeekr', 'xiaomi'].includes(id)) {
    const p = t[id]
    return { title: p.caseTitle, desc: p.caseDesc, time: p.period, role: p.role, section: id, stats: p.stats,
      link: id === 'momenta' ? 'https://mp.weixin.qq.com/s/cLbORjSdNRzwEKDKHAQ3vQ' : null,
      images: [{ src: `/assets-v2/${id}/${id === 'momenta' ? 'wicv' : 'hero'}-1600.webp`, alt: p.caseAlt || p.heroAlt }],
      context: id === 'momenta' ? '' : t.detail.official, technicalLabel: p.technicalLabel,
    }
  }
  return null
}

function readRoute() {
  const match = window.location.hash.match(/^#(project|photo)\/([a-z0-9-]+)$/)
  return match ? { type: match[1], id: match[2] } : null
}

export default function ProjectDetails() {
  const { language, toggleLanguage } = useLanguage()
  const t = translations[language]
  const lenis = useLenis()
  const [route, setRoute] = useState(readRoute)
  const [feedback, setFeedback] = useState('')
  const dialog = useRef(null)
  const openedHere = useRef(false)
  const routeRef = useRef(route)
  const photoIndex = route?.type === 'photo' ? PHOTO_IDS.indexOf(route.id) : -1
  const project = route?.type === 'project' ? getProject(route.id, t) : null
  const valid = Boolean(project || photoIndex >= 0)
  routeRef.current = route

  useEffect(() => {
    const sync = () => {
      const next = readRoute()
      if (next && !routeRef.current) openedHere.current = true
      if (!next) openedHere.current = false
      setFeedback('')
      setRoute(next)
    }
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  useEffect(() => {
    if (!valid) return undefined
    const node = dialog.current
    const trigger = document.activeElement
    const scrollY = window.scrollY
    const overflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    lenis?.stop()
    node.showModal()
    node.querySelector('[data-close]')?.focus()
    return () => {
      node.close()
      document.documentElement.style.overflow = overflow
      lenis?.start()
      window.scrollTo({ top: scrollY, behavior: 'instant' })
      if (trigger instanceof HTMLElement) trigger.focus({ preventScroll: true })
    }
  }, [valid, lenis])

  useEffect(() => {
    dialog.current?.scrollTo(0, 0)
  }, [route?.id])

  const close = () => {
    if (openedHere.current) {
      window.history.back()
    } else {
      const section = project?.section || 'about'
      window.history.replaceState(null, '', `#${section}`)
      setRoute(null)
      requestAnimationFrame(() => document.getElementById(section)?.scrollIntoView({ behavior: 'instant' }))
    }
  }
  const movePhoto = direction => {
    const id = PHOTO_IDS[(photoIndex + direction + PHOTO_IDS.length) % PHOTO_IDS.length]
    window.history.replaceState(null, '', `#photo/${id}`)
    setRoute({ type: 'photo', id })
    setFeedback('')
  }
  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setFeedback(t.detail.copied)
    } catch {
      setFeedback(t.detail.copyFailed)
    }
  }

  return (
    <dialog ref={dialog} className={`detail-dialog ${photoIndex >= 0 ? 'photo-dialog' : ''}`} aria-labelledby="detail-title" data-lenis-prevent
      onCancel={event => { event.preventDefault(); close() }}
      onClick={event => { if (event.target === event.currentTarget) { const r = event.currentTarget.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) close() } }}
      onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); close() } else if (photoIndex >= 0 && ['ArrowLeft', 'ArrowRight'].includes(event.key)) { event.preventDefault(); movePhoto(event.key === 'ArrowLeft' ? -1 : 1) } }}>
      {valid && <>
        <div className="detail-toolbar">
          <span className="text-sm font-semibold">{photoIndex >= 0 ? t.detail.personal : t[project.section].brand}</span>
          <div className="flex items-center gap-1">
            <button className="icon-button" onClick={toggleLanguage} title={t.detail.language} aria-label={t.detail.language}><Languages size={20} /></button>
            <button className="icon-button" onClick={share} title={t.detail.share} aria-label={t.detail.share}>{feedback === t.detail.copied ? <Check size={20} /> : <Copy size={20} />}</button>
            <button data-close className="icon-button" onClick={close} title={t.detail.close} aria-label={t.detail.close}><X size={22} /></button>
          </div>
        </div>
        <p role="status" className="px-6 text-sm">{feedback}</p>
        {photoIndex >= 0 ? <div className="photo-detail">
          <img src={`/assets-v2/photography/${route.id}.webp`} alt={t.photography.captions[photoIndex]} />
          <div className="flex items-center justify-between gap-4 pt-5">
            <button className="icon-button" onClick={() => movePhoto(-1)} title={t.detail.previous} aria-label={t.detail.previous}><ChevronLeft /></button>
            <h2 id="detail-title" className="text-center text-base">{t.photography.captions[photoIndex]} <span className="ml-3 text-ink-soft">{photoIndex + 1} / {PHOTO_IDS.length}</span></h2>
            <button className="icon-button" onClick={() => movePhoto(1)} title={t.detail.next} aria-label={t.detail.next}><ChevronRight /></button>
          </div>
        </div> : <article className="detail-content">
          <p className="text-sm text-ink-soft">{project.time}</p>
          <h2 id="detail-title" className="mt-3 text-[28px] font-bold leading-tight md:text-[40px]">{project.title}</h2>
          <div className="detail-copy"><h3>{t.detail.role}</h3><p>{project.role}</p></div>
          <div className="detail-copy"><h3>{t.detail.work}</h3><p>{project.desc}</p></div>
          {project.stats && <div className="detail-copy"><h3>{t.detail.results}</h3><ul className="space-y-3">{project.stats.map(stat => <li key={stat.value}><strong>{stat.value}</strong> · {stat.label}</li>)}</ul></div>}
          {project.video && <div className="mt-8 aspect-video"><PlayOnDemandVideo key={project.video} src={project.video} poster={project.poster} alt={project.videoAlt} playLabel={t.common.clickToPlay} /></div>}
          {project.screenshot && <figure className="mt-8"><img src={project.screenshot.src} alt={project.screenshot.alt} width="1430" height="894" className="h-auto w-full" /><figcaption className="mt-3 text-sm text-ink-soft">{project.screenshot.alt}</figcaption></figure>}
          {project.technicalLabel && <figure className="mt-8"><div className="aspect-video"><PlayOnDemandVideo key={project.section} src={`/assets-v2/${project.section}/technology.mp4`} poster={`/assets-v2/${project.section}/technology-poster.webp`} alt={project.technicalLabel} playLabel={t.common.clickToPlay} /></div><figcaption className="mt-3 text-sm text-ink-soft">{project.technicalLabel}</figcaption></figure>}
          {project.context && <p className="mt-3 text-sm text-ink-soft">{project.context}</p>}
          {project.images?.map(image => <img key={image.src} src={image.src} alt={image.alt} className="mt-8 h-auto w-full" loading="lazy" />)}
          {project.link && <a className="project-link mt-8" href={project.link} target="_blank" rel="noopener noreferrer">{project.linkLabel || t.common.viewOriginal}<ArrowUpRight size={17} /></a>}
        </article>}
      </>}
    </dialog>
  )
}
