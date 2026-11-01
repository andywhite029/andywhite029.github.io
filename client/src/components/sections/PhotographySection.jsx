import { useLanguage } from '../../context/LanguageContext'
import { translations, PHOTO_IDS } from '../../data/translations'
import PhotoGallery3D from '../../gallery/PhotoGallery3D'

/**
 * 摄影板块：桌面为可拖拽的 3D 环形展廊，移动端 / reduced-motion 为可访问网格。
 * 打开详情仍走既有的 `#photo/<id>` 路由，由 ProjectDetails 统一处理。
 */
export default function PhotographySection() {
  const { language } = useLanguage()
  const t = translations[language].photography

  const photos = PHOTO_IDS.map((id, index) => ({
    id,
    src: `/assets-v2/photography/${id}.webp`,
    caption: t.captions[index],
  }))

  const openPhoto = id => {
    window.location.hash = `#photo/${id}`
  }

  return (
    <div className="photography content-width">
      <p className="eyebrow text-ink-soft">{t.label}</p>
      <h3 className="mt-3 text-[28px] font-semibold md:text-[40px]">{t.title}</h3>
      <PhotoGallery3D photos={photos} onOpen={openPhoto} className="mt-10" />
    </div>
  )
}
