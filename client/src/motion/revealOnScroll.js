import { gsap } from './gsapSetup'

const DEFAULT_RATIO = 0.85

function startRatio(start) {
  const match = /([\d.]+)%/.exec(start)
  return match ? Number(match[1]) / 100 : DEFAULT_RATIO
}

/**
 * 滚动揭示的统一入口：
 * - 元素已经滚出视口上方：直接置为终态，避免语言切换重新挂载后隐藏且不再播放；
 * - 元素当前在视口内（例如语言切换需要重播）：立即播放；
 * - 其他情况交给 ScrollTrigger，在 start 位置进入视口时播放。
 * 补间在调用方的 gsap.context 内创建，只负责把动画交回给 context 清理。
 */
export function revealOnScroll({
  targets,
  trigger,
  from,
  to = {},
  duration = 0.9,
  delay = 0,
  stagger = 0,
  start = 'top 85%',
  once = true,
}) {
  const rect = trigger.getBoundingClientRect()
  const ratio = startRatio(start)

  if (rect.bottom <= 0) {
    gsap.set(targets, { opacity: 1, autoAlpha: 1, y: 0, ...to })
    return null
  }

  const alreadyInView = rect.top < window.innerHeight * ratio

  return gsap.fromTo(targets, from, {
    ...to,
    duration,
    delay,
    stagger,
    ease: 'power3.out',
    ...(alreadyInView
      ? {}
      : {
          scrollTrigger: {
            trigger,
            start,
            once,
            toggleActions: once ? 'play none none none' : 'play none none reverse',
          },
        }),
  })
}
