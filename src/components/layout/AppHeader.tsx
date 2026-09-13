'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
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
import { AppNotification } from '@/src/lib/notifications';
import NotificationDropdown from '@/src/components/notifications/NotificationDropdown';

interface AppHeaderProps {
  onOpenMobileMenu?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  unreadNotifs?: number;
  unreadMessages?: number;
  notifications?: AppNotification[];
  onMarkAllAsRead?: () => void;
  onReadNotification?: (id: string) => void;
}

interface UserProfile {
  id: string;
  nama_lengkap: string;
  email: string;
  tipe_akun?: string;
  role_kampus?: string;
  universitas?: string;
  status_kampus_terverifikasi?: boolean;
  avatar_url?: string | null;
}

export default function AppHeader({
  onOpenMobileMenu,
  searchQuery = '',
  onSearchChange,
  unreadNotifs = 0,
  unreadMessages = 0,
  notifications = [],
  onMarkAllAsRead,
  onReadNotification,
}: AppHeaderProps) {
  const router = useRouter();
  const supabase = createClient();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const isAdminSession = typeof document !== 'undefined' && document.cookie.includes('findly_admin_session=true');
        const envAdminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@findly.com';

        if (isAdminSession) {
          const storedEmail = typeof localStorage !== 'undefined' ? localStorage.getItem('findly_admin_email') : null;
          setUser({
            id: 'admin-env-user',
            nama_lengkap: 'Super Administrator',
            email: storedEmail || envAdminEmail,
            tipe_akun: 'admin',
            role_kampus: 'Administrator',
            universitas: 'Findly System',
            status_kampus_terverifikasi: true,
            avatar_url: null,
          });
          setLoading(false);
          return;
        }

        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          setUser(null);
          setLoading(false);
          return;
        }

        const isEnvAdmin = authUser.email?.toLowerCase() === envAdminEmail.toLowerCase();

        const { data: profile } = await supabase
          .from('profil_pengguna')
          .select('*')
          .eq('id', authUser.id)
          .single();

        const nama = profile?.nama_lengkap || authUser.user_metadata?.nama_lengkap || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Pengguna';
        const rawTipe = profile?.tipe_akun || authUser.user_metadata?.tipe_akun || 'community';
        const isCampus = rawTipe === 'campus';
        const isAdmin = rawTipe === 'admin' || isEnvAdmin;
        const tipeAkun = isAdmin ? 'admin' : isCampus ? 'campus' : 'community';
        const avatar = profile?.avatar_url || authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || null;

        setUser({
          id: authUser.id,
          nama_lengkap: nama,
          email: authUser.email || '',
          tipe_akun: tipeAkun,
          role_kampus: isCampus ? (profile?.role_kampus || authUser.user_metadata?.role_kampus || 'Mahasiswa') : (isAdmin ? 'Administrator' : ''),
          universitas: isCampus ? (profile?.universitas || authUser.user_metadata?.universitas || '') : '',
          status_kampus_terverifikasi: isCampus ? (profile?.status_kampus_terverifikasi ?? false) : false,
          avatar_url: avatar,
        });

        // Auto-purge bloated base64 from user_metadata to keep JWT & cookies lightweight (< 2KB)
        if (
          authUser.user_metadata?.avatar_url?.startsWith('data:') ||
          authUser.user_metadata?.picture?.startsWith('data:')
        ) {
          supabase.auth.updateUser({
            data: {
              avatar_url: null,
              picture: null,
            },
          }).catch(() => {});
        }
      } catch (err) {
        console.error('Error loading header user:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();

    const handleProfileUpdated = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setUser((prev) =>
          prev
            ? {
                ...prev,
                nama_lengkap: customEvent.detail.nama_lengkap ?? prev.nama_lengkap,
                avatar_url: customEvent.detail.avatar_url ?? null,
              }
            : prev
        );
      }
      loadUser();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('findly:profile_updated', handleProfileUpdated);
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        const isAdminSession = typeof document !== 'undefined' && document.cookie.includes('findly_admin_session=true');
        if (!isAdminSession) {
          setUser(null);
        }
      } else {
        loadUser();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
      if (typeof window !== 'undefined') {
        window.removeEventListener('findly:profile_updated', handleProfileUpdated);
      }
    };
  }, []);

  const handleSignOut = async () => {
    setProfileDropdownOpen(false);
    document.cookie = 'findly_admin_session=; path=/; max-age=0';
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('findly_admin_session');
      localStorage.removeItem('findly_admin_email');
    }
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
      {/* Left: Mobile Menu Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
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
            {/* Notification Bell with Real-time Dropdown Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotifDropdownOpen(!notifDropdownOpen);
                  setProfileDropdownOpen(false);
                }}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                aria-label="Notifications"
              >
                <Bell size={19} className="stroke-[1.75]" />
                {unreadNotifs > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full border-2 border-white leading-none shadow-xs animate-in zoom-in-50">
                    {unreadNotifs > 9 ? '9+' : unreadNotifs}
                  </span>
                )}
              </button>

              <NotificationDropdown
                isOpen={notifDropdownOpen}
                onClose={() => setNotifDropdownOpen(false)}
                notifications={notifications}
                unreadCount={unreadNotifs}
                onMarkAllAsRead={() => onMarkAllAsRead?.()}
                onReadItem={(id) => onReadNotification?.(id)}
              />
            </div>

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
                <div className="relative shrink-0">
                  <div
                    className={`w-8 h-8 rounded-full overflow-hidden text-white font-bold flex items-center justify-center text-xs shadow-xs ${
                      user.avatar_url
                        ? 'bg-gray-100 border border-gray-200'
                        : user.tipe_akun === 'admin'
                          ? 'bg-gradient-to-tr from-amber-500 to-orange-500'
                          : 'bg-gradient-to-tr from-[#30AFFF] to-[#60c4ff]'
                    }`}
                  >
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.nama_lengkap}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getInitials(user.nama_lengkap)
                    )}
                  </div>
                  {user.status_kampus_terverifikasi && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center shadow-xs">
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
                      ? '🛡️ Admin Mediator'
                      : user.tipe_akun === 'campus'
                        ? (user.role_kampus ? user.role_kampus.charAt(0).toUpperCase() + user.role_kampus.slice(1) : 'Warga Kampus')
                        : 'Masyarakat Umum'}
                  </span>
                </div>

                <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full overflow-hidden text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0 ${
                        user.avatar_url
                          ? 'bg-gray-100 border border-gray-200'
                          : user.tipe_akun === 'admin'
                            ? 'bg-gradient-to-tr from-amber-500 to-orange-500'
                            : 'bg-gradient-to-tr from-[#30AFFF] to-[#60c4ff]'
                      }`}
                    >
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.nama_lengkap}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        getInitials(user.nama_lengkap)
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-gray-900 truncate">{user.nama_lengkap}</p>
                      <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                      {user.tipe_akun === 'admin' ? (
                        <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-semibold border border-amber-200">
                          <ShieldAlert size={10} />
                          <span>Admin Mediator</span>
                        </div>
                      ) : user.tipe_akun === 'campus' && user.status_kampus_terverifikasi ? (
                        <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                          <CheckCircle2 size={10} />
                          <span>University Verified</span>
                        </div>
                      ) : user.tipe_akun === 'campus' ? (
                        <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-semibold">
                          <GraduationCap size={10} />
                          <span>Warga Kampus</span>
                        </div>
                      ) : (
                        <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-semibold">
                          <span>Masyarakat Umum</span>
                        </div>
                      )}
                    </div>
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
