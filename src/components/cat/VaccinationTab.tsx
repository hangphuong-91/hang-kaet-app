import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Vaccination } from '../../lib/types'
import { Plus, Syringe, CheckCircle, AlertCircle, Clock, X } from 'lucide-react'

const COMMON_VACCINES = ['FVRCP mũi 1', 'FVRCP mũi 2', 'FVRCP mũi 3', 'FVRCP tái chủng', 'Dại', 'FeLV', 'FIV', 'Chlamydia']

interface Props {
  catId: string
  vaccinations: Vaccination[]
  setVaccinations: React.Dispatch<React.SetStateAction<Vaccination[]>>
}

export default function VaccinationTab({ catId, vaccinations, setVaccinations }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ vaccine_name: '', vaccinated_at: '', next_due: '', clinic: '', vet_name: '', batch_number: '', note: '' })

  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }))

  const getStatus = (v: Vaccination) => {
    if (!v.next_due) return 'done'
    const due = new Date(v.next_due)
    const now = new Date()
    const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    if (diff < 0) return 'overdue'
    if (diff <= 30) return 'soon'
    return 'ok'
  }

  const statusConfig = {
    done: { icon: <CheckCircle className="w-4 h-4 text-emerald-500" />, bg: 'bg-emerald-50', border: 'border-emerald-100', label: 'Đã tiêm' },
    ok: { icon: <CheckCircle className="w-4 h-4 text-brand-teal" />, bg: 'bg-brand-teal/5', border: 'border-brand-teal/15', label: 'Đúng hạn' },
    soon: { icon: <Clock className="w-4 h-4 text-amber-500" />, bg: 'bg-amber-50', border: 'border-amber-100', label: 'Sắp đến hạn' },
    overdue: { icon: <AlertCircle className="w-4 h-4 text-red-500" />, bg: 'bg-red-50', border: 'border-red-100', label: 'Quá hạn' },
  }

  const handleSave = async () => {
    if (!form.vaccine_name || !form.vaccinated_at) return
    setSaving(true)
    const { data, error } = await supabase.from('vaccinations').insert({
      cat_id: catId, ...form,
      next_due: form.next_due || null,
      clinic: form.clinic || null,
      vet_name: form.vet_name || null,
      batch_number: form.batch_number || null,
      note: form.note || null,
    }).select().single()
    setSaving(false)
    if (!error && data) {
      setVaccinations(p => [data, ...p])
      setShowForm(false)
      setForm({ vaccine_name: '', vaccinated_at: '', next_due: '', clinic: '', vet_name: '', batch_number: '', note: '' })
    }
  }

  const inputCls = 'w-full bg-[#FAF7F2] border-2 border-brand-charcoal/10 rounded-xl px-3 py-2.5 text-sm font-semibold text-brand-charcoal placeholder-brand-charcoal/30 focus:outline-none focus:border-brand-teal transition-colors'
  const labelCls = 'block text-[10px] font-black uppercase tracking-wider text-brand-charcoal/50 mb-1'

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-xs font-black text-brand-charcoal/50">{vaccinations.length} mũi đã ghi nhận</p>
        <button onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 bg-brand-teal text-white text-xs font-black px-3 py-2 rounded-xl cursor-pointer hover:bg-brand-teal-med transition-colors">
          <Plus className="w-3.5 h-3.5" /> Thêm mũi tiêm
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white rounded-3xl border-2 border-brand-teal/20 p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-sm text-brand-charcoal">Ghi nhận mũi tiêm</h3>
            <button onClick={() => setShowForm(false)} className="cursor-pointer text-brand-charcoal/40 hover:text-brand-pink"><X className="w-4 h-4" /></button>
          </div>

          <div>
            <label className={labelCls}>Loại vaccine *</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_VACCINES.map(v => (
                <button key={v} type="button" onClick={() => set('vaccine_name', v)}
                  className={`text-[10px] font-black px-2.5 py-1 rounded-full border cursor-pointer transition-colors ${form.vaccine_name === v ? 'bg-brand-teal text-white border-brand-teal' : 'bg-[#FAF7F2] border-brand-charcoal/15 text-brand-charcoal/60 hover:border-brand-teal/40'}`}>
                  {v}
                </button>
              ))}
            </div>
            <input className={inputCls} placeholder="Hoặc nhập tên vaccine..." value={form.vaccine_name} onChange={e => set('vaccine_name', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Ngày tiêm *</label>
              <input type="date" className={inputCls} value={form.vaccinated_at} onChange={e => set('vaccinated_at', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Ngày tiêm nhắc</label>
              <input type="date" className={inputCls} value={form.next_due} onChange={e => set('next_due', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Phòng khám</label>
              <input className={inputCls} placeholder="Tên phòng khám..." value={form.clinic} onChange={e => set('clinic', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Bác sĩ</label>
              <input className={inputCls} placeholder="Tên bác sĩ..." value={form.vet_name} onChange={e => set('vet_name', e.target.value)} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Ghi chú</label>
            <input className={inputCls} placeholder="Phản ứng sau tiêm, ghi chú thêm..." value={form.note} onChange={e => set('note', e.target.value)} />
          </div>

          <button onClick={handleSave} disabled={!form.vaccine_name || !form.vaccinated_at || saving}
            className="w-full bg-brand-teal text-white font-black text-sm py-3 rounded-2xl cursor-pointer disabled:opacity-40 hover:bg-brand-teal-med transition-colors">
            {saving ? 'Đang lưu...' : 'Lưu mũi tiêm'}
          </button>
        </div>
      )}

      {/* Timeline */}
      {vaccinations.length === 0 ? (
        <div className="text-center py-12">
          <Syringe className="w-10 h-10 text-brand-charcoal/20 mx-auto mb-3" />
          <p className="text-sm font-black text-brand-charcoal/40">Chưa có lịch tiêm nào</p>
          <p className="text-xs text-brand-charcoal/30 mt-1">Thêm mũi tiêm đầu tiên để theo dõi</p>
        </div>
      ) : (
        <div className="space-y-2">
          {vaccinations.map(v => {
            const status = getStatus(v)
            const cfg = statusConfig[status]
            return (
              <div key={v.id} className={`rounded-2xl border-2 ${cfg.border} ${cfg.bg} p-4`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {cfg.icon}
                    <div>
                      <p className="font-black text-sm text-brand-charcoal">{v.vaccine_name}</p>
                      <p className="text-[11px] text-brand-charcoal/50 font-semibold mt-0.5">
                        Tiêm: {new Date(v.vaccinated_at).toLocaleDateString('vi-VN')}
                        {v.clinic && ` · ${v.clinic}`}
                        {v.vet_name && ` · BS. ${v.vet_name}`}
                      </p>
                      {v.next_due && (
                        <p className={`text-[11px] font-black mt-1 ${status === 'overdue' ? 'text-red-500' : status === 'soon' ? 'text-amber-600' : 'text-brand-teal'}`}>
                          {status === 'overdue' ? '⚠ Quá hạn: ' : '→ Nhắc tiêm: '}
                          {new Date(v.next_due).toLocaleDateString('vi-VN')}
                        </p>
                      )}
                      {v.note && <p className="text-[10px] text-brand-charcoal/40 italic mt-1">{v.note}</p>}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
