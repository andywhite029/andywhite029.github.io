import { useEffect, useState } from 'react'

const hasMatchMedia = typeof window !== 'undefined' && typeof window.matchMedia === 'function'

/** 订阅一条 media query，用于按设备能力（hover / pointer）或偏好开关动效。 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => hasMatchMedia && window.matchMedia(query).matches)

  useEffect(() => {
    if (!hasMatchMedia) return undefined
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}
