import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { photos } from '../photos'

// ============================================
// 📸 照片管理 - 运行 `npm run compress` 重新生成 photos.js
// ============================================

const isBrowser = typeof window !== 'undefined'

// Fisher-Yates 洗牌算法
const shuffleArray = (arr) => {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const allPhotos = shuffleArray(photos).map((p) => ({
  url: `/photos/${p.name}`,
  name: p.name,
  aspectRatio: p.aspectRatio,
}))

const config = {
  gap: 6,
  minColumnWidth: 180,
}

export default function PhotoWall() {
  const containerRef = useRef(null)
  const scrollRef = useRef(0)
  const rafRef = useRef(null)
  const photoDataRef = useRef([])
  const [columns, setColumns] = useState(5)
  const [dimensions, setDimensions] = useState({
    width: isBrowser ? window.innerWidth : 1920,
    height: isBrowser ? window.innerHeight : 1080,
  })
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const columnLoopHeightsRef = useRef([])

  // 检测 prefers-reduced-motion（用 state 以便变化时停止/启动动画）
  useEffect(() => {
    if (!isBrowser) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
    const handler = (e) => setPrefersReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // 计算列数与窗口尺寸
  useEffect(() => {
    if (!isBrowser) return

    let ticking = false
    const updateColumns = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      let cols = Math.floor(width / config.minColumnWidth)
      cols = Math.max(2, Math.min(cols, 10))
      setColumns(cols)
      setDimensions({ width, height })
    }

    const onResize = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateColumns()
          ticking = false
        })
        ticking = true
      }
    }

    updateColumns()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // 滚动监听
  useEffect(() => {
    if (!isBrowser) return
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          scrollRef.current = window.scrollY
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const containerHeight = useMemo(
    () => dimensions.height * 4,
    [dimensions.height]
  )

  // 缓存 DOM 元素及其动画参数（避免每帧 parseFloat dataset）
  const cachePhotoElements = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const elements = Array.from(container.querySelectorAll('.photo-item'))
    photoDataRef.current = elements.map((el) => ({
      el,
      baseY: parseFloat(el.dataset.basey) || 0,
      parallax: parseFloat(el.dataset.parallax) || 1,
      colIndex: parseInt(el.dataset.colIndex) || 0,
    }))
  }, [])

  // 渲染布局 - 双缓冲：每列渲染两套相同照片，实现首尾无缝循环
  const photoLayout = useMemo(() => {
    const colWidth = (dimensions.width - config.gap * (columns + 1)) / columns
    const cols = Array.from({ length: columns }, () => ({
      photos: [],
      height: 0,
    }))

    // 确保一套照片的高度 >= 容器高度，这样双缓冲后才能无缝覆盖
    const singlePhotoHeight = colWidth / 2 + config.gap
    const minLoops = Math.ceil(containerHeight / singlePhotoHeight)
    // 降低上限，减少 DOM 节点数量（原 30，对移动端过重）
    const totalLoops = Math.max(minLoops, 10)

    // 生成两套完全相同的照片序列
    for (let set = 0; set < 2; set++) {
      for (let loop = 0; loop < totalLoops; loop++) {
        for (let col = 0; col < columns; col++) {
          const photoIndex = (loop * columns + col) % allPhotos.length
          const photo = allPhotos[photoIndex]

          const photoHeight = colWidth / photo.aspectRatio
          // 视差系数：让不同列的照片有不同速度 (0.85 - 1.15)
          const parallax = 0.85 + Math.abs((col - columns / 2) / columns) * 0.3
          const baseY = cols[col].height

          cols[col].photos.push({
            ...photo,
            key: `p-${set}-${loop}-${col}`,
            width: colWidth,
            height: photoHeight,
            baseY,
            parallax,
            colIndex: col,
          })
          cols[col].height += photoHeight + config.gap
        }
      }
    }

    // 循环高度 = 一套照片的高度（双缓冲中两套接替循环）
    columnLoopHeightsRef.current = cols.map((c) => c.height / 2)

    return cols
  }, [columns, containerHeight, dimensions.width])

  const columnWidth = useMemo(
    () => (dimensions.width - config.gap * (columns + 1)) / columns,
    [dimensions.width, columns]
  )

  // 动画循环 - 依赖 photoLayout，列数变化后会重新缓存 DOM
  useEffect(() => {
    if (!isBrowser || prefersReducedMotion) return

    // 等本次 photoLayout 渲染完成后再缓存 DOM
    requestAnimationFrame(() => {
      cachePhotoElements()
    })

    let lastTime = performance.now()

    const animate = (time) => {
      rafRef.current = requestAnimationFrame(animate)

      const delta = time - lastTime
      lastTime = time

      // 限制 delta 防止跳帧后的大幅跳跃
      Math.min(delta, 50)

      const scrollY = scrollRef.current
      const autoScroll = time * 0.02

      const photoData = photoDataRef.current
      if (photoData.length === 0) return

      const loopHeights = columnLoopHeightsRef.current

      for (let i = 0; i < photoData.length; i++) {
        const { el, baseY, parallax, colIndex } = photoData[i]

        const singleLoopHeight = loopHeights[colIndex] || 1
        if (singleLoopHeight <= 0) continue

        // 滚动在一个循环内的偏移量（实现无限循环）
        const loopScroll = (scrollY + autoScroll) % singleLoopHeight

        // 滚动视差：不同列以不同速度滚动
        const parallaxOffset = loopScroll * (parallax - 1) * 0.5

        // 呼吸效果 - 基于时间浮动（用 baseY % singleLoopHeight 保证循环时模式连续）
        const breathe =
          Math.sin(time * 0.001 + (baseY % singleLoopHeight) * 0.002) * 6

        // 视差缩放 - 周期性的微妙缩放
        const scale =
          1 +
          Math.sin(time * 0.0008 + (baseY % singleLoopHeight) * 0.003) *
            0.02 *
            parallax

        // 最终位移 = 循环偏移 + 视差偏移 + 呼吸
        const y = -loopScroll - parallaxOffset + breathe

        el.style.transform = `translateY(${y}px) scale(${scale})`
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [cachePhotoElements, photoLayout, prefersReducedMotion])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 -z-10"
      style={{
        height: containerHeight,
        pointerEvents: 'none',
      }}
    >
      <div className="flex justify-center h-full" style={{ padding: config.gap }}>
        {photoLayout.map((col, colIndex) => (
          <div
            key={colIndex}
            className="flex flex-col"
            style={{
              width: columnWidth,
              gap: config.gap,
              marginLeft: colIndex > 0 ? config.gap : 0,
            }}
          >
            {col.photos.map((photo) => (
              <div
                key={photo.key}
                data-basey={photo.baseY}
                data-parallax={photo.parallax}
                data-col-index={photo.colIndex}
                className="photo-item relative shrink-0 overflow-hidden rounded-xl"
                style={{
                  width: photo.width,
                  height: photo.height,
                  opacity: 0.7,
                  willChange: 'transform',
                }}
              >
                <img
                  src={photo.url}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
