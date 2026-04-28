import { useEffect, useRef, useState, useMemo } from 'react'
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
  const currentOffsetRef = useRef(0)
  const rafRef = useRef(null)
  const [columns, setColumns] = useState(5)
  const [loadedImages, setLoadedImages] = useState({})
  const [layoutReady, setLayoutReady] = useState(false)
  const columnLoopHeightsRef = useRef([])

  // 预加载图片
  useEffect(() => {
    const loadImages = async () => {
      const loaded = {}

      await Promise.all(
        allPhotos.map(
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

      setLoadedImages(loaded)
      setLayoutReady(true)
    }

    loadImages()
  }, [])

  // 计算列数
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth
      let cols = Math.floor(width / CONFIG.minColumnWidth)
      cols = Math.max(2, Math.min(cols, 10))
      setColumns(cols)
    }

    updateColumns()
    window.addEventListener('resize', updateColumns)
    return () => window.removeEventListener('resize', updateColumns)
  }, [])

  // 计算容器高度 - 需要足够长让视差效果可见，同时计算每列循环高度
  const containerHeight = useMemo(() => {
    if (!layoutReady || Object.keys(loadedImages).length === 0) return window.innerHeight * 3

    const colWidth = Math.floor((window.innerWidth - CONFIG.gap * (columns + 1)) / columns)

    // 计算每列的循环高度（该列所有照片累积高度之和 = 50个循环的高度）
    const columnHeights = Array(columns).fill(0)
    for (let col = 0; col < columns; col++) {
      const photo = allPhotos[col % allPhotos.length]
      const imgData = loadedImages[photo.url]
      if (imgData) {
        // 一张照片的高度（一个循环的高度）
        const photoHeight = colWidth / imgData.aspectRatio + CONFIG.gap
        // 一个循环 = 一张照片，50 个循环确保铺满屏幕
        columnHeights[col] = photoHeight * 50
      }
    }

    // 存储每列的循环高度
    columnLoopHeightsRef.current = columnHeights

    // 容器高度取所有列高度之和（50 个循环在 photoLayout 中已计算）
    const totalHeight = columnHeights.reduce((sum, h) => sum + h, 0)
    return totalHeight
  }, [loadedImages, columns, layoutReady])

  // 滚动监听
  useEffect(() => {
    const handleScroll = () => {
      scrollRef.current = window.scrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 动画循环 - 照片随滚动同向移动，带视差效果，无限循环
  useEffect(() => {
    const animate = (time) => {
      rafRef.current = requestAnimationFrame(animate)

      const scrollY = scrollRef.current
      // 自动滚动速度：每秒滚动约20px
      const autoScroll = time * 0.02

      const container = containerRef.current
      if (container) {
        const children = container.querySelectorAll('.photo-item')
        children.forEach((child) => {
          const baseYPos = parseFloat(child.dataset.baseY) || 0
          const parallaxFactor = parseFloat(child.dataset.parallax) || 1
          const colIndex = parseInt(child.dataset.colIndex) || 0

          // 获取该列的循环高度
          const singleLoopHeight = columnLoopHeightsRef.current[colIndex] || 1

          // 计算滚动在一个循环内的偏移量（实现无限循环）
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
        })
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  // 渲染瀑布流 - 无缝循环布局
  const photoLayout = useMemo(() => {
    if (!layoutReady || Object.keys(loadedImages).length === 0) return []

    const colWidth = Math.floor((window.innerWidth - CONFIG.gap * (columns + 1)) / columns)
    const cols = Array.from({ length: columns }, () => ({ photos: [], height: 0 }))

    // 增加循环次数确保屏幕始终被填满
    // 需要 (视口高度 / 单张照片高度 + 2) 的照片数量才能填满一列，加上缓冲避免空白
    const viewportHeight = window.innerHeight
    const singlePhotoHeight = colWidth / 2 + CONFIG.gap // 估算的平均高度
    const photosNeeded = Math.ceil(viewportHeight / singlePhotoHeight) + 20
    const totalLoops = Math.max(photosNeeded, 50) // 至少50个循环确保不会空白

    for (let loop = 0; loop < totalLoops; loop++) {
      for (let col = 0; col < columns; col++) {
        const photoIndex = (loop * columns + col) % allPhotos.length
        const photo = allPhotos[photoIndex]
        const imgData = loadedImages[photo.url]
        if (!imgData) continue

        const photoHeight = Math.floor(colWidth / imgData.aspectRatio)
        // 视差系数：让不同列的照片有不同速度 (0.8 - 1.2)
        const parallax = 0.8 + Math.abs((col - columns / 2) / columns) * 0.4

        // 累积的Y位置用于视差计算
        const baseY = cols[col].height

        cols[col].photos.push({
          ...photo,
          key: `loop-${loop}-col-${col}`,
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
                  opacity: 0.7,
                  willChange: 'transform',
                }}
              >
                <img
                  src={photo.url}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
