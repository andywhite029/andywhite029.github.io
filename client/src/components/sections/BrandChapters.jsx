import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLanguage } from '../../context/LanguageContext'
import { translations } from '../../data/translations'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useIsMobile } from '../../hooks/useIsMobile'
import { ProjectLink } from '../ProjectDetails'

gsap.registerPlugin(ScrollTrigger)

function BrandImage({ brand, name = 'hero', alt, className = '' }) {
  const dimensions = { 'momenta/hero': [1600, 904], 'momenta/wicv': [800, 533], 'zeekr/hero': [1600, 800], 'xiaomi/hero': [1600, 811], 'xiaomi/devices': [1600, 732], 'xiaomi/home': [1600, 732] }
  const [width, height] = dimensions[`${brand}/${name}`]
  return <img width={width} height={height} className={className} src={`/assets-v2/${brand}/${name}-1600.webp`} srcSet={`/assets-v2/${brand}/${name}-800.webp 800w, /assets-v2/${brand}/${name}-1600.webp 1600w`} sizes="(max-width: 767px) 100vw, 1200px" alt={alt} loading="lazy" decoding="async" />
}

function Stats({ items }) {
  return <dl className="brand-stats">{items.map(stat => <div key={stat.value}><dt>{stat.label}</dt><dd>{stat.value}</dd></div>)}</dl>
}

function BrandHeading({ brand, logo }) {
  const { language } = useLanguage()
  const t = translations[language]
  const b = t[brand]
  return <div className="brand-heading content-width">
    {brand === 'momenta' ? <>
      <p className="eyebrow">{t.common.chapter} {b.index}</p>
      <h2 className="mt-5" aria-label={b.brand}>
        <img src={`/assets-v2/brands/${logo}`} alt={b.brand} className="chapter-brand-logo" loading="lazy" decoding="async" />
      </h2>
    </> : <>
      <div className="flex items-center justify-between gap-6"><img src={`/assets-v2/brands/${logo}`} alt={b.brand} className="brand-logo" loading="lazy" /><p className="eyebrow">{t.common.chapter} {b.index}</p></div>
      <h2 className="chapter-title mt-8">{b.brand}</h2>
    </>}
    <p className="mt-4 text-lg">{b.role} · {b.period}</p>
    <p className="mt-5 max-w-2xl leading-relaxed opacity-80">{b.intro}</p>
  </div>
}

function BrandStage({ brand, logo }) {
  const { language } = useLanguage()
  const t = translations[language]
  const reducedMotion = useReducedMotion()
  const isMobile = useIsMobile()
  const stageRef = useRef(null)
  const animated = !reducedMotion && !isMobile
  const maskLogo = brand === 'momenta' ? 'momenta-mask.svg' : logo

  useEffect(() => {
    if (!animated) return undefined
    const ctx = gsap.context(() => {
      const aperture = brand === 'momenta' ? 'inset(0% 0% 0% 0%)' : brand === 'zeekr'
        ? 'inset(0% 100% 0% 0%)'
        : brand === 'xiaomi' ? 'inset(100% 0% 0% 0%)' : 'inset(50% 0% 50% 0%)'
      const timeline = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: stageRef.current,
          start: brand === 'momenta' ? 'top 70%' : 'top top',
          end: 'bottom bottom',
          scrub: 0.45,
          invalidateOnRefresh: true,
        },
      })
      if (brand === 'zeekr') {
        // 相同顶点顺序让 Z 形切口连续扩张，底图始终保持固定取景。
        timeline
          .to('.brand-stage-copy', { y: -32, opacity: 0, duration: 0.16 }, 0.3)
          .fromTo('.brand-stage-full', {
            opacity: 0,
            clipPath: 'polygon(12% 25%, 88% 25%, 88% 26%, 15% 74%, 88% 74%, 88% 75%, 12% 75%, 12% 74%, 85% 26%, 12% 26%)',
          }, { opacity: 1, duration: 0.1 }, 0.32)
          .to('.brand-stage-full', {
            clipPath: 'polygon(6% 14%, 94% 14%, 94% 30%, 36% 66%, 94% 66%, 94% 86%, 6% 86%, 6% 70%, 64% 34%, 6% 34%)',
            duration: 0.24,
          }, 0.42)
          .to('.brand-stage-full', {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 50%, 100% 50%, 100% 50%, 100% 100%, 0% 100%, 0% 50%, 0% 50%, 0% 50%)',
            duration: 0.22,
          }, 0.66)
      } else if (brand === 'xiaomi') {
        timeline
          .to('.brand-stage-copy', { y: -48, opacity: 0, duration: 0.16 }, 0.3)
          .fromTo('.brand-stage-full', { clipPath: aperture, opacity: 1 },
            { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.48 }, 0.36)
      } else {
        timeline.fromTo('.brand-stage-mask', { opacity: 0, maskSize: '82% auto', maskPosition: 'center 15%' },
          { opacity: 1, duration: 0.28 }, 0)
        .to('.brand-stage-mask', { maskSize: '150% auto', maskPosition: 'center 50%', duration: 0.36 }, 0.28)
        // Keep both image layers sharp and aligned until the full image covers the mask.
        .fromTo('.brand-stage-full', { clipPath: aperture, opacity: 0 },
          { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, duration: 0.32 }, 0.54)
        .set('.brand-stage-mask', { opacity: 0 }, 0.86)
      }
      timeline.fromTo('.brand-stage-caption', { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.1 }, 0.84)
        .to('.brand-stage-full', { opacity: 1, duration: 0.22 }, 0.94)
    }, stageRef)
    return () => ctx.revert()
  }, [animated, brand])

  if (!animated) return <>
    <BrandHeading brand={brand} logo={logo} />
    <figure className="brand-visual"><BrandImage brand={brand} alt={t[brand].heroAlt} /><figcaption>{t.detail.official}</figcaption></figure>
  </>

  return <>
    {brand === 'momenta' && <BrandHeading brand={brand} logo={logo} />}
    <div ref={stageRef} className={`brand-stage brand-stage-${brand}`}>
    <div className="brand-stage-screen">
      {brand !== 'momenta' && <div className="brand-stage-copy"><BrandHeading brand={brand} logo={logo} /></div>}
      {brand === 'momenta' && <div className="brand-stage-mask" aria-hidden="true" style={{ '--brand-mask': `url('/assets-v2/brands/${maskLogo}')` }}>
        <BrandImage brand={brand} alt="" />
      </div>}
      <figure className="brand-stage-full">
        <BrandImage brand={brand} alt={t[brand].heroAlt} />
        <figcaption className="brand-stage-caption">
          <img src={`/assets-v2/brands/${logo}`} alt="" />
          <span>{t.detail.official}</span>
        </figcaption>
      </figure>
    </div>
  </div>
  </>
}

export default function BrandChapters() {
  const { language } = useLanguage()
  const t = translations[language]
  const root = useRef(null)
  const reducedMotion = useReducedMotion()
  useEffect(() => {
    if (reducedMotion) return undefined
    const media = gsap.matchMedia()
    media.add('(min-width: 768px)', () => {
      const ctx = gsap.context(() => {
        gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: '.brand-bridge',
            start: 'top 90%',
            end: 'bottom 25%',
            scrub: 0.4,
          },
        })
          .fromTo('.brand-bridge-green', { yPercent: 12 }, { yPercent: -4 }, 0)
          .fromTo('.brand-bridge-blue', { yPercent: 22 }, { yPercent: -8 }, 0)
          .fromTo('.brand-bridge-paper', { yPercent: 28 }, { yPercent: 0 }, 0)
        gsap.fromTo('.xiaomi-bridge', { opacity: 0.35 }, { opacity: 1, ease: 'none', scrollTrigger: { trigger: '.xiaomi-bridge', start: 'top 90%', end: 'bottom 40%', scrub: true } })
        gsap.fromTo('.momenta-path', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '#momenta', start: 'top 60%', end: 'center 55%', scrub: true } })
        gsap.fromTo('.xiaomi-pair figure', { y: 35 }, { y: 0, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: '.xiaomi-pair', start: 'top bottom', end: 'top 45%', scrub: true } })
      }, root)
      return () => ctx.revert()
    })
    return () => media.revert()
  }, [reducedMotion])

  return <div ref={root}>
    <section id="momenta" className="momenta-chapter">
      <div className="brand-bridge" aria-hidden="true">
        <div className="brand-bridge-green" />
        <div className="brand-bridge-blue" />
        <div className="brand-bridge-paper" />
      </div>
      <BrandStage brand="momenta" logo="momenta.png" />
      <div className="content-width pb-24">
        <div className="momenta-nodes"><div className="momenta-path" aria-hidden="true" />{t.momenta.nodes.map((node, i) => <div key={node}><span>0{i + 1}</span><h3>{node}</h3></div>)}</div>
        <Stats items={t.momenta.stats} />
        <article className="momenta-case"><BrandImage brand="momenta" name="wicv" alt={t.momenta.caseAlt} /><div><p className="eyebrow">WICV · 2025</p><h3>{t.momenta.caseTitle}</h3><p>{t.momenta.caseDesc}</p><ProjectLink id="momenta" /></div></article>
      </div>
    </section>
    <section id="zeekr" className="zeekr-chapter">
      <BrandStage brand="zeekr" logo="zeekr-wordmark.png" />
      <div className="content-width pb-24"><Stats items={t.zeekr.stats} /><ProjectLink id="zeekr" /></div>
    </section>
    <section id="xiaomi" className="xiaomi-chapter">
      <div className="xiaomi-bridge" aria-hidden="true" />
      <BrandStage brand="xiaomi" logo="xiaomi.png" />
      <div className="content-width pb-24">
        <Stats items={t.xiaomi.stats} /><ProjectLink id="xiaomi" />
        <div className="xiaomi-pair"><figure><BrandImage brand="xiaomi" name="devices" alt={t.xiaomi.devicesAlt} /></figure><figure><BrandImage brand="xiaomi" name="home" alt={t.xiaomi.homeAlt} /></figure></div>
      </div>
    </section>
  </div>
}
