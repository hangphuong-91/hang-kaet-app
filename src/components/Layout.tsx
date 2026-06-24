import type { Session } from '@supabase/supabase-js'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { LayoutDashboard, PawPrint, LogOut, ExternalLink } from 'lucide-react'

interface LayoutProps {
  session: Session
  children: React.ReactNode
}

export default function Layout({ session, children }: LayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const email = session.user.email || ''
  const displayName = session.user.user_metadata?.full_name || email.split('@')[0]
  const avatar = session.user.user_metadata?.avatar_url

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* Top Nav */}
      <nav className="bg-white border-b-2 border-brand-charcoal/8 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 cursor-pointer">
            <span className="text-lg font-black text-brand-teal">Hang Kæt</span>
            <span className="text-[10px] bg-brand-teal/10 text-brand-teal font-black px-2 py-0.5 rounded-full">App</span>
          </button>

          <div className="flex items-center gap-3">
            <a href="https://hangkaet.net" target="_blank" rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1 text-[11px] text-brand-charcoal/50 hover:text-brand-teal font-bold transition-colors">
              <ExternalLink className="w-3 h-3" /> Trang chủ
            </a>

            <div className="flex items-center gap-2">
              {avatar ? (
                <img src={avatar} alt="" className="w-7 h-7 rounded-full border-2 border-brand-teal/20" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-brand-teal/15 flex items-center justify-center">
                  <span className="text-[10px] font-black text-brand-teal">{displayName[0]?.toUpperCase()}</span>
                </div>
              )}
              <span className="hidden sm:block text-[11px] font-bold text-brand-charcoal/70 max-w-[120px] truncate">{displayName}</span>
            </div>

            <button onClick={handleLogout}
              className="flex items-center gap-1 text-[11px] text-brand-charcoal/40 hover:text-brand-pink font-bold transition-colors cursor-pointer">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Bottom Tab Bar (mobile) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-brand-charcoal/8 z-40 sm:hidden">
        <div className="flex">
          {[
            { icon: LayoutDashboard, label: 'Tổng quan', path: '/' },
            { icon: PawPrint, label: 'Mèo của tôi', path: '/cat/new' },
          ].map(({ icon: Icon, label, path }) => (
            <button key={path} onClick={() => navigate(path)}
              className={`flex-1 py-3 flex flex-col items-center gap-0.5 cursor-pointer transition-colors ${
                location.pathname === path ? 'text-brand-teal' : 'text-brand-charcoal/40'
              }`}>
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-black">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 pb-20 sm:pb-6">
        {children}
      </main>
    </div>
  )
}
