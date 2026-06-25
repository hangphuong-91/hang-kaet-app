import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { X, Shield, ChevronDown } from 'lucide-react'

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (cfg: object) => void
          renderButton: (el: HTMLElement, cfg: object) => void
          cancel: () => void
        }
      }
    }
  }
}

type Mode = 'login' | 'signup' | 'forgot'

const TC_SECTIONS = [
  {
    title: '1. Dịch vụ & Phạm vi áp dụng',
    body: 'Hang Kæt ("chúng tôi") vận hành ứng dụng quản lý hồ sơ mèo cưng tại app.hangkaet.net ("Ứng dụng"). Khi đăng ký tài khoản, bạn ("Người dùng") xác nhận đã đọc, hiểu và đồng ý với toàn bộ Điều khoản này. Ứng dụng hiện cung cấp các tính năng: quản lý hồ sơ mèo, theo dõi sức khỏe/tiêm chủng/cân nặng, lưu kỷ niệm và đặt lịch dịch vụ Kæt Sitter.',
  },
  {
    title: '2. Thông tin thu thập',
    body: 'Chúng tôi thu thập: (a) Địa chỉ email và thông tin xác thực tài khoản; (b) Thông tin hồ sơ mèo cưng: tên, giống, giới tính, ngày sinh, cân nặng, lịch sử y tế, lịch tiêm chủng, ghi chú; (c) URL ảnh kỷ niệm do Người dùng tự cung cấp — ảnh được lưu trữ trên dịch vụ của bên thứ ba (Google Drive, Imgur...), chúng tôi chỉ lưu đường dẫn; (d) Thông tin yêu cầu đặt lịch dịch vụ trông mèo.',
  },
  {
    title: '3. Mục đích sử dụng dữ liệu',
    body: 'Dữ liệu được sử dụng để: hiển thị và quản lý hồ sơ sức khỏe mèo cưng của bạn; hỗ trợ xử lý yêu cầu đặt lịch dịch vụ Kæt Sitter; cải thiện chất lượng dịch vụ. Chúng tôi không sử dụng dữ liệu cho mục đích quảng cáo, không bán, không chia sẻ hoặc cho thuê thông tin cá nhân cho bên thứ ba dưới bất kỳ hình thức nào.',
  },
  {
    title: '4. Bảo mật dữ liệu',
    body: 'Dữ liệu mèo của bạn được bảo vệ theo cơ chế Row Level Security (RLS): chỉ chủ tài khoản mới có thể đọc và ghi dữ liệu của mình. Mật khẩu được mã hóa theo chuẩn công nghiệp — chúng tôi không thể xem mật khẩu của bạn. Người vận hành Hang Kæt có thể xem thông tin hồ sơ mèo (không phải thông tin cá nhân nhạy cảm như mật khẩu hay email) nhằm mục đích hỗ trợ dịch vụ trông mèo khi có yêu cầu.',
  },
  {
    title: '5. Dịch vụ Kæt Sitter — Lưu ý quan trọng',
    body: 'Việc gửi yêu cầu đặt lịch trông mèo không đồng nghĩa với việc yêu cầu được chấp nhận. Hang Kæt có toàn quyền từ chối yêu cầu nếu không phù hợp với lịch, điều kiện sức khỏe của mèo hoặc các tiêu chí dịch vụ khác. Không có giao dịch tài chính nào được xử lý qua ứng dụng — mọi thỏa thuận thanh toán được thực hiện trực tiếp giữa các bên.',
  },
  {
    title: '6. Quyền của Người dùng (theo NĐ 13/2023/NĐ-CP)',
    body: 'Bạn có quyền: (a) Truy cập — xem toàn bộ dữ liệu của mình trong ứng dụng bất kỳ lúc nào; (b) Chỉnh sửa — cập nhật thông tin bất kỳ lúc nào; (c) Xóa — yêu cầu xóa tài khoản và toàn bộ dữ liệu liên quan bằng cách liên hệ qua email trong vòng 30 ngày; (d) Phản đối — ngừng sử dụng dịch vụ bất kỳ lúc nào mà không cần giải thích.',
  },
  {
    title: '7. Lưu trữ & Xóa dữ liệu',
    body: 'Dữ liệu được lưu trữ trên hạ tầng Supabase (máy chủ đặt tại Mỹ, tuân thủ tiêu chuẩn SOC 2 Type II). Dữ liệu được lưu trong suốt thời gian tài khoản còn hoạt động. Khi xóa tài khoản, toàn bộ dữ liệu sẽ bị xóa vĩnh viễn trong vòng 30 ngày kể từ ngày yêu cầu.',
  },
  {
    title: '8. Thay đổi Điều khoản',
    body: 'Hang Kæt có thể cập nhật Điều khoản này khi cần thiết. Thay đổi quan trọng sẽ được thông báo qua email đã đăng ký. Việc tiếp tục sử dụng ứng dụng sau ngày thay đổi có hiệu lực đồng nghĩa với việc bạn chấp nhận Điều khoản mới.',
  },
  {
    title: '9. Liên hệ',
    body: 'Mọi thắc mắc về dữ liệu cá nhân, yêu cầu xóa tài khoản hoặc phản ánh vi phạm: hangkaet@gmail.com | hangkaet.net',
  },
]

function TcModal({ onClose }: { onClose: () => void }) {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full sm:max-w-lg bg-white sm:rounded-3xl rounded-t-3xl border-2 border-[#33333315] shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#33333310] flex-shrink-0">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#0E676B]" />
            <div>
              <h2 className="font-black text-[#333] text-sm">Điều khoản & Bảo mật</h2>
              <p className="text-[10px] text-[#333]/40 font-semibold">Hang Kæt · Hiệu lực 24/06/2026</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-[#33333308] cursor-pointer transition-colors">
            <X className="w-4 h-4 text-[#333]/50" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 py-3 space-y-1.5">
          {TC_SECTIONS.map((sec, i) => (
            <div key={i} className="rounded-2xl border border-[#33333310] overflow-hidden">
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer hover:bg-[#FAF7F2] transition-colors"
              >
                <span className="text-[11px] font-black text-[#333]">{sec.title}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#333]/40 transition-transform flex-shrink-0 ml-2 ${openIdx === i ? 'rotate-180' : ''}`} />
              </button>
              {openIdx === i && (
                <div className="px-4 pb-4">
                  <p className="text-[11px] text-[#333]/70 leading-relaxed">{sec.body}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="px-6 py-4 border-t border-[#33333310] flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-[#0E676B] text-white font-black text-sm py-3 rounded-2xl border-2 border-[#333] shadow-[3px_3px_0px_0px_rgba(51,51,51,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [agreedToTC, setAgreedToTC] = useState(false)
  const [showTC, setShowTC] = useState(false)
  const gsiRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (mode === 'forgot') return

    const render = () => {
      const gsi = window.google?.accounts?.id
      if (!gsi || !gsiRef.current) return
      gsiRef.current.innerHTML = ''
      gsi.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID as string,
        callback: async (res: { credential: string }) => {
          setLoading(true)
          setMessage(null)
          const { error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: res.credential,
          })
          if (error) {
            setMessage({ type: 'error', text: error.message })
            setLoading(false)
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      })
      gsi.renderButton(gsiRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        locale: 'vi_VN',
        width: 400,
      })
    }

    if (window.google?.accounts?.id) {
      render()
    } else {
      const script = document.querySelector<HTMLScriptElement>('script[src*="gsi/client"]')
      script?.addEventListener('load', render, { once: true })
    }
  }, [mode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'signup' && !agreedToTC) {
      setMessage({ type: 'error', text: 'Vui lòng đọc và đồng ý với Điều khoản sử dụng trước khi đăng ký.' })
      return
    }
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

  const inputCls = 'w-full bg-[#FAF7F2] border-2 border-[#33333320] rounded-2xl px-4 py-3 text-sm font-semibold text-[#333] placeholder-[#33333340] focus:outline-none focus:border-[#0E676B] transition-colors'

  return (
    <>
      {showTC && <TcModal onClose={() => setShowTC(false)} />}

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

            {/* Google Button — rendered by GSI, shows app name not Supabase URL */}
            {mode !== 'forgot' && (
              <div className="w-full flex justify-center overflow-hidden rounded-2xl" style={{ minHeight: 44 }}>
                <div ref={gsiRef} />
              </div>
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

              {/* T&C Checkbox — only on signup */}
              {mode === 'signup' && (
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex-shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      checked={agreedToTC}
                      onChange={e => setAgreedToTC(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                      agreedToTC ? 'bg-[#0E676B] border-[#0E676B]' : 'bg-white border-[#33333330] group-hover:border-[#0E676B]/50'
                    }`}>
                      {agreedToTC && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] text-[#333]/60 font-semibold leading-relaxed">
                    Tôi đã đọc và đồng ý với{' '}
                    <button
                      type="button"
                      onClick={e => { e.preventDefault(); setShowTC(true) }}
                      className="text-[#0E676B] font-black underline underline-offset-2 cursor-pointer"
                    >
                      Điều khoản sử dụng & Chính sách bảo mật
                    </button>{' '}
                    của Hang Kæt
                  </span>
                </label>
              )}

              {message && (
                <div className={`rounded-2xl px-4 py-3 text-xs font-bold ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                  {message.text}
                </div>
              )}

              <button type="submit" disabled={loading || (mode === 'signup' && !agreedToTC)}
                className="w-full bg-[#0E676B] text-white font-black text-sm py-3.5 rounded-2xl border-2 border-[#333] shadow-[3px_3px_0px_0px_rgba(51,51,51,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-[3px_3px_0px_0px_rgba(51,51,51,1)]">
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
            <button onClick={() => setShowTC(true)} className="underline cursor-pointer hover:text-[#333]/50">Xem Điều khoản</button>
            {' '}·{' '}
            <a href="https://hangkaet.net" className="underline">hangkaet.net</a>
          </p>
        </div>
      </div>
    </>
  )
}
