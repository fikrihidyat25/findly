'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  GraduationCap,
  ShieldCheck,
  Building2,
  Loader2,
  RefreshCw,
  X,
  UserCheck,
  UserX,
  Shield,
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
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTipe, setFilterTipe] = useState<string>('semua');
  const [filterVerifikasi, setFilterVerifikasi] = useState<string>('semua');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function fetchUsers() {
    setLoading(true);
    try {
      const supabase = createClient();
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

  // Action: Toggle Verifikasi Kampus
  async function handleToggleVerification(user: PenggunaItem) {
    const nextStatus = !user.status_kampus_terverifikasi;
    setActionLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('profil_pengguna')
        .update({ status_kampus_terverifikasi: nextStatus })
        .eq('id', user.id);

      if (error) throw error;

      setUserList((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status_kampus_terverifikasi: nextStatus } : u))
      );

      setFeedbackMessage({
        type: 'success',
        text: `Status verifikasi civitas untuk "${user.nama_lengkap}" berhasil ${nextStatus ? 'disetujui' : 'dibatalkan'}.`,
      });
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Gagal memperbarui verifikasi pengguna.' });
    } finally {
      setActionLoading(false);
    }
  }

  // Action: Toggle Tipe Akun (Admin / Civitas / Komunitas)
  async function handleChangeAccountType(user: PenggunaItem, newType: string) {
    if (!confirm(`Ubah tipe akun "${user.nama_lengkap}" menjadi "${newType}"?`)) return;

    setActionLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('profil_pengguna')
        .update({ tipe_akun: newType })
        .eq('id', user.id);

      if (error) throw error;

      setUserList((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, tipe_akun: newType } : u))
      );

      setFeedbackMessage({
        type: 'success',
        text: `Tipe akun "${user.nama_lengkap}" berhasil diubah menjadi ${newType}.`,
      });
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Gagal mengubah tipe akun.' });
    } finally {
      setActionLoading(false);
    }
  }

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
            <h2 className="text-sm font-bold text-gray-900">Kelola Pengguna & Verifikasi Civitas</h2>
            <p className="text-xs text-gray-500">
              Total {filteredUsers.length} pengguna terdaftar dalam basis data.
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
                  <th className="px-5 py-3 text-right">Tindakan Admin</th>
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

                    {/* Column 7: Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Toggle campus verification */}
                        <button
                          type="button"
                          onClick={() => handleToggleVerification(item)}
                          disabled={actionLoading}
                          className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                            item.status_kampus_terverifikasi
                              ? 'text-amber-600 hover:bg-amber-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={
                            item.status_kampus_terverifikasi
                              ? 'Batalkan Verifikasi Kampus'
                              : 'Setujui Verifikasi Kampus'
                          }
                        >
                          {item.status_kampus_terverifikasi ? <UserX size={15} /> : <UserCheck size={15} />}
                        </button>

                        {/* Make / Revoke Admin */}
                        {item.tipe_akun !== 'admin' ? (
                          <button
                            type="button"
                            onClick={() => handleChangeAccountType(item, 'admin')}
                            disabled={actionLoading}
                            className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 cursor-pointer transition-colors"
                            title="Jadikan Administrator"
                          >
                            <Shield size={15} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleChangeAccountType(item, 'campus')}
                            disabled={actionLoading}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
                            title="Kembalikan ke Akun Biasa"
                          >
                            <X size={15} />
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
