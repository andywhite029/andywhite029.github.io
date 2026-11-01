import { GALLERY_GRID_LABEL } from './labels'

const pad = value => String(value).padStart(2, '0')

/**
 * 移动端 / 减少动画 / 照片不足时的可访问网格降级。
 * 排版对齐现有 photography-grid：2 列（手机）或 3 列（桌面）+ 交错下移。
 */
export default function PhotoGridFallback({ photos, onOpen, compact = false, className = '' }) {
  return (
    <div
      role="group"
      aria-label={GALLERY_GRID_LABEL}
      className={`grid grid-cols-2 gap-x-4 gap-y-7 ${
        compact ? '' : 'md:grid-cols-3 md:gap-x-6 md:gap-y-12'
      } ${className}`.trim()}
    >
      {photos.map((photo, index) => {
        const offset = compact ? index % 2 === 1 : index % 3 === 1
        return (
          <div key={photo.id || index} className={offset ? 'mt-8 md:mt-12' : ''}>
            <button
              type="button"
              onClick={() => onOpen?.(photo.id)}
              aria-label={photo.caption}
              className="group block w-full text-left"
            >
              <span className="block overflow-hidden bg-paper-warm">
                <img
                  src={photo.src}
                  alt={photo.caption}
                  loading="lazy"
                  decoding="async"
                  className="block aspect-[4/3] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />
              </span>
              <span className="mt-3 flex gap-4 text-[13px] leading-snug">
                <span className="shrink-0 tabular-nums opacity-50">{pad(index + 1)}</span>
                <span>{photo.caption}</span>
              </span>
            </button>
          </div>
        )
      })}
    </div>
  )
}
