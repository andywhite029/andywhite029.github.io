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

  // 计算容器高度 - 使用最大列高度而非求和
  const containerHeight = useMemo(() => {
    if (!layoutReady || Object.keys(loadedImages).length === 0) {
      return window.innerHeight * 3
    }

    const colWidth = Math.floor((window.innerWidth - CONFIG.gap * (columns + 1)) / columns)

    const columnHeights = Array(columns).fill(0)
    for (let col = 0; col < columns; col++) {
      const photo = allPhotos[col % allPhotos.length]
      const imgData = loadedImages[photo.url]
      if (imgData) {
        const photoHeight = colWidth / imgData.aspectRatio + CONFIG.gap
        columnHeights[col] = photoHeight * 50
      }
    }

    columnLoopHeightsRef.current = columnHeights

    // 使用最大列高度，而非求和
    const maxHeight = Math.max(...columnHeights)
    return maxHeight
  }, [loadedImages, columns, layoutReady])

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
        const totalOffset = (scrollY + autoScroll) % singleLoopHeight

        // 计算最终位置 = 初始位置 + 滚动偏移 + 视差偏移
        let y = baseYPos + totalOffset + totalOffset * (parallaxFactor - 1) * 0.5

        // 如果移出容器范围，wrap 回顶部继续循环
        if (y > window.innerHeight) {
          y = y - singleLoopHeight
        }

        child.style.transform = `translateY(${y}px)`
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [layoutReady, cachePhotoElements])

  // 渲染布局
  const photoLayout = useMemo(() => {
    if (!layoutReady || Object.keys(loadedImages).length === 0) return []

    const colWidth = Math.floor((window.innerWidth - CONFIG.gap * (columns + 1)) / columns)
    const cols = Array.from({ length: columns }, () => ({ photos: [], height: 0 }))

    const viewportHeight = window.innerHeight
    const singlePhotoHeight = colWidth / 2 + CONFIG.gap
    const photosNeeded = Math.ceil(viewportHeight / singlePhotoHeight) + 10
    const totalLoops = Math.max(photosNeeded, 30)

    for (let loop = 0; loop < totalLoops; loop++) {
      for (let col = 0; col < columns; col++) {
        const photoIndex = (loop * columns + col) % allPhotos.length
        const photo = allPhotos[photoIndex]
        const imgData = loadedImages[photo.url]
        if (!imgData) continue

        const photoHeight = Math.floor(colWidth / imgData.aspectRatio)
        const parallax = 0.85 + Math.abs((col - columns / 2) / columns) * 0.3
        const baseY = cols[col].height

        cols[col].photos.push({
          ...photo,
          key: `p-${loop}-${col}`,
          width: colWidth,
          height: photoHeight,
          baseY,
          parallax,
          colIndex: col,
        })
        cols[col].height += photoHeight + CONFIG.gap
      }
    }

    return cols
  }, [loadedImages, columns, layoutReady])

  const columnWidth = useMemo(() => {
    return Math.floor((window.innerWidth - CONFIG.gap * (columns + 1)) / columns)
  }, [columns])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 -z-10"
      style={{
        height: containerHeight,
        pointerEvents: 'none',
        contentVisibility: 'auto',
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
                className="photo-item relative overflow-hidden rounded-xl"
                style={{
                  width: photo.width,
                  height: photo.height,
                  opacity: 0.75,
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
