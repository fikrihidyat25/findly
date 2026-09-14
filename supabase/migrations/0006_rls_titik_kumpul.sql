-- Kebijakan RLS Khusus Admin untuk mengelola titik_kumpul_aman
-- (Pastikan RLS sudah aktif dengan: ALTER TABLE public.titik_kumpul_aman ENABLE ROW LEVEL SECURITY;)

-- 1. Semua pengguna terautentikasi (atau publik) bisa melihat titik kumpul
DROP POLICY IF EXISTS "Semua orang dapat melihat titik kumpul" ON public.titik_kumpul_aman;
CREATE POLICY "Semua orang dapat melihat titik kumpul"
ON public.titik_kumpul_aman FOR SELECT
USING (true);

-- 2. Admin dapat menambah (insert) titik temu
DROP POLICY IF EXISTS "Admin dapat menambah titik temu" ON public.titik_kumpul_aman;
CREATE POLICY "Admin dapat menambah titik temu"
ON public.titik_kumpul_aman FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profil_pengguna
        WHERE id = auth.uid() AND tipe_akun = 'admin'
    )
);

-- 3. Admin dapat mengubah (update) titik temu
DROP POLICY IF EXISTS "Admin dapat mengubah titik temu" ON public.titik_kumpul_aman;
CREATE POLICY "Admin dapat mengubah titik temu"
ON public.titik_kumpul_aman FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.profil_pengguna
        WHERE id = auth.uid() AND tipe_akun = 'admin'
    )
);

-- 4. Admin dapat menghapus (delete) titik temu
DROP POLICY IF EXISTS "Admin dapat menghapus titik temu" ON public.titik_kumpul_aman;
CREATE POLICY "Admin dapat menghapus titik temu"
ON public.titik_kumpul_aman FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.profil_pengguna
        WHERE id = auth.uid() AND tipe_akun = 'admin'
    )
);
