import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { WeightLog } from '../../lib/types'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Plus, Weight, X, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface Props {
  catId: string
  weightLogs: WeightLog[]
  setWeightLogs: React.Dispatch<React.SetStateAction<WeightLog[]>>
}

export default function WeightTab({ catId, weightLogs, setWeightLogs }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ weight_kg: '', logged_at: new Date().toISOString().split('T')[0], note: '' })

  const chartData = [...weightLogs].reverse().map(w => ({
    date: new Date(w.logged_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
    kg: w.weight_kg,
  }))

  const latest = weightLogs[0]
  const prev = weightLogs[1]
  const diff = latest && prev ? latest.weight_kg - prev.weight_kg : null

  const handleSave = async () => {
    if (!form.weight_kg) return
    setSaving(true)
    const { data, error } = await supabase.from('weight_logs').insert({
      cat_id: catId,
      weight_kg: parseFloat(form.weight_kg),
      logged_at: form.logged_at,
      note: form.note || null,
    }).select().single()
    setSaving(false)
    if (!error && data) {
      setWeightLogs(p => [data, ...p])
      setShowForm(false)
      setForm({ weight_kg: '', logged_at: new Date().toISOString().split('T')[0], note: '' })
    }
  }

  const inputCls = 'w-full bg-[#FAF7F2] border-2 border-brand-charcoal/10 rounded-xl px-3 py-2.5 text-sm font-semibold text-brand-charcoal placeholder-brand-charcoal/30 focus:outline-none focus:border-brand-teal transition-colors'
  const labelCls = 'block text-[10px] font-black uppercase tracking-wider text-brand-charcoal/50 mb-1'

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          {latest && (
            <div>
              <p className="text-2xl font-black text-brand-charcoal">{latest.weight_kg} <span className="text-sm font-bold text-brand-charcoal/50">kg</span></p>
              {diff !== null && (
                <p className={`text-xs font-black flex items-center gap-1 ${diff > 0 ? 'text-brand-pink' : diff < 0 ? 'text-brand-teal' : 'text-brand-charcoal/40'}`}>
                  {diff > 0 ? <TrendingUp className="w-3 h-3" /> : diff < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                  {diff > 0 ? '+' : ''}{diff.toFixed(2)} kg so với lần trước
                </p>
              )}
            </div>
          )}
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 bg-brand-teal text-white text-xs font-black px-3 py-2 rounded-xl cursor-pointer hover:bg-brand-teal-med transition-colors">
          <Plus className="w-3.5 h-3.5" /> Ghi cân
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-3xl border-2 border-brand-teal/20 p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-sm text-brand-charcoal">Ghi cân mới</h3>
            <button onClick={() => setShowForm(false)} className="cursor-pointer text-brand-charcoal/40 hover:text-brand-pink"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Cân nặng (kg) *</label>
              <input type="number" step="0.05" min="0" max="20" className={inputCls} placeholder="VD: 3.85" value={form.weight_kg} onChange={e => setForm(p => ({ ...p, weight_kg: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Ngày cân</label>
              <input type="date" className={inputCls} value={form.logged_at} onChange={e => setForm(p => ({ ...p, logged_at: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Ghi chú</label>
            <input className={inputCls} placeholder="VD: Sau khi cai sữa, trước khi tẩy giun..." value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} />
          </div>
          <button onClick={handleSave} disabled={!form.weight_kg || saving}
            className="w-full bg-brand-teal text-white font-black text-sm py-3 rounded-2xl cursor-pointer disabled:opacity-40 hover:bg-brand-teal-med transition-colors">
            {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      )}

      {/* Chart */}
      {chartData.length >= 2 && (
        <div className="bg-white rounded-3xl border-2 border-brand-charcoal/8 p-4">
          <p className="text-[10px] font-black text-brand-charcoal/40 uppercase tracking-wider mb-3">Biểu đồ cân nặng</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#33333310" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fontWeight: 700 }} />
              <YAxis tick={{ fontSize: 10, fontWeight: 700 }} domain={['auto', 'auto']} width={30} />
              <Tooltip formatter={(v) => [`${v} kg`, 'Cân nặng']} contentStyle={{ borderRadius: 12, border: '2px solid #0E676B20', fontSize: 12, fontWeight: 700 }} />
              <Line type="monotone" dataKey="kg" stroke="#0E676B" strokeWidth={2.5} dot={{ fill: '#0E676B', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Log list */}
      {weightLogs.length === 0 ? (
        <div className="text-center py-12">
          <Weight className="w-10 h-10 text-brand-charcoal/20 mx-auto mb-3" />
          <p className="text-sm font-black text-brand-charcoal/40">Chưa có dữ liệu cân nặng</p>
        </div>
      ) : (
        <div className="space-y-2">
          {weightLogs.map((w, i) => (
            <div key={w.id} className="bg-white rounded-2xl border-2 border-brand-charcoal/8 p-4 flex items-center justify-between">
              <div>
                <p className="font-black text-brand-charcoal">{w.weight_kg} kg</p>
                <p className="text-[11px] text-brand-charcoal/50 font-semibold">{new Date(w.logged_at).toLocaleDateString('vi-VN')}</p>
                {w.note && <p className="text-[10px] text-brand-charcoal/40 italic mt-0.5">{w.note}</p>}
              </div>
              {i === 0 && <span className="text-[10px] bg-brand-teal/10 text-brand-teal font-black px-2 py-0.5 rounded-full">Mới nhất</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
