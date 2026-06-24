import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../lib/supabase'

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-brand-offwhite flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="https://hangkaet.net" className="inline-block">
            <h1 className="text-3xl font-black text-brand-teal tracking-tight">Hang Kæt</h1>
            <p className="text-xs text-brand-charcoal/50 font-medium mt-1">🐾 Hồ Sơ Mèo Cưng</p>
          </a>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-3xl border-2 border-brand-charcoal/10 shadow-[4px_4px_0px_0px_rgba(14,103,107,0.15)] p-8">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#0E676B',
                    brandAccent: '#20A39A',
                    brandButtonText: 'white',
                    defaultButtonBackground: '#FAF7F2',
                    defaultButtonBackgroundHover: '#F2B94B20',
                    inputBackground: '#FAF7F2',
                    inputBorder: '#33333320',
                    inputBorderFocus: '#0E676B',
                    inputBorderHover: '#0E676B80',
                  },
                  radii: {
                    borderRadiusButton: '12px',
                    buttonBorderRadius: '12px',
                    inputBorderRadius: '12px',
                  },
                  fonts: {
                    bodyFontFamily: `"Quicksand", system-ui, sans-serif`,
                    buttonFontFamily: `"Quicksand", system-ui, sans-serif`,
                    inputFontFamily: `"Quicksand", system-ui, sans-serif`,
                    labelFontFamily: `"Quicksand", system-ui, sans-serif`,
                  },
                  fontSizes: {
                    baseBodySize: '13px',
                    baseInputSize: '13px',
                    baseLabelSize: '11px',
                    baseButtonSize: '13px',
                  },
                },
              },
              className: {
                button: 'font-black',
                label: 'font-black uppercase tracking-wider',
              },
            }}
            providers={['google']}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Email',
                  password_label: 'Mật khẩu',
                  email_input_placeholder: 'email@example.com',
                  password_input_placeholder: 'Mật khẩu của bạn',
                  button_label: 'Đăng nhập',
                  loading_button_label: 'Đang đăng nhập...',
                  social_provider_text: 'Tiếp tục với {{provider}}',
                  link_text: 'Đã có tài khoản? Đăng nhập',
                },
                sign_up: {
                  email_label: 'Email',
                  password_label: 'Tạo mật khẩu',
                  email_input_placeholder: 'email@example.com',
                  password_input_placeholder: 'Tối thiểu 8 ký tự',
                  button_label: 'Tạo tài khoản',
                  loading_button_label: 'Đang tạo...',
                  social_provider_text: 'Tiếp tục với {{provider}}',
                  link_text: 'Chưa có tài khoản? Đăng ký',
                  confirmation_text: 'Kiểm tra email để xác nhận tài khoản',
                },
                forgotten_password: {
                  link_text: 'Quên mật khẩu?',
                  button_label: 'Gửi link đặt lại',
                  loading_button_label: 'Đang gửi...',
                  confirmation_text: 'Kiểm tra email của bạn',
                },
              },
            }}
            redirectTo={window.location.origin}
          />
        </div>

        {/* Privacy note */}
        <p className="text-center text-[10px] text-brand-charcoal/40 mt-6 leading-relaxed px-4">
          Dữ liệu mèo của bạn được mã hóa và chỉ bạn mới có thể truy cập.
          Hang Kæt không đọc thông tin cá nhân của bạn.{' '}
          <a href="https://hangkaet.net/privacy" className="underline">Chính sách bảo mật</a>
        </p>
      </div>
    </div>
  )
}
