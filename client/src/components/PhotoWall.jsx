import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { photos } from '../photos'

// ============================================
// 📸 照片管理 - 编辑 src/photos.js 添加/删除/排序照片
// ============================================

// Fisher-Yates 洗牌算法
const shuffleArray = (arr) => {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const allPhotos = shuffleArray(photos).map((name) => ({
  url: `/photos/${name}`,
  name,
}))

export const CONFIG = {
  gap: 6,
  minColumnWidth: 180,
}

export default function PhotoWall() {
  const containerRef = useRef(null)
  const scrollRef = useRef(0)
  const rafRef = useRef(null)
  const photoElementsRef = useRef([])
  const [columns, setColumns] = useState(5)
  const [loadedImages, setLoadedImages] = useState({})
  const [layoutReady, setLayoutReady] = useState(false)
  const columnLoopHeightsRef = useRef([])
  const prefersReducedMotion = useRef(false)

  // 预加载图片
  useEffect(() => {
    let cancelled = false

    const loadImages = async () => {
      const loaded = {}

      // 分批加载，避免同时发起过多请求
      const batchSize = 10
      for (let i = 0; i < allPhotos.length; i += batchSize) {
        if (cancelled) return
        const batch = allPhotos.slice(i, i + batchSize)
        await Promise.all(
          batch.map(
            (photo) =>
              new Promise((resolve) => {
                const img = new Image()
                img.onload = () => {
                  loaded[photo.url] = {
                    aspectRatio: img.width / img.height,
                  }
                  resolve()
                }
                img.onerror = () => resolve()
                img.src = photo.url
              })
          )
        )
      }

      if (!cancelled) {
        setLoadedImages(loaded)
        setLayoutReady(true)
      }
    }

    loadImages()
    return () => { cancelled = true }
  }, [])

  // 检测 prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.current = mq.matches
    const handler = (e) => { prefersReducedMotion.current = e.matches }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // 计算列数
  useEffect(() => {
    let ticking = false
    const updateColumns = () => {
      const width = window.innerWidth
      let cols = Math.floor(width / CONFIG.minColumnWidth)
      cols = Math.max(2, Math.min(cols, 10))
      setColumns(cols)
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

  // 容器高度
  const containerHeight = useMemo(() => {
    if (!layoutReady || Object.keys(loadedImages).length === 0) {
      return window.innerHeight * 3
    }
    return window.innerHeight * 4
  }, [loadedImages, layoutReady])

  // 缓存 DOM 引用以避免每帧 querySelectorAll
  const cachePhotoElements = useCallback(() => {
    const container = containerRef.current
    if (container) {
      photoElementsRef.current = Array.from(container.querySelectorAll('.photo-item'))
    }
  }, [])

  // 动画循环
  useEffect(() => {
    if (!layoutReady) return
    if (prefersReducedMotion.current) return

    // 延迟缓存 DOM（等渲染完成后）
    requestAnimationFrame(() => {
      cachePhotoElements()
    })

    let lastTime = performance.now()

    const animate = (time) => {
      rafRef.current = requestAnimationFrame(animate)

      const delta = time - lastTime
      lastTime = time

      // 限制 delta 防止跳帧后的大幅跳跃
      const clampedDelta = Math.min(delta, 50)

      const scrollY = scrollRef.current
      const autoScroll = time * 0.02

      const elements = photoElementsRef.current
      if (elements.length === 0) return

      const loopHeights = columnLoopHeightsRef.current

      for (let i = 0; i < elements.length; i++) {
        const child = elements[i]
        const baseYPos = parseFloat(child.dataset.baseY) || 0
        const parallaxFactor = parseFloat(child.dataset.parallax) || 1
        const colIndex = parseInt(child.dataset.colIndex) || 0

        const singleLoopHeight = loopHeights[colIndex] || 1
        if (singleLoopHeight <= 0) continue

        // 滚动在一个循环内的偏移量（实现无限循环）
        const loopScroll = (scrollY + autoScroll) % singleLoopHeight

        // 滚动视差：不同列以不同速度滚动
        const parallaxOffset = loopScroll * (parallaxFactor - 1) * 0.5

        // 呼吸效果 - 基于时间浮动（用 baseY % singleLoopHeight 保证循环时模式连续）
        const breathe = Math.sin(time * 0.001 + (baseYPos % singleLoopHeight) * 0.002) * 6

        // 视差缩放 - 周期性的微妙缩放
        const scale = 1 + Math.sin(time * 0.0008 + (baseYPos % singleLoopHeight) * 0.003) * 0.02 * parallaxFactor

        // 最终位移 = 循环偏移 + 视差偏移 + 呼吸
        const y = -loopScroll - parallaxOffset + breathe

        child.style.transform = `translateY(${y}px) scale(${scale})`
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [layoutReady, cachePhotoElements])

  // 渲染布局 - 双缓冲：每列渲染两套相同照片，实现首尾无缝循环
  const photoLayout = useMemo(() => {
    if (!layoutReady || Object.keys(loadedImages).length === 0) return []

    const colWidth = (window.innerWidth - CONFIG.gap * (columns + 1)) / columns
    const cols = Array.from({ length: columns }, () => ({ photos: [], height: 0 }))

    // 确保一套照片的高度 >= 容器高度，这样双缓冲后才能无缝覆盖
    const singlePhotoHeight = colWidth / 2 + CONFIG.gap
    const minLoops = Math.ceil(containerHeight / singlePhotoHeight)
    const totalLoops = Math.max(minLoops, 30)

    // 生成两套完全相同的照片序列
    for (let set = 0; set < 2; set++) {
      for (let loop = 0; loop < totalLoops; loop++) {
        for (let col = 0; col < columns; col++) {
          const photoIndex = (loop * columns + col) % allPhotos.length
          const photo = allPhotos[photoIndex]
          const imgData = loadedImages[photo.url]
          if (!imgData) continue

          const photoHeight = colWidth / imgData.aspectRatio
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
          cols[col].height += photoHeight + CONFIG.gap
        }
      }
    }

    // 循环高度 = 一套照片的高度（双缓冲中两套接替循环）
    columnLoopHeightsRef.current = cols.map((c) => c.height / 2)

    return cols
  }, [loadedImages, columns, layoutReady, containerHeight])

  const columnWidth = useMemo(() => {
    return (window.innerWidth - CONFIG.gap * (columns + 1)) / columns
  }, [columns])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 -z-10"
      style={{
        height: containerHeight,
        pointerEvents: 'none',
      }}
    >
      <div className="flex justify-center h-full" style={{ padding: CONFIG.gap }}>
        {photoLayout.map((col, colIndex) => (
          <div
            key={colIndex}
            className="flex flex-col"
            style={{
              width: columnWidth,
              gap: CONFIG.gap,
              marginLeft: colIndex > 0 ? CONFIG.gap : 0,
            }}
          >
            {col.photos.map((photo) => (
              <div
                key={photo.key}
                data-baseY={photo.baseY}
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
