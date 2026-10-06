import { useContext, useEffect, useState, createContext } from 'react'

const MOBILE_QUERY = '(max-width: 767px)'
const MobileContext = createContext(false)

export function MobileProvider({ children }) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches,
  )

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY)
    const onChange = () => setIsMobile(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return <MobileContext.Provider value={isMobile}>{children}</MobileContext.Provider>
}

export function useIsMobile() {
  return useContext(MobileContext)
}
