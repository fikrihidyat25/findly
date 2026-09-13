'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Search,
  AlertCircle,
  HelpCircle,
  FileCheck2,
  MessageSquare,
  Bookmark,
  Bell,
  User,
  Settings,
  LifeBuoy,
  PlusCircle,
  X,
  Sparkles,
  LayoutDashboard,
  FileText,
  Users,
  MapPin,
  Sliders,
  Pin,
} from 'lucide-react';
import { createClient } from '@/src/lib/supabase/client';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  unreadNotifs?: number;
  unreadMessages?: number;
  isPinned?: boolean;
  onTogglePin?: () => void;
}

export default function AppSidebar({
  mobileOpen = false,
  onCloseMobile,
  unreadNotifs = 0,
  unreadMessages = 0,
  isPinned = false,
  onTogglePin,
}: SidebarProps) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [roleLoading, setRoleLoading] = useState(true);

  // Dynamic hover & motion responsiveness
  const [isHovered, setIsHovered] = useState(false);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sidebar expanded if pinned or currently hovered with mouse movement
  const isExpanded = Boolean(isPinned || isHovered);

  const resetIdleTimer = () => {
    if (isPinned) return;
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    // Jika tidak ada gerakan kursor selama 3.5 detik di area sidebar, otomatis collapse ke ikon saja
    idleTimerRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 3500);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    resetIdleTimer();
  };

  const handleMouseMove = () => {
    if (!isHovered) {
      setIsHovered(true);
    }
    resetIdleTimer();
  };

  const handleMouseLeave = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    setIsHovered(false);
  };

  useEffect(() => {
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  useEffect(() => {
    async function checkRole() {
      setRoleLoading(true);
      try {
        const isAdminSession = typeof document !== 'undefined' && document.cookie.includes('findly_admin_session=true');
        const envAdminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@findly.com';

        if (isAdminSession) {
          setIsAdmin(true);
          return;
        }

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsAdmin(false);
          return;
        }

        const isEnvAdmin = user.email?.toLowerCase() === envAdminEmail.toLowerCase();

        const { data: profile } = await supabase
          .from('profil_pengguna')
          .select('tipe_akun, role_kampus')
          .eq('id', user.id)
          .single();

        if (isEnvAdmin || profile?.tipe_akun === 'admin' || profile?.role_kampus === 'admin' || user.user_metadata?.tipe_akun === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch {
        setIsAdmin(false);
      } finally {
        setRoleLoading(false);
      }
    }

    checkRole();
  }, [pathname]);

  interface NavItem {
    label: string;
    href: string;
    icon: any;
    badge?: number | string;
  }

  const msgBadge = unreadMessages > 0 ? (unreadMessages > 9 ? '9+' : unreadMessages) : undefined;
  const notifBadge = unreadNotifs > 0 ? (unreadNotifs > 9 ? '9+' : unreadNotifs) : undefined;

  // 1. Navigation for Normal Student / Community User
  const userNavItems: NavItem[] = [
    { label: 'Beranda', href: '/dashboard', icon: Home },
    { label: 'Cari Barang', href: '/find', icon: Search },
    { label: 'Laporan Saya', href: '/my-reports', icon: FileText },
    { label: 'Saya Kehilangan', href: '/lost/new', icon: AlertCircle },
    { label: 'Saya Menemukan', href: '/found/new', icon: HelpCircle },
    { label: 'Klaim Saya', href: '/claims', icon: FileCheck2 },
    { label: 'Pesan', href: '/messages', icon: MessageSquare, badge: msgBadge },
    { label: 'Disimpan', href: '/saved', icon: Bookmark },
    { label: 'Notifikasi', href: '/notifications', icon: Bell, badge: notifBadge },
  ];

  // 2. Dedicated Navigation for Administrator
  const adminNavItems: NavItem[] = [
    { label: 'Dashboard Admin', href: '/admin', icon: LayoutDashboard },
    { label: 'Moderasi Laporan', href: '/admin/laporan', icon: FileText },
    { label: 'Mediasi Klaim', href: '/admin/klaim', icon: FileCheck2 },
    { label: 'Titik Temu', href: '/admin/titik-temu', icon: MapPin },
    { label: 'Master Data', href: '/admin/master-data', icon: Sliders },
    { label: 'Pesan & Mediasi', href: '/messages', icon: MessageSquare, badge: msgBadge },
    { label: 'Verifikasi Warga Kampus', href: '/admin/pengguna', icon: Users },
    { label: 'Notifikasi', href: '/notifications', icon: Bell, badge: notifBadge },
  ];

  const currentNavItems = isAdmin ? adminNavItems : userNavItems;

  const userSecondaryNavItems = [
    { label: 'Akun Saya', href: '/profile', icon: User },
    { label: 'Pengaturan', href: '/settings', icon: Settings },
    { label: 'Bantuan', href: '/help', icon: LifeBuoy },
  ];

  const adminSecondaryNavItems = [
    { label: 'Akun Admin', href: '/profile', icon: User },
    { label: 'Pengaturan', href: '/settings', icon: Settings },
    { label: 'Bantuan', href: '/help', icon: LifeBuoy },
  ];

  const currentSecondaryNavItems = isAdmin ? adminSecondaryNavItems : userSecondaryNavItems;

  const isItemActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    if (href === '/admin/laporan') return pathname.startsWith('/admin/laporan');
    if (href === '/admin/klaim') return pathname.startsWith('/admin/klaim');
    if (href === '/admin/titik-temu') return pathname.startsWith('/admin/titik-temu');
    if (href === '/admin/master-data') return pathname.startsWith('/admin/master-data');
    if (href === '/admin/pengguna') return pathname.startsWith('/admin/pengguna');
    if (href === '/dashboard' || href === '/beranda') return pathname === '/dashboard' || pathname === '/beranda';
    if (href === '/find') return pathname.startsWith('/find') || pathname.startsWith('/cari-barang');
    if (href === '/my-reports') return pathname.startsWith('/my-reports') || pathname.startsWith('/laporan-saya');
    if (href === '/lost/new') return pathname.startsWith('/lost') || pathname.startsWith('/saya-kehilangan');
    if (href === '/found/new') return pathname.startsWith('/found') || pathname.startsWith('/saya-menemukan');
    if (href === '/claims') return pathname.startsWith('/claim') || pathname.startsWith('/klaim') || pathname.startsWith('/ajukan-klaim');
    if (href === '/messages') return pathname.startsWith('/messages') || pathname.startsWith('/pesan');
    if (href === '/saved') return pathname.startsWith('/saved') || pathname.startsWith('/disimpan');
    if (href === '/notifications') return pathname.startsWith('/notifications') || pathname.startsWith('/notifikasi');
    if (href === '/safe-zones') return pathname.startsWith('/safe-zones') || pathname.startsWith('/titik-temu');
    if (href === '/profile') return pathname.startsWith('/profile') || pathname.startsWith('/akun-saya');
    if (href === '/settings') return pathname.startsWith('/settings') || pathname.startsWith('/pengaturan');
    if (href === '/help') return pathname.startsWith('/help') || pathname.startsWith('/bantuan');
    return pathname.startsWith(href);
  };

  const renderSidebarContent = (expanded: boolean) => (
    <div className="flex flex-col h-full bg-white border-r border-gray-100/90 select-none overflow-hidden">
      {/* Brand Logo Header */}
      <div
        className={`py-4 flex items-center border-b border-gray-50 h-[68px] shrink-0 transition-all duration-300 ${
          expanded ? 'px-5 justify-between' : 'px-2 justify-center'
        }`}
      >
        <Link
          href={isAdmin ? '/admin' : '/dashboard'}
          className="flex items-center gap-2.5 group overflow-hidden"
          title="Findly Campus"
        >
          {expanded ? (
            <div className="flex items-center gap-2 min-w-0 transition-all duration-200">
              <span className="text-2xl font-black tracking-tight text-[#30AFFF] group-hover:opacity-85 transition-opacity">
                Findly.
              </span>
              {isAdmin && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#30AFFF] border border-blue-200 uppercase tracking-wider shrink-0">
                  Admin
                </span>
              )}
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#30AFFF] to-[#2196E8] flex items-center justify-center text-white font-black text-xl shadow-xs group-hover:scale-105 transition-transform shrink-0">
              F<span className="text-white/80 text-sm leading-none">.</span>
            </div>
          )}
        </Link>

        {/* Pin / Lock button on desktop when expanded */}
        {expanded && onTogglePin && (
          <button
            type="button"
            onClick={onTogglePin}
            className={`hidden md:flex p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
              isPinned
                ? 'text-[#30AFFF] bg-blue-50 hover:bg-blue-100'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
            title={isPinned ? 'Lepas sematan (Otomatis mengecil saat kursor diam)' : 'Sematkan sidebar (Tetap terbuka)'}
          >
            <Pin size={15} className={isPinned ? 'fill-[#30AFFF]' : ''} />
          </button>
        )}

        {/* Close button on mobile */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation Scrollable Area */}
      <div
        className={`flex-1 overflow-y-auto py-3 space-y-5 scrollbar-thin scrollbar-thumb-gray-200 ${
          expanded ? 'px-3.5' : 'px-2'
        }`}
      >
        {/* Main Nav Items */}
        <nav className="space-y-1">
          {roleLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`flex items-center rounded-xl p-2.5 ${
                  expanded ? 'gap-3' : 'justify-center'
                }`}
              >
                <div className="w-[18px] h-[18px] rounded bg-gray-100 animate-pulse shrink-0" />
                {expanded && (
                  <div
                    className={`h-3.5 rounded bg-gray-100 animate-pulse ${
                      i % 2 === 0 ? 'w-24' : 'w-20'
                    }`}
                  />
                )}
              </div>
            ))
          ) : (
            currentNavItems.map((item) => {
              const active = isItemActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onCloseMobile}
                  title={!expanded ? item.label : undefined}
                  className={`relative flex items-center rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    expanded
                      ? 'justify-between px-3 py-2.5'
                      : 'justify-center w-10 h-10 mx-auto'
                  } ${
                    active
                      ? 'bg-[#EFF8FF] text-[#30AFFF] font-semibold shadow-2xs'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className={`flex items-center ${expanded ? 'gap-3 min-w-0' : 'justify-center'}`}>
                    <Icon
                      size={18}
                      className={`shrink-0 ${
                        active ? 'text-[#30AFFF] stroke-[2.2]' : 'text-gray-400 stroke-[1.75]'
                      }`}
                    />
                    {expanded && <span className="truncate">{item.label}</span>}
                  </div>

                  {/* Badge when expanded: full pill */}
                  {expanded && item.badge && (
                    <span
                      className={`text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-2xs shrink-0 ${
                        item.label === 'Notifikasi' ? 'bg-rose-500' : 'bg-[#30AFFF]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {/* Badge when collapsed: compact dot */}
                  {!expanded && item.badge && (
                    <span
                      className={`absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                        item.label === 'Notifikasi' ? 'bg-rose-500' : 'bg-[#30AFFF]'
                      }`}
                    />
                  )}
                </Link>
              );
            })
          )}
        </nav>

        {/* Divider & Secondary Nav Items */}
        <div className="border-t border-gray-100 pt-3">
          {expanded ? (
            <p className="px-3 text-[10px] font-semibold tracking-wider uppercase text-gray-400 mb-2 truncate">
              {isAdmin ? 'Pengaturan Admin' : 'Pengaturan Akun'}
            </p>
          ) : (
            <div className="w-6 mx-auto border-t border-gray-200/80 mb-2" />
          )}
          <nav className="space-y-1">
            {currentSecondaryNavItems.map((item) => {
              const active = isItemActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onCloseMobile}
                  title={!expanded ? item.label : undefined}
                  className={`flex items-center rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    expanded
                      ? 'gap-3 px-3 py-2.5'
                      : 'justify-center w-10 h-10 mx-auto'
                  } ${
                    active
                      ? 'bg-[#EFF8FF] text-[#30AFFF] font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon
                    size={18}
                    className={`shrink-0 ${
                      active ? 'text-[#30AFFF]' : 'text-gray-400 stroke-[1.75]'
                    }`}
                  />
                  {expanded && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Promo / Action Card (Only when expanded on dashboard for regular users) */}
        {expanded && !isAdmin && (pathname === '/dashboard' || pathname === '/beranda') && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#EBF7FF] to-[#E0F2FE] p-4 border border-[#BAE6FD]/60 shadow-2xs">
            <div className="relative z-10 space-y-2">
              <div className="flex items-center gap-1.5 text-[#0369A1] text-xs font-semibold">
                <Sparkles size={14} className="text-[#0284C7]" />
                <span>Aksi Positif</span>
              </div>
              <h4 className="font-bold text-xs text-gray-900 leading-snug">
                Laporkan barang yang Anda temukan.
              </h4>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Bantu teman kampus mendapatkan kembali barang berharganya.
              </p>
              <Link
                href="/found/new"
                onClick={onCloseMobile}
                className="inline-flex items-center justify-center gap-1.5 w-full mt-2 bg-[#10B981] hover:bg-[#059669] active:scale-[0.98] text-white text-xs font-semibold py-2 px-3 rounded-lg shadow-sm transition-all"
              >
                <PlusCircle size={14} />
                <span>Laporkan Sekarang</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Footer Copyright */}
      {expanded && (
        <div className="px-5 py-3.5 border-t border-gray-50 text-[10.5px] text-gray-400 truncate">
          © 2026 Findly Inc.
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed Left with Motion & Hover Expand) */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`hidden md:flex flex-col fixed inset-y-0 left-0 z-30 transition-all duration-300 ease-in-out ${
          isExpanded
            ? 'w-64 lg:w-72 shadow-xl border-r border-slate-200/90'
            : 'w-[72px] shadow-xs border-r border-slate-100'
        }`}
      >
        {renderSidebarContent(isExpanded)}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      {/* Mobile Drawer Content */}
      <div
        className={`fixed inset-y-0 left-0 w-72 z-50 md:hidden transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {renderSidebarContent(true)}
      </div>
    </>
  );
}
