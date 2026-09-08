'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Loader2,
  RefreshCw,
  X,
  Save,
  AlertTriangle,
  Building2,
  GraduationCap,
} from 'lucide-react';
import { createClient } from '@/src/lib/supabase/client';

interface PenggunaItem {
  id: string;
  nama_lengkap: string;
  email: string;
  tipe_akun: 'campus' | 'community' | 'admin' | string;
  universitas?: string | null;
  role_kampus?: string | null;
  nim_nip?: string | null;
  status_kampus_terverifikasi?: boolean;
  dibuat_pada?: string;
}

export default function AdminPenggunaPage() {
  const [userList, setUserList] = useState<PenggunaItem[]>([]);
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTipe, setFilterTipe] = useState<string>('semua');
  const [filterVerifikasi, setFilterVerifikasi] = useState<string>('semua');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit Modal State
  const [editingUser, setEditingUser] = useState<PenggunaItem | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editTipeAkun, setEditTipeAkun] = useState<'campus' | 'community' | 'admin'>('campus');
  const [editUniversity, setEditUniversity] = useState('');
  const [editCampusRole, setEditCampusRole] = useState('mahasiswa');
  const [editNimNip, setEditNimNip] = useState('');
  const [editIsVerified, setEditIsVerified] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Delete Confirmation Modal State
  const [deletingUser, setDeletingUser] = useState<PenggunaItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function fetchUsers() {
    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (authUser) {
        setCurrentAdminId(authUser.id);
      }

      const { data, error } = await supabase
        .from('profil_pengguna')
        .select('*')
        .order('dibuat_pada', { ascending: false });

      if (error) throw error;
      setUserList(data || []);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setFeedbackMessage({ type: 'error', text: err.message || 'Gagal memuat profil pengguna.' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = userList.filter((u) => {
    const matchSearch =
      (u.nama_lengkap && u.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.universitas && u.universitas.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.nim_nip && u.nim_nip.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchTipe = filterTipe === 'semua' || u.tipe_akun === filterTipe;
    const matchVerifikasi =
      filterVerifikasi === 'semua' ||
      (filterVerifikasi === 'terverifikasi' && u.status_kampus_terverifikasi) ||
      (filterVerifikasi === 'belum' && !u.status_kampus_terverifikasi);

    return matchSearch && matchTipe && matchVerifikasi;
  });

  // Open Edit Modal
  const handleOpenEdit = (user: PenggunaItem) => {
    setEditingUser(user);
    setEditFullName(user.nama_lengkap || '');
    setEditTipeAkun((user.tipe_akun as any) || 'community');
    setEditUniversity(user.universitas || 'Universitas Bung Hatta');
    setEditCampusRole(user.role_kampus || 'mahasiswa');
    setEditNimNip(user.nim_nip || '');
    setEditIsVerified(!!user.status_kampus_terverifikasi);
  };

  // Submit Edit Form
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (!editFullName.trim()) {
      setFeedbackMessage({ type: 'error', text: 'Nama lengkap wajib diisi.' });
      return;
    }

    setIsSaving(true);
    try {
      const supabase = createClient();
      const updates: Partial<PenggunaItem> = {
        nama_lengkap: editFullName.trim(),
        tipe_akun: editTipeAkun,
        universitas: editTipeAkun === 'campus' ? editUniversity.trim() : null,
        role_kampus: editTipeAkun === 'campus' ? editCampusRole : null,
        nim_nip: editTipeAkun === 'campus' ? editNimNip.trim() : null,
        status_kampus_terverifikasi: editTipeAkun === 'campus' ? editIsVerified : false,
      };

      const { error } = await supabase
        .from('profil_pengguna')
        .update(updates)
        .eq('id', editingUser.id);

      if (error) throw error;

      setUserList((prev) =>
        prev.map((u) => (u.id === editingUser.id ? { ...u, ...updates } : u))
      );

      setFeedbackMessage({
        type: 'success',
        text: `Data pengguna "${editFullName.trim()}" berhasil diperbarui.`,
      });
      setEditingUser(null);
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Gagal menyimpan perubahan pengguna.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Execute Delete User
  const handleConfirmDelete = async () => {
    if (!deletingUser) return;

    if (deletingUser.id === currentAdminId) {
      setFeedbackMessage({ type: 'error', text: 'Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif.' });
      setDeletingUser(null);
      return;
    }

    setIsDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('profil_pengguna')
        .delete()
        .eq('id', deletingUser.id);

      if (error) throw error;

      setUserList((prev) => prev.filter((u) => u.id !== deletingUser.id));

      setFeedbackMessage({
        type: 'success',
        text: `Pengguna "${deletingUser.nama_lengkap}" berhasil dihapus dari sistem.`,
      });
      setDeletingUser(null);
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Gagal menghapus pengguna.' });
    } finally {
      setIsDeleting(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
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

      {/* Control Bar: Filters & Search */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Kelola Pengguna</h2>
            <p className="text-xs text-gray-500">
              Total {filteredUsers.length} pengguna terdaftar dalam basis data Findly.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchUsers}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 self-start sm:self-auto"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin text-[#30AFFF]' : ''} />
            <span>Segarkan</span>
          </button>
        </div>

        {/* Filter Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-50">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, email, universitas, atau NIM..."
              className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:border-[#30AFFF] focus:outline-none transition-all"
            />
          </div>

          <div>
            <select
              value={filterTipe}
              onChange={(e) => setFilterTipe(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:border-[#30AFFF] focus:outline-none transition-all cursor-pointer"
            >
              <option value="semua">Semua Tipe Akun</option>
              <option value="campus">Civitas Kampus</option>
              <option value="community">Masyarakat Umum</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <div>
            <select
              value={filterVerifikasi}
              onChange={(e) => setFilterVerifikasi(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:border-[#30AFFF] focus:outline-none transition-all cursor-pointer"
            >
              <option value="semua">Semua Status Verifikasi</option>
              <option value="terverifikasi">Terverifikasi Saja</option>
              <option value="belum">Belum Terverifikasi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <Loader2 size={24} className="animate-spin text-[#30AFFF] mx-auto mb-2" />
            <p className="text-xs text-gray-400">Memuat profil pengguna...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-xs text-gray-400">Tidak ada data pengguna yang sesuai filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/75 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3">Pengguna</th>
                  <th className="px-4 py-3">Tipe Akun</th>
                  <th className="px-4 py-3">Institusi / Universitas</th>
                  <th className="px-4 py-3">Role Kampus & NIM</th>
                  <th className="px-4 py-3">Status Verifikasi</th>
                  <th className="px-4 py-3">Terdaftar</th>
                  <th className="px-5 py-3 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                    {/* Column 1: User info */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-sky-400 text-white font-bold flex items-center justify-center text-xs shrink-0">
                          {getInitials(item.nama_lengkap)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate max-w-[150px]">
                            {item.nama_lengkap}
                          </p>
                          <p className="text-[11px] text-gray-400 truncate max-w-[150px]">
                            {item.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Column 2: Account type badge */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          item.tipe_akun === 'admin'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : item.tipe_akun === 'campus'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {item.tipe_akun === 'admin'
                          ? 'Administrator'
                          : item.tipe_akun === 'campus'
                          ? 'Civitas Kampus'
                          : 'Komunitas'}
                      </span>
                    </td>

                    {/* Column 3: University */}
                    <td className="px-4 py-3.5 text-gray-700 truncate max-w-[140px]">
                      {item.universitas || '-'}
                    </td>

                    {/* Column 4: Role & NIM */}
                    <td className="px-4 py-3.5 text-gray-600 truncate max-w-[130px]">
                      {item.tipe_akun === 'campus' ? (
                        <div>
                          <p className="font-semibold text-gray-800 capitalize">
                            {item.role_kampus || 'Mahasiswa'}
                          </p>
                          <p className="text-[11px] text-gray-400">NIM: {item.nim_nip || '-'}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>

                    {/* Column 5: Verification status */}
                    <td className="px-4 py-3.5">
                      {item.status_kampus_terverifikasi ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                          <CheckCircle2 size={11} />
                          <span>Terverifikasi</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 font-medium text-[10px]">
                          <XCircle size={11} />
                          <span>Belum Verifikasi</span>
                        </span>
                      )}
                    </td>

                    {/* Column 6: Registered Date */}
                    <td className="px-4 py-3.5 text-gray-400 text-[11px] whitespace-nowrap">
                      {formatDate(item.dibuat_pada)}
                    </td>

                    {/* Column 7: Clean Edit & Delete Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 transition-all cursor-pointer"
                          title="Edit Data Pengguna"
                        >
                          <Edit2 size={13} className="text-gray-500" />
                          <span>Edit</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => setDeletingUser(item)}
                          disabled={item.id === currentAdminId}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          title={item.id === currentAdminId ? 'Tidak dapat menghapus akun sendiri' : 'Hapus Pengguna'}
                        >
                          <Trash2 size={13} className="text-red-600" />
                          <span>Hapus</span>
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

      {/* Edit User Modal Dialog (Formal & Clean) */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#30AFFF] flex items-center justify-center">
                  <Edit2 size={15} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Edit Data Pengguna</h3>
                  <p className="text-[11px] text-gray-400">{editingUser.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              {/* Nama Lengkap */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:border-[#30AFFF] focus:outline-none transition-all"
                  required
                />
              </div>

              {/* Tipe Akun */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Tipe Akun</label>
                <select
                  value={editTipeAkun}
                  onChange={(e) => setEditTipeAkun(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:border-[#30AFFF] focus:outline-none transition-all cursor-pointer"
                >
                  <option value="campus">Civitas Kampus</option>
                  <option value="community">Masyarakat Umum</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              {/* Campus specific fields */}
              {editTipeAkun === 'campus' && (
                <div className="space-y-3 p-3.5 bg-blue-50/40 rounded-2xl border border-blue-100/60">
                  <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
                    Data Civitas Akademika
                  </span>

                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Universitas / Institusi</label>
                    <input
                      type="text"
                      value={editUniversity}
                      onChange={(e) => setEditUniversity(e.target.value)}
                      placeholder="Nama universitas..."
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:border-[#30AFFF] focus:outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-medium text-gray-700 mb-1">Peran Kampus</label>
                      <select
                        value={editCampusRole}
                        onChange={(e) => setEditCampusRole(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:border-[#30AFFF] focus:outline-none transition-all cursor-pointer"
                      >
                        <option value="mahasiswa">Mahasiswa</option>
                        <option value="dosen">Dosen</option>
                        <option value="staff">Staff Kampus</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium text-gray-700 mb-1">NIM / NIP</label>
                      <input
                        type="text"
                        value={editNimNip}
                        onChange={(e) => setEditNimNip(e.target.value)}
                        placeholder="NIM / NIP..."
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:border-[#30AFFF] focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Verification checkbox */}
                  <label className="flex items-center gap-2 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editIsVerified}
                      onChange={(e) => setEditIsVerified(e.target.checked)}
                      className="w-4 h-4 text-[#30AFFF] rounded border-gray-300 focus:ring-[#30AFFF]"
                    />
                    <span className="font-semibold text-gray-800">
                      Status Terverifikasi Kampus (Centang Biru)
                    </span>
                  </label>
                </div>
              )}

              {/* Form Action Buttons */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#30AFFF] hover:bg-[#2196E8] text-white text-xs font-semibold shadow-2xs cursor-pointer transition-all disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal Dialog */}
      {deletingUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto border border-red-100">
              <AlertTriangle size={22} />
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900">Hapus Pengguna</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Apakah Anda yakin ingin menghapus akun <strong className="text-gray-800">{deletingUser.nama_lengkap}</strong> ({deletingUser.email})?
              </p>
              <p className="text-[11px] text-red-500 mt-2">
                Tindakan ini permanen dan tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-2xs cursor-pointer transition-all disabled:opacity-50"
              >
                {isDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus Pengguna'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
