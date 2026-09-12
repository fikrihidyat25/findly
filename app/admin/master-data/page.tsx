'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Layers,
  MapPin,
  CheckCircle2,
  Plus,
  Pencil,
  Trash2,
  Search,
  RefreshCw,
  Loader2,
  X,
  Save,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Sliders,
  Sparkles,
  Building2,
} from 'lucide-react';
import {
  MasterCategory,
  MasterCondition,
  MasterCampusArea,
  getMasterCategories,
  getMasterConditions,
  getMasterCampusAreas,
  createMasterCategory,
  updateMasterCategory,
  deleteMasterCategory,
  createMasterCondition,
  updateMasterCondition,
  deleteMasterCondition,
  AVAILABLE_CATEGORY_ICONS,
  resolveCategoryIcon,
} from '@/src/lib/masterData';

type ActiveTab = 'kategori' | 'area' | 'kondisi';

export default function AdminMasterDataPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('kategori');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Data states
  const [categories, setCategories] = useState<MasterCategory[]>([]);
  const [conditions, setConditions] = useState<MasterCondition[]>([]);
  const [campusAreas, setCampusAreas] = useState<MasterCampusArea[]>([]);

  // Category Modal State
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryModalMode, setCategoryModalMode] = useState<'create' | 'edit'>('create');
  const [categoryFormData, setCategoryFormData] = useState<Partial<MasterCategory>>({
    nama: '',
    icon: 'Package',
    deskripsi: '',
    urutan: 1,
    aktif: true,
  });

  // Condition Modal State
  const [conditionModalOpen, setConditionModalOpen] = useState(false);
  const [conditionModalMode, setConditionModalMode] = useState<'create' | 'edit'>('create');
  const [conditionFormData, setConditionFormData] = useState<Partial<MasterCondition>>({
    nama: '',
    deskripsi: '',
    urutan: 1,
    aktif: true,
  });

  // Delete Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'kategori' | 'kondisi';
    id: string;
    nama: string;
  } | null>(null);

  const [actionLoading, setActionLoading] = useState(false);

  // Load all master data
  async function loadData() {
    setLoading(true);
    try {
      const [cats, conds, areas] = await Promise.all([
        getMasterCategories(true),
        getMasterConditions(true),
        getMasterCampusAreas(true),
      ]);
      setCategories(cats);
      setConditions(conds);
      setCampusAreas(areas);
    } catch (err: any) {
      console.error('Gagal memuat master data:', err);
      setFeedback({ type: 'error', text: 'Gagal memuat master data dari server.' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const showNotification = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => {
      setFeedback((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  };

  // ---------------------------------------------------------------------------
  // Category Handlers
  // ---------------------------------------------------------------------------
  const openCreateCategory = () => {
    setCategoryModalMode('create');
    setCategoryFormData({
      nama: '',
      icon: 'Package',
      deskripsi: '',
      urutan: categories.length + 1,
      aktif: true,
    });
    setCategoryModalOpen(true);
  };

  const openEditCategory = (item: MasterCategory) => {
    setCategoryModalMode('edit');
    setCategoryFormData({ ...item });
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryFormData.nama?.trim()) {
      showNotification('error', 'Nama kategori wajib diisi.');
      return;
    }

    setActionLoading(true);
    try {
      if (categoryModalMode === 'create') {
        const { data, error } = await createMasterCategory({
          nama: categoryFormData.nama,
          icon: categoryFormData.icon,
          deskripsi: categoryFormData.deskripsi,
          urutan: categoryFormData.urutan,
          aktif: categoryFormData.aktif,
        });
        if (error) throw error;
        showNotification('success', `Kategori "${categoryFormData.nama}" berhasil ditambahkan.`);
      } else if (categoryFormData.id) {
        const { error } = await updateMasterCategory(categoryFormData.id, {
          nama: categoryFormData.nama,
          icon: categoryFormData.icon,
          deskripsi: categoryFormData.deskripsi,
          urutan: categoryFormData.urutan,
          aktif: categoryFormData.aktif,
        });
        if (error) throw error;
        showNotification('success', `Kategori "${categoryFormData.nama}" berhasil diperbarui.`);
      }
      setCategoryModalOpen(false);
      await loadData();
    } catch (err: any) {
      showNotification('error', err.message || 'Gagal menyimpan kategori barang.');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleCategoryStatus = async (item: MasterCategory) => {
    try {
      const nextStatus = !item.aktif;
      // Optimistic update
      setCategories((prev) =>
        prev.map((c) => (c.id === item.id ? { ...c, aktif: nextStatus } : c))
      );
      const { error } = await updateMasterCategory(item.id, { aktif: nextStatus });
      if (error) throw error;
      showNotification('success', `Status kategori "${item.nama}" diubah ke ${nextStatus ? 'Aktif' : 'Nonaktif'}.`);
    } catch (err: any) {
      showNotification('error', 'Gagal memperbarui status kategori.');
      await loadData();
    }
  };

  // ---------------------------------------------------------------------------
  // Condition Handlers
  // ---------------------------------------------------------------------------
  const openCreateCondition = () => {
    setConditionModalMode('create');
    setConditionFormData({
      nama: '',
      deskripsi: '',
      urutan: conditions.length + 1,
      aktif: true,
    });
    setConditionModalOpen(true);
  };

  const openEditCondition = (item: MasterCondition) => {
    setConditionModalMode('edit');
    setConditionFormData({ ...item });
    setConditionModalOpen(true);
  };

  const handleSaveCondition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conditionFormData.nama?.trim()) {
      showNotification('error', 'Label kondisi wajib diisi.');
      return;
    }

    setActionLoading(true);
    try {
      if (conditionModalMode === 'create') {
        const { error } = await createMasterCondition({
          nama: conditionFormData.nama,
          deskripsi: conditionFormData.deskripsi,
          urutan: conditionFormData.urutan,
          aktif: conditionFormData.aktif,
        });
        if (error) throw error;
        showNotification('success', `Kondisi "${conditionFormData.nama}" berhasil ditambahkan.`);
      } else if (conditionFormData.id) {
        const { error } = await updateMasterCondition(conditionFormData.id, {
          nama: conditionFormData.nama,
          deskripsi: conditionFormData.deskripsi,
          urutan: conditionFormData.urutan,
          aktif: conditionFormData.aktif,
        });
        if (error) throw error;
        showNotification('success', `Kondisi "${conditionFormData.nama}" berhasil diperbarui.`);
      }
      setConditionModalOpen(false);
      await loadData();
    } catch (err: any) {
      showNotification('error', err.message || 'Gagal menyimpan kondisi barang.');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleConditionStatus = async (item: MasterCondition) => {
    try {
      const nextStatus = !item.aktif;
      // Optimistic update
      setConditions((prev) =>
        prev.map((c) => (c.id === item.id ? { ...c, aktif: nextStatus } : c))
      );
      const { error } = await updateMasterCondition(item.id, { aktif: nextStatus });
      if (error) throw error;
      showNotification('success', `Status kondisi "${item.nama}" diubah ke ${nextStatus ? 'Aktif' : 'Nonaktif'}.`);
    } catch (err: any) {
      showNotification('error', 'Gagal memperbarui status kondisi.');
      await loadData();
    }
  };

  // ---------------------------------------------------------------------------
  // Delete Handler
  // ---------------------------------------------------------------------------
  const confirmDelete = (type: 'kategori' | 'kondisi', id: string, nama: string) => {
    setDeleteTarget({ type, id, nama });
    setDeleteModalOpen(true);
  };

  const handleExecuteDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      if (deleteTarget.type === 'kategori') {
        const { error } = await deleteMasterCategory(deleteTarget.id);
        if (error) throw error;
        showNotification('success', `Kategori "${deleteTarget.nama}" berhasil dihapus.`);
      } else {
        const { error } = await deleteMasterCondition(deleteTarget.id);
        if (error) throw error;
        showNotification('success', `Kondisi "${deleteTarget.nama}" berhasil dihapus.`);
      }
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      await loadData();
    } catch (err: any) {
      showNotification('error', err.message || 'Gagal menghapus data.');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered queries
  const q = searchQuery.toLowerCase().trim();
  const filteredCategories = categories.filter(
    (c) => c.nama.toLowerCase().includes(q) || c.deskripsi?.toLowerCase().includes(q)
  );
  const filteredConditions = conditions.filter(
    (c) => c.nama.toLowerCase().includes(q) || c.deskripsi?.toLowerCase().includes(q)
  );
  const filteredCampusAreas = campusAreas.filter(
    (a) => a.nama_lokasi.toLowerCase().includes(q) || a.deskripsi?.toLowerCase().includes(q)
  );

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between border shadow-sm transition-all animate-in fade-in duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-red-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="p-1 hover:opacity-75 text-gray-400 hover:text-gray-700 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 text-[#30AFFF] text-[11px] font-bold">
              <Sliders size={13} />
              <span>Pengaturan Pilihan Sistem</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Manajemen Master Data Selection
            </h1>
            <p className="text-xs text-gray-500 max-w-2xl leading-relaxed">
              Kelola daftar pilihan yang muncul pada formulir pelaporan kehilangan dan temuan warga kampus.
              Perubahan di sini langsung berlaku secara *real-time* ke semua form pengguna.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRefresh}
              disabled={loading || refreshing}
              className="p-2.5 rounded-2xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 transition-all cursor-pointer disabled:opacity-50"
              title="Muat ulang data"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin text-[#30AFFF]' : ''} />
            </button>

            {activeTab === 'kategori' && (
              <button
                onClick={openCreateCategory}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#30AFFF] hover:bg-[#2196E8] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <Plus size={15} />
                <span>Tambah Kategori</span>
              </button>
            )}

            {activeTab === 'kondisi' && (
              <button
                onClick={openCreateCondition}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#30AFFF] hover:bg-[#2196E8] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <Plus size={15} />
                <span>Tambah Kondisi</span>
              </button>
            )}

            {activeTab === 'area' && (
              <Link
                href="/admin/titik-temu"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#30AFFF] hover:bg-[#2196E8] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <MapPin size={15} />
                <span>Kelola Titik Temu Peta</span>
              </Link>
            )}
          </div>
        </div>

        {/* Tab Navigation & Search Bar */}
        <div className="pt-2 flex flex-col md:flex-row md:items-center justify-between gap-3 border-t border-gray-100">
          {/* Segmented Tabs */}
          <div className="flex items-center p-1 bg-gray-100 rounded-2xl gap-1 overflow-x-auto">
            <button
              onClick={() => {
                setActiveTab('kategori');
                setSearchQuery('');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'kategori'
                  ? 'bg-white text-gray-900 shadow-2xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Layers size={14} className={activeTab === 'kategori' ? 'text-[#30AFFF]' : 'text-gray-400'} />
              <span>Kategori Barang</span>
              <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-gray-200/80 text-gray-700">
                {categories.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('area');
                setSearchQuery('');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'area'
                  ? 'bg-white text-gray-900 shadow-2xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Building2 size={14} className={activeTab === 'area' ? 'text-[#30AFFF]' : 'text-gray-400'} />
              <span>Area & Gedung Kampus</span>
              <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-gray-200/80 text-gray-700">
                {campusAreas.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('kondisi');
                setSearchQuery('');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'kondisi'
                  ? 'bg-white text-gray-900 shadow-2xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <CheckCircle2 size={14} className={activeTab === 'kondisi' ? 'text-[#30AFFF]' : 'text-gray-400'} />
              <span>Kondisi Saat Hilang</span>
              <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-gray-200/80 text-gray-700">
                {conditions.length}
              </span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-72">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Cari ${
                activeTab === 'kategori' ? 'kategori...' : activeTab === 'area' ? 'gedung / area...' : 'kondisi...'
              }`}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-900 focus:bg-white focus:border-[#30AFFF] focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-2">
            <Loader2 size={26} className="animate-spin text-[#30AFFF] mx-auto" />
            <p className="text-xs font-medium text-gray-400">Memuat konfigurasi master data...</p>
          </div>
        ) : (
          <>
            {/* ==================== TAB 1: KATEGORI BARANG ==================== */}
            {activeTab === 'kategori' && (
              <div className="divide-y divide-gray-100">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/75 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        <th className="py-3.5 px-4 w-16 text-center">Urutan</th>
                        <th className="py-3.5 px-4">Kategori & Ikon</th>
                        <th className="py-3.5 px-4">Deskripsi / Contoh Barang</th>
                        <th className="py-3.5 px-4 w-28 text-center">Status</th>
                        <th className="py-3.5 px-4 w-28 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs">
                      {filteredCategories.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-gray-400">
                            Tidak ada kategori barang yang cocok dengan pencarian.
                          </td>
                        </tr>
                      ) : (
                        filteredCategories.map((cat, idx) => {
                          const IconComponent = resolveCategoryIcon(cat.icon);
                          return (
                            <tr key={cat.id || idx} className="hover:bg-gray-50/60 transition-colors">
                              <td className="py-3.5 px-4 text-center font-bold text-gray-400">
                                #{cat.urutan}
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#30AFFF] flex items-center justify-center shrink-0 border border-blue-100/60">
                                    <IconComponent size={18} />
                                  </div>
                                  <div>
                                    <span className="font-bold text-gray-900 block">{cat.nama}</span>
                                    <span className="text-[10px] text-gray-400">Ikon: {cat.icon}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-gray-600 max-w-md leading-relaxed">
                                {cat.deskripsi || '-'}
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => toggleCategoryStatus(cat)}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                                    cat.aktif
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                      : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
                                  }`}
                                  title="Klik untuk mengubah status"
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      cat.aktif ? 'bg-emerald-500' : 'bg-gray-400'
                                    }`}
                                  />
                                  <span>{cat.aktif ? 'Aktif' : 'Nonaktif'}</span>
                                </button>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <div className="inline-flex items-center gap-1">
                                  <button
                                    onClick={() => openEditCategory(cat)}
                                    className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-600 hover:text-[#30AFFF] transition-colors cursor-pointer"
                                    title="Edit Kategori"
                                  >
                                    <Pencil size={14} />
                                  </button>
                                  <button
                                    onClick={() => confirmDelete('kategori', cat.id, cat.nama)}
                                    className="p-1.5 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                                    title="Hapus Kategori"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ==================== TAB 2: AREA & GEDUNG KAMPUS ==================== */}
            {activeTab === 'area' && (
              <div className="space-y-4 p-5 sm:p-6">
                <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#30AFFF] text-white flex items-center justify-center shrink-0">
                      <MapPin size={16} />
                    </div>
                    <div className="space-y-0.5">
                      <h3 className="font-bold text-gray-900">
                        Sinkronisasi Otomatis dengan Titik Temu Kampus
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        Data gedung dan area kampus di bawah ini langsung terhubung dengan tabel{' '}
                        <code className="px-1.5 py-0.5 rounded bg-sky-100/80 font-mono text-[11px] text-sky-900">
                          titik_kumpul_aman
                        </code>
                        . Anda dapat mengatur koordinat GPS peta, ketersediaan petugas satpam, dan CCTV di halaman Titik Temu.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/admin/titik-temu"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-sky-200 text-sky-700 font-bold hover:bg-sky-100/50 transition-colors shrink-0"
                  >
                    <span>Buka Titik Temu</span>
                    <ExternalLink size={13} />
                  </Link>
                </div>

                <div className="overflow-x-auto border border-gray-100 rounded-2xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/75 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        <th className="py-3.5 px-4">Nama Gedung / Area Kampus</th>
                        <th className="py-3.5 px-4">Keterangan / Alamat</th>
                        <th className="py-3.5 px-4 w-40 text-center">Fasilitas Keamanan</th>
                        <th className="py-3.5 px-4 w-28 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs">
                      {filteredCampusAreas.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-12 text-center text-gray-400">
                            Tidak ada area kampus yang cocok dengan pencarian.
                          </td>
                        </tr>
                      ) : (
                        filteredCampusAreas.map((area, idx) => (
                          <tr key={area.id || idx} className="hover:bg-gray-50/60 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center shrink-0">
                                  <Building2 size={14} />
                                </div>
                                <span className="font-bold text-gray-900">{area.nama_lokasi}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-gray-600">
                              {area.alamat_lengkap || area.deskripsi || 'Area lingkungan kampus'}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <div className="inline-flex items-center gap-2">
                                {area.ada_satpam && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                                    <ShieldCheck size={11} /> Satpam
                                  </span>
                                )}
                                {area.ada_cctv && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-200">
                                    CCTV
                                  </span>
                                )}
                                {!area.ada_satpam && !area.ada_cctv && (
                                  <span className="text-gray-400 text-[11px]">-</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                  area.aktif !== false
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-gray-100 text-gray-500 border border-gray-200'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    area.aktif !== false ? 'bg-emerald-500' : 'bg-gray-400'
                                  }`}
                                />
                                <span>{area.aktif !== false ? 'Tersedia' : 'Nonaktif'}</span>
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ==================== TAB 3: KONDISI SAAT HILANG ==================== */}
            {activeTab === 'kondisi' && (
              <div className="divide-y divide-gray-100">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/75 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        <th className="py-3.5 px-4 w-16 text-center">Urutan</th>
                        <th className="py-3.5 px-4">Label Kondisi Barang</th>
                        <th className="py-3.5 px-4">Deskripsi Panduan bagi Pelapor</th>
                        <th className="py-3.5 px-4 w-28 text-center">Status</th>
                        <th className="py-3.5 px-4 w-28 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs">
                      {filteredConditions.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-gray-400">
                            Tidak ada data kondisi barang yang cocok dengan pencarian.
                          </td>
                        </tr>
                      ) : (
                        filteredConditions.map((cond, idx) => (
                          <tr key={cond.id || idx} className="hover:bg-gray-50/60 transition-colors">
                            <td className="py-3.5 px-4 text-center font-bold text-gray-400">
                              #{cond.urutan}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-gray-900">
                              {cond.nama}
                            </td>
                            <td className="py-3.5 px-4 text-gray-600 leading-relaxed">
                              {cond.deskripsi || '-'}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => toggleConditionStatus(cond)}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                                  cond.aktif
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
                                }`}
                                title="Klik untuk mengubah status"
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    cond.aktif ? 'bg-emerald-500' : 'bg-gray-400'
                                  }`}
                                />
                                <span>{cond.aktif ? 'Aktif' : 'Nonaktif'}</span>
                              </button>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  onClick={() => openEditCondition(cond)}
                                  className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-600 hover:text-[#30AFFF] transition-colors cursor-pointer"
                                  title="Edit Kondisi"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  onClick={() => confirmDelete('kondisi', cond.id, cond.nama)}
                                  className="p-1.5 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                                  title="Hapus Kondisi"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* =================================================================== */}
      {/* MODAL: Tambah / Edit Kategori Barang                                 */}
      {/* =================================================================== */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-xl border border-gray-100 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#30AFFF] flex items-center justify-center">
                  <Layers size={16} />
                </div>
                <h3 className="font-bold text-sm text-gray-900">
                  {categoryModalMode === 'create' ? 'Tambah Kategori Barang' : 'Edit Kategori Barang'}
                </h3>
              </div>
              <button
                onClick={() => setCategoryModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Nama Kategori <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={categoryFormData.nama || ''}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, nama: e.target.value })}
                  placeholder="Contoh: Pakaian & Jaket, Gadget & Aksesoris"
                  className="w-full px-3.5 py-2.5 text-xs text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:border-[#30AFFF] focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Pilih Ikon Visual
                </label>
                <div className="grid grid-cols-8 gap-2 p-2.5 bg-gray-50 rounded-2xl border border-gray-200/80 max-h-36 overflow-y-auto">
                  {AVAILABLE_CATEGORY_ICONS.map((iconName) => {
                    const IconComp = resolveCategoryIcon(iconName);
                    const isSelected = categoryFormData.icon === iconName;
                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setCategoryFormData({ ...categoryFormData, icon: iconName })}
                        className={`p-2 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#30AFFF] text-white shadow-xs scale-105'
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
                        }`}
                        title={iconName}
                      >
                        <IconComp size={16} />
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Ikon terpilih: <span className="font-semibold text-gray-700">{categoryFormData.icon}</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Deskripsi / Contoh Barang
                </label>
                <textarea
                  rows={2}
                  value={categoryFormData.deskripsi || ''}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, deskripsi: e.target.value })}
                  placeholder="Contoh: Jaket almamater, kemeja, sweater, celana panjang"
                  className="w-full px-3.5 py-2 text-xs text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:border-[#30AFFF] focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Nomor Urut Tampilan
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={categoryFormData.urutan ?? 1}
                    onChange={(e) =>
                      setCategoryFormData({ ...categoryFormData, urutan: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-3 py-2 text-xs text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:border-[#30AFFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Status Penayangan
                  </label>
                  <select
                    value={categoryFormData.aktif ? 'true' : 'false'}
                    onChange={(e) =>
                      setCategoryFormData({ ...categoryFormData, aktif: e.target.value === 'true' })
                    }
                    className="w-full px-3 py-2 text-xs text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#30AFFF]"
                  >
                    <option value="true">Aktif (Tampil di Form)</option>
                    <option value="false">Nonaktif (Disembunyikan)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#30AFFF] hover:bg-[#2196E8] text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>{categoryModalMode === 'create' ? 'Simpan Kategori' : 'Perbarui Kategori'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: Tambah / Edit Kondisi Barang                                  */}
      {/* =================================================================== */}
      {conditionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-xl border border-gray-100 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#30AFFF] flex items-center justify-center">
                  <CheckCircle2 size={16} />
                </div>
                <h3 className="font-bold text-sm text-gray-900">
                  {conditionModalMode === 'create' ? 'Tambah Kondisi Barang' : 'Edit Kondisi Barang'}
                </h3>
              </div>
              <button
                onClick={() => setConditionModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveCondition} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Label Kondisi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={conditionFormData.nama || ''}
                  onChange={(e) => setConditionFormData({ ...conditionFormData, nama: e.target.value })}
                  placeholder="Contoh: Sangat Baik / Baru, Lecet Pemakaian"
                  className="w-full px-3.5 py-2.5 text-xs text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:border-[#30AFFF] focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Deskripsi Panduan bagi Pelapor
                </label>
                <textarea
                  rows={2}
                  value={conditionFormData.deskripsi || ''}
                  onChange={(e) =>
                    setConditionFormData({ ...conditionFormData, deskripsi: e.target.value })
                  }
                  placeholder="Contoh: Kondisi fisik masih mulus tanpa cacat terlihat"
                  className="w-full px-3.5 py-2 text-xs text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:border-[#30AFFF] focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Nomor Urut Tampilan
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={conditionFormData.urutan ?? 1}
                    onChange={(e) =>
                      setConditionFormData({ ...conditionFormData, urutan: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-3 py-2 text-xs text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:border-[#30AFFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Status Penayangan
                  </label>
                  <select
                    value={conditionFormData.aktif ? 'true' : 'false'}
                    onChange={(e) =>
                      setConditionFormData({ ...conditionFormData, aktif: e.target.value === 'true' })
                    }
                    className="w-full px-3 py-2 text-xs text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#30AFFF]"
                  >
                    <option value="true">Aktif (Tampil di Form)</option>
                    <option value="false">Nonaktif (Disembunyikan)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setConditionModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#30AFFF] hover:bg-[#2196E8] text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>{conditionModalMode === 'create' ? 'Simpan Kondisi' : 'Perbarui Kondisi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: Konfirmasi Hapus Data                                         */}
      {/* =================================================================== */}
      {deleteModalOpen && deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-xl border border-gray-100 space-y-4 text-center animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 size={22} />
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-sm text-gray-900">
                Hapus {deleteTarget.type === 'kategori' ? 'Kategori' : 'Kondisi'}?
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Apakah Anda yakin ingin menghapus data{' '}
                <strong className="text-gray-800">"{deleteTarget.nama}"</strong>? Aksi ini akan
                menghapus opsi dari formulir pelaporan.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleExecuteDelete}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-xs disabled:opacity-50"
              >
                {actionLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                <span>Hapus Data</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
