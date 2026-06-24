import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { MedicalRecord } from '../../lib/types'
import { Plus, Stethoscope, X } from 'lucide-react'

const TYPES = [
  { value: 'checkup', label: '🏥 Khám định kỳ', color: 'bg-blue-50 border-blue-100 text-blue-700' },
  { value: 'illness', label: '🤒 Bệnh lý', color: 'bg-amber-50 border-amber-100 text-amber-700' },
  { value: 'surgery', label: '🔪 Phẫu thuật', color: 'bg-purple-50 border-purple-100 text-purple-700' },
  { value: 'emergency', label: '🚨 Cấp cứu', color: 'bg-red-50 border-red-100 text-red-700' },
  { value: 'other', label: '📋 Khác', color: 'bg-gray-50 border-gray-100 text-gray-600' },
]

interface Props {
  catId: string
  records: MedicalRecord[]
  setRecords: React.Dispatch<React.SetStateAction<MedicalRecord[]>>
}

export default function MedicalTab({ catId, records, setRecords }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'checkup' as MedicalRecord['type'],
    diagnosis: '', symptoms: '', treatment: '', medication: '',
    clinic: '', vet_name: '', cost: '', follow_up_date: '', note: '',
  })

  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleSave = async () => {
    if (!form.date) return
    setSaving(true)
    const { data, error } = await supabase.from('medical_records').insert({
      cat_id: catId, date: form.date, type: form.type,
      diagnosis: form.diagnosis || null, symptoms: form.symptoms || null,
      treatment: form.treatment || null, medication: form.medication || null,
      clinic: form.clinic || null, vet_name: form.vet_name || null,
      cost: form.cost ? parseFloat(form.cost) : null,
      follow_up_date: form.follow_up_date || null, note: form.note || null,
    }).select().single()
    setSaving(false)
    if (!error && data) {
      setRecords(p => [data, ...p])
      setShowForm(false)
    }
  }

  const inputCls = 'w-full bg-[#FAF7F2] border-2 border-brand-charcoal/10 rounded-xl px-3 py-2.5 text-sm font-semibold text-brand-charcoal placeholder-brand-charcoal/30 focus:outline-none focus:border-brand-teal transition-colors'
  const labelCls = 'block text-[10px] font-black uppercase tracking-wider text-brand-charcoal/50 mb-1'

  const typeConfig = (type: string) => TYPES.find(t => t.value === type) || TYPES[4]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-xs font-black text-brand-charcoal/50">{records.length} lần khám / điều trị</p>
        <button onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 bg-brand-teal text-white text-xs font-black px-3 py-2 rounded-xl cursor-pointer hover:bg-brand-teal-med transition-colors">
          <Plus className="w-3.5 h-3.5" /> Thêm hồ sơ
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-3xl border-2 border-brand-teal/20 p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-sm text-brand-charcoal">Thêm hồ sơ khám/điều trị</h3>
            <button onClick={() => setShowForm(false)} className="cursor-pointer text-brand-charcoal/40 hover:text-brand-pink"><X className="w-4 h-4" /></button>
          </div>

          <div>
            <label className={labelCls}>Loại *</label>
            <div className="flex flex-wrap gap-1.5">
              {TYPES.map(t => (
                <button key={t.value} type="button" onClick={() => set('type', t.value)}
                  className={`text-[10px] font-black px-2.5 py-1 rounded-full border-2 cursor-pointer transition-colors ${form.type === t.value ? 'bg-brand-teal text-white border-brand-teal' : 'bg-[#FAF7F2] border-brand-charcoal/15 text-brand-charcoal/60'}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Ngày *</label>
              <input type="date" className={inputCls} value={form.date} onChange={e => set('date', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Tái khám</label>
              <input type="date" className={inputCls} value={form.follow_up_date} onChange={e => set('follow_up_date', e.target.value)} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Triệu chứng</label>
            <textarea className={`${inputCls} resize-none`} rows={2} placeholder="Mô tả triệu chứng..." value={form.symptoms} onChange={e => set('symptoms', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Chẩn đoán</label>
            <input className={inputCls} placeholder="Bác sĩ chẩn đoán..." value={form.diagnosis} onChange={e => set('diagnosis', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Điều trị / Thuốc</label>
            <textarea className={`${inputCls} resize-none`} rows={2} placeholder="Phác đồ điều trị, thuốc uống..." value={form.treatment} onChange={e => set('treatment', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Phòng khám</label>
              <input className={inputCls} placeholder="Tên phòng khám..." value={form.clinic} onChange={e => set('clinic', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Chi phí (VND)</label>
              <input type="number" className={inputCls} placeholder="VD: 500000" value={form.cost} onChange={e => set('cost', e.target.value)} />
            </div>
          </div>

          <button onClick={handleSave} disabled={saving}
            className="w-full bg-brand-teal text-white font-black text-sm py-3 rounded-2xl cursor-pointer disabled:opacity-40 hover:bg-brand-teal-med transition-colors">
            {saving ? 'Đang lưu...' : 'Lưu hồ sơ'}
          </button>
        </div>
      )}

      {records.length === 0 ? (
        <div className="text-center py-12">
          <Stethoscope className="w-10 h-10 text-brand-charcoal/20 mx-auto mb-3" />
          <p className="text-sm font-black text-brand-charcoal/40">Chưa có hồ sơ bệnh lý</p>
        </div>
      ) : (
        <div className="space-y-2">
          {records.map(r => {
            const cfg = typeConfig(r.type)
            const isExpanded = expanded === r.id
            return (
              <div key={r.id} className={`rounded-2xl border-2 overflow-hidden transition-all ${cfg.color}`}>
                <button className="w-full p-4 text-left cursor-pointer" onClick={() => setExpanded(isExpanded ? null : r.id)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider opacity-70">{cfg.label}</span>
                      <p className="font-black text-sm mt-0.5">{r.diagnosis || r.symptoms || 'Xem chi tiết'}</p>
                      <p className="text-[11px] opacity-70 font-semibold">{new Date(r.date).toLocaleDateString('vi-VN')}{r.clinic && ` · ${r.clinic}`}</p>
                    </div>
                    <span className="text-lg">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-2 border-t border-current/10">
                    {[
                      ['Triệu chứng', r.symptoms],
                      ['Chẩn đoán', r.diagnosis],
                      ['Điều trị', r.treatment],
                      ['Thuốc', r.medication],
                      ['Bác sĩ', r.vet_name],
                      ['Chi phí', r.cost ? `${r.cost.toLocaleString('vi-VN')} đ` : null],
                      ['Tái khám', r.follow_up_date ? new Date(r.follow_up_date).toLocaleDateString('vi-VN') : null],
                      ['Ghi chú', r.note],
                    ].filter(([, v]) => v).map(([k, v]) => (
                      <div key={k as string} className="flex gap-2">
                        <span className="text-[10px] font-black opacity-60 w-20 flex-shrink-0 pt-0.5">{k}</span>
                        <span className="text-xs font-semibold">{v}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
