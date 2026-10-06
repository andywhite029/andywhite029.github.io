import { LanguageProvider } from './context/LanguageContext'
import { MobileProvider } from './hooks/useIsMobile'
import { LenisProvider } from './hooks/useLenis'
import Home from './pages/Home'

function App() {
  return (
    <LanguageProvider>
      <MobileProvider>
        <LenisProvider>
          <Home />
        </LenisProvider>
      </MobileProvider>
    </LanguageProvider>
  )
}

export default App
