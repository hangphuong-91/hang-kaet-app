import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Cat } from '../lib/types'
import { Plus, PawPrint, ChevronRight, Calendar } from 'lucide-react'

export default function DashboardPage() {
  const [cats, setCats] = useState<Cat[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.from('cats').select('*').order('created_at').then(({ data }) => {
      if (data) setCats(data)
      setLoading(false)
    })
  }, [])

  const getAge = (dob?: string) => {
    if (!dob) return null
    const birth = new Date(dob)
    const now = new Date()
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth()
    if (months < 12) return `${months} tháng tuổi`
    const years = Math.floor(months / 12)
    const rem = months % 12
    return rem > 0 ? `${years} tuổi ${rem} tháng` : `${years} tuổi`
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-brand-teal border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-brand-charcoal">Mèo của tôi</h1>
          <p className="text-xs text-brand-charcoal/50 mt-0.5">{cats.length} thành viên trong gia đình</p>
        </div>
        <button onClick={() => navigate('/cat/new')}
          className="flex items-center gap-1.5 bg-brand-teal text-white text-xs font-black px-4 py-2.5 rounded-2xl border-2 border-brand-charcoal shadow-[3px_3px_0px_0px_rgba(51,51,51,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer">
          <Plus className="w-4 h-4" /> Thêm mèo
        </button>
      </div>

      {/* Cat Grid */}
      {cats.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <div className="w-20 h-20 bg-brand-teal/10 rounded-full flex items-center justify-center mx-auto">
            <PawPrint className="w-10 h-10 text-brand-teal/40" />
          </div>
          <div>
            <p className="font-black text-brand-charcoal/60">Chưa có hồ sơ mèo nào</p>
            <p className="text-xs text-brand-charcoal/40 mt-1">Thêm thành viên đầu tiên của gia đình bạn</p>
          </div>
          <button onClick={() => navigate('/cat/new')}
            className="inline-flex items-center gap-2 bg-brand-teal text-white font-black text-sm px-6 py-3 rounded-2xl cursor-pointer hover:bg-brand-teal-med transition-colors">
            <Plus className="w-4 h-4" /> Thêm mèo đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {cats.map(cat => (
            <button key={cat.id} onClick={() => navigate(`/cat/${cat.id}`)}
              className="bg-white rounded-3xl border-2 border-brand-charcoal/8 p-5 text-left hover:border-brand-teal/30 hover:shadow-[4px_4px_0px_0px_rgba(14,103,107,0.12)] transition-all cursor-pointer group">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-brand-teal/10 flex-shrink-0 border-2 border-brand-charcoal/8">
                  {cat.avatar_url ? (
                    <img src={cat.avatar_url} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PawPrint className="w-7 h-7 text-brand-teal/30" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-black text-brand-charcoal text-base leading-tight">{cat.name}</h3>
                      {cat.nickname && <p className="text-[11px] text-brand-charcoal/50 font-medium">"{cat.nickname}"</p>}
                    </div>
                    <ChevronRight className="w-4 h-4 text-brand-charcoal/30 group-hover:text-brand-teal transition-colors flex-shrink-0 mt-0.5" />
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {cat.breed && (
                      <span className="text-[10px] bg-brand-gold/15 text-brand-charcoal/70 font-bold px-2 py-0.5 rounded-full">{cat.breed}</span>
                    )}
                    {cat.gender && (
                      <span className="text-[10px] bg-brand-teal/10 text-brand-teal font-bold px-2 py-0.5 rounded-full">
                        {cat.gender === 'male' ? '♂ Đực' : cat.gender === 'female' ? '♀ Cái' : '?'}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex gap-3 text-[10px] text-brand-charcoal/50 font-bold">
                    {cat.dob && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {getAge(cat.dob)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
