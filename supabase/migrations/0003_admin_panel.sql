-- ==============================================================================
-- FINDLY — MIGRATION 0003: PANEL ADMIN & MODERASI
-- Salin script ini ke: Supabase Dashboard > SQL Editor > Run
-- ==============================================================================

-- 1. Tambah kolom aktif & alasan_moderasi ke tabel laporan_barang (jika belum ada)
ALTER TABLE public.laporan_barang ADD COLUMN IF NOT EXISTS aktif BOOLEAN DEFAULT TRUE;
ALTER TABLE public.laporan_barang ADD COLUMN IF NOT EXISTS alasan_moderasi TEXT;

-- 2. Kebijakan RLS Khusus Admin

-- Admin dapat melihat semua laporan (termasuk yang dinonaktifkan/disembunyikan)
DROP POLICY IF EXISTS "Admin dapat melihat seluruh laporan" ON public.laporan_barang;
CREATE POLICY "Admin dapat melihat seluruh laporan"
ON public.laporan_barang FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profil_pengguna
        WHERE id = auth.uid() AND tipe_akun = 'admin'
    )
);

-- Admin dapat memperbarui/memoderasi laporan apapun
DROP POLICY IF EXISTS "Admin dapat mengelola seluruh laporan" ON public.laporan_barang;
CREATE POLICY "Admin dapat mengelola seluruh laporan"
ON public.laporan_barang FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.profil_pengguna
        WHERE id = auth.uid() AND tipe_akun = 'admin'
    )
);

-- Admin dapat menghapus laporan bermasalah
DROP POLICY IF EXISTS "Admin dapat menghapus laporan" ON public.laporan_barang;
CREATE POLICY "Admin dapat menghapus laporan"
ON public.laporan_barang FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.profil_pengguna
        WHERE id = auth.uid() AND tipe_akun = 'admin'
    )
);

-- Admin dapat mengelola dan memutus seluruh klaim
DROP POLICY IF EXISTS "Admin dapat mengelola seluruh klaim" ON public.klaim_barang;
CREATE POLICY "Admin dapat mengelola seluruh klaim"
ON public.klaim_barang FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profil_pengguna
        WHERE id = auth.uid() AND tipe_akun = 'admin'
    )
);

-- Admin dapat memperbarui & menghapus profil pengguna
DROP POLICY IF EXISTS "Admin dapat mengelola profil pengguna" ON public.profil_pengguna;
CREATE POLICY "Admin dapat mengelola profil pengguna"
ON public.profil_pengguna FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profil_pengguna
        WHERE id = auth.uid() AND tipe_akun = 'admin'
    )
);

-- Admin dapat melihat seluruh pesan obrolan untuk mediasi sengketa
DROP POLICY IF EXISTS "Admin dapat melihat semua pesan obrolan" ON public.pesan_chat;
CREATE POLICY "Admin dapat melihat semua pesan obrolan"
ON public.pesan_chat FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profil_pengguna
        WHERE id = auth.uid() AND tipe_akun = 'admin'
    )
);
