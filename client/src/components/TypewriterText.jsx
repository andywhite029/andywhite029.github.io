import { useEffect, useState } from 'react'
import TerminalCursor from './TerminalCursor'
import { useReducedMotion } from '../hooks/useReducedMotion'

export default function TypewriterText({
  text,
  speed = 60,
  delay = 0,
  showCursor = true,
  className = '',
  onComplete,
}) {
  const [displayText, setDisplayText] = useState('')
  const [started, setStarted] = useState(false)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) {
      setDisplayText(text)
      onComplete?.()
      return
    }

    const startTimeout = setTimeout(() => setStarted(true), delay)
    return () => clearTimeout(startTimeout)
  }, [delay, text, reducedMotion, onComplete])

  useEffect(() => {
    if (!started || reducedMotion) return

    let index = 0
    const interval = setInterval(() => {
      if (index <= text.length) {
        setDisplayText(text.slice(0, index))
        index++
      } else {
        clearInterval(interval)
        onComplete?.()
      }
    }, speed)

    return () => clearInterval(interval)
  }, [started, text, speed, reducedMotion, onComplete])

  return (
    <span className={`font-mono ${className}`}>
      {displayText}
      {showCursor && <TerminalCursor />}
    </span>
  )
}
