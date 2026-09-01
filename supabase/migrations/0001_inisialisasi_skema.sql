-- Tipe Enum untuk Laporan
CREATE TYPE jenis_laporan_enum AS ENUM ('KEHILANGAN', 'DITEMUKAN');
CREATE TYPE status_laporan_enum AS ENUM ('MENCARI', 'KLAIM_DIPROSES', 'SELESAI');

-- Tipe Enum untuk Klaim
CREATE TYPE status_klaim_enum AS ENUM ('MENUNGGU', 'DIVERIFIKASI', 'JADWAL_DIBUAT', 'DITOLAK', 'SELESAI');

-- Tipe Enum untuk Jadwal Pengembalian
CREATE TYPE status_jadwal_enum AS ENUM ('DIJADWALKAN', 'SELESAI', 'TIDAK_HADIR', 'DIBATALKAN');


-- 1. Tabel Profil Pengguna (Berelasi dengan Supabase Auth)
CREATE TABLE profil_pengguna (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nama_lengkap TEXT NOT NULL,
    no_telepon TEXT,
    avatar_url TEXT,
    status_kampus_terverifikasi BOOLEAN DEFAULT FALSE,
    dibuat_pada TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabel Laporan Barang (Barang hilang atau ditemukan)
CREATE TABLE laporan_barang (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pelapor_id UUID REFERENCES profil_pengguna(id) ON DELETE CASCADE,
    jenis_laporan jenis_laporan_enum NOT NULL,
    nama_barang TEXT NOT NULL,
    deskripsi TEXT,
    foto_url TEXT,
    lokasi_terakhir TEXT,
    status status_laporan_enum DEFAULT 'MENCARI',
    dibuat_pada TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabel Klaim Barang (Permintaan klaim kepemilikan)
CREATE TABLE klaim_barang (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    laporan_id UUID REFERENCES laporan_barang(id) ON DELETE CASCADE,
    pengklaim_id UUID REFERENCES profil_pengguna(id) ON DELETE CASCADE,
    pesan_verifikasi TEXT,
    status status_klaim_enum DEFAULT 'MENUNGGU',
    dibuat_pada TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabel Titik Kumpul Aman (Dikelola oleh Admin Kampus)
CREATE TABLE titik_kumpul_aman (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_lokasi TEXT NOT NULL,
    ada_satpam BOOLEAN DEFAULT FALSE,
    ada_cctv BOOLEAN DEFAULT FALSE,
    jam_buka TIME NOT NULL,
    jam_tutup TIME NOT NULL,
    aktif BOOLEAN DEFAULT TRUE,
    dibuat_pada TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabel Jadwal Pengembalian (Hanya dibuat setelah Klaim DIVERIFIKASI)
CREATE TABLE jadwal_pengembalian (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    klaim_id UUID REFERENCES klaim_barang(id) ON DELETE CASCADE,
    titik_kumpul_id UUID REFERENCES titik_kumpul_aman(id),
    waktu_bertemu TIMESTAMP WITH TIME ZONE NOT NULL,
    kode_pengembalian TEXT NOT NULL, -- Kode rahasia 4 digit (Hanya dilihat oleh Pemilik/Claimant)
    status status_jadwal_enum DEFAULT 'DIJADWALKAN',
    dibuat_pada TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Keamanan RLS (Row Level Security) Standar
ALTER TABLE profil_pengguna ENABLE ROW LEVEL SECURITY;
ALTER TABLE laporan_barang ENABLE ROW LEVEL SECURITY;
ALTER TABLE klaim_barang ENABLE ROW LEVEL SECURITY;
ALTER TABLE titik_kumpul_aman ENABLE ROW LEVEL SECURITY;
ALTER TABLE jadwal_pengembalian ENABLE ROW LEVEL SECURITY;
