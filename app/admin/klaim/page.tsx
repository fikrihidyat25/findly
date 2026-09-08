'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileCheck2,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  Loader2,
  RefreshCw,
  X,
  User,
  Package,
} from 'lucide-react';
import { createClient } from '@/src/lib/supabase/client';

interface KlaimItem {
  id: string;
  laporan_id: string;
  nama_barang: string;
  pengklaim_id: string;
  pengklaim_nama: string;
  pengklaim_email: string;
  pelapor_id?: string;
  pelapor_nama?: string;
  pesan_verifikasi: string;
  status: 'MENUNGGU' | 'DIVERIFIKASI' | 'JADWAL_DIBUAT' | 'DITOLAK' | 'SELESAI' | string;
  dibuat_pada: string;
}

export default function AdminKlaimPage() {
  const [klaimList, setKlaimList] = useState<KlaimItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('semua');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function fetchKlaimData() {
    setLoading(true);
    try {
      const supabase = createClient();

      // 1. Fetch claims
      const { data: claims, error: claimErr } = await supabase
        .from('klaim_barang')
        .select('*')
        .order('dibuat_pada', { ascending: false });

      if (claimErr) throw claimErr;

      // 2. Fetch reports for title mapping
      const { data: reports } = await supabase
        .from('laporan_barang')
        .select('id, nama_barang, pelapor_id');

      const reportMap = new Map<string, { nama: string; pelapor_id: string }>();
      reports?.forEach((r) => {
        reportMap.set(r.id, { nama: r.nama_barang, pelapor_id: r.pelapor_id });
      });

      // 3. Fetch user profiles
      const { data: profiles } = await supabase
        .from('profil_pengguna')
        .select('id, nama_lengkap, email');

      const profileMap = new Map<string, { nama: string; email: string }>();
      profiles?.forEach((p) => {
        profileMap.set(p.id, { nama: p.nama_lengkap || 'Pengguna', email: p.email || '' });
      });

      const formatted: KlaimItem[] = (claims || []).map((c) => {
        const rep = reportMap.get(c.laporan_id);
        const pengklaim = profileMap.get(c.pengklaim_id);
        const pelapor = rep?.pelapor_id ? profileMap.get(rep.pelapor_id) : null;

        return {
          id: c.id,
          laporan_id: c.laporan_id,
          nama_barang: rep?.nama || 'Barang Laporan',
          pengklaim_id: c.pengklaim_id,
          pengklaim_nama: pengklaim?.nama || 'Pengklaim',
          pengklaim_email: pengklaim?.email || '',
          pelapor_id: rep?.pelapor_id,
          pelapor_nama: pelapor?.nama || 'Pelapor',
          pesan_verifikasi: c.pesan_verifikasi || 'Tidak ada pesan sertaan.',
          status: c.status || 'MENUNGGU',
          dibuat_pada: c.dibuat_pada,
        };
      });

      setKlaimList(formatted);
    } catch (err: any) {
      console.error('Error loading claims:', err);
      setFeedbackMessage({ type: 'error', text: err.message || 'Gagal memuat data klaim.' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchKlaimData();
  }, []);

  const filteredKlaim = klaimList.filter((k) => {
    const matchSearch =
      k.nama_barang.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.pengklaim_nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.pesan_verifikasi.toLowerCase().includes(searchQuery.toLowerCase());

    const matchStatus = filterStatus === 'semua' || k.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Action: Update Klaim Status
  async function handleUpdateStatus(claim: KlaimItem, newStatus: string) {
    setActionLoading(true);
    try {
      const supabase = createClient();

      const { error: claimErr } = await supabase
        .from('klaim_barang')
        .update({ status: newStatus })
        .eq('id', claim.id);

      if (claimErr) throw claimErr;

      // If status is SELESAI, also update related laporan to SELESAI
      if (newStatus === 'SELESAI' && claim.laporan_id) {
        await supabase
          .from('laporan_barang')
          .update({ status: 'SELESAI' })
          .eq('id', claim.laporan_id);
      }

      setKlaimList((prev) =>
        prev.map((item) => (item.id === claim.id ? { ...item, status: newStatus } : item))
      );

      setFeedbackMessage({
        type: 'success',
        text: `Status klaim untuk barang "${claim.nama_barang}" berhasil diubah menjadi ${newStatus}.`,
      });
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Gagal memperbarui status klaim.' });
    } finally {
      setActionLoading(false);
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
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
      {/* Toast Feedback */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between transition-all border ${feedbackMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
            }`}
        >
          <span>{feedbackMessage.text}</span>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="p-1 hover:opacity-75 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header & Controls */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Kelola Pengajuan Klaim</h2>
            <p className="text-xs text-gray-500">
              Total {filteredKlaim.length} klaim dalam sistem.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchKlaimData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 self-start sm:self-auto"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin text-[#30AFFF]' : ''} />
            <span>Segarkan</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-50">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama barang, pengklaim, atau pesan..."
              className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:border-[#30AFFF] focus:outline-none transition-all"
            />
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:border-[#30AFFF] focus:outline-none transition-all cursor-pointer"
            >
              <option value="semua">Semua Status Klaim</option>
              <option value="MENUNGGU">Menunggu Verifikasi</option>
              <option value="DIVERIFIKASI">Diverifikasi / Disetujui</option>
              <option value="SELESAI">Selesai / Tuntas</option>
              <option value="DITOLAK">Ditolak</option>
            </select>
          </div>
        </div>
      </div>

      {/* Claims List Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <Loader2 size={24} className="animate-spin text-[#30AFFF] mx-auto mb-2" />
            <p className="text-xs text-gray-400">Memuat data pengajuan klaim...</p>
          </div>
        ) : filteredKlaim.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-xs text-gray-400">Belum ada data klaim yang sesuai.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/75 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3">Barang Terkait</th>
                  <th className="px-4 py-3">Pengklaim</th>
                  <th className="px-4 py-3">Pelapor Barang</th>
                  <th className="px-4 py-3">Pesan Verifikasi</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-5 py-3 text-right">Tindakan Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredKlaim.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                    {/* Item Name */}
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-gray-900 block truncate max-w-[150px]">
                        {item.nama_barang}
                      </span>
                    </td>

                    {/* Pengklaim */}
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-gray-900 truncate max-w-[130px]">
                        {item.pengklaim_nama}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate max-w-[130px]">
                        {item.pengklaim_email}
                      </p>
                    </td>

                    {/* Pelapor */}
                    <td className="px-4 py-3.5 text-gray-600 truncate max-w-[120px]">
                      {item.pelapor_nama || 'Anonim'}
                    </td>

                    {/* Pesan Verifikasi */}
                    <td className="px-4 py-3.5">
                      <p className="text-gray-700 truncate max-w-[200px]" title={item.pesan_verifikasi}>
                        {item.pesan_verifikasi}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${item.status === 'SELESAI'
                            ? 'bg-emerald-50 text-emerald-700'
                            : item.status === 'MENUNGGU'
                              ? 'bg-amber-50 text-amber-800'
                              : item.status === 'DITOLAK'
                                ? 'bg-red-50 text-red-700'
                                : 'bg-blue-50 text-[#30AFFF]'
                          }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* Tanggal */}
                    <td className="px-4 py-3.5 text-gray-400 text-[11px] whitespace-nowrap">
                      {formatDate(item.dibuat_pada)}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Go to chat button */}
                        <Link
                          href={`/messages?id=${item.id}`}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                          title="Buka Chat Terkait"
                        >
                          <MessageSquare size={15} />
                        </Link>

                        {/* Approve button */}
                        {item.status !== 'SELESAI' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(item, 'SELESAI')}
                            disabled={actionLoading}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 cursor-pointer transition-colors"
                            title="Selesaikan Klaim (Tuntas)"
                          >
                            <CheckCircle2 size={15} />
                          </button>
                        )}

                        {/* Reject button */}
                        {item.status !== 'DITOLAK' && item.status !== 'SELESAI' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(item, 'DITOLAK')}
                            disabled={actionLoading}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 cursor-pointer transition-colors"
                            title="Tolak Klaim"
                          >
                            <XCircle size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
