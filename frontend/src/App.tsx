import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import LandingPage from './pages/LandingPage'
import ProcessingPage from './pages/ProcessingPage'
import DashboardPage from './pages/DashboardPage'
import AuthPage from './pages/AuthPage'
import WorkspacePage from './pages/WorkspacePage'
import { ThemeProvider } from './theme/ThemeContext'
import useAppStore from './store/useAppStore'
import { supabase } from './lib/supabase'
import './index.css'

function AuthListener() {
  const setSession = useAppStore(s => s.setSession)

  useEffect(() => {
    // Set initial session
    supabase.auth.getSession().then(({ data }) => setSession(data.session))

    // Listen for auth state changes (login / logout / token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [setSession])

  return null
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthListener />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/processing" element={<ProcessingPage />} />
          <Route path="/dashboard/*" element={<DashboardPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/workspace" element={<WorkspacePage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
