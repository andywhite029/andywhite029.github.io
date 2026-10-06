import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLanguage } from '../../context/LanguageContext'
import { translations } from '../../data/translations'
import { useReducedMotion } from '../../hooks/useReducedMotion'
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
    <div className="flex items-center justify-between gap-6"><img src={`/assets-v2/brands/${logo}`} alt={b.brand} className="brand-logo" loading="lazy" /><p className="eyebrow">{t.common.chapter} {b.index}</p></div>
    <h2 className="chapter-title mt-8">{b.brand}</h2>
    <p className="mt-4 text-lg">{b.role} · {b.period}</p>
    <p className="mt-5 max-w-2xl leading-relaxed opacity-80">{b.intro}</p>
  </div>
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
        gsap.fromTo('.brand-bridge-line', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.brand-bridge', start: 'top 85%', end: 'bottom 40%', scrub: true } })
        gsap.fromTo('.zeekr-visual', { clipPath: 'inset(0 12% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', ease: 'none', scrollTrigger: { trigger: '.zeekr-visual', start: 'top 90%', end: 'top 30%', scrub: true } })
        gsap.fromTo('.xiaomi-bridge', { opacity: 0.35 }, { opacity: 1, ease: 'none', scrollTrigger: { trigger: '.xiaomi-bridge', start: 'top 90%', end: 'bottom 40%', scrub: true } })
        gsap.fromTo('.momenta-path', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '#momenta', start: 'top 60%', end: 'center 55%', scrub: true } })
        gsap.fromTo('.zeekr-image', { xPercent: -2 }, { xPercent: 2, ease: 'none', scrollTrigger: { trigger: '#zeekr', start: 'top bottom', end: 'bottom top', scrub: true } })
        gsap.fromTo('.xiaomi-pair figure', { y: 35 }, { y: 0, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: '.xiaomi-pair', start: 'top bottom', end: 'top 45%', scrub: true } })
      }, root)
      return () => ctx.revert()
    })
    return () => media.revert()
  }, [reducedMotion])

  return <div ref={root}>
    <section id="momenta" className="momenta-chapter">
      <div className="brand-bridge" aria-hidden="true"><div className="brand-bridge-line" /></div>
      <BrandHeading brand="momenta" logo="momenta.png" />
      <figure className="brand-visual"><BrandImage brand="momenta" alt={t.momenta.heroAlt} /><figcaption>{t.detail.official}</figcaption></figure>
      <div className="content-width pb-24">
        <div className="momenta-nodes"><div className="momenta-path" aria-hidden="true" />{t.momenta.nodes.map((node, i) => <div key={node}><span>0{i + 1}</span><h3>{node}</h3></div>)}</div>
        <Stats items={t.momenta.stats} />
        <article className="momenta-case"><BrandImage brand="momenta" name="wicv" alt={t.momenta.caseAlt} /><div><p className="eyebrow">WICV · 2025</p><h3>{t.momenta.caseTitle}</h3><p>{t.momenta.caseDesc}</p><ProjectLink id="momenta" /></div></article>
      </div>
    </section>
    <section id="zeekr" className="zeekr-chapter">
      <BrandHeading brand="zeekr" logo="zeekr-wordmark.png" />
      <figure className="brand-visual zeekr-visual"><BrandImage brand="zeekr" alt={t.zeekr.heroAlt} className="zeekr-image" /><figcaption>{t.detail.official}</figcaption></figure>
      <div className="content-width pb-24"><Stats items={t.zeekr.stats} /><ProjectLink id="zeekr" /></div>
    </section>
    <section id="xiaomi" className="xiaomi-chapter">
      <div className="xiaomi-bridge" aria-hidden="true" />
      <BrandHeading brand="xiaomi" logo="xiaomi.png" />
      <figure className="brand-visual xiaomi-visual"><BrandImage brand="xiaomi" alt={t.xiaomi.heroAlt} /><figcaption>{t.detail.official}</figcaption></figure>
      <div className="content-width pb-24">
        <Stats items={t.xiaomi.stats} /><ProjectLink id="xiaomi" />
        <div className="xiaomi-pair"><figure><BrandImage brand="xiaomi" name="devices" alt={t.xiaomi.devicesAlt} /></figure><figure><BrandImage brand="xiaomi" name="home" alt={t.xiaomi.homeAlt} /></figure></div>
      </div>
    </section>
  </div>
}
