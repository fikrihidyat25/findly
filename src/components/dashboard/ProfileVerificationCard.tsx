'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, GraduationCap, ShieldCheck, ArrowRight, LogIn, UserPlus, ShieldAlert, Users } from 'lucide-react';
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
      <div className="bg-white p-5 rounded-[6px] border border-slate-200 h-full animate-pulse flex flex-col justify-between">
        <div className="space-y-3">
          <div className="h-4 bg-slate-100 rounded-[4px] w-1/3" />
          <div className="flex gap-3 items-center pt-2">
            <div className="w-10 h-10 rounded-[6px] bg-slate-100 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-100 rounded-[4px] w-3/4" />
              <div className="h-3 bg-slate-100 rounded-[4px] w-1/2" />
            </div>
          </div>
        </div>
        <div className="h-8 bg-slate-100 rounded-[4px] w-full mt-4" />
      </div>
    );
  }

  // Guest State
  if (!user) {
    return (
      <div className="bg-white p-5 rounded-[6px] border border-slate-200 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-slate-700" />
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 tracking-tight">
                Akses Civitas Kampus
              </h4>
            </div>
            <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              Mode Tamu
            </span>
          </div>

          <div className="space-y-1.5">
            <h5 className="font-bold text-xs text-slate-900">Belum masuk ke akun Anda?</h5>
            <p className="text-xs text-slate-500 leading-relaxed">
              Masuk atau daftarkan akun kampus untuk membuat laporan kehilangan, menemukan barang, dan klaim kepemilikan.
            </p>
          </div>
        </div>

        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center gap-2">
          <Link
            href="/login"
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-[6px] border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-all"
          >
            <LogIn size={13} />
            <span>Masuk</span>
          </Link>
          <Link
            href="/register"
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-[6px] bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-all"
          >
            <UserPlus size={13} />
            <span>Daftar</span>
          </Link>
        </div>
      </div>
    );
  }

  const maskedNIM = user.nim_nip
    ? user.nim_nip.length > 4
      ? `•••••${user.nim_nip.slice(-4)}`
      : user.nim_nip
    : '-';

  return (
    <div className="bg-white p-5 rounded-[6px] border border-slate-200 flex flex-col justify-between h-full">
      <div>
        {/* Header Widget */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 mb-3.5">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-sky-600" />
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 tracking-tight">
              Profil Pengguna
            </h4>
          </div>

          {user.tipe_akun === 'admin' ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              Administrator
            </span>
          ) : user.status_kampus_terverifikasi ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <CheckCircle2 size={11} className="text-emerald-600" />
              <span>Civitas Terverifikasi</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              <span>Warga Kampus</span>
            </span>
          )}
        </div>

        {/* Profile Details */}
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-[6px] bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
            {getInitials(user.nama_lengkap)}
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                {user.nama_lengkap}
              </span>
              <span className="inline-flex items-center text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded-[4px]">
                {user.tipe_akun === 'admin'
                  ? 'Admin Platform'
                  : user.tipe_akun === 'campus'
                  ? (user.role_kampus ? user.role_kampus.charAt(0).toUpperCase() + user.role_kampus.slice(1) : 'Mahasiswa')
                  : 'Anggota Komunitas'}
              </span>
            </div>

            {user.tipe_akun === 'campus' ? (
              <p className="text-[11px] text-slate-500 flex items-center gap-1.5 truncate">
                <GraduationCap size={12} className="text-slate-400 shrink-0" />
                <span className="truncate">{user.universitas || 'Universitas'}</span>
              </p>
            ) : user.tipe_akun === 'admin' ? (
              <p className="text-[11px] text-amber-700 flex items-center gap-1.5 truncate">
                <ShieldAlert size={12} className="text-amber-600 shrink-0" />
                <span className="truncate">Mediator & Pengawas Kampus</span>
              </p>
            ) : (
              <p className="text-[11px] text-slate-500 flex items-center gap-1.5 truncate">
                <Users size={12} className="text-slate-400 shrink-0" />
                <span className="truncate">Pengguna Umum Kampus</span>
              </p>
            )}

            {user.tipe_akun === 'campus' && user.nim_nip && (
              <p className="text-[11px] font-mono text-slate-400">
                NIM: <span className="font-semibold text-slate-600">{maskedNIM}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Link */}
      <div className="pt-3 mt-3 border-t border-slate-100">
        <Link
          href="/profile"
          className="w-full inline-flex items-center justify-between py-2 px-3 rounded-[6px] border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-all group"
        >
          <span>Buka Profil Lengkap</span>
          <ArrowRight size={13} className="text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>
    </div>
  );
}
