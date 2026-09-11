'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Eye,
  Pencil,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  X,
  Loader2,
  RefreshCw,
  ExternalLink,
  MapPin,
  Calendar,
  User,
  Shield,
  Save
} from 'lucide-react';
import { createClient } from '@/src/lib/supabase/client';

interface LaporanItem {
  id: string;
  nama_barang: string;
  deskripsi: string;
  jenis_laporan: 'KEHILANGAN' | 'DITEMUKAN';
  status: string;
  foto_url: string | null;
  lokasi_terakhir: string | null;
  ciri_rahasia: string | null;
  dibuat_pada: string;
  pelapor_id: string;
  pelapor_nama?: string;
  pelapor_email?: string;
}

export default function AdminLaporanPage() {
  const [laporanList, setLaporanList] = useState<LaporanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterJenis, setFilterJenis] = useState<string>('semua');
  const [filterStatus, setFilterStatus] = useState<string>('semua');

  // Modal Detail
  const [selectedItem, setSelectedItem] = useState<LaporanItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit State
  const [editItem, setEditItem] = useState<LaporanItem | null>(null);
  const [editForm, setEditForm] = useState({
    nama_barang: '',
    deskripsi: '',
    lokasi_terakhir: '',
    ciri_rahasia: ''
  });

  async function fetchLaporan() {
    setLoading(true);
    try {
      const supabase = createClient();

      const { data: laporanData, error: lapErr } = await supabase
        .from('laporan_barang')
        .select('*')
        .order('dibuat_pada', { ascending: false });

      if (lapErr) throw lapErr;

      const { data: profiles } = await supabase
        .from('profil_pengguna')
        .select('id, nama_lengkap, email');

      const profileMap = new Map<string, { nama: string; email: string }>();
      profiles?.forEach((p) => {
        profileMap.set(p.id, { nama: p.nama_lengkap || 'Pengguna', email: p.email || '' });
      });

      const formatted: LaporanItem[] = (laporanData || []).map((item) => {
        const prof = item.pelapor_id ? profileMap.get(item.pelapor_id) : null;
        return {
          ...item,
          pelapor_nama: prof?.nama || 'Anonim',
          pelapor_email: prof?.email || '',
        };
      });

      setLaporanList(formatted);
    } catch (err: any) {
      console.error('Gagal memuat laporan:', err);
      setFeedbackMessage({ type: 'error', text: err.message || 'Gagal memuat data laporan.' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLaporan();
  }, []);

  // Filter logic
  const filteredList = laporanList.filter((item) => {
    const matchSearch =
      item.nama_barang.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.deskripsi && item.deskripsi.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.pelapor_nama && item.pelapor_nama.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.lokasi_terakhir && item.lokasi_terakhir.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchJenis = filterJenis === 'semua' || item.jenis_laporan === filterJenis;
    const matchStatus = filterStatus === 'semua' || item.status === filterStatus;

    return matchSearch && matchJenis && matchStatus;
  });

  // Action: Toggle Status Selesai / Mencari
  async function handleToggleStatus(item: LaporanItem) {
    const nextStatus = item.status === 'SELESAI' ? 'MENCARI' : 'SELESAI';
    setActionLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('laporan_barang')
        .update({ status: nextStatus })
        .eq('id', item.id);

      if (error) throw error;

      setLaporanList((prev) =>
        prev.map((l) => (l.id === item.id ? { ...l, status: nextStatus } : l))
      );
      if (selectedItem?.id === item.id) {
        setSelectedItem({ ...selectedItem, status: nextStatus });
      }

      setFeedbackMessage({
        type: 'success',
        text: `Status laporan "${item.nama_barang}" berhasil diubah menjadi ${nextStatus}.`,
      });
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Gagal memperbarui status.' });
    } finally {
      setActionLoading(false);
    }
  }

  // Edit Action
  const openEditModal = (item: LaporanItem) => {
    setEditItem(item);
    setEditForm({
      nama_barang: item.nama_barang || '',
      deskripsi: item.deskripsi || '',
      lokasi_terakhir: item.lokasi_terakhir || '',
      ciri_rahasia: item.ciri_rahasia || ''
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    setActionLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('laporan_barang')
        .update({
          nama_barang: editForm.nama_barang,
          deskripsi: editForm.deskripsi,
          lokasi_terakhir: editForm.lokasi_terakhir,
          ciri_rahasia: editForm.ciri_rahasia
        })
        .eq('id', editItem.id);

      if (error) throw error;
      setLaporanList((prev) =>
        prev.map((l) => (l.id === editItem.id ? { ...l, ...editForm } : l))
      );
      setFeedbackMessage({ type: 'success', text: 'Laporan berhasil diperbarui.' });
      setEditItem(null);
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Gagal menyimpan perubahan.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Hapus Laporan
  async function handleDeleteLaporan(item: LaporanItem) {
    if (!confirm(`Apakah Anda yakin ingin menghapus laporan "${item.nama_barang}" secara permanen?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('laporan_barang').delete().eq('id', item.id);

      if (error) throw error;

      setLaporanList((prev) => prev.filter((l) => l.id !== item.id));
      if (selectedItem?.id === item.id) {
        setSelectedItem(null);
      }

      setFeedbackMessage({
        type: 'success',
        text: `Laporan "${item.nama_barang}" berhasil dihapus dari sistem.`,
      });
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Gagal menghapus laporan.' });
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
      {/* Toast Feedback Notification */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between transition-all border ${
            feedbackMessage.type === 'success'
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

      {/* Control Bar: Search & Filters */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Daftar Laporan</h2>
            <p className="text-xs text-gray-500">
              Total {filteredList.length} laporan ditampilkan.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchLaporan}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 self-start sm:self-auto"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin text-[#30AFFF]' : ''} />
            <span>Segarkan</span>
          </button>
        </div>

        {/* Filter Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 border-t border-gray-50">
          {/* Search Box */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama barang, pelapor..."
              className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:border-[#30AFFF] focus:outline-none transition-all"
            />
          </div>

          {/* Filter Jenis */}
          <div>
            <select
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:border-[#30AFFF] focus:outline-none transition-all cursor-pointer"
            >
              <option value="semua">Semua Jenis Laporan</option>
              <option value="KEHILANGAN">Kehilangan Saja</option>
              <option value="DITEMUKAN">Ditemukan Saja</option>
            </select>
          </div>

          {/* Filter Status */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:border-[#30AFFF] focus:outline-none transition-all cursor-pointer"
            >
              <option value="semua">Semua Status</option>
              <option value="MENCARI">Sedang Mencari</option>
              <option value="SELESAI">Selesai</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <Loader2 size={24} className="animate-spin text-[#30AFFF] mx-auto mb-2" />
            <p className="text-xs text-gray-400">Memuat data laporan...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-xs text-gray-400">Tidak ada laporan yang sesuai dengan kriteria filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/75 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3">Barang</th>
                  <th className="px-4 py-3">Jenis</th>
                  <th className="px-4 py-3">Pelapor</th>
                  <th className="px-4 py-3">Lokasi</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                    {/* Column 1: Barang */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {item.foto_url ? (
                          <img
                            src={item.foto_url}
                            alt={item.nama_barang}
                            className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 shrink-0 text-[10px] font-bold">
                            N/A
                          </div>
                        )}
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => setSelectedItem(item)}
                            className="font-bold text-gray-900 hover:text-[#30AFFF] text-left truncate block max-w-xs cursor-pointer"
                          >
                            {item.nama_barang}
                          </button>
                          <span className="text-[11px] text-gray-400 block truncate max-w-xs mt-0.5">
                            {formatDate(item.dibuat_pada)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Column 2: Jenis */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          item.jenis_laporan === 'KEHILANGAN'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {item.jenis_laporan === 'KEHILANGAN' ? 'Kehilangan' : 'Ditemukan'}
                      </span>
                    </td>

                    {/* Column 3: Pelapor */}
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-gray-900 truncate max-w-[140px]">
                        {item.pelapor_nama}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate max-w-[140px]">
                        {item.pelapor_email}
                      </p>
                    </td>

                    {/* Column 4: Lokasi */}
                    <td className="px-4 py-3.5 text-gray-600 truncate max-w-[130px]">
                      {item.lokasi_terakhir || 'Kampus'}
                    </td>

                    {/* Column 5: Status */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                          item.status === 'SELESAI'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-blue-50 text-[#30AFFF]'
                        }`}
                      >
                        {item.status === 'SELESAI' ? 'Selesai' : 'Mencari'}
                      </span>
                    </td>

                    {/* Column 6: Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedItem(item)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors"
                          title="Lihat Detail Lengkap"
                        >
                          <Eye size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          disabled={actionLoading}
                          className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 cursor-pointer transition-colors"
                          title="Edit Laporan"
                        >
                          <Pencil size={15} />
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item)}
                          disabled={actionLoading}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 cursor-pointer transition-colors"
                          title={item.status === 'SELESAI' ? 'Ubah jadi Mencari' : 'Tandai Selesai'}
                        >
                          <CheckCircle2 size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteLaporan(item)}
                          disabled={actionLoading}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 cursor-pointer transition-colors"
                          title="Hapus Permanen"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal Dialog */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    selectedItem.jenis_laporan === 'KEHILANGAN'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {selectedItem.jenis_laporan}
                </span>
                <h3 className="text-sm font-bold text-gray-900">{selectedItem.nama_barang}</h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Photo preview if available */}
            {selectedItem.foto_url && (
              <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center max-h-56">
                <img
                  src={selectedItem.foto_url}
                  alt={selectedItem.nama_barang}
                  className="max-h-56 w-auto object-contain"
                />
              </div>
            )}

            {/* Information Grid */}
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                  Deskripsi Laporan
                </span>
                <p className="text-gray-800 mt-1 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                  {selectedItem.deskripsi || 'Tidak ada deskripsi rinci.'}
                </p>
              </div>

              {selectedItem.ciri_rahasia && (
                <div>
                  <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">
                    🔒 Ciri Khusus / Rahasia (Hanya Admin & Pelapor)
                  </span>
                  <p className="text-gray-800 mt-1 leading-relaxed bg-amber-50/60 p-3 rounded-xl border border-amber-100 font-mono text-[11px]">
                    {selectedItem.ciri_rahasia}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <span className="text-[11px] font-semibold text-gray-400 block">Pelapor</span>
                  <p className="text-gray-900 font-semibold mt-0.5">{selectedItem.pelapor_nama}</p>
                  <p className="text-[11px] text-gray-500 truncate">{selectedItem.pelapor_email}</p>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-gray-400 block">Lokasi Terakhir</span>
                  <p className="text-gray-900 font-semibold mt-0.5">{selectedItem.lokasi_terakhir || 'Kampus'}</p>
                  <p className="text-[11px] text-gray-500">{formatDate(selectedItem.dibuat_pada)}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons in Modal */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedItem(null);
                  openEditModal(selectedItem);
                }}
                disabled={actionLoading}
                className="px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer border bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 transition-all flex items-center gap-1.5"
              >
                <Pencil size={14} />
                <span>Edit Laporan</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl bg-[#30AFFF] hover:bg-[#2196E8] text-white text-xs font-semibold cursor-pointer transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal Dialog */}
      {editItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900">Edit Laporan</h3>
              <button
                onClick={() => setEditItem(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submitEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Barang</label>
                <input
                  type="text"
                  name="nama_barang"
                  value={editForm.nama_barang}
                  onChange={handleEditChange}
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-[#30AFFF] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  name="deskripsi"
                  value={editForm.deskripsi}
                  onChange={handleEditChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-[#30AFFF] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Lokasi Terakhir</label>
                <input
                  type="text"
                  name="lokasi_terakhir"
                  value={editForm.lokasi_terakhir}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-[#30AFFF] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Ciri Rahasia / Khusus</label>
                <textarea
                  name="ciri_rahasia"
                  value={editForm.ciri_rahasia}
                  onChange={handleEditChange}
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-[#30AFFF] transition-all font-mono"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditItem(null)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-[#30AFFF] text-white rounded-xl text-xs font-semibold hover:bg-[#2196E8] flex items-center gap-1.5 transition-colors disabled:opacity-70 cursor-pointer"
                >
                  {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
