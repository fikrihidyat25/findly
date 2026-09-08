'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/src/components/layout/AppLayout';
import {
  CheckCircle2,
  GraduationCap,
  Mail,
  ShieldCheck,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { createClient } from '@/src/lib/supabase/client';

interface UserProfile {
  id: string;
  nama_lengkap: string;
  email: string;
  tipe_akun: string;
  universitas: string;
  role_kampus: string;
  nim_nip: string;
  status_kampus_terverifikasi: boolean;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFullNIM, setShowFullNIM] = useState(false);
  const [reportsCount, setReportsCount] = useState(0);
  const [resolvedCount, setResolvedCount] = useState(0);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) {
          setUser(null);
          setLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from('profil_pengguna')
          .select('*')
          .eq('id', authUser.id)
          .single();

        const nama = profile?.nama_lengkap || authUser.user_metadata?.nama_lengkap || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Pengguna';
        const rawTipe = profile?.tipe_akun || authUser.user_metadata?.tipe_akun || 'community';
        const isCampus = rawTipe === 'campus';
        const isAdmin = rawTipe === 'admin';
        const tipeAkun = isAdmin ? 'admin' : isCampus ? 'campus' : 'community';

        setUser({
          id: authUser.id,
          nama_lengkap: nama,
          email: authUser.email || '',
          tipe_akun: tipeAkun,
          universitas: isCampus ? (profile?.universitas || authUser.user_metadata?.universitas || 'Universitas Bung Hatta') : '',
          role_kampus: isCampus ? (profile?.role_kampus || authUser.user_metadata?.role_kampus || 'Mahasiswa') : '',
          nim_nip: isCampus ? (profile?.nim_nip || authUser.user_metadata?.nim_nip || '') : '',
          status_kampus_terverifikasi: isCampus ? (profile?.status_kampus_terverifikasi ?? false) : false,
        });

        // Count user's reports
        const { count: repCount } = await supabase
          .from('laporan_barang')
          .select('*', { count: 'exact', head: true })
          .eq('pelapor_id', authUser.id);
        setReportsCount(repCount || 0);

        // Count user's resolved returns
        const { count: resCount } = await supabase
          .from('klaim_barang')
          .select('*', { count: 'exact', head: true })
          .eq('pengklaim_id', authUser.id)
          .eq('status', 'SELESAI');
        setResolvedCount(resCount || 0);
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-2xs animate-pulse space-y-4">
          <div className="flex gap-4">
            <div className="w-20 h-20 rounded-3xl bg-gray-100" />
            <div className="space-y-2 flex-1">
              <div className="h-6 bg-gray-100 rounded w-1/3" />
              <div className="h-4 bg-gray-100 rounded w-1/4" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Guest State
  if (!user) {
    return (
      <AppLayout>
        <div className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-12 text-center space-y-4 shadow-2xs max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#30AFFF] flex items-center justify-center mx-auto shadow-xs">
            <ShieldCheck size={32} />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-gray-900">Anda Belum Masuk</h2>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-sm mx-auto">
              Silakan masuk atau daftarkan akun kampus untuk melihat profil, laporan, serta riwayat klaim Anda.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold transition-all inline-flex items-center justify-center gap-1.5"
            >
              <LogIn size={14} />
              <span>Masuk</span>
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#30AFFF] hover:bg-[#2196E8] text-white text-xs font-semibold shadow-2xs transition-all inline-flex items-center justify-center gap-1.5"
            >
              <UserPlus size={14} />
              <span>Daftar Akun</span>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  const isCampus = user.tipe_akun === 'campus';
  const isAdmin = user.tipe_akun === 'admin';

  const roleDisplay = isAdmin
    ? 'Admin Mediator'
    : isCampus
    ? user.role_kampus
      ? user.role_kampus.charAt(0).toUpperCase() + user.role_kampus.slice(1)
      : 'Civitas Kampus'
    : 'Anggota Komunitas';

  const maskedNIM = user.nim_nip
    ? user.nim_nip.length > 4
      ? `•••••${user.nim_nip.slice(-4)}`
      : user.nim_nip
    : '-';

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header Profile Hero Card */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className={`w-18 h-18 sm:w-20 sm:h-20 rounded-3xl text-white flex items-center justify-center font-extrabold text-2xl shadow-sm shrink-0 ${
                user.tipe_akun === 'admin'
                  ? 'bg-gradient-to-tr from-amber-500 to-orange-500'
                  : 'bg-gradient-to-tr from-[#30AFFF] to-[#5ec2ff]'
              }`}>
                {getInitials(user.nama_lengkap)}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                    {user.nama_lengkap}
                  </h1>
                  {isAdmin ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      <span>Administrator</span>
                    </span>
                  ) : user.status_kampus_terverifikasi ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                      <CheckCircle2 size={12} className="text-emerald-600" />
                      <span>University Verified</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                      <span>Community Member</span>
                    </span>
                  )}
                </div>

                {isCampus ? (
                  <p className="text-xs sm:text-sm text-gray-500 font-medium flex items-center gap-1.5">
                    <GraduationCap size={15} className="text-[#30AFFF]" />
                    <span>{user.universitas || 'Civitas Akademika'} · {roleDisplay}</span>
                  </p>
                ) : isAdmin ? (
                  <p className="text-xs sm:text-sm text-gray-500 font-medium flex items-center gap-1.5">
                    <span>Administrator Findly</span>
                  </p>
                ) : (
                  <p className="text-xs sm:text-sm text-gray-500 font-medium flex items-center gap-1.5">
                    <Users size={15} className="text-[#30AFFF]" />
                    <span>Masyarakat Umum / Tamu Kampus</span>
                  </p>
                )}
              </div>
            </div>

            <Link
              href="/profile/edit"
              className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-all self-stretch sm:self-auto text-center cursor-pointer hover:border-[#30AFFF] hover:text-[#30AFFF]"
            >
              Edit Profil
            </Link>
          </div>

          {/* User Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 mt-6 border-t border-gray-100 text-xs">
            <div className="space-y-1">
              <span className="text-gray-400 block text-[11px]">Email:</span>
              <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                <Mail size={13} className="text-gray-400" />
                {user.email}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-gray-400 block text-[11px]">Nomor Induk (NIM/NIP):</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-gray-800 tracking-wider">
                  {showFullNIM ? (user.nim_nip || '-') : maskedNIM}
                </span>
                {user.nim_nip && (
                  <button
                    type="button"
                    onClick={() => setShowFullNIM(!showFullNIM)}
                    className="text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                    title={showFullNIM ? 'Sembunyikan' : 'Tampilkan NIM'}
                  >
                    {showFullNIM ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-gray-400 block text-[11px]">Tipe Akun:</span>
              <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-[#30AFFF]" />
                {user.tipe_akun === 'admin'
                  ? 'Administrator Kampus'
                  : user.tipe_akun === 'campus'
                  ? 'Civitas Kampus Aktif'
                  : 'Anggota Komunitas'}
              </span>
            </div>
          </div>
        </div>

        {/* Contribution Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs space-y-1">
            <span className="text-xs text-gray-500 font-medium">Total Laporan Dibuat</span>
            <p className="text-2xl font-extrabold text-gray-900">{reportsCount}</p>
            <span className="text-[11px] text-gray-400">Laporan barang aktif & selesai</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs space-y-1">
            <span className="text-xs text-gray-500 font-medium">Barang Berhasil Dikembalikan</span>
            <p className="text-2xl font-extrabold text-emerald-600">{resolvedCount}</p>
            <span className="text-[11px] text-gray-400">Klaim terverifikasi sukses</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs space-y-1">
            <span className="text-xs text-gray-500 font-medium">
              {isCampus ? 'Status Akun Civitas' : isAdmin ? 'Status Akun Admin' : 'Status Akun Komunitas'}
            </span>
            <p className="text-2xl font-extrabold text-[#30AFFF]">Aktif</p>
            <span className="text-[11px] text-gray-400">Terdaftar resmi di Findly</span>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="p-4 bg-gray-50/90 rounded-2xl border border-gray-200/80 text-xs text-gray-500 flex items-start gap-3">
          <ShieldCheck size={18} className="text-[#30AFFF] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {isCampus ? (
              <>
                <strong>Komitmen Privasi Kampus:</strong> Nomor Induk Mahasiswa (NIM) dan kontak pribadi Anda disensor secara ketat pada publikasi laporan barang. Hanya identitas terverifikasi dan nama yang terlihat oleh sesama mahasiswa untuk menjamin keamanan civitas akademika.
              </>
            ) : (
              <>
                <strong>Komitmen Privasi:</strong> Data kontak pribadi Anda disensor secara ketat pada publikasi laporan barang untuk menjamin keamanan dan kenyamanan seluruh pengguna komunitas.
              </>
            )}
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
