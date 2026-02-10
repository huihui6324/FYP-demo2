import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Welcome from './components/Welcome'
import MapView from './components/MapView'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/map" element={<MapView />} />
      </Routes>
    </Router>
  )
}

export default App
