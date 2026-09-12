import { createClient } from '@/src/lib/supabase/client';
import {
  Smartphone,
  Wallet,
  Shirt,
  Briefcase,
  CreditCard,
  KeyRound,
  BookOpen,
  Package,
  Glasses,
  Watch,
  Headphones,
  Laptop,
  Folder,
  Sparkles,
  Camera,
  Heart,
  Tag,
} from 'lucide-react';

export const ICON_MAP: Record<string, any> = {
  Smartphone,
  Wallet,
  Shirt,
  Briefcase,
  CreditCard,
  KeyRound,
  BookOpen,
  Package,
  Glasses,
  Watch,
  Headphones,
  Laptop,
  Folder,
  Sparkles,
  Camera,
  Heart,
  Tag,
};

export function resolveCategoryIcon(iconName?: string) {
  if (iconName && ICON_MAP[iconName]) {
    return ICON_MAP[iconName];
  }
  return Package;
}

export interface MasterCategory {
  id: string;
  nama: string;
  icon: string;
  deskripsi: string;
  urutan: number;
  aktif: boolean;
  dibuat_pada?: string;
}

export interface MasterCondition {
  id: string;
  nama: string;
  deskripsi: string;
  urutan: number;
  aktif: boolean;
  dibuat_pada?: string;
}

export interface MasterCampusArea {
  id: string;
  nama_lokasi: string;
  kategori_area?: string;
  deskripsi: string;
  urutan: number;
  aktif: boolean;
  dibuat_pada?: string;
}

// ---------------------------------------------------------------------------
// Fallback Datasets (Fail-safe UX)
// ---------------------------------------------------------------------------
export const DEFAULT_MASTER_CATEGORIES: MasterCategory[] = [
  {
    id: 'cat-1',
    nama: 'Elektronik & Gadget',
    icon: 'Smartphone',
    deskripsi: 'Smartphone, Laptop, Tablet, Kamera, Charger, TWS',
    urutan: 1,
    aktif: true,
  },
  {
    id: 'cat-2',
    nama: 'Dompet & Aksesoris',
    icon: 'Wallet',
    deskripsi: 'Dompet, Uang tunai, Jam tangan, Kacamata, Perhiasan',
    urutan: 2,
    aktif: true,
  },
  {
    id: 'cat-3',
    nama: 'Pakaian & Jaket',
    icon: 'Shirt',
    deskripsi: 'Jaket almamater, Hoodie, Kemeja, Sepatu, Topi',
    urutan: 3,
    aktif: true,
  },
  {
    id: 'cat-4',
    nama: 'Tas & Ransel',
    icon: 'Briefcase',
    deskripsi: 'Ransel kuliah, Totebag, Tas laptop, Pouch',
    urutan: 4,
    aktif: true,
  },
  {
    id: 'cat-5',
    nama: 'Dokumen & Kartu',
    icon: 'CreditCard',
    deskripsi: 'KTM, KTP, SIM, STNK, Kartu ATM, Sertifikat',
    urutan: 5,
    aktif: true,
  },
  {
    id: 'cat-6',
    nama: 'Kunci & Kendaraan',
    icon: 'KeyRound',
    deskripsi: 'Kunci motor/mobil, Helm, Remote, Kunci kamar/kos',
    urutan: 6,
    aktif: true,
  },
  {
    id: 'cat-7',
    nama: 'Buku & Alat Tulis',
    icon: 'BookOpen',
    deskripsi: 'Buku kuliah, Catatan, Binder, Modul praktikum',
    urutan: 7,
    aktif: true,
  },
  {
    id: 'cat-8',
    nama: 'Lainnya',
    icon: 'Package',
    deskripsi: 'Barang keperluan lain di luar kategori standar',
    urutan: 8,
    aktif: true,
  },
];

export const DEFAULT_MASTER_CONDITIONS: MasterCondition[] = [
  {
    id: 'cnd-1',
    nama: 'Sangat Baik / Baru',
    deskripsi: 'Kondisi mulus sempurna, tanpa goresan, atau barang baru',
    urutan: 1,
    aktif: true,
  },
  {
    id: 'cnd-2',
    nama: 'Baik (Bekas Pemakaian Normal)',
    deskripsi: 'Berfungsi optimal dengan jejak pemakaian wajar harian',
    urutan: 2,
    aktif: true,
  },
  {
    id: 'cnd-3',
    nama: 'Cukup / Ada Goresan',
    deskripsi: 'Terdapat lecet atau goresan fisik, fungsi utama tetap normal',
    urutan: 3,
    aktif: true,
  },
  {
    id: 'cnd-4',
    nama: 'Rusak Sebagian',
    deskripsi: 'Terdapat bagian yang retak/patah atau fungsi berkurang',
    urutan: 4,
    aktif: true,
  },
];

export const DEFAULT_CAMPUS_AREAS: MasterCampusArea[] = [
  { id: 'ar-1', nama_lokasi: 'Perpustakaan Pusat', kategori_area: 'Fasilitas Umum', deskripsi: 'Gedung perpustakaan utama dan ruang baca', urutan: 1, aktif: true },
  { id: 'ar-2', nama_lokasi: 'Gedung Rektorat', kategori_area: 'Administrasi', deskripsi: 'Lobby utama rektorat dan kantor administrasi kampus', urutan: 2, aktif: true },
  { id: 'ar-3', nama_lokasi: 'Gedung Kuliah Bersama (GKB)', kategori_area: 'Gedung Kuliah', deskripsi: 'Ruang kelas kuliah umum, koridor, dan selasar', urutan: 3, aktif: true },
  { id: 'ar-4', nama_lokasi: 'Fakultas Ilmu Komputer', kategori_area: 'Fakultas', deskripsi: 'Gedung FILKOM, lab komputer, dan ruang dosen', urutan: 4, aktif: true },
  { id: 'ar-5', nama_lokasi: 'Fakultas Teknik', kategori_area: 'Fakultas', deskripsi: 'Bengkel praktikum, laboratorium teknik, dan ruang kelas', urutan: 5, aktif: true },
  { id: 'ar-6', nama_lokasi: 'Fakultas Ekonomi & Bisnis', kategori_area: 'Fakultas', deskripsi: 'Gedung FEB, ruang seminar, dan ruang kelas', urutan: 6, aktif: true },
  { id: 'ar-7', nama_lokasi: 'Kantin Utama', kategori_area: 'Fasilitas Umum', deskripsi: 'Pujasera, warung makan mahasiswa, dan area duduk santai', urutan: 7, aktif: true },
  { id: 'ar-8', nama_lokasi: 'Masjid Kampus', kategori_area: 'Fasilitas Umum', deskripsi: 'Area ibadah, serambi utama, dan area wudhu', urutan: 8, aktif: true },
  { id: 'ar-9', nama_lokasi: 'Parkiran Kendaraan', kategori_area: 'Area Luar', deskripsi: 'Area parkir motor dan mobil mahasiswa/civitas kampus', urutan: 9, aktif: true },
  { id: 'ar-10', nama_lokasi: 'Area Lainnya', kategori_area: 'Lainnya', deskripsi: 'Lokasi lain di lingkungan kampus di luar daftar utama', urutan: 10, aktif: true },
];

export const AVAILABLE_CATEGORY_ICONS = [
  'Smartphone',
  'Wallet',
  'Shirt',
  'Briefcase',
  'CreditCard',
  'KeyRound',
  'BookOpen',
  'Package',
  'Glasses',
  'Watch',
  'Headphones',
  'Laptop',
  'Folder',
  'Sparkles',
  'Camera',
  'Heart',
] as const;

export const AVAILABLE_AREA_CATEGORIES = [
  'Gedung Kuliah',
  'Fakultas',
  'Fasilitas Umum',
  'Administrasi',
  'Area Luar',
  'Lainnya',
] as const;

// ---------------------------------------------------------------------------
// 1. Fetching Functions
// ---------------------------------------------------------------------------

/**
 * Mengambil master kategori barang (aktif saja atau semua untuk admin)
 */
export async function getMasterCategories(includeInactive = false): Promise<MasterCategory[]> {
  try {
    const supabase = createClient();
    let query = supabase
      .from('master_kategori')
      .select('*')
      .order('urutan', { ascending: true })
      .order('dibuat_pada', { ascending: true });

    if (!includeInactive) {
      query = query.eq('aktif', true);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn('Fallback master_kategori ke default:', err);
  }

  return includeInactive
    ? DEFAULT_MASTER_CATEGORIES
    : DEFAULT_MASTER_CATEGORIES.filter((c) => c.aktif);
}

/**
 * Mengambil master kondisi barang
 */
export async function getMasterConditions(includeInactive = false): Promise<MasterCondition[]> {
  try {
    const supabase = createClient();
    let query = supabase
      .from('master_kondisi')
      .select('*')
      .order('urutan', { ascending: true })
      .order('dibuat_pada', { ascending: true });

    if (!includeInactive) {
      query = query.eq('aktif', true);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn('Fallback master_kondisi ke default:', err);
  }

  return includeInactive
    ? DEFAULT_MASTER_CONDITIONS
    : DEFAULT_MASTER_CONDITIONS.filter((c) => c.aktif);
}

/**
 * Mengambil master area kampus (lokasi barang hilang / ditemukan)
 */
export async function getMasterCampusAreas(includeInactive = false): Promise<MasterCampusArea[]> {
  try {
    const supabase = createClient();
    let query = supabase
      .from('master_area_kampus')
      .select('*')
      .order('urutan', { ascending: true })
      .order('dibuat_pada', { ascending: true });

    if (!includeInactive) {
      query = query.eq('aktif', true);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn('Fallback master_area_kampus ke default:', err);
  }

  return includeInactive
    ? DEFAULT_CAMPUS_AREAS
    : DEFAULT_CAMPUS_AREAS.filter((a) => a.aktif);
}

// ---------------------------------------------------------------------------
// 2. Admin CRUD Operations for Categories
// ---------------------------------------------------------------------------

export async function createMasterCategory(payload: {
  nama: string;
  icon?: string;
  deskripsi?: string;
  urutan?: number;
  aktif?: boolean;
}): Promise<{ data: MasterCategory | null; error: any }> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('master_kategori')
      .insert({
        nama: payload.nama.trim(),
        icon: payload.icon || 'Package',
        deskripsi: payload.deskripsi?.trim() || '',
        urutan: payload.urutan ?? 1,
        aktif: payload.aktif ?? true,
      })
      .select()
      .single();

    return { data, error };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

export async function updateMasterCategory(
  id: string,
  payload: Partial<MasterCategory>
): Promise<{ data: MasterCategory | null; error: any }> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('master_kategori')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

export async function deleteMasterCategory(id: string): Promise<{ error: any }> {
  try {
    const supabase = createClient();
    const { error } = await supabase.from('master_kategori').delete().eq('id', id);
    return { error };
  } catch (err: any) {
    return { error: err };
  }
}

// ---------------------------------------------------------------------------
// 3. Admin CRUD Operations for Campus Areas (Lokasi / Gedung Kampus)
// ---------------------------------------------------------------------------

export async function createMasterCampusArea(payload: {
  nama_lokasi: string;
  kategori_area?: string;
  deskripsi?: string;
  urutan?: number;
  aktif?: boolean;
}): Promise<{ data: MasterCampusArea | null; error: any }> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('master_area_kampus')
      .insert({
        nama_lokasi: payload.nama_lokasi.trim(),
        kategori_area: payload.kategori_area || 'Gedung Kuliah',
        deskripsi: payload.deskripsi?.trim() || '',
        urutan: payload.urutan ?? 1,
        aktif: payload.aktif ?? true,
      })
      .select()
      .single();

    return { data, error };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

export async function updateMasterCampusArea(
  id: string,
  payload: Partial<MasterCampusArea>
): Promise<{ data: MasterCampusArea | null; error: any }> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('master_area_kampus')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

export async function deleteMasterCampusArea(id: string): Promise<{ error: any }> {
  try {
    const supabase = createClient();
    const { error } = await supabase.from('master_area_kampus').delete().eq('id', id);
    return { error };
  } catch (err: any) {
    return { error: err };
  }
}

// ---------------------------------------------------------------------------
// 4. Admin CRUD Operations for Conditions
// ---------------------------------------------------------------------------

export async function createMasterCondition(payload: {
  nama: string;
  deskripsi?: string;
  urutan?: number;
  aktif?: boolean;
}): Promise<{ data: MasterCondition | null; error: any }> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('master_kondisi')
      .insert({
        nama: payload.nama.trim(),
        deskripsi: payload.deskripsi?.trim() || '',
        urutan: payload.urutan ?? 1,
        aktif: payload.aktif ?? true,
      })
      .select()
      .single();

    return { data, error };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

export async function updateMasterCondition(
  id: string,
  payload: Partial<MasterCondition>
): Promise<{ data: MasterCondition | null; error: any }> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('master_kondisi')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

export async function deleteMasterCondition(id: string): Promise<{ error: any }> {
  try {
    const supabase = createClient();
    const { error } = await supabase.from('master_kondisi').delete().eq('id', id);
    return { error };
  } catch (err: any) {
    return { error: err };
  }
}
