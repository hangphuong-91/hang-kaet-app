# Hang Kæt App

Ứng dụng quản lý hồ sơ sức khỏe mèo cưng — thành viên của hệ sinh thái [hangkaet.net](https://hangkaet.net).

**Live:** https://hang-kaet-app.vercel.app

---

## Stack

| Layer | Công nghệ |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite 8 |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite`, no config file) |
| Routing | React Router v7 |
| Backend/DB | Supabase (PostgreSQL + Auth + Storage) |
| Charting | Recharts |
| Icons | Lucide React |
| Lint | Oxlint |
| Deploy | Vercel (auto-deploy on push to `main`) |

---

## Tính năng

- Đăng ký / đăng nhập (Email + Google OAuth)
- Tạo nhiều hồ sơ mèo với ảnh đại diện upload thực
- Tab **Tổng quan** — thông tin cơ bản (giống, màu lông, ngày sinh, chip)
- Tab **Tiêm chủng** — lịch sử + cảnh báo quá hạn
- Tab **Cân nặng** — biểu đồ theo thời gian
- Tab **Dinh dưỡng** — theo dõi thức ăn, pate, thuốc
- Tab **Bệnh sử** — khám/bệnh/phẫu thuật/cấp cứu
- Tab **Kỷ niệm** — album ảnh qua URL bên ngoài
- Tab **Kæt Sitter** — lịch sử đặt lịch trông mèo + nút đăng ký mới
- T&C đầy đủ theo Nghị định 13/2023/NĐ-CP, bắt buộc tick khi đăng ký

---

## Local Dev

```bash
cd "Hang Claude/.claude/project/hang kaet/hang-kaet-app"
npm install
npm run dev          # localhost:5173
npm run build        # kiểm tra production build
npm run lint         # oxlint
```

Tạo file `.env.local`:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJh...
```

---

## Supabase Setup

### Tables cần tạo

```sql
-- Profiles (tự động tạo qua trigger khi user đăng ký)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  phone text,
  address text,
  emergency_contact text,
  created_at timestamptz DEFAULT now()
);

-- Cats
CREATE TABLE cats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  nickname text, breed text, gender text,
  dob date, adopted_date date,
  color text, microchip text,
  avatar_url text, notes text,
  created_at timestamptz DEFAULT now()
);

-- Vaccinations
CREATE TABLE vaccinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cat_id uuid REFERENCES cats ON DELETE CASCADE NOT NULL,
  vaccine_name text NOT NULL,
  vaccinated_at date NOT NULL,
  next_due date, clinic text, vet_name text,
  note text, batch_number text,
  created_at timestamptz DEFAULT now()
);

-- Weight logs
CREATE TABLE weight_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cat_id uuid REFERENCES cats ON DELETE CASCADE NOT NULL,
  weight_kg numeric(5,2) NOT NULL,
  logged_at date NOT NULL,
  note text,
  created_at timestamptz DEFAULT now()
);

-- Medical records
CREATE TABLE medical_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cat_id uuid REFERENCES cats ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  type text NOT NULL,  -- checkup|illness|surgery|emergency|other
  diagnosis text, symptoms text, treatment text,
  medication text, clinic text, vet_name text,
  cost numeric(12,0), follow_up_date date, note text,
  created_at timestamptz DEFAULT now()
);

-- Memories
CREATE TABLE memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cat_id uuid REFERENCES cats ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  date date NOT NULL,
  photo_url text, note text,
  created_at timestamptz DEFAULT now()
);

-- Food logs
CREATE TABLE food_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cat_id uuid REFERENCES cats ON DELETE CASCADE NOT NULL,
  owner_id uuid REFERENCES auth.users NOT NULL,
  type text NOT NULL,  -- dry|wet|snack|supplement|other
  brand text, name text NOT NULL,
  amount_per_day text, feeding_times_per_day int,
  notes text, started_at date, ended_at date,
  is_current boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Medicine logs
CREATE TABLE medicine_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cat_id uuid REFERENCES cats ON DELETE CASCADE NOT NULL,
  owner_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  purpose text,     -- deworming|flea|supplement|prescribed|other
  dosage text,
  frequency text,   -- daily|weekly|monthly|as_needed|once
  started_at date, ended_at date,
  is_current boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Sitter bookings (admin-managed)
CREATE TABLE sitter_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  cat_id uuid REFERENCES cats ON DELETE CASCADE NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text DEFAULT 'pending',  -- pending|confirmed|ongoing|completed|cancelled
  notes text,
  admin_notes jsonb,  -- [{timestamp, text, photo_urls[]}]
  created_at timestamptz DEFAULT now()
);
```

### Row Level Security (bật trên tất cả tables)

```sql
-- Bật RLS cho tất cả
ALTER TABLE cats ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicine_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sitter_bookings ENABLE ROW LEVEL SECURITY;

-- Cats: owner only
CREATE POLICY "cats_owner" ON cats FOR ALL USING (owner_id = auth.uid());

-- Dữ liệu liên kết qua cat_id: owner của cat mới xem được
CREATE POLICY "vax_owner" ON vaccinations FOR ALL
  USING (cat_id IN (SELECT id FROM cats WHERE owner_id = auth.uid()));
CREATE POLICY "weight_owner" ON weight_logs FOR ALL
  USING (cat_id IN (SELECT id FROM cats WHERE owner_id = auth.uid()));
CREATE POLICY "medical_owner" ON medical_records FOR ALL
  USING (cat_id IN (SELECT id FROM cats WHERE owner_id = auth.uid()));
CREATE POLICY "memories_owner" ON memories FOR ALL
  USING (cat_id IN (SELECT id FROM cats WHERE owner_id = auth.uid()));

-- Food & medicine: dùng owner_id trực tiếp (nhanh hơn)
CREATE POLICY "food_owner" ON food_logs FOR ALL USING (owner_id = auth.uid());
CREATE POLICY "medicine_owner" ON medicine_logs FOR ALL USING (owner_id = auth.uid());

-- Sitter bookings: user xem booking của mình
CREATE POLICY "sitter_user" ON sitter_bookings FOR ALL USING (user_id = auth.uid());
```

### Storage

```sql
-- Bucket: cat-photos (public: ON)
INSERT INTO storage.buckets (id, name, public) VALUES ('cat-photos', 'cat-photos', true);

CREATE POLICY "cat_photos_owner" ON storage.objects
FOR ALL USING (
  bucket_id = 'cat-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## Vercel Deployment

1. Env vars trong Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

2. Git push → Vercel auto-deploy (~2 phút)

3. Supabase Auth → URL Configuration:
   - Site URL: `https://hang-kaet-app.vercel.app`
   - Redirect URLs: `https://hang-kaet-app.vercel.app/**`

---

## Cấu trúc thư mục

```
src/
├── App.tsx                    # Routes + session guard + error boundary
├── main.tsx                   # Entry point
├── lib/
│   ├── supabase.ts            # Supabase client (env vars)
│   └── types.ts               # TypeScript interfaces
├── components/
│   ├── Layout.tsx             # Header (logo + logout)
│   └── cat/
│       ├── VaccinationTab.tsx
│       ├── WeightTab.tsx
│       ├── MedicalTab.tsx
│       ├── NutritionTab.tsx   # Thức ăn + thuốc
│       ├── MemoriesTab.tsx
│       └── SitterBookingTab.tsx
└── pages/
    ├── AuthPage.tsx           # Login/Signup + T&C modal
    ├── DashboardPage.tsx      # Danh sách mèo
    ├── AddCatPage.tsx         # Form thêm mèo + upload ảnh
    └── CatProfilePage.tsx     # Hồ sơ chi tiết + 7 tabs
```

---

## Roadmap

- [ ] Admin view trong CMS hangkaet.net (xem cat profiles theo user)
- [ ] Subdomain `app.hangkaet.net` (CNAME → Vercel)
- [ ] Email nhắc nhở tiêm chủng sắp đến hạn
- [ ] QR code chia sẻ hồ sơ mèo
- [ ] Forum / cộng đồng (Phase 4)
