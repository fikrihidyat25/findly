import { createClient } from '@/src/lib/supabase/client';

export interface SafePoint {
  id: string;
  nama_lokasi: string;
  deskripsi: string;
  alamat_lengkap: string;
  latitude: number;
  longitude: number;
  jam_buka: string; // e.g. "08:00"
  jam_tutup: string; // e.g. "21:00" or "24 Jam"
  ada_satpam: boolean;
  ada_cctv: boolean;
  aktif: boolean;
  kampus?: string;
}

export const DEFAULT_SAFE_POINTS: SafePoint[] = [
  {
    id: 'sp-1',
    nama_lokasi: 'Pos Satpam Utama Gerbang Barat',
    deskripsi: 'Pos keamanan utama kampus dengan penjagaan personil satpam 24 jam dan pantauan CCTV aktif.',
    alamat_lengkap: 'Jl. Prof. Dr. Fuad Hassan, Gerbang Barat Kampus UI, Depok',
    latitude: -6.36442,
    longitude: 106.82861,
    jam_buka: '00:00',
    jam_tutup: '23:59',
    ada_satpam: true,
    ada_cctv: true,
    aktif: true,
    kampus: 'Universitas Indonesia',
  },
  {
    id: 'sp-2',
    nama_lokasi: 'Lobi Utama Gedung Rektorat (Lantai 1)',
    deskripsi: 'Lobi ber-AC dan terang di depan meja resepsionis pelayanan terpadu civitas kampus.',
    alamat_lengkap: 'Gedung Pusat Administrasi & Rektorat, Kampus UI, Depok',
    latitude: -6.36284,
    longitude: 106.83115,
    jam_buka: '07:30',
    jam_tutup: '17:30',
    ada_satpam: true,
    ada_cctv: true,
    aktif: true,
    kampus: 'Universitas Indonesia',
  },
  {
    id: 'sp-3',
    nama_lokasi: 'Perpustakaan Pusat (The Crystal of Knowledge)',
    deskripsi: 'Titik temu di samping loker penitipan & meja informasi lantai dasar perpustakaan.',
    alamat_lengkap: 'Gedung Perpustakaan Pusat UI, Lingkar Danau Kenanga, Depok',
    latitude: -6.36531,
    longitude: 106.83182,
    jam_buka: '08:00',
    jam_tutup: '20:00',
    ada_satpam: true,
    ada_cctv: true,
    aktif: true,
    kampus: 'Universitas Indonesia',
  },
  {
    id: 'sp-4',
    nama_lokasi: 'Pusat Kegiatan Mahasiswa (Hall Gedung PKM)',
    deskripsi: 'Area terbuka dekat foodcourt mahasiswa, selalu ramai dan terpantau petugas gedung.',
    alamat_lengkap: 'Gedung Pusat Kegiatan Mahasiswa (PKM), Kampus UI, Depok',
    latitude: -6.36705,
    longitude: 106.82954,
    jam_buka: '08:00',
    jam_tutup: '21:00',
    ada_satpam: true,
    ada_cctv: true,
    aktif: true,
    kampus: 'Universitas Indonesia',
  },
];

/**
 * Fetch safe meeting points from Supabase `titik_kumpul_aman`, with fallback to DEFAULT_SAFE_POINTS
 */
export async function getSafePoints(): Promise<SafePoint[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('titik_kumpul_aman')
      .select('*')
      .order('dibuat_pada', { ascending: true });

    if (!error && data && data.length > 0) {
      const uniqueData = [];
      const seen = new Set();
      for (const item of data) {
        if (!seen.has(item.nama_lokasi)) {
          seen.add(item.nama_lokasi);
          uniqueData.push(item);
        }
      }

      return uniqueData.map((item: any) => ({
        id: item.id,
        nama_lokasi: item.nama_lokasi,
        deskripsi: item.deskripsi || 'Titik temu resmi kampus.',
        alamat_lengkap: item.alamat_lengkap || 'Area Kampus',
        latitude: item.latitude ? Number(item.latitude) : -6.36442,
        longitude: item.longitude ? Number(item.longitude) : 106.82861,
        jam_buka: (item.jam_buka || '08:00').slice(0, 5),
        jam_tutup: (item.jam_tutup || '21:00').slice(0, 5),
        ada_satpam: item.ada_satpam ?? true,
        ada_cctv: item.ada_cctv ?? true,
        aktif: item.aktif ?? true,
        kampus: item.kampus || 'Universitas Indonesia',
      }));
    }
  } catch (err) {
    console.warn('Fallback to local safe points:', err);
  }

  return DEFAULT_SAFE_POINTS;
}

/**
 * Helper to generate third-party app URLs for navigation & rides
 */
export function getNavigationLinks(lat: number, lng: number, placeName: string) {
  const encodedName = encodeURIComponent(placeName);
  return {
    googleMaps: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=&travelmode=driving`,
    openStreetMap: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`,
    // Gojek mobile intent + web fallback
    gojekApp: `gojek://gopride?destination_lat=${lat}&destination_lng=${lng}`,
    gojekWeb: `https://www.gojek.com/id-id/`,
    // Maxim app intent + web
    maximApp: `maxim://order?lat=${lat}&lon=${lng}&address=${encodedName}`,
    maximWeb: `https://taximaxim.com/id/id-id/`,
    // Grab mobile intent
    grabApp: `grab://open?screenType=TRANSPORT&dropoff_latitude=${lat}&dropoff_longitude=${lng}&dropoff_name=${encodedName}`,
    grabWeb: `https://www.grab.com/id/transport/`,
    // Waze
    waze: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`,
  };
}
