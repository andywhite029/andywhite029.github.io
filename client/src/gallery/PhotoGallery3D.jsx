import { useIsMobile } from '../hooks/useIsMobile'
import { useReducedMotion } from '../hooks/useReducedMotion'
import PhotoCarousel3D from './PhotoCarousel3D'
import PhotoGridFallback from './PhotoGridFallback'

/**
 * PhotoGallery3D —— 摄影作品 3D 展廊（桌面）+ 可访问网格降级（移动端 / 减少动画）。
 *
 * @param {Object} props
 * @param {{ id: string, src: string, caption: string }[]} props.photos 照片列表
 * @param {string} [props.className] 外层附加类名
 * @param {(id: string) => void} [props.onOpen] 打开详情（Lead 负责接 `#photo/<id>` 路由）
 *
 * 用法：
 *   <PhotoGallery3D photos={photos} onOpen={id => { window.location.hash = `#photo/${id}` }} />
 *
 * 交互：指针横向拖拽旋转（惯性衰减）、←/→ 切换、点击居中卡片打开详情；
 * 点击非居中卡片先把它转到中间。不接管 wheel，不影响页面纵向滚动，无焦点陷阱。
 */
export default function PhotoGallery3D({ photos = [], className = '', onOpen }) {
  const isMobile = useIsMobile()
  const reducedMotion = useReducedMotion()
  const items = (Array.isArray(photos) ? photos : []).filter(photo => photo && photo.id)

  if (!items.length) return null

  const grid = isMobile || reducedMotion || items.length < 3

  if (grid) {
    return (
      <PhotoGridFallback photos={items} onOpen={onOpen} compact={isMobile} className={className} />
    )
  }

  return <PhotoCarousel3D photos={items} onOpen={onOpen} className={className} />
}
