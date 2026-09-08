'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/src/components/layout/AppLayout';
import {
  ShieldCheck,
  MapPin,
  Clock,
  Navigation,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  AlertCircle,
  Building,
  Loader2,
  Search,
  Shield,
  Video,
  User,
} from 'lucide-react';
import { createClient } from '@/src/lib/supabase/client';
import LeafletSafeMap from '@/src/components/map/LeafletSafeMap';
import { SafePoint, getSafePoints, DEFAULT_SAFE_POINTS } from '@/src/lib/safePoints';

export default function SafeZonesPage() {
  const [safePoints, setSafePoints] = useState<SafePoint[]>(DEFAULT_SAFE_POINTS);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPointId, setSelectedPointId] = useState<string>('sp-1');

  // Admin CRUD Modal state
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editingPoint, setEditingPoint] = useState<SafePoint | null>(null);
  const [formName, setFormName] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formLat, setFormLat] = useState(-6.36442);
  const [formLng, setFormLng] = useState(106.82861);
  const [formOpen, setFormOpen] = useState('08:00');
  const [formClose, setFormClose] = useState('21:00');
  const [formSatpam, setFormSatpam] = useState(true);
  const [formCctv, setFormCctv] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const points = await getSafePoints();
        setSafePoints(points);
        if (points.length > 0) {
          setSelectedPointId(points[0].id);
        }

        // Check admin role
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from('profil_pengguna')
            .select('tipe_akun, role_kampus')
            .eq('id', user.id)
            .single();

          if (profile?.tipe_akun === 'admin' || profile?.role_kampus === 'admin') {
            setIsAdmin(true);
          }
        }
      } catch (err) {
        console.error('Error initializing safe zones:', err);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  const filteredPoints = safePoints.filter(
    (p) =>
      p.nama_lokasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.alamat_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.deskripsi.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedPoint = safePoints.find((p) => p.id === selectedPointId) || safePoints[0];

  const handleOpenAddModal = () => {
    setEditingPoint(null);
    setFormName('');
    setFormAddress('');
    setFormDesc('');
    setFormLat(-6.36442);
    setFormLng(106.82861);
    setFormOpen('08:00');
    setFormClose('21:00');
    setFormSatpam(true);
    setFormCctv(true);
    setFormError(null);
    setShowAdminModal(true);
  };

  const handleOpenEditModal = (point: SafePoint) => {
    setEditingPoint(point);
    setFormName(point.nama_lokasi);
    setFormAddress(point.alamat_lengkap);
    setFormDesc(point.deskripsi);
    setFormLat(point.latitude);
    setFormLng(point.longitude);
    setFormOpen(point.jam_buka);
    setFormClose(point.jam_tutup);
    setFormSatpam(point.ada_satpam);
    setFormCctv(point.ada_cctv);
    setFormError(null);
    setShowAdminModal(true);
  };

  const handleSaveSafePoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Nama lokasi wajib diisi.');
      return;
    }
    if (!formAddress.trim()) {
      setFormError('Alamat lengkap lokasi wajib diisi.');
      return;
    }

    setIsSaving(true);
    setFormError(null);

    const payload = {
      nama_lokasi: formName.trim(),
      alamat_lengkap: formAddress.trim(),
      deskripsi: formDesc.trim() || 'Titik temu resmi kampus.',
      latitude: formLat,
      longitude: formLng,
      jam_buka: formOpen,
      jam_tutup: formClose,
      ada_satpam: formSatpam,
      ada_cctv: formCctv,
      aktif: true,
      kampus: 'Universitas Indonesia',
    };

    try {
      const supabase = createClient();

      if (editingPoint) {
        // Update
        const { error } = await supabase
          .from('titik_kumpul_aman')
          .update(payload)
          .eq('id', editingPoint.id);

        if (error) {
          console.warn('Database update fallback to local:', error.message);
        }

        setSafePoints((prev) =>
          prev.map((p) => (p.id === editingPoint.id ? { ...p, ...payload } : p))
        );
      } else {
        // Create new
        const { data, error } = await supabase
          .from('titik_kumpul_aman')
          .insert(payload)
          .select()
          .single();

        const newId = data?.id || `sp-${Date.now()}`;
        const newPoint: SafePoint = {
          id: newId,
          ...payload,
        };

        setSafePoints((prev) => [...prev, newPoint]);
        setSelectedPointId(newId);
      }

      setShowAdminModal(false);
    } catch (err: any) {
      setFormError(err.message || 'Gagal menyimpan titik temu.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePoint = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus titik temu "${name}"?`)) return;

    try {
      const supabase = createClient();
      await supabase.from('titik_kumpul_aman').delete().eq('id', id);

      setSafePoints((prev) => prev.filter((p) => p.id !== id));
      if (selectedPointId === id && safePoints.length > 1) {
        const next = safePoints.find((p) => p.id !== id);
        if (next) setSelectedPointId(next.id);
      }
    } catch (err) {
      console.error('Error deleting safe point:', err);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-2xs">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Titik Temu Aman
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl leading-relaxed">
              Lokasi serah terima resmi yang dikelola admin kampus.
            </p>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="px-4 py-2.5 rounded-xl bg-[#30AFFF] hover:bg-[#2196E8] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#30AFFF]/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Plus size={16} />
                <span>Tambah Titik</span>
              </button>
            </div>
          )}
        </div>

        {/* Interactive Map Overview Section */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                <MapPin size={18} className="text-[#30AFFF]" />
                <span>Peta Titik Temu</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Klik pin pada peta atau kartu di bawah untuk melihat detail lokasi.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari lokasi kampus..."
                className="w-full pl-9 pr-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:border-[#30AFFF] focus:outline-none transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Leaflet OSM Component */}
          <div className="pt-2">
            <LeafletSafeMap
              points={filteredPoints}
              selectedPointId={selectedPointId}
              onSelectPoint={(point) => setSelectedPointId(point.id)}
              heightClass="h-[320px] sm:h-[400px]"
            />
          </div>
        </div>

        {/* Safe Points Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPoints.map((point) => {
            const isSelected = point.id === selectedPointId;
            return (
              <div
                key={point.id}
                onClick={() => setSelectedPointId(point.id)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer bg-white shadow-2xs relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#30AFFF] ring-2 ring-[#30AFFF]/20'
                    : 'border-gray-100 hover:border-gray-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-[#30AFFF]/10 text-[#30AFFF]' : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        <ShieldCheck size={18} />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm sm:text-base text-gray-900">
                          {point.nama_lokasi}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                          {point.alamat_lengkap}
                        </p>
                      </div>
                    </div>

                    {/* Admin actions */}
                    {isAdmin && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditModal(point);
                          }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit titik kumpul"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePoint(point.id, point.nama_lokasi);
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus titik kumpul"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-gray-600 mt-3 leading-relaxed">
                    {point.deskripsi}
                  </p>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-3 text-[11px]">
                    {point.ada_satpam && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                        <User size={11} />
                        Satpam
                      </span>
                    )}
                    {point.ada_cctv && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                        <Video size={11} />
                        CCTV
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                      <Clock size={11} />
                      {point.jam_buka}–{point.jam_tutup}
                    </span>
                  </div>
                </div>

                {/* Card Action footer */}
                <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                  <div className="text-[10px] text-gray-400">
                    GPS: {point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}
                  </div>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${point.latitude},${point.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="px-3.5 py-1.5 rounded-xl bg-[#30AFFF] hover:bg-[#2196E8] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                    title="Buka lokasi di Google Maps atau aplikasi navigasi HP"
                  >
                    <Navigation size={13} />
                    <span>Buka di Peta</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Admin Add / Edit Modal */}
        {showAdminModal && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
            onClick={() => setShowAdminModal(false)}
          >
            <div
              className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#30AFFF]/10 text-[#30AFFF] flex items-center justify-center">
                    <Building size={18} />
                  </div>
                  <h3 className="font-bold text-gray-900 text-base">
                    {editingPoint ? 'Edit Titik Temu Aman' : 'Tambah Titik Temu Aman Baru'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveSafePoint} className="p-5 overflow-y-auto space-y-4">
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle size={15} />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-800">
                    Nama Lokasi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Contoh: Pos Satpam Utama Gerbang Barat"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:border-[#30AFFF] outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-800">
                    Alamat Lengkap & Patokan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    placeholder="Contoh: Jl. Prof. Fuad Hassan, depan halte bus kampus"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:border-[#30AFFF] outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-800">
                    Deskripsi Keamanan / Petunjuk Pertemuan
                  </label>
                  <textarea
                    rows={2}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Jelaskan kondisi pengawasan dan instruksi bagi civitas yang bertemu di sini..."
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:border-[#30AFFF] outline-none resize-none"
                  />
                </div>

                {/* Leaflet Pin Picker */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-800">
                    Koordinat (klik peta untuk memindah pin)
                  </label>
                  <LeafletSafeMap
                    lat={formLat}
                    lng={formLng}
                    isPicker={true}
                    onCoordinatesChange={(lat, lng) => {
                      setFormLat(lat);
                      setFormLng(lng);
                    }}
                    heightClass="h-[220px]"
                  />
                  <div className="flex items-center gap-3 text-[11px] text-gray-500 pt-1">
                    <span>Latitude: <strong className="text-gray-800">{formLat}</strong></span>
                    <span>Longitude: <strong className="text-gray-800">{formLng}</strong></span>
                  </div>
                </div>

                {/* Operating Hours */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-800">Jam Buka</label>
                    <input
                      type="time"
                      value={formOpen}
                      onChange={(e) => setFormOpen(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:border-[#30AFFF] outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-800">Jam Tutup</label>
                    <input
                      type="time"
                      value={formClose}
                      onChange={(e) => setFormClose(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:border-[#30AFFF] outline-none"
                    />
                  </div>
                </div>

                {/* Facilities Toggles */}
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-bold text-gray-800">Fasilitas</label>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formSatpam}
                        onChange={(e) => setFormSatpam(e.target.checked)}
                        className="rounded text-[#30AFFF] focus:ring-[#30AFFF]"
                      />
                      <span>Ada Satpam</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formCctv}
                        onChange={(e) => setFormCctv(e.target.checked)}
                        className="rounded text-[#30AFFF] focus:ring-[#30AFFF]"
                      />
                      <span>CCTV</span>
                    </label>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowAdminModal(false)}
                    className="px-4 py-2 border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 bg-[#30AFFF] hover:bg-[#2196E8] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    <span>{editingPoint ? 'Simpan Perubahan' : 'Tambahkan Lokasi'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
