-- ==============================================================================
-- 0004_master_data_pilihan.sql
-- Tabel Master Data Dinamis: Kategori Barang, Area Kampus, & Kondisi Barang
-- Dikelola oleh Administrator Findly
-- ==============================================================================

-- 1. Tabel Master Kategori Barang
CREATE TABLE IF NOT EXISTS public.master_kategori (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama TEXT NOT NULL UNIQUE,
    icon TEXT DEFAULT 'Package',
    deskripsi TEXT,
    urutan INT DEFAULT 0,
    aktif BOOLEAN DEFAULT TRUE,
    dibuat_pada TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabel Master Kondisi Barang
CREATE TABLE IF NOT EXISTS public.master_kondisi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama TEXT NOT NULL UNIQUE,
    deskripsi TEXT,
    urutan INT DEFAULT 0,
    aktif BOOLEAN DEFAULT TRUE,
    dibuat_pada TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabel Master Area & Gedung Kampus (Terpisah dari Titik Temu Aman)
CREATE TABLE IF NOT EXISTS public.master_area_kampus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_lokasi TEXT NOT NULL UNIQUE,
    kategori_area TEXT DEFAULT 'Gedung Kuliah',
    deskripsi TEXT,
    urutan INT DEFAULT 0,
    aktif BOOLEAN DEFAULT TRUE,
    dibuat_pada TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Aktifkan Row Level Security (RLS)
ALTER TABLE public.master_kategori ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_kondisi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_area_kampus ENABLE ROW LEVEL SECURITY;

-- 5. Kebijakan RLS untuk Master Kategori
DROP POLICY IF EXISTS "Master kategori dapat dibaca publik" ON public.master_kategori;
CREATE POLICY "Master kategori dapat dibaca publik" 
    ON public.master_kategori FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Master kategori dapat dikelola pengguna terautentikasi" ON public.master_kategori;
CREATE POLICY "Master kategori dapat dikelola pengguna terautentikasi" 
    ON public.master_kategori FOR ALL 
    USING (auth.uid() IS NOT NULL);

-- 6. Kebijakan RLS untuk Master Kondisi
DROP POLICY IF EXISTS "Master kondisi dapat dibaca publik" ON public.master_kondisi;
CREATE POLICY "Master kondisi dapat dibaca publik" 
    ON public.master_kondisi FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Master kondisi dapat dikelola pengguna terautentikasi" ON public.master_kondisi;
CREATE POLICY "Master kondisi dapat dikelola pengguna terautentikasi" 
    ON public.master_kondisi FOR ALL 
    USING (auth.uid() IS NOT NULL);

-- 7. Kebijakan RLS untuk Master Area Kampus
DROP POLICY IF EXISTS "Master area kampus dapat dibaca publik" ON public.master_area_kampus;
CREATE POLICY "Master area kampus dapat dibaca publik" 
    ON public.master_area_kampus FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Master area kampus dapat dikelola pengguna terautentikasi" ON public.master_area_kampus;
CREATE POLICY "Master area kampus dapat dikelola pengguna terautentikasi" 
    ON public.master_area_kampus FOR ALL 
    USING (auth.uid() IS NOT NULL);

-- 8. Initial Seed Data: Kategori Barang
INSERT INTO public.master_kategori (nama, icon, deskripsi, urutan, aktif)
VALUES
    ('Elektronik & Gadget', 'Smartphone', 'Smartphone, Laptop, Tablet, Kamera, Charger, TWS', 1, true),
    ('Dompet & Aksesoris', 'Wallet', 'Dompet, Uang tunai, Jam tangan, Kacamata, Perhiasan', 2, true),
    ('Pakaian & Jaket', 'Shirt', 'Jaket almamater, Hoodie, Kemeja, Sepatu, Topi', 3, true),
    ('Tas & Ransel', 'Briefcase', 'Ransel kuliah, Totebag, Tas laptop, Pouch', 4, true),
    ('Dokumen & Kartu', 'CreditCard', 'KTM, KTP, SIM, STNK, Kartu ATM, Sertifikat', 5, true),
    ('Kunci & Kendaraan', 'KeyRound', 'Kunci motor/mobil, Helm, Remote, Kunci kamar/kos', 6, true),
    ('Buku & Alat Tulis', 'BookOpen', 'Buku kuliah, Catatan, Binder, Modul praktikum', 7, true),
    ('Lainnya', 'Package', 'Barang keperluan lain di luar kategori standar', 8, true)
ON CONFLICT (nama) DO UPDATE 
SET icon = EXCLUDED.icon, deskripsi = EXCLUDED.deskripsi, urutan = EXCLUDED.urutan;

-- 9. Initial Seed Data: Kondisi Barang
INSERT INTO public.master_kondisi (nama, deskripsi, urutan, aktif)
VALUES
    ('Sangat Baik / Baru', 'Kondisi mulus sempurna, tanpa goresan, atau barang baru', 1, true),
    ('Baik (Bekas Pemakaian Normal)', 'Berfungsi optimal dengan jejak pemakaian wajar harian', 2, true),
    ('Cukup / Ada Goresan', 'Terdapat lecet atau goresan fisik, fungsi utama tetap normal', 3, true),
    ('Rusak Sebagian', 'Terdapat bagian yang retak/patah atau fungsi berkurang', 4, true)
ON CONFLICT (nama) DO UPDATE 
SET deskripsi = EXCLUDED.deskripsi, urutan = EXCLUDED.urutan;

-- 10. Initial Seed Data: Area & Gedung Kampus
INSERT INTO public.master_area_kampus (nama_lokasi, kategori_area, deskripsi, urutan, aktif)
VALUES
    ('Perpustakaan Pusat', 'Fasilitas Umum', 'Gedung perpustakaan utama dan ruang baca lantai 1-3', 1, true),
    ('Gedung Rektorat', 'Administrasi', 'Lobby utama rektorat dan kantor administrasi kampus', 2, true),
    ('Gedung Kuliah Bersama (GKB)', 'Gedung Kuliah', 'Ruang kelas perkuliahan umum, koridor, dan selasar', 3, true),
    ('Fakultas Ilmu Komputer', 'Fakultas', 'Gedung FILKOM, lab komputer, dan ruang dosen', 4, true),
    ('Fakultas Teknik', 'Fakultas', 'Bengkel praktikum, laboratorium teknik, dan ruang kelas', 5, true),
    ('Fakultas Ekonomi & Bisnis', 'Fakultas', 'Gedung FEB, ruang seminar, dan ruang kelas', 6, true),
    ('Kantin Utama', 'Fasilitas Umum', 'Pujasera, warung makan mahasiswa, dan area duduk santai', 7, true),
    ('Masjid Kampus', 'Fasilitas Umum', 'Area ibadah, serambi utama, dan area wudhu', 8, true),
    ('Parkiran Kendaraan', 'Area Luar', 'Area parkir motor dan mobil mahasiswa/civitas kampus', 9, true),
    ('Area Lainnya', 'Lainnya', 'Lokasi lain di lingkungan kampus di luar daftar utama', 10, true)
ON CONFLICT (nama_lokasi) DO UPDATE 
SET kategori_area = EXCLUDED.kategori_area, deskripsi = EXCLUDED.deskripsi, urutan = EXCLUDED.urutan;
