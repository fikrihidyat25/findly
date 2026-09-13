-- ==============================================================================
-- 0005_konsensus_dua_pihak.sql
-- Penambahan Kolom Persetujuan Dua Pihak (Mutual Dual-Consent Agreement)
-- Pada Tabel klaim_barang
-- ==============================================================================

ALTER TABLE public.klaim_barang 
ADD COLUMN IF NOT EXISTS disetujui_oleh_pelapor BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS disetujui_oleh_pengklaim BOOLEAN DEFAULT FALSE;

-- Update klaim yang sudah berstatus SELESAI agar kedua flag bernilai true
UPDATE public.klaim_barang 
SET disetujui_oleh_pelapor = TRUE, disetujui_oleh_pengklaim = TRUE 
WHERE status = 'SELESAI';
