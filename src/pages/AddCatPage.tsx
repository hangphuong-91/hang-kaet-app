import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Camera, Loader } from 'lucide-react'

const BREEDS = ['Mèo Ta', 'Mèo Anh Lông Ngắn', 'Mèo Anh Lông Dài', 'Mèo Ba Tư', 'Scottish Fold', 'Maine Coon', 'Ragdoll', 'Siamese', 'Bengal', 'Munchkin', 'Devon Rex', 'Sphynx', 'Norwegian Forest', 'Birman', 'Khác']

export default function AddCatPage() {
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  const [form, setForm] = useState({
    name: '', nickname: '', breed: '', gender: '' as 'male' | 'female' | 'unknown' | '',
    dob: '', adopted_date: '', color: '', microchip: '', notes: '',
    avatar_url: '',
  })

  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show local preview immediately
    const reader = new FileReader()
    reader.onload = ev => setAvatarPreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    setUploading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${user!.id}/${Date.now()}.${ext}`

    const { error } = await supabase.storage.from('cat-photos').upload(path, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('cat-photos').getPublicUrl(path)
      set('avatar_url', data.publicUrl)
    }
    setUploading(false)
  }

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
      avatar_url: form.avatar_url || null,
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

      {/* Avatar upload */}
      <div className="flex flex-col items-center gap-2">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-28 h-28 rounded-3xl overflow-hidden bg-brand-teal/10 border-2 border-dashed border-brand-teal/30 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-brand-teal/15 transition-colors relative group disabled:cursor-not-allowed"
        >
          {avatarPreview ? (
            <>
              <img src={avatarPreview} alt="preview" className="w-full h-full object-cover absolute inset-0" />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </>
          ) : (
            <>
              {uploading ? (
                <Loader className="w-7 h-7 text-brand-teal/50 animate-spin" />
              ) : (
                <>
                  <Camera className="w-7 h-7 text-brand-teal/40" />
                  <span className="text-[9px] font-black text-brand-teal/50">Thêm ảnh</span>
                </>
              )}
            </>
          )}
          {uploading && avatarPreview && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Loader className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </button>
        <p className="text-[10px] text-brand-charcoal/30 font-semibold">
          {uploading ? 'Đang tải ảnh...' : 'Nhấn để chọn ảnh đại diện'}
        </p>
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
      <button onClick={handleSave} disabled={!form.name.trim() || saving || uploading}
        className="w-full bg-brand-teal text-white font-black text-sm py-4 rounded-2xl border-2 border-brand-charcoal shadow-[4px_4px_0px_0px_rgba(51,51,51,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-[4px_4px_0px_0px_rgba(51,51,51,1)]">
        {saving ? 'Đang lưu...' : uploading ? 'Chờ ảnh tải xong...' : '🐾 Tạo hồ sơ mèo'}
      </button>
    </div>
  )
}
