export interface Cat {
  id: string
  owner_id: string
  name: string
  nickname?: string
  breed?: string
  gender?: 'male' | 'female' | 'unknown'
  dob?: string
  adopted_date?: string
  avatar_url?: string
  color?: string
  microchip?: string
  notes?: string
  created_at: string
}

export interface WeightLog {
  id: string
  cat_id: string
  weight_kg: number
  logged_at: string
  note?: string
}

export interface Vaccination {
  id: string
  cat_id: string
  vaccine_name: string
  vaccinated_at: string
  next_due?: string
  clinic?: string
  vet_name?: string
  note?: string
  batch_number?: string
}

export interface MedicalRecord {
  id: string
  cat_id: string
  date: string
  type: 'checkup' | 'illness' | 'surgery' | 'emergency' | 'other'
  diagnosis?: string
  symptoms?: string
  treatment?: string
  medication?: string
  clinic?: string
  vet_name?: string
  cost?: number
  follow_up_date?: string
  note?: string
}

export interface Memory {
  id: string
  cat_id: string
  title: string
  date: string
  photo_url?: string
  note?: string
  created_at: string
}

export interface FoodLog {
  id: string
  cat_id: string
  owner_id: string
  type: 'dry' | 'wet' | 'snack' | 'supplement' | 'other'
  brand?: string
  name: string
  amount_per_day?: string
  feeding_times_per_day?: number
  notes?: string
  started_at?: string
  ended_at?: string
  is_current: boolean
  created_at: string
}

export interface MedicineLog {
  id: string
  cat_id: string
  owner_id: string
  name: string
  purpose?: 'deworming' | 'flea' | 'supplement' | 'prescribed' | 'other'
  dosage?: string
  frequency?: 'daily' | 'weekly' | 'monthly' | 'as_needed' | 'once'
  started_at?: string
  ended_at?: string
  is_current: boolean
  notes?: string
  created_at: string
}

export interface Profile {
  id: string
  display_name?: string
  avatar_url?: string
  phone?: string
  address?: string
  emergency_contact?: string
  created_at: string
}

export interface SitterBooking {
  id: string
  user_id: string
  cat_id: string
  start_date: string
  end_date: string
  status: 'pending' | 'confirmed' | 'ongoing' | 'completed' | 'cancelled'
  notes?: string
  admin_notes?: AdminNote[]
  created_at: string
}

export interface AdminNote {
  timestamp: string
  text: string
  photo_urls?: string[]
}
