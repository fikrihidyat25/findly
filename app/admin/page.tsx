'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  FileCheck2,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { createClient } from '@/src/lib/supabase/client';

interface StatsData {
  totalLaporan: number;
  laporanKehilangan: number;
  laporanDitemukan: number;
  laporanSelesai: number;
  laporanMencari: number;
  totalKlaim: number;
  klaimMenunggu: number;
  klaimSelesai: number;
  totalPengguna: number;
  penggunaKampus: number;
  penggunaTerverifikasi: number;
}

interface RecentLaporan {
  id: string;
  nama_barang: string;
  jenis_laporan: string;
  status: string;
  dibuat_pada: string;
  pelapor_id?: string;
  pelapor_nama?: string;
}

interface RecentKlaim {
  id: string;
  laporan_id: string;
  nama_barang: string;
  status: string;
  pesan_verifikasi: string;
  dibuat_pada: string;
  pengklaim_nama?: string;
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<StatsData>({
    totalLaporan: 0,
    laporanKehilangan: 0,
    laporanDitemukan: 0,
    laporanSelesai: 0,
    laporanMencari: 0,
    totalKlaim: 0,
    klaimMenunggu: 0,
    klaimSelesai: 0,
    totalPengguna: 0,
    penggunaKampus: 0,
    penggunaTerverifikasi: 0,
  });
  const [recentLaporan, setRecentLaporan] = useState<RecentLaporan[]>([]);
  const [recentKlaim, setRecentKlaim] = useState<RecentKlaim[]>([]);

  async function loadDashboardData() {
    try {
      const supabase = createClient();

      // 1. Fetch Laporan
      const { data: laporanData } = await supabase
        .from('laporan_barang')
        .select('id, nama_barang, jenis_laporan, status, dibuat_pada, pelapor_id')
        .order('dibuat_pada', { ascending: false });

      // 2. Fetch Klaim
      const { data: klaimData } = await supabase
        .from('klaim_barang')
        .select('id, laporan_id, status, pesan_verifikasi, dibuat_pada, pengklaim_id')
        .order('dibuat_pada', { ascending: false });

      // 3. Fetch Profil Pengguna
      const { data: penggunaData } = await supabase
        .from('profil_pengguna')
        .select('id, nama_lengkap, tipe_akun, status_kampus_terverifikasi');

      const profilesMap = new Map<string, string>();
      penggunaData?.forEach((p) => {
        profilesMap.set(p.id, p.nama_lengkap || 'Pengguna');
      });

      // Calculate Laporan stats
      const totalLaporan = laporanData?.length || 0;
      const kehilangan = laporanData?.filter((l) => l.jenis_laporan === 'KEHILANGAN').length || 0;
      const ditemukan = laporanData?.filter((l) => l.jenis_laporan === 'DITEMUKAN').length || 0;
      const selesaiLaporan = laporanData?.filter((l) => l.status === 'SELESAI').length || 0;
      const mencariLaporan = laporanData?.filter((l) => l.status === 'MENCARI' || l.status === 'KLAIM_DIPROSES').length || 0;

      // Calculate Klaim stats
      const totalKlaim = klaimData?.length || 0;
      const klaimMenunggu = klaimData?.filter((k) => k.status === 'MENUNGGU').length || 0;
      const klaimSelesai = klaimData?.filter((k) => k.status === 'SELESAI').length || 0;

      // Calculate Pengguna stats
      const totalPengguna = penggunaData?.length || 0;
      const penggunaKampus = penggunaData?.filter((p) => p.tipe_akun === 'campus').length || 0;
      const penggunaTerverifikasi = penggunaData?.filter((p) => p.status_kampus_terverifikasi).length || 0;

      setStats({
        totalLaporan,
        laporanKehilangan: kehilangan,
        laporanDitemukan: ditemukan,
        laporanSelesai: selesaiLaporan,
        laporanMencari: mencariLaporan,
        totalKlaim,
        klaimMenunggu,
        klaimSelesai,
        totalPengguna,
        penggunaKampus,
        penggunaTerverifikasi,
      });

      // Format 5 recent laporan
      const formattedLaporan: RecentLaporan[] = (laporanData?.slice(0, 5) || []).map((item) => ({
        id: item.id,
        nama_barang: item.nama_barang,
        jenis_laporan: item.jenis_laporan,
        status: item.status,
        dibuat_pada: item.dibuat_pada,
        pelapor_id: item.pelapor_id,
        pelapor_nama: item.pelapor_id ? profilesMap.get(item.pelapor_id) || 'Anonim' : 'Anonim',
      }));
      setRecentLaporan(formattedLaporan);

      // Format 5 recent klaim
      const laporanMap = new Map<string, string>();
      laporanData?.forEach((l) => laporanMap.set(l.id, l.nama_barang));

      const formattedKlaim: RecentKlaim[] = (klaimData?.slice(0, 5) || []).map((item) => ({
        id: item.id,
        laporan_id: item.laporan_id,
        nama_barang: laporanMap.get(item.laporan_id) || 'Barang Laporan',
        status: item.status,
        pesan_verifikasi: item.pesan_verifikasi || '',
        dibuat_pada: item.dibuat_pada,
        pengklaim_nama: item.pengklaim_id ? profilesMap.get(item.pengklaim_id) || 'Pengklaim' : 'Pengklaim',
      }));
      setRecentKlaim(formattedKlaim);
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleManualRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">

      {/* Main Metric Cards Grid (Clean, Standard, Non-AI Slop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Laporan */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Total Laporan</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#30AFFF] flex items-center justify-center">
              <FileText size={16} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-gray-900">{stats.totalLaporan}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-500">
            <span>Hilang: <strong className="text-gray-800">{stats.laporanKehilangan}</strong></span>
            <span>Ditemukan: <strong className="text-gray-800">{stats.laporanDitemukan}</strong></span>
          </div>
        </div>

        {/* Card 2: Status Penyelesaian */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Laporan Selesai</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-emerald-600">{stats.laporanSelesai}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-500">
            <span>Dalam Proses: <strong className="text-amber-700">{stats.laporanMencari}</strong></span>
            <span>Tingkat Selesai: <strong className="text-gray-800">
              {stats.totalLaporan > 0 ? Math.round((stats.laporanSelesai / stats.totalLaporan) * 100) : 0}%
            </strong></span>
          </div>
        </div>

        {/* Card 3: Klaim Verifikasi */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Total Klaim</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileCheck2 size={16} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-gray-900">{stats.totalKlaim}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-500">
            <span>Menunggu: <strong className="text-amber-600">{stats.klaimMenunggu}</strong></span>
            <span>Tuntas: <strong className="text-emerald-700">{stats.klaimSelesai}</strong></span>
          </div>
        </div>

        {/* Card 4: Pengguna Civitas */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Pengguna Terdaftar</span>
            <div className="w-8 h-8 rounded-xl bg-gray-50 text-gray-700 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-gray-900">{stats.totalPengguna}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-500">
            <span>Kampus: <strong className="text-gray-800">{stats.penggunaKampus}</strong></span>
            <span>Terverifikasi: <strong className="text-emerald-700">{stats.penggunaTerverifikasi}</strong></span>
          </div>
        </div>
      </div>

      {/* Two-Column Tables Section: Recent Reports & Recent Claims */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Recent Reports */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Laporan Terbaru</h3>
              <p className="text-xs text-gray-500 mt-0.5">5 barang terakhir yang dilaporkan pengguna.</p>
            </div>
            <Link
              href="/admin/laporan"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#30AFFF] hover:text-[#2196E8]"
            >
              <span>Kelola Semua</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="divide-y divide-gray-50">
            {recentLaporan.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">
                Belum ada data laporan barang.
              </div>
            ) : (
              recentLaporan.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between gap-3 hover:bg-gray-50/50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                          item.jenis_laporan === 'KEHILANGAN'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {item.jenis_laporan === 'KEHILANGAN' ? 'Kehilangan' : 'Ditemukan'}
                      </span>
                      <h4 className="text-xs font-semibold text-gray-900 truncate">
                        {item.nama_barang}
                      </h4>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Pelapor: <span className="text-gray-600">{item.pelapor_nama}</span> • {formatDate(item.dibuat_pada)}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                        item.status === 'SELESAI'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-blue-50 text-[#30AFFF]'
                      }`}
                    >
                      {item.status === 'SELESAI' ? 'Selesai' : 'Mencari'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Recent Claims */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Klaim Terkini</h3>
              <p className="text-xs text-gray-500 mt-0.5">5 pengajuan klaim barang terbaru.</p>
            </div>
            <Link
              href="/admin/klaim"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#30AFFF] hover:text-[#2196E8]"
            >
              <span>Kelola Semua</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="divide-y divide-gray-50">
            {recentKlaim.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">
                Belum ada pengajuan klaim aktif.
              </div>
            ) : (
              recentKlaim.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between gap-3 hover:bg-gray-50/50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-semibold text-gray-900 truncate">
                      {item.nama_barang}
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Oleh: <span className="text-gray-600">{item.pengklaim_nama}</span> • {formatDate(item.dibuat_pada)}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                        item.status === 'SELESAI'
                          ? 'bg-gray-100 text-gray-700'
                          : item.status === 'MENUNGGU'
                            ? 'bg-amber-50 text-amber-800'
                            : item.status === 'DITOLAK'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-blue-50 text-[#30AFFF]'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
