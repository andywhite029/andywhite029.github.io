import Home from './pages/Home'
import Admin from './pages/Admin'

function App() {
  const isAdmin = new URLSearchParams(window.location.search).get('admin') === '1'
  return isAdmin ? <Admin /> : <Home />
}

export default App