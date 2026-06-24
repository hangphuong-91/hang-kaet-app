import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowLeft, PawPrint } from 'lucide-react'

const BREEDS = ['Mèo Ta', 'Mèo Anh Lông Ngắn', 'Mèo Anh Lông Dài', 'Mèo Ba Tư', 'Scottish Fold', 'Maine Coon', 'Ragdoll', 'Siamese', 'Bengal', 'Munchkin', 'Devon Rex', 'Sphynx', 'Norwegian Forest', 'Birman', 'Khác']

export default function AddCatPage() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', nickname: '', breed: '', gender: '' as 'male' | 'female' | 'unknown' | '',
    dob: '', adopted_date: '', color: '', microchip: '', notes: '',
  })

  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase.from('cats').insert({
      owner_id: user!.id,
      name: form.name.trim(),
      nickname: form.nickname || null,
      breed: form.breed || null,
      gender: form.gender || 'unknown',
      dob: form.dob || null,
      adopted_date: form.adopted_date || null,
      color: form.color || null,
      microchip: form.microchip || null,
      notes: form.notes || null,
    }).select().single()
    setSaving(false)
    if (!error && data) navigate(`/cat/${data.id}`)
  }

  const inputCls = 'w-full bg-[#FAF7F2] border-2 border-brand-charcoal/10 rounded-2xl px-4 py-3 text-sm font-semibold text-brand-charcoal placeholder-brand-charcoal/30 focus:outline-none focus:border-brand-teal transition-colors'
  const labelCls = 'block text-[10px] font-black uppercase tracking-wider text-brand-charcoal/50 mb-1.5'

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/')} className="w-9 h-9 flex items-center justify-center rounded-xl border-2 border-brand-charcoal/10 hover:border-brand-teal/30 cursor-pointer transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-black text-brand-charcoal">Thêm mèo mới</h1>
          <p className="text-xs text-brand-charcoal/40">Tạo hồ sơ cho thành viên mới</p>
        </div>
      </div>

      {/* Avatar placeholder */}
      <div className="flex justify-center">
        <div className="w-24 h-24 rounded-3xl bg-brand-teal/10 border-2 border-dashed border-brand-teal/30 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-brand-teal/15 transition-colors">
          <PawPrint className="w-8 h-8 text-brand-teal/40" />
          <span className="text-[9px] font-black text-brand-teal/50">Thêm ảnh</span>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-3xl border-2 border-brand-charcoal/8 p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={labelCls}>Tên mèo *</label>
            <input className={inputCls} placeholder="VD: Miu, Bông, Caramel..." value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Tên gọi thân mật</label>
            <input className={inputCls} placeholder="VD: Hoàng Thượng, Crush..." value={form.nickname} onChange={e => set('nickname', e.target.value)} />
          </div>
        </div>

        <div>
          <label className={labelCls}>Giống mèo</label>
          <select className={inputCls} value={form.breed} onChange={e => set('breed', e.target.value)}>
            <option value="">Chọn giống mèo...</option>
            {BREEDS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <div>
          <label className={labelCls}>Giới tính</label>
          <div className="grid grid-cols-3 gap-2">
            {[['male', '♂ Đực'], ['female', '♀ Cái'], ['unknown', '? Chưa rõ']].map(([v, l]) => (
              <button key={v} type="button" onClick={() => set('gender', v)}
                className={`py-2.5 rounded-2xl text-xs font-black border-2 cursor-pointer transition-all ${
                  form.gender === v ? 'bg-brand-teal text-white border-brand-teal' : 'bg-[#FAF7F2] border-brand-charcoal/10 text-brand-charcoal/60 hover:border-brand-teal/30'
                }`}>{l}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Ngày sinh</label>
            <input type="date" className={inputCls} value={form.dob} onChange={e => set('dob', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Ngày nhận nuôi</label>
            <input type="date" className={inputCls} value={form.adopted_date} onChange={e => set('adopted_date', e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Màu lông</label>
            <input className={inputCls} placeholder="VD: Cam vàng, Tabby..." value={form.color} onChange={e => set('color', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Chip định danh</label>
            <input className={inputCls} placeholder="Số chip (nếu có)" value={form.microchip} onChange={e => set('microchip', e.target.value)} />
          </div>
        </div>

        <div>
          <label className={labelCls}>Ghi chú về tính cách / đặc điểm</label>
          <textarea className={`${inputCls} resize-none`} rows={3} placeholder="VD: Hay gắt khi đói, thích ngủ trên vai ba..." value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>
      </div>

      {/* Save */}
      <button onClick={handleSave} disabled={!form.name.trim() || saving}
        className="w-full bg-brand-teal text-white font-black text-sm py-4 rounded-2xl border-2 border-brand-charcoal shadow-[4px_4px_0px_0px_rgba(51,51,51,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
        {saving ? 'Đang lưu...' : '🐾 Tạo hồ sơ mèo'}
      </button>
    </div>
  )
}
