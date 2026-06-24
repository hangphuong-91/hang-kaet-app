import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import type { Session } from '@supabase/supabase-js'

import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import CatProfilePage from './pages/CatProfilePage'
import AddCatPage from './pages/AddCatPage'
import Layout from './components/Layout'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-brand-offwhite">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-brand-teal border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-brand-teal">Đang tải...</p>
      </div>
    </div>
  )

  if (!session) return <AuthPage />

  return (
    <Layout session={session}>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/cat/new" element={<AddCatPage />} />
        <Route path="/cat/:id" element={<CatProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}
