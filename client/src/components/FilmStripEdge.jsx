import { useScrollProgress } from '../context/ScrollProgressContext'

const HOLE_COUNT = 14

export default function FilmStripEdge() {
  const { scrollProgress } = useScrollProgress()

  return (
    <div className="fixed left-0 top-0 bottom-0 z-20 hidden lg:flex flex-col items-center justify-between py-8 w-20 border-r border-border bg-bg-secondary/60 backdrop-blur-sm">
      {/* 顶部 ISO 标识 */}
      <div className="writing-vertical rotate-180 font-mono text-[10px] tracking-[0.4em] text-accent-red uppercase">
        ISO 400
      </div>

      {/* 齿孔列 */}
      <div className="relative flex flex-col items-center gap-4">
        {/* 进度指示线 */}
        <div
          className="absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 bg-gradient-to-b from-transparent via-accent-red/30 to-transparent"
          style={{ opacity: 0.5 }}
        />

        {Array.from({ length: HOLE_COUNT }).map((_, index) => {
          const holeProgress = index / (HOLE_COUNT - 1)
          const isActive = Math.abs(scrollProgress - holeProgress) < 0.08

          return (
            <div key={index} className="relative flex items-center">
              {/* 齿孔 */}
              <div
                className={`w-6 h-10 rounded-md border-2 transition-all duration-300 ${
                  isActive
                    ? 'bg-accent-red border-accent-red-glow shadow-[0_0_16px_rgba(255,34,0,0.7)]'
                    : 'bg-bg-primary border-accent-red-dark/60'
                }`}
              />

              {/* 帧号 */}
              <div
                className={`absolute left-9 font-mono text-[10px] tracking-wider whitespace-nowrap transition-all duration-300 ${
                  isActive ? 'text-accent-red-glow opacity-100' : 'text-text-secondary/40 opacity-60'
                }`}
              >
                {String(index * 2).padStart(2, '0')}
              </div>
            </div>
          )
        })}
      </div>

      {/* 底部胶片品牌 */}
      <div className="writing-vertical font-mono text-[10px] tracking-[0.4em] text-accent-red uppercase">
        KODAK 35MM
      </div>
    </div>
  )
}
