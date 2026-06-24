import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { SitterBooking } from '../../lib/types'
import { Home, Calendar, Clock, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'

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
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000)
}

export default function SitterBookingTab({ catId }: { catId: string }) {
  const [bookings, setBookings] = useState<SitterBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

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

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-6 h-6 border-4 border-[#0E676B] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (bookings.length === 0) return (
    <div className="text-center py-16 space-y-4">
      <div className="w-16 h-16 bg-[#0E676B]/10 rounded-full flex items-center justify-center mx-auto">
        <Home className="w-8 h-8 text-[#0E676B]/30" />
      </div>
      <div>
        <p className="font-black text-[#333]/60 text-sm">Chưa có lịch sử gửi Sitter</p>
        <p className="text-xs text-[#333]/40 mt-1">Các lần đặt sitter cho bé sẽ hiển thị ở đây</p>
      </div>
      <a
        href="https://hangkaet.net?tab=sitter"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-[#0E676B] text-white font-black text-xs px-5 py-2.5 rounded-2xl border-2 border-[#333] shadow-[3px_3px_0px_0px_rgba(51,51,51,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
      >
        <Home className="w-3.5 h-3.5" />
        Đăng ký trông mèo
      </a>
    </div>
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black text-[#333]/50 uppercase tracking-wider">{bookings.length} lần gửi</p>
        <a
          href="https://hangkaet.net?tab=sitter"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-black text-[#0E676B] hover:underline flex items-center gap-1"
        >
          <ExternalLink className="w-3 h-3" /> Đặt lịch mới
        </a>
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

              {isOpen ? <ChevronUp className="w-4 h-4 text-[#333]/30 flex-shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-[#333]/30 flex-shrink-0 mt-1" />}
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
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-[#0E676B]">
                              {new Date(note.timestamp).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
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
  )
}
