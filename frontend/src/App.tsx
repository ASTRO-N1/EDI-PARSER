import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import ProcessingPage from './pages/ProcessingPage'
import DashboardPage from './pages/DashboardPage'
import { ThemeProvider } from './theme/ThemeContext'
import './index.css'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/processing" element={<ProcessingPage />} />
          <Route path="/dashboard/*" element={<DashboardPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
