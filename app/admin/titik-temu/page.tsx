'use client';

import { useState, useEffect } from 'react';
import {
  MapPin,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff,
  Save,
} from 'lucide-react';
import { createClient } from '@/src/lib/supabase/client';
import { SafePoint } from '@/src/lib/safePoints';
import dynamic from 'next/dynamic';

// Load map dynamically to prevent SSR issues
const LeafletSafeMap = dynamic(() => import('@/src/components/map/LeafletSafeMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[260px] sm:h-[320px] rounded-2xl bg-gray-100 animate-pulse flex items-center justify-center">
      <span className="text-xs font-semibold text-gray-400">Memuat Peta...</span>
    </div>
  ),
});

export default function AdminTitikTemuPage() {
  const [points, setPoints] = useState<SafePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formData, setFormData] = useState<Partial<SafePoint>>({
    nama_lokasi: '',
    deskripsi: '',
    alamat_lengkap: '',
    latitude: -0.95772,
    longitude: 100.39579,
    jam_buka: '08:00',
    jam_tutup: '21:00',
    ada_satpam: true,
    ada_cctv: true,
    aktif: true,
    kampus: 'UPI YPTK Padang',
  });

  async function fetchPoints() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('titik_kumpul_aman')
        .select('*')
        .order('dibuat_pada', { ascending: false });

      if (error) throw error;
      setPoints(data || []);
    } catch (err: any) {
      console.error('Gagal memuat titik temu:', err);
      setFeedback({ type: 'error', text: 'Gagal memuat data titik temu.' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPoints();
  }, []);

  const filteredPoints = points.filter((p) =>
    p.nama_lokasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.alamat_lengkap && p.alamat_lengkap.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const openCreateModal = () => {
    setFormMode('create');
    setFormData({
      nama_lokasi: '',
      deskripsi: '',
      alamat_lengkap: '',
      latitude: -0.95772,
      longitude: 100.39579,
      jam_buka: '08:00',
      jam_tutup: '21:00',
      ada_satpam: true,
      ada_cctv: true,
      aktif: true,
      kampus: 'UPI YPTK Padang',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (point: SafePoint) => {
    setFormMode('edit');
    setFormData({ ...point });
    setIsModalOpen(true);
  };

  const handleDelete = async (point: SafePoint) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus "${point.nama_lokasi}" secara permanen?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('titik_kumpul_aman').delete().eq('id', point.id);

      if (error) throw error;
      setPoints((prev) => prev.filter((p) => p.id !== point.id));
      setFeedback({ type: 'success', text: `Titik temu "${point.nama_lokasi}" berhasil dihapus.` });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Gagal menghapus data.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleAktif = async (point: SafePoint) => {
    setActionLoading(true);
    try {
      const supabase = createClient();
      const nextState = !point.aktif;
      const { error } = await supabase
        .from('titik_kumpul_aman')
        .update({ aktif: nextState })
        .eq('id', point.id);

      if (error) throw error;
      setPoints((prev) =>
        prev.map((p) => (p.id === point.id ? { ...p, aktif: nextState } : p))
      );
      setFeedback({ type: 'success', text: `Visibilitas diperbarui.` });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Gagal memperbarui visibilitas.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const supabase = createClient();
      const payload = {
        nama_lokasi: formData.nama_lokasi,
        deskripsi: formData.deskripsi,
        alamat_lengkap: formData.alamat_lengkap,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        jam_buka: formData.jam_buka,
        jam_tutup: formData.jam_tutup,
        ada_satpam: formData.ada_satpam,
        ada_cctv: formData.ada_cctv,
        aktif: formData.aktif,
        kampus: formData.kampus,
      };

      if (formMode === 'create') {
        const { data, error } = await supabase.from('titik_kumpul_aman').insert([payload]).select().single();
        if (error) throw error;
        setPoints((prev) => [data as SafePoint, ...prev]);
        setFeedback({ type: 'success', text: 'Titik temu baru berhasil ditambahkan.' });
      } else {
        const { data, error } = await supabase.from('titik_kumpul_aman').update(payload).eq('id', formData.id).select().single();
        if (error) throw error;
        setPoints((prev) => prev.map((p) => (p.id === formData.id ? (data as SafePoint) : p)));
        setFeedback({ type: 'success', text: 'Data titik temu berhasil diperbarui.' });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Gagal menyimpan data.' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Feedback Alert */}
      {feedback && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between border ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="p-1 hover:opacity-75 cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header & Controls */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <MapPin size={18} className="text-[#30AFFF]" />
              Manajemen Titik Temu Aman
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Kelola lokasi resmi untuk serah terima barang temuan.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchPoints}
              disabled={loading}
              className="p-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 transition-all cursor-pointer"
              title="Segarkan"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin text-[#30AFFF]' : ''} />
            </button>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#30AFFF] hover:bg-[#2196E8] text-white text-xs font-semibold transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>Tambah Lokasi</span>
            </button>
          </div>
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama lokasi atau alamat..."
            className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:border-[#30AFFF] focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <Loader2 size={24} className="animate-spin text-[#30AFFF] mx-auto mb-2" />
            <p className="text-xs text-gray-400">Memuat data titik temu...</p>
          </div>
        ) : filteredPoints.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-xs text-gray-400">Belum ada data titik temu.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/75 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3">Nama Lokasi</th>
                  <th className="px-4 py-3">Alamat</th>
                  <th className="px-4 py-3">Fasilitas & Waktu</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredPoints.map((point) => (
                  <tr key={point.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-gray-900">{point.nama_lokasi}</p>
                      <p className="text-[10px] text-gray-400 truncate max-w-[150px] mt-0.5">{point.deskripsi}</p>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 truncate max-w-[180px]">
                      {point.alamat_lengkap}
                    </td>
                    <td className="px-4 py-3.5 text-[10px]">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-gray-700">🕒 {point.jam_buka} - {point.jam_tutup}</span>
                        <div className="flex items-center gap-1.5 text-gray-500">
                          {point.ada_satpam && <span>👮 Satpam</span>}
                          {point.ada_cctv && <span>📷 CCTV</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {point.aktif ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                          <Eye size={11} /> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                          <EyeOff size={11} /> Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleAktif(point)}
                          disabled={actionLoading}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                          title={point.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                        >
                          {point.aktif ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                        <button
                          onClick={() => openEditModal(point)}
                          disabled={actionLoading}
                          className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(point)}
                          disabled={actionLoading}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
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

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-5">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                {formMode === 'create' ? <Plus size={16} /> : <Pencil size={16} />}
                {formMode === 'create' ? 'Tambah Titik Temu Baru' : 'Edit Titik Temu'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submitForm} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Kiri */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Lokasi</label>
                    <input
                      type="text"
                      name="nama_lokasi"
                      value={formData.nama_lokasi}
                      onChange={handleFormChange}
                      required
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-[#30AFFF] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Alamat Lengkap</label>
                    <input
                      type="text"
                      name="alamat_lengkap"
                      value={formData.alamat_lengkap}
                      onChange={handleFormChange}
                      required
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-[#30AFFF] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Deskripsi Tambahan</label>
                    <textarea
                      name="deskripsi"
                      value={formData.deskripsi}
                      onChange={handleFormChange}
                      rows={2}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-[#30AFFF] transition-all"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Jam Buka</label>
                      <input
                        type="time"
                        name="jam_buka"
                        value={formData.jam_buka}
                        onChange={handleFormChange}
                        required
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-[#30AFFF] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Jam Tutup</label>
                      <input
                        type="time"
                        name="jam_tutup"
                        value={formData.jam_tutup}
                        onChange={handleFormChange}
                        required
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-[#30AFFF] transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                      <input type="checkbox" name="ada_satpam" checked={formData.ada_satpam} onChange={handleFormChange} className="rounded border-gray-300" />
                      Ada Satpam
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                      <input type="checkbox" name="ada_cctv" checked={formData.ada_cctv} onChange={handleFormChange} className="rounded border-gray-300" />
                      Ada CCTV
                    </label>
                  </div>
                </div>

                {/* Kanan - Map Picker */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Tentukan Koordinat</label>
                    <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
                      <LeafletSafeMap
                        isPicker={true}
                        lat={formData.latitude}
                        lng={formData.longitude}
                        onCoordinatesChange={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })}
                        heightClass="h-[220px]"
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">Geser pin pada peta untuk menyesuaikan koordinat.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Latitude</label>
                      <input
                        type="number"
                        step="any"
                        name="latitude"
                        value={formData.latitude ?? ''}
                        onChange={handleFormChange}
                        readOnly
                        className="w-full px-2 py-1.5 bg-gray-100 border border-gray-200 rounded-lg text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Longitude</label>
                      <input
                        type="number"
                        step="any"
                        name="longitude"
                        value={formData.longitude ?? ''}
                        onChange={handleFormChange}
                        readOnly
                        className="w-full px-2 py-1.5 bg-gray-100 border border-gray-200 rounded-lg text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-[#30AFFF] text-white rounded-xl text-xs font-semibold hover:bg-[#2196E8] flex items-center gap-1.5 transition-colors disabled:opacity-70 cursor-pointer"
                >
                  {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>{formMode === 'create' ? 'Tambah Data' : 'Simpan Perubahan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
