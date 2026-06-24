import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Memory } from '../../lib/types'
import { Plus, Heart, X } from 'lucide-react'

interface Props { catId: string }

export default function MemoriesTab({ catId }: Props) {
  const [memories, setMemories] = useState<Memory[]>([])
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', date: new Date().toISOString().split('T')[0], photo_url: '', note: '' })

  useEffect(() => {
    supabase.from('memories').select('*').eq('cat_id', catId).order('date', { ascending: false }).then(({ data }) => {
      if (data) setMemories(data)
    })
  }, [catId])

  const handleSave = async () => {
    if (!form.title || !form.date) return
    setSaving(true)
    const { data, error } = await supabase.from('memories').insert({
      cat_id: catId, title: form.title, date: form.date,
      photo_url: form.photo_url || null, note: form.note || null,
    }).select().single()
    setSaving(false)
    if (!error && data) {
      setMemories(p => [data, ...p])
      setShowForm(false)
      setForm({ title: '', date: new Date().toISOString().split('T')[0], photo_url: '', note: '' })
    }
  }

  const inputCls = 'w-full bg-[#FAF7F2] border-2 border-brand-charcoal/10 rounded-xl px-3 py-2.5 text-sm font-semibold text-brand-charcoal placeholder-brand-charcoal/30 focus:outline-none focus:border-brand-teal transition-colors'
  const labelCls = 'block text-[10px] font-black uppercase tracking-wider text-brand-charcoal/50 mb-1'

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-xs font-black text-brand-charcoal/50">{memories.length} kỷ niệm</p>
        <button onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 bg-brand-pink text-white text-xs font-black px-3 py-2 rounded-xl cursor-pointer hover:opacity-90 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Thêm kỷ niệm
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-3xl border-2 border-brand-pink/20 p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-sm text-brand-charcoal">Lưu kỷ niệm mới</h3>
            <button onClick={() => setShowForm(false)} className="cursor-pointer text-brand-charcoal/40 hover:text-brand-pink"><X className="w-4 h-4" /></button>
          </div>
          <div>
            <label className={labelCls}>Tiêu đề *</label>
            <input className={inputCls} placeholder="VD: Lần đầu tiên ra nắng, Sinh nhật 1 tuổi..." value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Ngày *</label>
              <input type="date" className={inputCls} value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Link ảnh</label>
              <input className={inputCls} placeholder="https://..." value={form.photo_url} onChange={e => setForm(p => ({ ...p, photo_url: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Ghi chú</label>
            <textarea className={`${inputCls} resize-none`} rows={3} placeholder="Kể lại kỷ niệm này..." value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} />
          </div>
          <button onClick={handleSave} disabled={!form.title || saving}
            className="w-full bg-brand-pink text-white font-black text-sm py-3 rounded-2xl cursor-pointer disabled:opacity-40 hover:opacity-90 transition-colors">
            {saving ? 'Đang lưu...' : '💝 Lưu kỷ niệm'}
          </button>
        </div>
      )}

      {memories.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-10 h-10 text-brand-charcoal/20 mx-auto mb-3" />
          <p className="text-sm font-black text-brand-charcoal/40">Chưa có kỷ niệm nào</p>
          <p className="text-xs text-brand-charcoal/30 mt-1">Lưu những khoảnh khắc đặc biệt cùng bé</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {memories.map(m => (
            <div key={m.id} className="bg-white rounded-3xl border-2 border-brand-charcoal/8 overflow-hidden hover:border-brand-pink/30 transition-colors">
              {m.photo_url && (
                <div className="h-40 overflow-hidden">
                  <img src={m.photo_url} alt={m.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-4">
                <p className="font-black text-sm text-brand-charcoal">{m.title}</p>
                <p className="text-[11px] text-brand-charcoal/40 font-semibold mt-0.5">{new Date(m.date).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                {m.note && <p className="text-xs text-brand-charcoal/60 mt-2 leading-relaxed">{m.note}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
