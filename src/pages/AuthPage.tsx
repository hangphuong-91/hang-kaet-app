import { useState } from 'react'
import { supabase } from '../lib/supabase'

type Mode = 'login' | 'signup' | 'forgot'

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage({ type: 'error', text: error.message })
    } else if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage({ type: 'error', text: error.message })
      else setMessage({ type: 'success', text: 'Kiểm tra email để xác nhận tài khoản!' })
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) setMessage({ type: 'error', text: error.message })
      else setMessage({ type: 'success', text: 'Đã gửi link đặt lại mật khẩu vào email!' })
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) { setMessage({ type: 'error', text: error.message }); setLoading(false) }
  }

  const inputCls = 'w-full bg-[#FAF7F2] border-2 border-[#33333320] rounded-2xl px-4 py-3 text-sm font-semibold text-[#333] placeholder-[#33333340] focus:outline-none focus:border-[#0E676B] transition-colors'

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <a href="https://hangkaet.net">
            <h1 className="text-3xl font-black text-[#0E676B] tracking-tight">Hang Kæt</h1>
            <p className="text-xs text-[#333]/40 font-medium mt-1">🐾 Hồ Sơ Mèo Cưng</p>
          </a>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border-2 border-[#33333315] shadow-[4px_4px_0px_0px_rgba(14,103,107,0.12)] p-8 space-y-5">

          <h2 className="font-black text-[#333] text-lg">
            {mode === 'login' ? 'Đăng nhập' : mode === 'signup' ? 'Tạo tài khoản' : 'Quên mật khẩu'}
          </h2>

          {/* Google Button */}
          {mode !== 'forgot' && (
            <button onClick={handleGoogle} disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-[#33333320] hover:border-[#333]/30 rounded-2xl py-3 text-sm font-black text-[#333] cursor-pointer transition-colors disabled:opacity-50">
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18z"/>
                <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
              </svg>
              Tiếp tục với Google
            </button>
          )}

          {mode !== 'forgot' && (
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[#333]/10" />
              <span className="text-[10px] font-black text-[#333]/30 uppercase tracking-wider">hoặc</span>
              <div className="flex-1 h-px bg-[#333]/10" />
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-[#333]/50 mb-1.5">Email</label>
              <input type="email" required className={inputCls} placeholder="email@example.com"
                value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            {mode !== 'forgot' && (
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-[#333]/50 mb-1.5">Mật khẩu</label>
                <input type="password" required minLength={6} className={inputCls}
                  placeholder={mode === 'signup' ? 'Tối thiểu 6 ký tự' : 'Mật khẩu của bạn'}
                  value={password} onChange={e => setPassword(e.target.value)} />
              </div>
            )}

            {message && (
              <div className={`rounded-2xl px-4 py-3 text-xs font-bold ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                {message.text}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-[#0E676B] text-white font-black text-sm py-3.5 rounded-2xl border-2 border-[#333] shadow-[3px_3px_0px_0px_rgba(51,51,51,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer disabled:opacity-50">
              {loading ? 'Đang xử lý...' : mode === 'login' ? 'Đăng nhập' : mode === 'signup' ? 'Tạo tài khoản' : 'Gửi link đặt lại'}
            </button>
          </form>

          {/* Mode switcher */}
          <div className="flex flex-col items-center gap-2 pt-1">
            {mode === 'login' && <>
              <button onClick={() => { setMode('signup'); setMessage(null) }} className="text-xs font-black text-[#0E676B] hover:underline cursor-pointer">Chưa có tài khoản? Đăng ký</button>
              <button onClick={() => { setMode('forgot'); setMessage(null) }} className="text-[11px] text-[#333]/40 hover:text-[#333]/70 cursor-pointer">Quên mật khẩu?</button>
            </>}
            {mode === 'signup' && <button onClick={() => { setMode('login'); setMessage(null) }} className="text-xs font-black text-[#0E676B] hover:underline cursor-pointer">Đã có tài khoản? Đăng nhập</button>}
            {mode === 'forgot' && <button onClick={() => { setMode('login'); setMessage(null) }} className="text-xs font-black text-[#0E676B] hover:underline cursor-pointer">← Quay lại đăng nhập</button>}
          </div>
        </div>

        <p className="text-center text-[10px] text-[#333]/30 mt-5 leading-relaxed px-4">
          Dữ liệu mèo của bạn được mã hóa và chỉ bạn mới truy cập được.{' '}
          <a href="https://hangkaet.net" className="underline">hangkaet.net</a>
        </p>
      </div>
    </div>
  )
}
