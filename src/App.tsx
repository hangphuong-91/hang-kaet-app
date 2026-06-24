import { useEffect, useState, Component, type ReactNode } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import type { Session } from '@supabase/supabase-js'

import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import CatProfilePage from './pages/CatProfilePage'
import AddCatPage from './pages/AddCatPage'
import Layout from './components/Layout'

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null }
  static getDerivedStateFromError(error: Error) { return { error } }
  render() {
    if (this.state.error) {
      const err = this.state.error as Error
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2] p-6">
          <div className="max-w-md w-full bg-white rounded-3xl border-2 border-red-200 p-6 space-y-3">
            <h2 className="font-black text-red-600 text-lg">⚠ Lỗi khởi động app</h2>
            <p className="text-xs font-mono bg-red-50 p-3 rounded-xl text-red-700 break-all">{err.message}</p>
            <p className="text-xs text-brand-charcoal/50">Kiểm tra Vercel env vars: VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY</p>
            <button onClick={() => window.location.reload()} className="w-full bg-brand-teal text-white font-black text-sm py-2.5 rounded-xl cursor-pointer">Thử lại</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function AppInner() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-[#0E676B] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-[#0E676B]">Đang tải...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2] p-6">
      <div className="max-w-md w-full bg-white rounded-3xl border-2 border-red-200 p-6 space-y-3">
        <h2 className="font-black text-red-600">⚠ Không kết nối được Supabase</h2>
        <p className="text-xs font-mono bg-red-50 p-3 rounded-xl text-red-700 break-all">{error}</p>
        <p className="text-xs text-[#333]/50">Kiểm tra VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY trong Vercel settings</p>
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

export default function App() {
  return (
    <ErrorBoundary>
      <AppInner />
    </ErrorBoundary>
  )
}
