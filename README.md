# 🔍 Findly — Campus Lost & Found Platform

Platform Lost & Found modern berbasis komunitas kampus yang mengedepankan **peer-to-peer verification**, privasi data, dan mediasi sengketa terintegrasi.

---

## 📖 Dokumentasi & Acuan Sistem
Seluruh alur bisnis, aturan privasi, peran pengguna (*roles*), dan siklus status (*state machine*) mengacu pada:
👉 **[SYSTEM_FLOW.md](./SYSTEM_FLOW.md)** *(Single Source of Truth)*

---

## 👥 Tipe Pengguna (Roles)
1. **Campus Member:** Civitas akademika (Mahasiswa, Dosen, Staff) dengan verifikasi identitas universitas (`✓ University Verified`).
2. **Community Member:** Pengguna eksternal/umum di sekitar kampus (`Community Member`).
3. **Admin (Mediator):** Bertindak khusus sebagai penengah bila terjadi sengketa klaim (`DISPUTED`).

---

## 🚀 Menjalankan Project Secara Lokal

```bash
# 1. Install dependencies
npm install

# 2. Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.

---

## 🛠️ Tech Stack
- **Framework:** Next.js (App Router, Turbopack)
- **Styling:** Tailwind CSS
- **Database & Auth:** Supabase (`@supabase/ssr`, `@supabase/supabase-js`)
- **Icons:** Lucide React
