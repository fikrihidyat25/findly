'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/src/components/layout/AppLayout';
import {
  FileText,
  MapPin,
  Clock,
  CheckCircle2,
  Search,
  Trash2,
  Eye,
  Loader2,
} from 'lucide-react';
import { createClient } from '@/src/lib/supabase/client';
import { detectCategory, getCategoryIcon } from '@/src/lib/categories';

interface UserReport {
  id: string;
  nama_barang: string;
  jenis_laporan: 'KEHILANGAN' | 'DITEMUKAN';
  kategori: string;
  lokasi_terakhir: string;
  deskripsi: string;
  status: 'MENCARI' | 'SELESAI';
  foto_url: string | null;
  dibuat_pada: string;
}

export default function MyReportsPage() {
  const [reports, setReports] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'KEHILANGAN' | 'DITEMUKAN' | 'SELESAI'>('all');
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchMyReports = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setReports([]);
        return;
      }

      const { data, error } = await supabase
        .from('laporan_barang')
        .select('*')
        .eq('pelapor_id', user.id)
        .order('dibuat_pada', { ascending: false });

      if (error) throw error;

      if (data) {
        setReports(
          data.map((row: any) => {
            const rawPhoto = row.foto_url;
            const validPhoto = rawPhoto && !rawPhoto.startsWith('blob:') ? rawPhoto : null;
            return {
              id: row.id,
              nama_barang: row.nama_barang,
              jenis_laporan: row.jenis_laporan,
              kategori: detectCategory(row),
              lokasi_terakhir: row.lokasi_terakhir || 'Lingkungan Kampus',
              deskripsi: row.deskripsi || '',
              status: row.status === 'SELESAI' ? 'SELESAI' : 'MENCARI',
              foto_url: validPhoto,
              dibuat_pada: row.dibuat_pada,
            };
          })
        );
      }
    } catch (err: any) {
      console.error('Error fetching user reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReports();
  }, []);

  const handleToggleStatus = async (report: UserReport) => {
    const nextStatus = report.status === 'SELESAI' ? 'MENCARI' : 'SELESAI';
    setActionLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('laporan_barang')
        .update({ status: nextStatus })
        .eq('id', report.id);

      if (error) throw error;

      setReports((prev) =>
        prev.map((r) => (r.id === report.id ? { ...r, status: nextStatus } : r))
      );
      setMessage({
        type: 'success',
        text: `Status laporan berhasil diubah menjadi ${nextStatus === 'SELESAI' ? 'Selesai' : 'Mencari'}.`,
      });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal mengubah status laporan.' });
    } finally {
      setActionLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus laporan ini?')) return;
    setActionLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('laporan_barang').delete().eq('id', id);
      if (error) throw error;

      setReports((prev) => prev.filter((r) => r.id !== id));
      setMessage({ type: 'success', text: 'Laporan berhasil dihapus.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal menghapus laporan.' });
    } finally {
      setActionLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.nama_barang.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.lokasi_terakhir.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.deskripsi.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'all') return true;
    if (filterType === 'SELESAI') return r.status === 'SELESAI';
    return r.jenis_laporan === filterType && r.status !== 'SELESAI';
  });

  return (
    <AppLayout searchQuery={searchQuery} onSearchChange={setSearchQuery}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
              <FileText className="text-[#30AFFF]" size={28} />
              <span>Laporan Saya</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Kelola semua riwayat laporan kehilangan dan temuan yang Anda buat.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/lost/new"
              className="px-3.5 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all"
            >
              + Lapor Kehilangan
            </Link>
            <Link
              href="/found/new"
              className="px-3.5 py-2 text-xs font-semibold text-white bg-[#30AFFF] hover:bg-[#2196E8] rounded-xl shadow-2xs transition-all"
            >
              + Lapor Temuan
            </Link>
          </div>
        </div>

        {/* Feedback Alert */}
        {message && (
          <div
            className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between transition-all border ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            <span>{message.text}</span>
          </div>
        )}

        {/* Filter Controls */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari berdasarkan nama barang, deskripsi, lokasi..."
                className="w-full bg-gray-50/70 hover:bg-gray-50 focus:bg-white pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 border border-gray-200 focus:border-[#30AFFF] focus:ring-2 focus:ring-[#30AFFF]/20 focus:outline-none transition-all"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-gray-100/90 p-1 rounded-xl shrink-0 w-full sm:w-auto justify-center">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-white text-gray-900 shadow-2xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Semua ({reports.length})
              </button>
              <button
                onClick={() => setFilterType('KEHILANGAN')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterType === 'KEHILANGAN'
                    ? 'bg-white text-rose-600 shadow-2xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Hilang ({reports.filter((r) => r.jenis_laporan === 'KEHILANGAN' && r.status !== 'SELESAI').length})
              </button>
              <button
                onClick={() => setFilterType('DITEMUKAN')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterType === 'DITEMUKAN'
                    ? 'bg-white text-emerald-600 shadow-2xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Temuan ({reports.filter((r) => r.jenis_laporan === 'DITEMUKAN' && r.status !== 'SELESAI').length})
              </button>
              <button
                onClick={() => setFilterType('SELESAI')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterType === 'SELESAI'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Selesai ({reports.filter((r) => r.status === 'SELESAI').length})
              </button>
            </div>
          </div>
        </div>

        {/* Reports List */}
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 size={32} className="animate-spin text-[#30AFFF] mx-auto mb-3" />
            <p className="text-xs text-gray-400 font-medium">Memuat data laporan Anda...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-2xs space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto text-gray-400">
              <FileText size={28} />
            </div>
            <h3 className="font-bold text-gray-800 text-sm">Tidak ada laporan ditemukan</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
              {searchQuery
                ? 'Tidak ada laporan yang cocok dengan pencarian Anda.'
                : 'Anda belum membuat laporan barang hilang atau barang temuan.'}
            </p>
            <div className="pt-3 flex items-center justify-center gap-2">
              <Link
                href="/lost/new"
                className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-semibold border border-rose-200 transition-all"
              >
                Lapor Kehilangan
              </Link>
              <Link
                href="/found/new"
                className="px-4 py-2 rounded-xl bg-[#30AFFF] hover:bg-[#2196E8] text-white text-xs font-semibold shadow-2xs transition-all"
              >
                Lapor Temuan
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredReports.map((report) => {
              const isLost = report.jenis_laporan === 'KEHILANGAN';
              const isDone = report.status === 'SELESAI';
              const Icon = getCategoryIcon(report.kategori);

              return (
                <div
                  key={report.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                >
                  {/* Visual Header */}
                  <div className="relative w-full h-40 bg-gray-50 border-b border-gray-100 flex items-center justify-center overflow-hidden">
                    {/* Status Badge */}
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${
                          isLost
                            ? 'bg-rose-500 text-white border-rose-600'
                            : 'bg-emerald-500 text-white border-emerald-600'
                        }`}
                      >
                        {isLost ? 'Kehilangan' : 'Ditemukan'}
                      </span>
                      {isDone && (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-600 text-white shadow-2xs">
                          Selesai
                        </span>
                      )}
                    </div>

                    {report.foto_url ? (
                      <img
                        src={report.foto_url}
                        alt={report.nama_barang}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-white shadow-2xs flex items-center justify-center text-gray-400 group-hover:scale-110 transition-transform duration-300">
                        <Icon size={28} className="stroke-[1.75]" />
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                        {report.kategori}
                      </span>
                      <Link href={`/find/${report.id}`}>
                        <h3 className="font-bold text-sm text-gray-900 group-hover:text-[#30AFFF] transition-colors line-clamp-1 mt-0.5 hover:underline decoration-[#30AFFF]">
                          {report.nama_barang}
                        </h3>
                      </Link>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                        {report.deskripsi || 'Tidak ada deskripsi tambahan.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-gray-50 space-y-1.5 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-gray-400 shrink-0" />
                        <span className="truncate">{report.lokasi_terakhir}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                        <Clock size={12} className="shrink-0" />
                        <span>
                          {new Date(report.dibuat_pada).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
                      <Link
                        href={`/find/${report.id}`}
                        className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-3 rounded-xl border border-gray-200 bg-gray-50/70 hover:bg-gray-100 text-gray-700 text-xs font-semibold transition-all"
                      >
                        <Eye size={13} />
                        <span>Lihat</span>
                      </Link>

                      <button
                        onClick={() => handleToggleStatus(report)}
                        disabled={actionLoading}
                        className={`inline-flex items-center justify-center gap-1 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isDone
                            ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                        }`}
                        title={isDone ? 'Ubah jadi Masih Dicari' : 'Tandai Selesai / Ditemukan'}
                      >
                        <CheckCircle2 size={13} />
                        <span>{isDone ? 'Aktifkan' : 'Selesai'}</span>
                      </button>

                      <button
                        onClick={() => handleDelete(report.id)}
                        disabled={actionLoading}
                        className="p-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                        title="Hapus Laporan"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
