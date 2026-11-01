import { useLayoutEffect, useMemo, useRef } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { gsap } from './gsapSetup'
import { revealOnScroll } from './revealOnScroll'

// 中日韩文字与全角标点：按单字切分；其余按空格分词。
const CJK_PATTERN =
  /[\u2E80-\u2EFF\u3000-\u303F\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFFEF\uAC00-\uD7AF]/

const FRAGMENT_STYLE = {
  display: 'inline-block',
  lineHeight: 'inherit',
  willChange: 'transform, opacity',
}

const SPACE_STYLE = { whiteSpace: 'pre-wrap' }

function toText(children) {
  if (typeof children === 'string') return children
  if (typeof children === 'number') return String(children)
  if (Array.isArray(children)) {
    const parts = children.map(toText)
    if (parts.every(part => part !== null)) return parts.join('')
  }
  return null
}

function tokenize(text) {
  const chars = Array.from(text)
  const tokens = []
  let index = 0

  while (index < chars.length) {
    const char = chars[index]

    if (char === '\n') {
      tokens.push({ type: 'break' })
      index += 1
      continue
    }

    if (/\s/.test(char)) {
      let end = index + 1
      while (end < chars.length && chars[end] !== '\n' && /\s/.test(chars[end])) end += 1
      tokens.push({ type: 'space', value: chars.slice(index, end).join('') })
      index = end
      continue
    }

    if (CJK_PATTERN.test(char)) {
      tokens.push({ type: 'char', value: char })
      index += 1
      continue
    }

    let end = index + 1
    while (
      end < chars.length &&
      chars[end] !== '\n' &&
      !/\s/.test(chars[end]) &&
      !CJK_PATTERN.test(chars[end])
    ) {
      end += 1
    }
    tokens.push({ type: 'word', value: chars.slice(index, end).join('') })
    index = end
  }

  return tokens
}

/**
 * 分片滚动揭示：中文按字、英文按词，opacity + y 逐片入场。
 * 完整原文以 sr-only 保留给屏幕阅读器，视觉片段 aria-hidden。
 * 动画由 ScrollTrigger 驱动，reduced-motion 时直接静态渲染。
 */
export default function SplitReveal({
  as: As = 'span',
  children,
  className = '',
  delay = 0,
  stagger = 0.03,
  y = 18,
  once = true,
}) {
  const reducedMotion = useReducedMotion()
  const rootRef = useRef(null)
  const text = toText(children)
  const tokens = useMemo(() => (text === null ? [] : tokenize(text)), [text])

  useLayoutEffect(() => {
    if (reducedMotion || text === null) return undefined
    const root = rootRef.current
    if (!root) return undefined
    const targets = root.querySelectorAll('[data-split-item]')
    if (targets.length === 0) return undefined

    const ctx = gsap.context(() => {
      revealOnScroll({
        targets,
        trigger: root,
        from: { opacity: 0, y },
        to: { opacity: 1, y: 0 },
        duration: 0.85,
        delay,
        stagger,
        start: 'top 85%',
        once,
      })
    }, root)

    return () => ctx.revert()
  }, [text, reducedMotion, delay, stagger, y, once])

  if (text === null || reducedMotion) {
    return <As className={className}>{children}</As>
  }

  return (
    <As ref={rootRef} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {tokens.map((token, index) => {
          if (token.type === 'break') return <br key={index} />
          if (token.type === 'space') {
            return (
              <span key={index} style={SPACE_STYLE}>
                {token.value}
              </span>
            )
          }
          return (
            <span key={index} data-split-item style={FRAGMENT_STYLE}>
              {token.value}
            </span>
          )
        })}
      </span>
    </As>
  )
}
