import { useCallback, useRef } from 'react'
import { useReducedMotion } from './useReducedMotion'

export function useShutterSound() {
  const audioContextRef = useRef(null)
  const reducedMotion = useReducedMotion()

  const play = useCallback(() => {
    if (reducedMotion) return

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      }

      const ctx = audioContextRef.current
      const t = ctx.currentTime

      // 噪声缓冲 - 模拟快门声
      const bufferSize = ctx.sampleRate * 0.08
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2))
      }

      const noise = ctx.createBufferSource()
      noise.buffer = buffer

      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.value = 2000
      filter.Q.value = 1

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.3, t)
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08)

      noise.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)

      noise.start(t)
      noise.stop(t + 0.1)
    } catch (_err) {
      // 音频上下文可能被浏览器阻止，静默失败
    }
  }, [reducedMotion])

  return play
}
