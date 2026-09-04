-- ==============================================================================
-- FINDLY — SKEMA DATABASE LENGKAP SUPABASE (ONE-CLICK SETUP)
-- Salin seluruh isi script ini ke: Supabase Dashboard > SQL Editor > New Query > Run
-- ==============================================================================

-- 1. Tipe ENUM
DO $$ BEGIN
    CREATE TYPE jenis_laporan_enum AS ENUM ('KEHILANGAN', 'DITEMUKAN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE status_laporan_enum AS ENUM ('MENCARI', 'KLAIM_DIPROSES', 'SELESAI');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE status_klaim_enum AS ENUM ('MENUNGGU', 'DIVERIFIKASI', 'JADWAL_DIBUAT', 'DITOLAK', 'SELESAI');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE status_jadwal_enum AS ENUM ('DIJADWALKAN', 'SELESAI', 'TIDAK_HADIR', 'DIBATALKAN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Tabel Profil Pengguna (Sinkron Otomatis dengan Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profil_pengguna (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nama_lengkap TEXT NOT NULL,
    tipe_akun TEXT DEFAULT 'community', -- 'campus', 'community', 'admin'
    universitas TEXT,
    role_kampus TEXT, -- 'mahasiswa', 'dosen', 'staff'
    nim_nip TEXT,
    no_telepon TEXT,
    avatar_url TEXT,
    status_kampus_terverifikasi BOOLEAN DEFAULT FALSE,
    dibuat_pada TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    diperbarui_pada TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabel Laporan Barang (Lost & Found)
CREATE TABLE IF NOT EXISTS public.laporan_barang (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pelapor_id UUID REFERENCES public.profil_pengguna(id) ON DELETE CASCADE,
    jenis_laporan jenis_laporan_enum NOT NULL,
    nama_barang TEXT NOT NULL,
    deskripsi TEXT,
    foto_url TEXT,
    lokasi_terakhir TEXT,
    ciri_rahasia TEXT, -- Secret attributes: disembunyikan dari publik
    status status_laporan_enum DEFAULT 'MENCARI',
    dibuat_pada TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabel Klaim Barang
CREATE TABLE IF NOT EXISTS public.klaim_barang (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    laporan_id UUID REFERENCES public.laporan_barang(id) ON DELETE CASCADE,
    pengklaim_id UUID REFERENCES public.profil_pengguna(id) ON DELETE CASCADE,
    pesan_verifikasi TEXT,
    status status_klaim_enum DEFAULT 'MENUNGGU',
    dibuat_pada TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabel Titik Kumpul Aman (Safe Meeting Points Kampus)
CREATE TABLE IF NOT EXISTS public.titik_kumpul_aman (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_lokasi TEXT NOT NULL,
    ada_satpam BOOLEAN DEFAULT FALSE,
    ada_cctv BOOLEAN DEFAULT FALSE,
    jam_buka TIME NOT NULL,
    jam_tutup TIME NOT NULL,
    aktif BOOLEAN DEFAULT TRUE,
    dibuat_pada TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabel Jadwal Pengembalian
CREATE TABLE IF NOT EXISTS public.jadwal_pengembalian (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    klaim_id UUID REFERENCES public.klaim_barang(id) ON DELETE CASCADE,
    titik_kumpul_id UUID REFERENCES public.titik_kumpul_aman(id),
    waktu_bertemu TIMESTAMP WITH TIME ZONE NOT NULL,
    kode_pengembalian TEXT NOT NULL, -- Kode verifikasi 4 digit
    status status_jadwal_enum DEFAULT 'DIJADWALKAN',
    dibuat_pada TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Aktifkan Row Level Security (RLS)
ALTER TABLE public.profil_pengguna ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laporan_barang ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.klaim_barang ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.titik_kumpul_aman ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jadwal_pengembalian ENABLE ROW LEVEL SECURITY;

-- 8. Kebijakan Keamanan RLS
-- Profil Pengguna
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profil_pengguna;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profil_pengguna FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profil_pengguna;
CREATE POLICY "Users can insert their own profile" ON public.profil_pengguna FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profil_pengguna;
CREATE POLICY "Users can update their own profile" ON public.profil_pengguna FOR UPDATE USING (auth.uid() = id);

-- Laporan Barang
DROP POLICY IF EXISTS "Laporan dapat dibaca semua orang" ON public.laporan_barang;
CREATE POLICY "Laporan dapat dibaca semua orang" ON public.laporan_barang FOR SELECT USING (true);

DROP POLICY IF EXISTS "Pengguna dapat membuat laporan" ON public.laporan_barang;
CREATE POLICY "Pengguna dapat membuat laporan" ON public.laporan_barang FOR INSERT WITH CHECK (auth.uid() = pelapor_id);

DROP POLICY IF EXISTS "Pelapor dapat mengubah laporannya" ON public.laporan_barang;
CREATE POLICY "Pelapor dapat mengubah laporannya" ON public.laporan_barang FOR UPDATE USING (auth.uid() = pelapor_id);

-- Klaim Barang
DROP POLICY IF EXISTS "Pihak terkait dapat melihat klaim" ON public.klaim_barang;
CREATE POLICY "Pihak terkait dapat melihat klaim" ON public.klaim_barang FOR SELECT USING (
    auth.uid() = pengklaim_id OR 
    auth.uid() IN (SELECT pelapor_id FROM public.laporan_barang WHERE id = laporan_id)
);

DROP POLICY IF EXISTS "Pengguna dapat mengajukan klaim" ON public.klaim_barang;
CREATE POLICY "Pengguna dapat mengajukan klaim" ON public.klaim_barang FOR INSERT WITH CHECK (auth.uid() = pengklaim_id);

-- Titik Kumpul Aman
DROP POLICY IF EXISTS "Titik kumpul dapat dilihat publik" ON public.titik_kumpul_aman;
CREATE POLICY "Titik kumpul dapat dilihat publik" ON public.titik_kumpul_aman FOR SELECT USING (true);

-- 9. Trigger Otomatis: Sinkronkan Auth Users ke Profil Pengguna
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_nama_lengkap TEXT;
    v_tipe_akun TEXT;
    v_universitas TEXT;
    v_role_kampus TEXT;
    v_nim_nip TEXT;
    v_avatar_url TEXT;
    v_terverifikasi BOOLEAN;
BEGIN
    v_nama_lengkap := COALESCE(
        NEW.raw_user_meta_data->>'nama_lengkap',
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1)
    );
    v_tipe_akun := COALESCE(NEW.raw_user_meta_data->>'tipe_akun', 'community');
    v_universitas := NEW.raw_user_meta_data->>'universitas';
    v_role_kampus := NEW.raw_user_meta_data->>'role_kampus';
    v_nim_nip := NEW.raw_user_meta_data->>'nim_nip';
    v_avatar_url := COALESCE(
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'picture'
    );
    v_terverifikasi := CASE 
        WHEN v_tipe_akun = 'campus' AND v_nim_nip IS NOT NULL AND length(trim(v_nim_nip)) > 0 THEN TRUE 
        ELSE FALSE 
    END;

    INSERT INTO public.profil_pengguna (
        id,
        nama_lengkap,
        tipe_akun,
        universitas,
        role_kampus,
        nim_nip,
        avatar_url,
        status_kampus_terverifikasi,
        dibuat_pada,
        diperbarui_pada
    )
    VALUES (
        NEW.id,
        v_nama_lengkap,
        v_tipe_akun,
        v_universitas,
        v_role_kampus,
        v_nim_nip,
        v_avatar_url,
        v_terverifikasi,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        nama_lengkap = EXCLUDED.nama_lengkap,
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.profil_pengguna.avatar_url),
        diperbarui_pada = NOW();

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. Data Awal Titik Kumpul Aman (Seed Data Kampus)
INSERT INTO public.titik_kumpul_aman (nama_lokasi, ada_satpam, ada_cctv, jam_buka, jam_tutup, aktif)
VALUES 
    ('Pos Satpam Gerbang Utama Kampus', TRUE, TRUE, '06:00:00', '22:00:00', TRUE),
    ('Lobi Utama Gedung Rektorat', TRUE, TRUE, '07:30:00', '17:00:00', TRUE),
    ('Area Depan Perpustakaan Pusat', TRUE, TRUE, '08:00:00', '18:00:00', TRUE)
ON CONFLICT DO NOTHING;

-- 11. Konfirmasi email otomatis untuk semua user di auth.users & Masukkan ke profil_pengguna
UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;

INSERT INTO public.profil_pengguna (
    id,
    nama_lengkap,
    tipe_akun,
    universitas,
    role_kampus,
    nim_nip,
    status_kampus_terverifikasi,
    dibuat_pada,
    diperbarui_pada
)
SELECT 
    id,
    COALESCE(raw_user_meta_data->>'nama_lengkap', raw_user_meta_data->>'full_name', split_part(email, '@', 1), 'Civitas Kampus'),
    COALESCE(raw_user_meta_data->>'tipe_akun', 'campus'),
    COALESCE(raw_user_meta_data->>'universitas', 'Universitas Bung Hatta'),
    COALESCE(raw_user_meta_data->>'role_kampus', 'mahasiswa'),
    COALESCE(raw_user_meta_data->>'nim_nip', '21100123'),
    TRUE,
    NOW(),
    NOW()
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 12. Fungsi RPC: Pendaftaran Cepat Bebas Email Rate Limit
CREATE OR REPLACE FUNCTION public.daftar_pengguna_cepat(
    p_email TEXT,
    p_password TEXT,
    p_nama_lengkap TEXT,
    p_tipe_akun TEXT DEFAULT 'campus',
    p_universitas TEXT DEFAULT 'Universitas Bung Hatta',
    p_role_kampus TEXT DEFAULT 'mahasiswa',
    p_nim_nip TEXT DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_user_id UUID := gen_random_uuid();
    v_encrypted_pw TEXT;
BEGIN
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = lower(p_email)) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Email ini sudah terdaftar. Silakan login.');
    END IF;

    v_encrypted_pw := crypt(p_password, gen_salt('bf'));

    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        aud,
        role,
        created_at,
        updated_at
    ) VALUES (
        v_user_id,
        '00000000-0000-0000-0000-000000000000',
        lower(p_email),
        v_encrypted_pw,
        NOW(),
        jsonb_build_object('provider', 'email', 'providers', array['email']),
        jsonb_build_object(
            'nama_lengkap', p_nama_lengkap,
            'tipe_akun', p_tipe_akun,
            'universitas', p_universitas,
            'role_kampus', p_role_kampus,
            'nim_nip', p_nim_nip
        ),
        'authenticated',
        'authenticated',
        NOW(),
        NOW()
    );

    INSERT INTO public.profil_pengguna (
        id,
        nama_lengkap,
        tipe_akun,
        universitas,
        role_kampus,
        nim_nip,
        status_kampus_terverifikasi,
        dibuat_pada,
        diperbarui_pada
    ) VALUES (
        v_user_id,
        p_nama_lengkap,
        p_tipe_akun,
        p_universitas,
        p_role_kampus,
        p_nim_nip,
        (p_tipe_akun = 'campus' AND length(trim(p_nim_nip)) > 0),
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        nama_lengkap = EXCLUDED.nama_lengkap;

    RETURN jsonb_build_object('success', true, 'user_id', v_user_id);
END;
$$;
