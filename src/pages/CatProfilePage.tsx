import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Cat, Vaccination, WeightLog, MedicalRecord } from '../lib/types'
import { ArrowLeft, Syringe, Weight, Stethoscope, Heart, AlertCircle, Home } from 'lucide-react'
import VaccinationTab from '../components/cat/VaccinationTab'
import WeightTab from '../components/cat/WeightTab'
import MedicalTab from '../components/cat/MedicalTab'
import MemoriesTab from '../components/cat/MemoriesTab'
import SitterBookingTab from '../components/cat/SitterBookingTab'

type Tab = 'overview' | 'vaccine' | 'weight' | 'medical' | 'memories' | 'sitter'

export default function CatProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [cat, setCat] = useState<Cat | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([])
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([])
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([
      supabase.from('cats').select('*').eq('id', id).single(),
      supabase.from('vaccinations').select('*').eq('cat_id', id).order('vaccinated_at', { ascending: false }),
      supabase.from('weight_logs').select('*').eq('cat_id', id).order('logged_at', { ascending: false }),
      supabase.from('medical_records').select('*').eq('cat_id', id).order('date', { ascending: false }),
    ]).then(([{ data: catData }, { data: vax }, { data: wt }, { data: med }]) => {
      if (catData) setCat(catData)
      if (vax) setVaccinations(vax)
      if (wt) setWeightLogs(wt)
      if (med) setMedicalRecords(med)
      setLoading(false)
    })
  }, [id])

  const getAge = (dob?: string) => {
    if (!dob) return null
    const months = (new Date().getFullYear() - new Date(dob).getFullYear()) * 12 + new Date().getMonth() - new Date(dob).getMonth()
    if (months < 12) return `${months} tháng tuổi`
    return `${Math.floor(months / 12)} tuổi ${months % 12 > 0 ? `${months % 12} tháng` : ''}`
  }

  const overdueVaccines = vaccinations.filter(v => v.next_due && new Date(v.next_due) < new Date())

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-brand-teal border-t-transparent rounded-full animate-spin" /></div>
  if (!cat) return <div className="text-center py-20 text-brand-charcoal/50 font-bold">Không tìm thấy hồ sơ mèo</div>

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'overview', label: 'Tổng quan', icon: <Heart className="w-3.5 h-3.5" /> },
    { id: 'vaccine', label: 'Tiêm chủng', icon: <Syringe className="w-3.5 h-3.5" />, count: overdueVaccines.length },
    { id: 'weight', label: 'Cân nặng', icon: <Weight className="w-3.5 h-3.5" /> },
    { id: 'medical', label: 'Bệnh sử', icon: <Stethoscope className="w-3.5 h-3.5" /> },
    { id: 'memories', label: 'Kỷ niệm', icon: <Heart className="w-3.5 h-3.5" /> },
    { id: 'sitter', label: 'Kæt Sitter', icon: <Home className="w-3.5 h-3.5" /> },
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button onClick={() => navigate('/')} className="w-9 h-9 flex items-center justify-center rounded-xl border-2 border-brand-charcoal/10 hover:border-brand-teal/30 cursor-pointer mt-1 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex-1 flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-brand-teal/10 border-2 border-brand-charcoal/8 flex-shrink-0">
            {cat.avatar_url ? (
              <img src={cat.avatar_url} alt={cat.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">🐱</div>
            )}
          </div>
          <div>
            <h1 className="text-xl font-black text-brand-charcoal">{cat.name}</h1>
            {cat.nickname && <p className="text-xs text-brand-charcoal/50 font-semibold">"{cat.nickname}"</p>}
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {cat.breed && <span className="text-[10px] bg-brand-gold/15 text-brand-charcoal/70 font-bold px-2 py-0.5 rounded-full">{cat.breed}</span>}
              {cat.dob && <span className="text-[10px] bg-brand-teal/10 text-brand-teal font-bold px-2 py-0.5 rounded-full">{getAge(cat.dob)}</span>}
              {cat.gender && <span className="text-[10px] bg-white border border-brand-charcoal/10 text-brand-charcoal/60 font-bold px-2 py-0.5 rounded-full">{cat.gender === 'male' ? '♂ Đực' : cat.gender === 'female' ? '♀ Cái' : '?'}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Overdue vaccine alert */}
      {overdueVaccines.length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-3 flex items-center gap-3" onClick={() => setActiveTab('vaccine')}>
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-xs font-black text-red-600">
            {overdueVaccines.length} mũi tiêm đã quá hạn! Kiểm tra lịch tiêm chủng.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-black whitespace-nowrap cursor-pointer transition-all flex-shrink-0 relative ${
              activeTab === tab.id
                ? 'bg-brand-teal text-white'
                : 'bg-white border-2 border-brand-charcoal/8 text-brand-charcoal/60 hover:border-brand-teal/30'
            }`}>
            {tab.icon} {tab.label}
            {tab.count ? <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">{tab.count}</span> : null}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="bg-white rounded-3xl border-2 border-brand-charcoal/8 p-5 space-y-4">
            <h3 className="font-black text-sm text-brand-charcoal/50 uppercase tracking-wider">Thông tin cơ bản</h3>
            {[
              ['Tên đầy đủ', cat.name],
              ['Tên gọi', cat.nickname],
              ['Giống', cat.breed],
              ['Màu lông', cat.color],
              ['Ngày sinh', cat.dob ? new Date(cat.dob).toLocaleDateString('vi-VN') : null],
              ['Ngày nhận nuôi', cat.adopted_date ? new Date(cat.adopted_date).toLocaleDateString('vi-VN') : null],
              ['Chip định danh', cat.microchip],
            ].filter(([, v]) => v).map(([k, v]) => (
              <div key={k as string} className="flex justify-between items-center py-2 border-b border-brand-charcoal/5 last:border-0">
                <span className="text-xs font-black text-brand-charcoal/50">{k}</span>
                <span className="text-sm font-bold text-brand-charcoal">{v}</span>
              </div>
            ))}
            {cat.notes && (
              <div className="bg-brand-gold/10 rounded-2xl p-3">
                <p className="text-[10px] font-black text-brand-charcoal/50 uppercase tracking-wider mb-1">Ghi chú</p>
                <p className="text-xs text-brand-charcoal font-semibold leading-relaxed">{cat.notes}</p>
              </div>
            )}
          </div>
        )}
        {activeTab === 'vaccine' && <VaccinationTab catId={cat.id} vaccinations={vaccinations} setVaccinations={setVaccinations} />}
        {activeTab === 'weight' && <WeightTab catId={cat.id} weightLogs={weightLogs} setWeightLogs={setWeightLogs} />}
        {activeTab === 'medical' && <MedicalTab catId={cat.id} records={medicalRecords} setRecords={setMedicalRecords} />}
        {activeTab === 'memories' && <MemoriesTab catId={cat.id} />}
        {activeTab === 'sitter' && <SitterBookingTab catId={cat.id} />}
      </div>
    </div>
  )
}
