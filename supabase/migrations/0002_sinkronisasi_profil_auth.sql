-- ==============================================================================
-- 0002: SINKRONISASI OTOMATIS AUTH SUPABASE KE PROFIL PENGGUNA FINDLY
-- ==============================================================================

-- 1. Buat atau sesuaikan Tabel Profil Pengguna
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

-- 2. Pastikan RLS Aktif
ALTER TABLE public.profil_pengguna ENABLE ROW LEVEL SECURITY;

-- 3. Kebijakan Keamanan RLS (Row Level Security)
-- Pengguna publik/terautentikasi dapat membaca profil dasar (nama, universitas, badge)
DROP POLICY IF EXISTS "Profil dapat dilihat oleh semua pengguna terdaftar" ON public.profil_pengguna;
CREATE POLICY "Profil dapat dilihat oleh semua pengguna terdaftar" 
ON public.profil_pengguna 
FOR SELECT 
TO authenticated 
USING (true);

-- Pengguna hanya dapat mengubah profil miliknya sendiri
DROP POLICY IF EXISTS "Pengguna dapat mengupdate profil sendiri" ON public.profil_pengguna;
CREATE POLICY "Pengguna dapat mengupdate profil sendiri" 
ON public.profil_pengguna 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- Izinkan pengguna memasukkan profil miliknya saat pendaftaran
DROP POLICY IF EXISTS "Pengguna dapat menambahkan profil sendiri" ON public.profil_pengguna;
CREATE POLICY "Pengguna dapat menambahkan profil sendiri" 
ON public.profil_pengguna 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- 4. Fungsi & Trigger Otomatis: Saat ada user baru di auth.users, sinkronkan ke profil_pengguna
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
    -- Ekstrak data dari user_metadata
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

-- 5. Pasang Trigger pada auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
