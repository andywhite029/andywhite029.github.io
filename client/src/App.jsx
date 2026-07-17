import { LenisProvider } from './hooks/useLenis'
import { ScrollProgressProvider } from './context/ScrollProgressContext'
import { LanguageProvider } from './context/LanguageContext'
import Home from './pages/Home'

function App() {
  return (
    <LanguageProvider>
      <LenisProvider>
        <ScrollProgressProvider>
          <Home />
        </ScrollProgressProvider>
      </LenisProvider>
    </LanguageProvider>
  )
}

export default App
