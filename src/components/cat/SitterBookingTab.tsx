import { useEffect, useState } from 'react'
import emailjs from '@emailjs/browser'
import { supabase } from '../../lib/supabase'
import type { SitterBooking } from '../../lib/types'
import { Home, Calendar, Clock, ChevronDown, ChevronUp, Plus, X, Send, ExternalLink } from 'lucide-react'

const STATUS = {
  pending:   { label: 'Chờ xác nhận', cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  confirmed: { label: 'Đã xác nhận',  cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  ongoing:   { label: 'Đang chăm sóc', cls: 'bg-[#0E676B]/10 text-[#0E676B] border-[#0E676B]/20' },
  completed: { label: 'Hoàn thành',   cls: 'bg-green-50 text-green-700 border-green-200' },
  cancelled: { label: 'Đã hủy',       cls: 'bg-red-50 text-red-600 border-red-200' },
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function diffDays(start: string, end: string) {
  return Math.max(1, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000))
}

function today() {
  return new Date().toISOString().split('T')[0]
}

function addDays(date: string, n: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

interface BookingFormProps {
  catId: string
  catName: string
  onClose: () => void
  onSaved: (b: SitterBooking) => void
}

function BookingForm({ catId, catName, onClose, onSaved }: BookingFormProps) {
  const [startDate, setStartDate] = useState(addDays(today(), 3))
  const [endDate, setEndDate] = useState(addDays(today(), 6))
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const inputCls = 'w-full bg-[#FAF7F2] border-2 border-[#33333315] rounded-xl px-3 py-2.5 text-sm font-semibold text-[#333] focus:outline-none focus:border-[#0E676B] transition-colors'

  const sendEmail = async (ownerEmail: string, booking: SitterBooking) => {
    const svcId  = import.meta.env.VITE_EMAILJS_SERVICE_ID  as string
    const tplId  = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string
    const pubKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY  as string
    if (!svcId || !tplId || !pubKey) return
    try {
      await emailjs.send(svcId, tplId, {
        cat_name:     catName,
        owner_email:  ownerEmail,
        start_date:   new Date(booking.start_date).toLocaleDateString('vi-VN'),
        end_date:     new Date(booking.end_date).toLocaleDateString('vi-VN'),
        days:         diffDays(booking.start_date, booking.end_date),
        notes:        booking.notes ?? '(không có ghi chú)',
        submitted_at: new Date().toLocaleString('vi-VN'),
      }, pubKey)
    } catch (e) {
      console.warn('[sitter] email notification failed:', e)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (endDate <= startDate) { setErr('Ngày kết thúc phải sau ngày bắt đầu.'); return }
    setSaving(true)
    setErr(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setErr('Chưa đăng nhập.'); setSaving(false); return }

    const { data, error } = await supabase
      .from('sitter_bookings')
      .insert({
        user_id: user.id,
        cat_id: catId,
        start_date: startDate,
        end_date: endDate,
        status: 'pending',
        notes: notes.trim() || null,
      })
      .select()
      .single()

    if (error) {
      setErr('Gửi thất bại: ' + error.message)
      setSaving(false)
      return
    }

    sendEmail(user.email ?? 'unknown', data as SitterBooking)
    onSaved(data as SitterBooking)
  }

  const days = endDate > startDate ? diffDays(startDate, endDate) : 0

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full sm:max-w-md bg-white sm:rounded-3xl rounded-t-3xl border-2 border-[#33333315] shadow-2xl">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#33333310]">
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-[#0E676B]" />
            <div>
              <h2 className="font-black text-[#333] text-sm">Đăng ký Kæt Sitter</h2>
              <p className="text-[10px] text-[#333]/40 font-semibold">Hang Kæt sẽ liên hệ xác nhận qua Zalo</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-[#33333308] cursor-pointer transition-colors">
            <X className="w-4 h-4 text-[#333]/50" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-[#333]/50 mb-1.5">Ngày bắt đầu</label>
              <input
                type="date"
                required
                min={addDays(today(), 1)}
                value={startDate}
                onChange={e => {
                  setStartDate(e.target.value)
                  if (e.target.value >= endDate) setEndDate(addDays(e.target.value, 3))
                }}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-[#333]/50 mb-1.5">Ngày kết thúc</label>
              <input
                type="date"
                required
                min={addDays(startDate, 1)}
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          {days > 0 && (
            <div className="bg-[#0E676B]/8 rounded-xl px-3 py-2 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#0E676B]" />
              <span className="text-xs font-black text-[#0E676B]">{days} ngày chăm sóc</span>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-[#333]/50 mb-1.5">Ghi chú cho Sitter</label>
            <textarea
              className={`${inputCls} resize-none`}
              rows={3}
              placeholder="Lịch cho ăn, thói quen đặc biệt, vị trí thức ăn/cát, số điện thoại liên hệ..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            <p className="text-[11px] text-amber-700 font-semibold leading-relaxed">
              Đăng ký không đồng nghĩa xác nhận. Hang Kæt sẽ liên hệ Zalo để xác nhận lịch phù hợp.
            </p>
          </div>

          {err && <p className="text-xs text-red-600 font-bold">{err}</p>}

          <button
            type="submit"
            disabled={saving || days <= 0}
            className="w-full bg-[#0E676B] text-white font-black text-sm py-3 rounded-2xl border-2 border-[#333] shadow-[3px_3px_0px_0px_rgba(51,51,51,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-[3px_3px_0px_0px_rgba(51,51,51,1)] flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            {saving ? 'Đang gửi...' : 'Gửi đăng ký'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function SitterBookingTab({ catId, catName }: { catId: string; catName: string }) {
  const [bookings, setBookings] = useState<SitterBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    supabase
      .from('sitter_bookings')
      .select('*')
      .eq('cat_id', catId)
      .order('start_date', { ascending: false })
      .then(({ data }) => {
        if (data) setBookings(data)
        setLoading(false)
      })
  }, [catId])

  const handleSaved = (b: SitterBooking) => {
    setBookings(prev => [b, ...prev])
    setShowForm(false)
  }

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-6 h-6 border-4 border-[#0E676B] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <>
      {showForm && <BookingForm catId={catId} catName={catName} onClose={() => setShowForm(false)} onSaved={handleSaved} />}

      {bookings.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <div className="w-16 h-16 bg-[#0E676B]/10 rounded-full flex items-center justify-center mx-auto">
            <Home className="w-8 h-8 text-[#0E676B]/30" />
          </div>
          <div>
            <p className="font-black text-[#333]/60 text-sm">Chưa có lịch sử gửi Sitter</p>
            <p className="text-xs text-[#333]/40 mt-1">Các lần đặt sitter cho bé sẽ hiển thị ở đây</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-[#0E676B] text-white font-black text-xs px-5 py-2.5 rounded-2xl border-2 border-[#333] shadow-[3px_3px_0px_0px_rgba(51,51,51,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            Đăng ký trông mèo
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black text-[#333]/50 uppercase tracking-wider">{bookings.length} lần gửi</p>
            <div className="flex items-center gap-3">
              <a
                href="https://hangkaet.net?tab=sitter"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-black text-[#333]/40 hover:text-[#0E676B] flex items-center gap-1 transition-colors"
              >
                <ExternalLink className="w-3 h-3" /> hangkaet.net
              </a>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-1 text-[11px] font-black text-[#0E676B] hover:underline cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Đặt lịch mới
              </button>
            </div>
          </div>

          {bookings.map(b => {
            const st = STATUS[b.status] ?? STATUS.pending
            const days = diffDays(b.start_date, b.end_date)
            const isOpen = expanded === b.id
            const hasNotes = b.admin_notes && b.admin_notes.length > 0

            return (
              <div key={b.id} className="bg-white rounded-2xl border-2 border-[#33333310] overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : b.id)}
                  className="w-full p-4 text-left flex items-start gap-3 cursor-pointer hover:bg-[#FAF7F2] transition-colors"
                >
                  <div className="w-10 h-10 bg-[#0E676B]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Home className="w-5 h-5 text-[#0E676B]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${st.cls}`}>
                        {st.label}
                      </span>
                      {hasNotes && (
                        <span className="text-[10px] font-black text-[#0E676B] bg-[#0E676B]/10 px-2 py-0.5 rounded-full">
                          {b.admin_notes!.length} cập nhật
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-[#333]/60 font-bold">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {fmtDate(b.start_date)} → {fmtDate(b.end_date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {days} ngày
                      </span>
                    </div>
                    {b.notes && (
                      <p className="mt-1 text-[11px] text-[#333]/50 line-clamp-1">{b.notes}</p>
                    )}
                  </div>

                  {isOpen
                    ? <ChevronUp className="w-4 h-4 text-[#333]/30 flex-shrink-0 mt-1" />
                    : <ChevronDown className="w-4 h-4 text-[#333]/30 flex-shrink-0 mt-1" />
                  }
                </button>

                {isOpen && (
                  <div className="border-t border-[#33333310] px-4 pb-4 pt-3 space-y-3">
                    {b.notes && (
                      <div>
                        <p className="text-[10px] font-black text-[#333]/40 uppercase tracking-wider mb-1">Ghi chú của bạn</p>
                        <p className="text-xs text-[#333] font-semibold leading-relaxed">{b.notes}</p>
                      </div>
                    )}

                    {hasNotes && (
                      <div>
                        <p className="text-[10px] font-black text-[#333]/40 uppercase tracking-wider mb-2">Cập nhật từ Sitter</p>
                        <div className="space-y-2">
                          {b.admin_notes!.map((note, i) => (
                            <div key={i} className="bg-[#FAF7F2] rounded-xl p-3 space-y-2">
                              <span className="text-[10px] font-black text-[#0E676B]">
                                {new Date(note.timestamp).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <p className="text-xs text-[#333] font-semibold leading-relaxed">{note.text}</p>
                              {note.photo_urls && note.photo_urls.length > 0 && (
                                <div className="flex gap-2 flex-wrap mt-1">
                                  {note.photo_urls.map((url, j) => (
                                    <img key={j} src={url} alt="" className="w-16 h-16 rounded-lg object-cover border border-[#33333315]" />
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {!hasNotes && !b.notes && (
                      <p className="text-xs text-[#333]/40 italic">Chưa có thông tin thêm.</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
