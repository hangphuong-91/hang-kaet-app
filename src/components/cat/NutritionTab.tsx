import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { FoodLog, MedicineLog } from '../../lib/types'
import { Plus, X, Utensils, Pill, Archive } from 'lucide-react'

// ── Food config ──────────────────────────────────────────────────────────────
const FOOD_TYPES: Record<FoodLog['type'], { label: string; cls: string }> = {
  dry:        { label: 'Hạt khô',   cls: 'bg-[#F2B94B]/15 text-[#9B6B0A] border-[#F2B94B]/30' },
  wet:        { label: 'Pate / Ướt',cls: 'bg-[#0E676B]/10 text-[#0E676B] border-[#0E676B]/20' },
  snack:      { label: 'Đồ ăn vặt', cls: 'bg-pink-50 text-pink-700 border-pink-200' },
  supplement: { label: 'Bổ sung',   cls: 'bg-purple-50 text-purple-700 border-purple-200' },
  other:      { label: 'Khác',      cls: 'bg-gray-50 text-gray-600 border-gray-200' },
}

// ── Medicine config ───────────────────────────────────────────────────────────
const MED_PURPOSES: Record<NonNullable<MedicineLog['purpose']>, { label: string; cls: string }> = {
  deworming:  { label: 'Tẩy giun',    cls: 'bg-orange-50 text-orange-700 border-orange-200' },
  flea:       { label: 'Trị ve/bọ chét', cls: 'bg-red-50 text-red-700 border-red-200' },
  supplement: { label: 'Thực phẩm chức năng', cls: 'bg-purple-50 text-purple-700 border-purple-200' },
  prescribed: { label: 'Thuốc kê đơn', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  other:      { label: 'Khác',        cls: 'bg-gray-50 text-gray-600 border-gray-200' },
}
const MED_FREQ: Record<NonNullable<MedicineLog['frequency']>, string> = {
  daily:     'Hàng ngày',
  weekly:    'Hàng tuần',
  monthly:   'Hàng tháng',
  as_needed: 'Khi cần',
  once:      'Một lần',
}

const inputCls = 'w-full bg-[#FAF7F2] border-2 border-[#33333310] rounded-xl px-3 py-2.5 text-sm font-semibold text-[#333] placeholder-[#33333330] focus:outline-none focus:border-[#0E676B] transition-colors'
const labelCls = 'block text-[10px] font-black uppercase tracking-wider text-[#333]/50 mb-1'

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(d?: string) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// ── Food section ──────────────────────────────────────────────────────────────
function FoodSection({ catId, userId }: { catId: string; userId: string }) {
  const [items, setItems] = useState<FoodLog[]>([])
  const [showPast, setShowPast] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    type: 'dry' as FoodLog['type'],
    brand: '', name: '', amount_per_day: '',
    feeding_times_per_day: '', notes: '', started_at: '',
  })

  useEffect(() => {
    supabase.from('food_logs').select('*').eq('cat_id', catId)
      .order('is_current', { ascending: false })
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setItems(data) })
  }, [catId])

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    const { data } = await supabase.from('food_logs').insert({
      cat_id: catId, owner_id: userId,
      type: form.type,
      brand: form.brand || null,
      name: form.name.trim(),
      amount_per_day: form.amount_per_day || null,
      feeding_times_per_day: form.feeding_times_per_day ? parseInt(form.feeding_times_per_day) : null,
      notes: form.notes || null,
      started_at: form.started_at || null,
      is_current: true,
    }).select().single()
    if (data) setItems(p => [data, ...p])
    setForm({ type: 'dry', brand: '', name: '', amount_per_day: '', feeding_times_per_day: '', notes: '', started_at: '' })
    setShowForm(false)
    setSaving(false)
  }

  const toggleCurrent = async (item: FoodLog) => {
    await supabase.from('food_logs').update({ is_current: !item.is_current }).eq('id', item.id)
    setItems(p => p.map(x => x.id === item.id ? { ...x, is_current: !x.is_current } : x))
  }

  const remove = async (id: string) => {
    await supabase.from('food_logs').delete().eq('id', id)
    setItems(p => p.filter(x => x.id !== id))
  }

  const visible = items.filter(x => showPast ? !x.is_current : x.is_current)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Utensils className="w-4 h-4 text-[#0E676B]" />
          <span className="text-sm font-black text-[#333]">Thức ăn & Pate</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowPast(!showPast)} className={`text-[10px] font-black px-2.5 py-1 rounded-full border cursor-pointer transition-colors ${showPast ? 'bg-[#333] text-white border-[#333]' : 'bg-white border-[#33333320] text-[#333]/50 hover:border-[#333]/30'}`}>
            {showPast ? 'Đang dùng' : 'Lưu trữ'}
          </button>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 text-[11px] font-black text-[#0E676B] hover:underline cursor-pointer">
            <Plus className="w-3.5 h-3.5" /> Thêm
          </button>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-[#FAF7F2] rounded-2xl border-2 border-[#0E676B]/15 p-4 space-y-3">
          <div>
            <label className={labelCls}>Loại *</label>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(FOOD_TYPES) as FoodLog['type'][]).map(t => (
                <button key={t} type="button" onClick={() => setForm(p => ({ ...p, type: t }))}
                  className={`text-[10px] font-black px-2.5 py-1 rounded-full border cursor-pointer transition-all ${form.type === t ? 'bg-[#0E676B] text-white border-[#0E676B]' : 'bg-white border-[#33333320] text-[#333]/60 hover:border-[#0E676B]/30'}`}>
                  {FOOD_TYPES[t].label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Tên sản phẩm *</label>
              <input className={inputCls} placeholder="VD: Royal Canin Kitten" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Thương hiệu</label>
              <input className={inputCls} placeholder="VD: Royal Canin" value={form.brand} onChange={e => setForm(p => ({ ...p, brand: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Lượng / ngày</label>
              <input className={inputCls} placeholder="VD: 60g, 1 lon" value={form.amount_per_day} onChange={e => setForm(p => ({ ...p, amount_per_day: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Số bữa / ngày</label>
              <input type="number" min="1" max="10" className={inputCls} placeholder="VD: 3" value={form.feeding_times_per_day} onChange={e => setForm(p => ({ ...p, feeding_times_per_day: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Dùng từ ngày</label>
              <input type="date" className={inputCls} value={form.started_at} onChange={e => setForm(p => ({ ...p, started_at: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Ghi chú</label>
              <input className={inputCls} placeholder="Dị ứng, thích ăn ấm..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={() => setShowForm(false)} className="flex-1 py-2 text-xs font-black rounded-xl border-2 border-[#33333320] text-[#333]/50 hover:bg-[#33333308] cursor-pointer transition-colors">Hủy</button>
            <button onClick={handleSave} disabled={!form.name.trim() || saving} className="flex-1 py-2 text-xs font-black rounded-xl bg-[#0E676B] text-white border-2 border-[#333] shadow-[2px_2px_0px_0px_rgba(51,51,51,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer disabled:opacity-50">
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {visible.length === 0 ? (
        <p className="text-xs text-[#333]/40 text-center py-4 italic">{showPast ? 'Không có mục lưu trữ' : 'Chưa có thức ăn nào được ghi nhận'}</p>
      ) : (
        <div className="space-y-2">
          {visible.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-[#33333310] p-3 flex items-start gap-3">
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border flex-shrink-0 mt-0.5 ${FOOD_TYPES[item.type]?.cls}`}>
                {FOOD_TYPES[item.type]?.label}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-[#333]">{item.name}</p>
                {item.brand && <p className="text-[10px] text-[#333]/50 font-semibold">{item.brand}</p>}
                <div className="flex flex-wrap gap-2 mt-1">
                  {item.amount_per_day && <span className="text-[10px] text-[#333]/50">{item.amount_per_day}/ngày</span>}
                  {item.feeding_times_per_day && <span className="text-[10px] text-[#333]/50">{item.feeding_times_per_day} bữa/ngày</span>}
                  {item.started_at && <span className="text-[10px] text-[#333]/40">Từ {fmtDate(item.started_at)}</span>}
                </div>
                {item.notes && <p className="text-[10px] text-[#333]/50 mt-1 italic">{item.notes}</p>}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => toggleCurrent(item)} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-[#33333308] cursor-pointer transition-colors" title={item.is_current ? 'Lưu trữ' : 'Đặt là đang dùng'}>
                  <Archive className="w-3 h-3 text-[#333]/30" />
                </button>
                <button onClick={() => remove(item.id)} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-50 cursor-pointer transition-colors">
                  <X className="w-3 h-3 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Medicine section ──────────────────────────────────────────────────────────
function MedicineSection({ catId, userId }: { catId: string; userId: string }) {
  const [items, setItems] = useState<MedicineLog[]>([])
  const [showPast, setShowPast] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    purpose: 'supplement' as NonNullable<MedicineLog['purpose']>,
    name: '', dosage: '',
    frequency: 'daily' as NonNullable<MedicineLog['frequency']>,
    started_at: '', notes: '',
  })

  useEffect(() => {
    supabase.from('medicine_logs').select('*').eq('cat_id', catId)
      .order('is_current', { ascending: false })
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setItems(data) })
  }, [catId])

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    const { data } = await supabase.from('medicine_logs').insert({
      cat_id: catId, owner_id: userId,
      purpose: form.purpose,
      name: form.name.trim(),
      dosage: form.dosage || null,
      frequency: form.frequency,
      started_at: form.started_at || null,
      notes: form.notes || null,
      is_current: true,
    }).select().single()
    if (data) setItems(p => [data, ...p])
    setForm({ purpose: 'supplement', name: '', dosage: '', frequency: 'daily', started_at: '', notes: '' })
    setShowForm(false)
    setSaving(false)
  }

  const toggleCurrent = async (item: MedicineLog) => {
    await supabase.from('medicine_logs').update({ is_current: !item.is_current }).eq('id', item.id)
    setItems(p => p.map(x => x.id === item.id ? { ...x, is_current: !x.is_current } : x))
  }

  const remove = async (id: string) => {
    await supabase.from('medicine_logs').delete().eq('id', id)
    setItems(p => p.filter(x => x.id !== id))
  }

  const visible = items.filter(x => showPast ? !x.is_current : x.is_current)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pill className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-black text-[#333]">Thuốc & Thực phẩm chức năng</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowPast(!showPast)} className={`text-[10px] font-black px-2.5 py-1 rounded-full border cursor-pointer transition-colors ${showPast ? 'bg-[#333] text-white border-[#333]' : 'bg-white border-[#33333320] text-[#333]/50 hover:border-[#333]/30'}`}>
            {showPast ? 'Đang dùng' : 'Lưu trữ'}
          </button>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 text-[11px] font-black text-purple-600 hover:underline cursor-pointer">
            <Plus className="w-3.5 h-3.5" /> Thêm
          </button>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-[#FAF7F2] rounded-2xl border-2 border-purple-100 p-4 space-y-3">
          <div>
            <label className={labelCls}>Phân loại *</label>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(MED_PURPOSES) as NonNullable<MedicineLog['purpose']>[]).map(p => (
                <button key={p} type="button" onClick={() => setForm(prev => ({ ...prev, purpose: p }))}
                  className={`text-[10px] font-black px-2.5 py-1 rounded-full border cursor-pointer transition-all ${form.purpose === p ? 'bg-purple-600 text-white border-purple-600' : 'bg-white border-[#33333320] text-[#333]/60 hover:border-purple-300'}`}>
                  {MED_PURPOSES[p].label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Tên thuốc / sản phẩm *</label>
              <input className={inputCls} placeholder="VD: Milbemax, Frontline..." value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Liều lượng</label>
              <input className={inputCls} placeholder="VD: 1 viên, 0.5ml" value={form.dosage} onChange={e => setForm(p => ({ ...p, dosage: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Tần suất</label>
              <select className={inputCls} value={form.frequency} onChange={e => setForm(p => ({ ...p, frequency: e.target.value as NonNullable<MedicineLog['frequency']> }))}>
                {(Object.entries(MED_FREQ)).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Bắt đầu từ</label>
              <input type="date" className={inputCls} value={form.started_at} onChange={e => setForm(p => ({ ...p, started_at: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Ghi chú (lý do, tác dụng phụ...)</label>
            <input className={inputCls} placeholder="VD: Bác sĩ kê vì ho, tái khám sau 2 tuần" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={() => setShowForm(false)} className="flex-1 py-2 text-xs font-black rounded-xl border-2 border-[#33333320] text-[#333]/50 hover:bg-[#33333308] cursor-pointer transition-colors">Hủy</button>
            <button onClick={handleSave} disabled={!form.name.trim() || saving} className="flex-1 py-2 text-xs font-black rounded-xl bg-purple-600 text-white border-2 border-[#333] shadow-[2px_2px_0px_0px_rgba(51,51,51,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer disabled:opacity-50">
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {visible.length === 0 ? (
        <p className="text-xs text-[#333]/40 text-center py-4 italic">{showPast ? 'Không có mục lưu trữ' : 'Chưa có thuốc nào được ghi nhận'}</p>
      ) : (
        <div className="space-y-2">
          {visible.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-[#33333310] p-3 flex items-start gap-3">
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border flex-shrink-0 mt-0.5 ${item.purpose ? MED_PURPOSES[item.purpose]?.cls : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                {item.purpose ? MED_PURPOSES[item.purpose]?.label : 'Khác'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-[#333]">{item.name}</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {item.dosage && <span className="text-[10px] text-[#333]/50">{item.dosage}</span>}
                  {item.frequency && <span className="text-[10px] text-[#333]/50">· {MED_FREQ[item.frequency]}</span>}
                  {item.started_at && <span className="text-[10px] text-[#333]/40">từ {fmtDate(item.started_at)}</span>}
                </div>
                {item.notes && <p className="text-[10px] text-[#333]/50 mt-1 italic">{item.notes}</p>}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => toggleCurrent(item)} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-[#33333308] cursor-pointer transition-colors" title={item.is_current ? 'Lưu trữ' : 'Đặt là đang dùng'}>
                  <Archive className="w-3 h-3 text-[#333]/30" />
                </button>
                <button onClick={() => remove(item.id)} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-50 cursor-pointer transition-colors">
                  <X className="w-3 h-3 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main tab ──────────────────────────────────────────────────────────────────
export default function NutritionTab({ catId }: { catId: string }) {
  const [userId, setUserId] = useState<string>('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id)
    })
  }, [])

  if (!userId) return null

  return (
    <div className="space-y-6">
      <FoodSection catId={catId} userId={userId} />
      <div className="border-t border-[#33333310]" />
      <MedicineSection catId={catId} userId={userId} />
    </div>
  )
}
