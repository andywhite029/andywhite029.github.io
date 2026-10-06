import { useLanguage } from '../../context/LanguageContext'
import { translations, PHOTO_IDS } from '../../data/translations'

export default function PhotographySection() {
  const { language } = useLanguage()
  const t = translations[language].photography
  return <div className="photography content-width">
    <p className="eyebrow text-ink-soft">{t.label}</p>
    <h3 className="mt-3 text-[28px] font-semibold md:text-[40px]">{t.title}</h3>
    <div className="photography-grid">{PHOTO_IDS.map((id, i) => <a key={id} href={`#photo/${id}`} aria-label={t.captions[i]}><figure><img src={`/assets-v2/photography/${id}.webp`} alt={t.captions[i]} loading="lazy" decoding="async" /><figcaption><span>0{i + 1}</span>{t.captions[i]}</figcaption></figure></a>)}</div>
  </div>
}
