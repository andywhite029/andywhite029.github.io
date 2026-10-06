import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLanguage } from '../../context/LanguageContext'
import { translations } from '../../data/translations'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useIsMobile } from '../../hooks/useIsMobile'
import { scrollToSection } from '../../hooks/useLenis'
import { LoopVideo, PlayOnDemandVideo } from '../Media'
import { ProjectLink } from '../ProjectDetails'

gsap.registerPlugin(ScrollTrigger)

const ENTRY_IDS = ['gl-project-0', 'gl-project-1', 'gl-project-2']

function HeaderBlock() {
  const { language } = useLanguage()
  const g = translations[language].guanglun
  return (
    <div className="mx-auto w-full max-w-content px-5 pb-16 pt-24 md:px-8 md:pb-24 md:pt-32">
      <img src="/assets-v2/brands/guanglun-logo.png" alt={g.brandAlt} className="h-7 w-auto md:h-8" loading="lazy" decoding="async" />
      <p className="eyebrow mt-8 text-gl-mist">{translations[language].common.chapter} {g.index}</p>
      <h2 className="chapter-title mt-3 text-white">{g.brand}</h2>
      <p className="mt-4 text-[17px] font-medium text-gl-silver/90 md:text-lg">
        {g.role} · {g.period}
      </p>
      <p className="mt-6 max-w-2xl leading-relaxed text-gl-mist">{g.intro}</p>
    </div>
  )
}

function ProjectEntry({ project, index }) {
  const { language } = useLanguage()
  const t = translations[language]
  return (
    <article id={ENTRY_IDS[index]} className="grid scroll-mt-24 gap-7 border-t border-white/10 py-10 md:grid-cols-12 md:gap-10 md:py-14">
      <div className="md:col-span-5">
        <div className="aspect-video w-full">
          <PlayOnDemandVideo
            src={project.video}
            poster={project.poster}
            alt={project.videoAlt}
            playLabel={`${t.common.clickToPlay} — ${project.title}`}
          />
        </div>
      </div>
      <div className="md:col-span-7">
        <div className="flex flex-wrap items-center gap-3">
          <span className="eyebrow text-gl-mist">{String(index + 1).padStart(2, '0')}</span>
          <span className="text-[13px] text-gl-mist">{project.time}</span>
          {project.published && (
            <span className="rounded-full border border-gl-blue/60 px-2.5 py-0.5 text-[12px] font-medium text-gl-mist">
              {t.common.publishedBadge}
            </span>
          )}
        </div>
        <h3 className="mt-3 text-[24px] font-bold leading-snug text-white md:text-[28px]">{project.title}</h3>
        <p className="mt-4 max-w-xl leading-relaxed text-gl-mist">{project.desc}</p>
        <ProjectLink id={`lightwheel-${index}`} className="mt-5" />
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {project.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-white/5 px-3 py-1 text-[12px] font-medium text-gl-silver/80">
              {tag}
            </span>
          ))}
        </div>
        <a
          href={project.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 text-[15px] font-semibold text-gl-silver underline decoration-gl-blue decoration-2 underline-offset-4 transition-colors hover:text-white"
        >
          {t.common.viewOriginal}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2 10 10 2M4 2h6v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </article>
  )
}

/**
 * 光轮智能章节：深空蓝紫暗色世界。
 * 桌面动效版含一个短距离粘性影像舞台：作品画面 → 我的职责 → 项目入口。
 */
export default function GuanglunSection() {
  const { language } = useLanguage()
  const t = translations[language]
  const g = t.guanglun
  const reducedMotion = useReducedMotion()
  const isMobile = useIsMobile()
  const expanded = !reducedMotion && !isMobile

  const stageRef = useRef(null)
  const vidBRef = useRef(null)
  const capARef = useRef(null)
  const capBRef = useRef(null)
  const dutiesRef = useRef(null)
  const projectsRef = useRef(null)
  const scrimRef = useRef(null)
  // 第二条视频滚动到达后才挂载，避免在不可见时解码
  const [vidBActive, setVidBActive] = useState(false)

  useEffect(() => {
    if (!expanded) return undefined
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: stageRef.current,
          start: 'top top',
          // 与 sticky 行程一致，避免时间线先于粘性结束
          end: () => `+=${stageRef.current.offsetHeight - window.innerHeight}`,
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      })
      // 状态一：作品画面（RoboStack → 持续学习 交叉淡化）
      tl.to(vidBRef.current, {
        opacity: 1,
        duration: 0.2,
        onStart: () => setVidBActive(true),
        onReverseComplete: () => setVidBActive(false),
      }, 0.3)
        .to(capARef.current, { opacity: 0, y: -14, duration: 0.1 }, 0.34)
        .fromTo(capBRef.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.12 }, 0.44)
        // 状态二：我的职责
        .to([capBRef.current, capARef.current], { opacity: 0, duration: 0.08 }, 0.58)
        .to(scrimRef.current, { opacity: 0.72, duration: 0.15 }, 0.6)
        .fromTo(dutiesRef.current, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.16 }, 0.62)
        // 状态三：项目入口
        .to(dutiesRef.current, { opacity: 0, y: -22, duration: 0.1 }, 0.8)
        .fromTo(projectsRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.18 }, 0.86)
    }, stageRef)
    return () => ctx.revert()
  }, [expanded])

  if (!expanded) {
    // 移动端 / reduced-motion：自然流动的轻量版
    return (
      <section id="guanglun" className="bg-gl-night text-gl-silver">
        <HeaderBlock />
        <div className="mx-auto w-full max-w-content space-y-14 px-5 pb-14 md:px-8">
          <figure>
            <div className="aspect-video w-full">
              <LoopVideo
                src="/assets-v2/guanglun/robostack-stage.mp4"
                poster="/assets-v2/guanglun/robostack-stage-poster.webp"
                alt={g.projects[0].videoAlt}
                className="aspect-video w-full"
              />
            </div>
            <figcaption className="mt-3 text-[13px] text-gl-mist">{g.stage.captionA}</figcaption>
          </figure>
          <figure>
            <div className="aspect-video w-full">
              <LoopVideo
                src="/assets-v2/guanglun/continuous-learning.mp4"
                poster="/assets-v2/guanglun/continuous-learning-poster.webp"
                alt={g.projects[1].videoAlt}
                className="aspect-video w-full"
              />
            </div>
            <figcaption className="mt-3 text-[13px] text-gl-mist">{g.stage.captionB}</figcaption>
          </figure>
          <div>
            <p className="eyebrow text-gl-mist">{g.stage.state2Label}</p>
            <ul className="mt-4 grid grid-cols-2 gap-3">
              {g.stage.duties.map((d, i) => (
                <li key={d} className="rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-[15px] font-medium">
                  <span className="mr-2 text-gl-mist">{String(i + 1).padStart(2, '0')}</span>
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <ProjectList />
      </section>
    )
  }

  return (
    <section id="guanglun" className="bg-gl-night text-gl-silver">
      {/* 粘性影像舞台：约 3 屏的滚动距离 */}
      <div ref={stageRef} className="relative" style={{ height: '300vh' }}>
        <div className="sticky top-0 h-screen overflow-hidden">
          <LoopVideo
            src="/assets-v2/guanglun/robostack-stage.mp4"
            poster="/assets-v2/guanglun/robostack-stage-poster.webp"
            alt={g.projects[0].videoAlt}
            className="absolute inset-0"
          />
          <div ref={vidBRef} className="absolute inset-0 opacity-0">
            {vidBActive ? (
              <LoopVideo
                src="/assets-v2/guanglun/continuous-learning.mp4"
                poster="/assets-v2/guanglun/continuous-learning-poster.webp"
                alt={g.projects[1].videoAlt}
                className="absolute inset-0"
              />
            ) : (
              <img
                src="/assets-v2/guanglun/continuous-learning-poster.webp"
                alt=""
                aria-hidden="true"
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-gl-night/80 via-transparent to-gl-night/40" />
          <div ref={scrimRef} className="absolute inset-0 bg-gl-night opacity-0" />

          {/* 状态一：作品画面 */}
          <div ref={capARef} className="absolute bottom-24 left-5 right-5 md:left-8 md:right-8">
            <div className="mx-auto max-w-content">
              <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur">
                {g.stage.state1Label}
              </span>
              <p className="mt-4 max-w-xl text-[22px] font-semibold leading-snug text-white md:text-[28px]">
                {g.stage.captionA}
              </p>
            </div>
          </div>
          <div ref={capBRef} className="absolute bottom-24 left-5 right-5 opacity-0 md:left-8 md:right-8">
            <div className="mx-auto max-w-content">
              <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur">
                {g.stage.state1Label}
              </span>
              <p className="mt-4 max-w-xl text-[22px] font-semibold leading-snug text-white md:text-[28px]">
                {g.stage.captionB}
              </p>
            </div>
          </div>

          {/* 状态二：我的职责 */}
          <div ref={dutiesRef} className="absolute inset-0 flex items-center justify-center opacity-0">
            <div className="w-[min(92vw,760px)] rounded-2xl border border-white/10 bg-gl-night/70 p-8 backdrop-blur-md md:p-12">
              <p className="eyebrow text-gl-mist">{g.stage.state2Label}</p>
              <ul className="mt-6 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                {g.stage.duties.map((d, i) => (
                  <li key={d} className="flex items-baseline gap-4 border-b border-white/10 pb-4 text-[19px] font-semibold text-white md:text-[22px]">
                    <span className="text-[14px] font-semibold text-gl-blue">{String(i + 1).padStart(2, '0')}</span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 状态三：项目入口 */}
          <div ref={projectsRef} className="absolute inset-0 flex items-center opacity-0">
            <div className="mx-auto w-full max-w-content px-5 md:px-8">
              <p className="eyebrow text-gl-mist">{g.stage.state3Label}</p>
              <ul className="mt-6 divide-y divide-white/10 border-y border-white/10">
                {g.projects.map((p, i) => (
                  <li key={p.title}>
                    <button
                      type="button"
                      onClick={() => scrollToSection(ENTRY_IDS[i])}
                      className="group flex w-full items-baseline gap-5 py-5 text-left transition-transform duration-300 hover:translate-x-2"
                    >
                      <span className="text-[14px] font-semibold text-gl-blue">{String(i + 1).padStart(2, '0')}</span>
                      <span className="flex-1 text-[20px] font-semibold text-white md:text-[26px]">{p.title}</span>
                      <span className="hidden text-[13px] text-gl-mist md:block">{p.tags.join(' · ')}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-[13px] text-gl-mist">{g.stage.hint}</p>
            </div>
          </div>
        </div>
      </div>

      <ProjectList />
    </section>
  )

  function ProjectList() {
    return (
      <div className="mx-auto w-full max-w-content px-5 pb-24 pt-6 md:px-8 md:pb-32">
        <p className="eyebrow text-gl-mist">{g.projectsTitle}</p>
        <div className="mt-6">
          {g.projects.map((p, i) => (
            <ProjectEntry key={p.title} project={p} index={i} />
          ))}
        </div>
      </div>
    )
  }
}
