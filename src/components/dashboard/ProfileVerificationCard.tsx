'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, GraduationCap, ShieldCheck, ArrowUpRight, LogIn, UserPlus, ShieldAlert, Users } from 'lucide-react';
import { createClient } from '@/src/lib/supabase/client';

interface UserProfile {
  id: string;
  nama_lengkap: string;
  tipe_akun: string;
  universitas: string;
  role_kampus: string;
  nim_nip: string;
  status_kampus_terverifikasi: boolean;
}

export default function ProfileVerificationCard() {
  const supabase = createClient();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          setUser(null);
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
          tipe_akun: tipeAkun,
          universitas: isCampus ? (profile?.universitas || authUser.user_metadata?.universitas || 'Universitas Bung Hatta') : '',
          role_kampus: isCampus ? (profile?.role_kampus || authUser.user_metadata?.role_kampus || 'Mahasiswa') : '',
          nim_nip: isCampus ? (profile?.nim_nip || authUser.user_metadata?.nim_nip || '') : '',
          status_kampus_terverifikasi: isCampus ? (profile?.status_kampus_terverifikasi ?? false) : false,
        });
      } catch (err) {
        console.error('Error loading profile card:', err);
        setUser(null);
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
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-2xs h-full animate-pulse">
        <div className="h-5 bg-gray-100 rounded w-1/2 mb-4" />
        <div className="flex gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-100 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  // Guest State
  if (!user) {
    return (
      <div className="bg-gradient-to-br from-white via-white to-blue-50/40 p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#30AFFF]" />
              <h4 className="font-bold text-xs sm:text-sm text-gray-900 tracking-tight">
                Akses Civitas Kampus
              </h4>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
              Mode Tamu
            </span>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-sm text-gray-900">Belum masuk ke akun Anda?</h5>
            <p className="text-xs text-gray-500 leading-relaxed">
              Masuk atau daftarkan akun kampus untuk membuat laporan kehilangan, melaporkan barang temuan, serta memverifikasi klaim kepemilikan.
            </p>
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-gray-50 flex items-center gap-2">
          <Link
            href="/login"
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold transition-all"
          >
            <LogIn size={13} />
            <span>Masuk</span>
          </Link>
          <Link
            href="/register"
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#30AFFF] hover:bg-[#2196E8] text-white text-xs font-semibold shadow-2xs transition-all"
          >
            <UserPlus size={13} />
            <span>Daftar</span>
          </Link>
        </div>
      </div>
    );
  }

  // Authenticated State
  const roleDisplay = user.tipe_akun === 'admin'
    ? 'Admin Mediator'
    : user.role_kampus
      ? user.role_kampus.charAt(0).toUpperCase() + user.role_kampus.slice(1)
      : 'Warga Kampus';

  const maskedNIM = user.nim_nip
    ? user.nim_nip.length > 4
      ? `•••••${user.nim_nip.slice(-4)}`
      : user.nim_nip
    : '-';

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full">
      <div>
        {/* Header Widget */}
        <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#30AFFF]" />
            <h4 className="font-bold text-xs sm:text-sm text-gray-900 tracking-tight">
              Profil & Verifikasi
            </h4>
          </div>
          {user.tipe_akun === 'admin' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <ShieldAlert size={11} className="text-amber-600" />
              <span>Admin Mediator</span>
            </span>
          ) : user.status_kampus_terverifikasi ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
              <CheckCircle2 size={11} className="text-emerald-600" />
              <span>University Verified</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">
              <span>Community Member</span>
            </span>
          )}
        </div>

        {/* Profile Details */}
        <div className="flex items-start gap-3.5">
          {/* Avatar */}
          <div className={`w-12 h-12 rounded-2xl text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0 ${user.tipe_akun === 'admin'
              ? 'bg-gradient-to-tr from-amber-500 to-orange-500'
              : 'bg-gradient-to-tr from-[#30AFFF] to-[#5ec2ff]'
            }`}>
            {getInitials(user.nama_lengkap)}
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-bold text-sm text-gray-900 leading-tight">
                {user.nama_lengkap}
              </span>
              <span className="inline-flex items-center text-[10px] font-semibold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded-md border border-sky-100">
                {user.tipe_akun === 'admin' ? 'Admin Mediator' : user.tipe_akun === 'campus' ? (user.role_kampus ? user.role_kampus.charAt(0).toUpperCase() + user.role_kampus.slice(1) : 'Civitas Kampus') : 'Anggota Komunitas'}
              </span>
            </div>
            {user.tipe_akun === 'campus' ? (
              <p className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                <GraduationCap size={13} className="text-[#30AFFF] shrink-0" />
                <span className="truncate">{user.universitas || 'Civitas Kampus'}</span>
              </p>
            ) : user.tipe_akun === 'admin' ? (
              <p className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                <ShieldAlert size={13} className="text-amber-600 shrink-0" />
                <span className="truncate">Administrator Platform</span>
              </p>
            ) : (
              <p className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                <Users size={13} className="text-[#30AFFF] shrink-0" />
                <span className="truncate">Masyarakat Umum / Tamu</span>
              </p>
            )}
            {user.tipe_akun === 'campus' && user.nim_nip && (
              <p className="text-[11px] font-mono text-gray-400 pt-0.5">
                NIM/NIP: <span className="tracking-widest">{maskedNIM}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-4 mt-4 border-t border-gray-50">
        <Link
          href="/profile"
          className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-[#30AFFF]/40 text-[#30AFFF] hover:bg-[#EFF8FF] text-xs font-semibold transition-all duration-200"
        >
          <span>Lihat Profil Lengkap</span>
          <ArrowUpRight size={13} />
        </Link>
      </div>
    </div>
  );
}
