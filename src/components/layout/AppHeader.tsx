'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  MessageSquare,
  Menu,
  CheckCircle2,
  ChevronDown,
  User,
  Settings,
  LogOut,
  ShieldAlert,
  GraduationCap,
} from 'lucide-react';
import { createClient } from '@/src/lib/supabase/client';

interface AppHeaderProps {
  onOpenMobileMenu?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  unreadNotifs?: number;
  unreadMessages?: number;
}

interface UserProfile {
  id: string;
  nama_lengkap: string;
  email: string;
  tipe_akun?: string;
  role_kampus?: string;
  universitas?: string;
  status_kampus_terverifikasi?: boolean;
}

export default function AppHeader({
  onOpenMobileMenu,
  searchQuery = '',
  onSearchChange,
  unreadNotifs = 0,
  unreadMessages = 0,
}: AppHeaderProps) {
  const router = useRouter();
  const supabase = createClient();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
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
          role_kampus: isCampus ? (profile?.role_kampus || authUser.user_metadata?.role_kampus || 'Mahasiswa') : '',
          universitas: isCampus ? (profile?.universitas || authUser.user_metadata?.universitas || '') : '',
          status_kampus_terverifikasi: isCampus ? (profile?.status_kampus_terverifikasi ?? false) : false,
        });
      } catch (err) {
        console.error('Error loading header user:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
      } else {
        loadUser();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    setProfileDropdownOpen(false);
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login');
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-20 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu Toggle & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* Global Search Input */}
        <div className="relative w-full">
          <Search
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Cari barang hilang atau ditemukan..."
            className="w-full bg-gray-50/80 hover:bg-gray-50 focus:bg-white pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 border border-gray-200/80 focus:border-[#30AFFF] focus:ring-2 focus:ring-[#30AFFF]/20 focus:outline-none transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* Right: Notifications, Messages, and Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {loading ? (
          <div className="w-24 h-8 bg-gray-100 animate-pulse rounded-xl" />
        ) : !user ? (
          /* Guest State: Clear Masuk / Daftar Actions */
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:text-[#30AFFF] rounded-xl hover:bg-gray-50 border border-gray-200 transition-all cursor-pointer"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-[#30AFFF] hover:bg-[#2196E8] rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              Daftar
            </Link>
          </div>
        ) : (
          /* Authenticated User State */
          <>
            {/* Notification Bell */}
            <Link
              href="/notifications"
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
              aria-label="Notifications"
            >
              <Bell size={19} className="stroke-[1.75]" />
              {unreadNotifs > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full border-2 border-white leading-none shadow-xs">
                  {unreadNotifs > 9 ? '9+' : unreadNotifs}
                </span>
              )}
            </Link>

            {/* Messages */}
            <Link
              href="/messages"
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
              aria-label="Messages"
            >
              <MessageSquare size={19} className="stroke-[1.75]" />
              {unreadMessages > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-[#30AFFF] rounded-full border-2 border-white leading-none shadow-xs">
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </span>
              )}
            </Link>

            {/* User Profile Pill & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all cursor-pointer"
              >
                {/* Avatar with Verified Ring */}
                <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-[#30AFFF] to-[#60c4ff] text-white font-bold flex items-center justify-center text-xs shadow-xs">
                  {getInitials(user.nama_lengkap)}
                  {user.status_kampus_terverifikasi && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center">
                      <CheckCircle2 size={12} className="text-[#10B981] fill-white" />
                    </div>
                  )}
                </div>

                {/* Name & Role (Desktop) */}
                <div className="hidden lg:flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-gray-900 leading-none">
                      {user.nama_lengkap}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400 leading-none mt-1">
                    {user.tipe_akun === 'admin'
                      ? 'Administrator'
                      : user.tipe_akun === 'campus'
                      ? (user.role_kampus ? user.role_kampus.charAt(0).toUpperCase() + user.role_kampus.slice(1) : 'Civitas Kampus')
                      : 'Anggota Komunitas'}
                  </span>
                </div>

                <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2.5 border-b border-gray-50">
                    <p className="text-xs font-bold text-gray-900">{user.nama_lengkap}</p>
                    <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                    {user.tipe_akun === 'admin' ? (
                      <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[10px] font-medium">
                        <span>Administrator</span>
                      </div>
                    ) : user.tipe_akun === 'campus' && user.status_kampus_terverifikasi ? (
                      <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                        <CheckCircle2 size={10} />
                        <span>University Verified</span>
                      </div>
                    ) : user.tipe_akun === 'campus' ? (
                      <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-semibold">
                        <GraduationCap size={10} />
                        <span>Warga Kampus</span>
                      </div>
                    ) : (
                      <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-semibold">
                        <span>Community Member</span>
                      </div>
                    )}
                  </div>

                  <div className="py-1">
                    {user.tipe_akun === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#30AFFF] hover:bg-blue-50"
                      >
                        <ShieldAlert size={14} className="text-[#30AFFF]" />
                        <span>Panel Admin</span>
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    >
                      <User size={14} className="text-gray-400" />
                      <span>Profil Saya</span>
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    >
                      <Settings size={14} className="text-gray-400" />
                      <span>Pengaturan</span>
                    </Link>
                  </div>

                  <div className="border-t border-gray-50 pt-1">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 hover:bg-red-50 cursor-pointer text-left"
                    >
                      <LogOut size={14} />
                      <span>Keluar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
