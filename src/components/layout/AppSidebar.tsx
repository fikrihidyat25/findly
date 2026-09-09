'use client';
import { useState, useEffect } from 'react';
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
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  LayoutDashboard,
  FileText,
  Users,
} from 'lucide-react';
import { createClient } from '@/src/lib/supabase/client';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  unreadNotifs?: number;
  unreadMessages?: number;
}

export default function AppSidebar({
  mobileOpen = false,
  onCloseMobile,
  unreadNotifs = 0,
  unreadMessages = 0,
}: SidebarProps) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkRole() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsAdmin(false);
          return;
        }
        const { data: profile } = await supabase
          .from('profil_pengguna')
          .select('tipe_akun, role_kampus')
          .eq('id', user.id)
          .single();

        if (profile?.tipe_akun === 'admin' || profile?.role_kampus === 'admin' || user.user_metadata?.tipe_akun === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch {
        setIsAdmin(false);
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

  // 2. Dedicated Navigation for Administrator (No personal reporting, focused on moderation & mediation)
  const adminNavItems: NavItem[] = [
    { label: 'Dashboard Admin', href: '/admin', icon: LayoutDashboard },
    { label: 'Moderasi Laporan', href: '/admin/laporan', icon: FileText },
    { label: 'Mediasi Klaim', href: '/admin/klaim', icon: FileCheck2 },
    { label: 'Pesan & Mediasi', href: '/messages', icon: MessageSquare, badge: msgBadge },
    { label: 'Verifikasi Civitas', href: '/admin/pengguna', icon: Users },
    { label: 'Katalog Barang', href: '/find', icon: Search },
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
    if (href === '/admin') {
      return pathname === '/admin';
    }
    if (href === '/admin/laporan') {
      return pathname.startsWith('/admin/laporan');
    }
    if (href === '/admin/klaim') {
      return pathname.startsWith('/admin/klaim');
    }
    if (href === '/admin/pengguna') {
      return pathname.startsWith('/admin/pengguna');
    }
    if (href === '/dashboard' || href === '/beranda') {
      return pathname === '/dashboard' || pathname === '/beranda';
    }
    if (href === '/find') {
      return pathname.startsWith('/find') || pathname.startsWith('/cari-barang');
    }
    if (href === '/my-reports') {
      return pathname.startsWith('/my-reports') || pathname.startsWith('/laporan-saya');
    }
    if (href === '/lost/new') {
      return pathname.startsWith('/lost') || pathname.startsWith('/saya-kehilangan');
    }
    if (href === '/found/new') {
      return pathname.startsWith('/found') || pathname.startsWith('/saya-menemukan');
    }
    if (href === '/claims') {
      return pathname.startsWith('/claim') || pathname.startsWith('/klaim') || pathname.startsWith('/ajukan-klaim');
    }
    if (href === '/messages') {
      return pathname.startsWith('/messages') || pathname.startsWith('/pesan');
    }
    if (href === '/saved') {
      return pathname.startsWith('/saved') || pathname.startsWith('/disimpan');
    }
    if (href === '/notifications') {
      return pathname.startsWith('/notifications') || pathname.startsWith('/notifikasi');
    }
    if (href === '/safe-zones') {
      return pathname.startsWith('/safe-zones') || pathname.startsWith('/titik-temu');
    }
    if (href === '/profile') {
      return pathname.startsWith('/profile') || pathname.startsWith('/akun-saya');
    }
    if (href === '/settings') {
      return pathname.startsWith('/settings') || pathname.startsWith('/pengaturan');
    }
    if (href === '/help') {
      return pathname.startsWith('/help') || pathname.startsWith('/bantuan');
    }
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-gray-100/90 select-none">
      {/* Brand Logo Header */}
      <div className="px-6 py-5 flex items-center justify-between border-b border-gray-50">
        <Link href={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-2 group">
          <span className="text-2xl font-black tracking-tight text-[#30AFFF] group-hover:opacity-85 transition-opacity">
            Findly.
          </span>
        </Link>
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
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-200">
        {/* Main Nav Items */}
        <nav className="space-y-1">
          {currentNavItems.map((item) => {
            const active = isItemActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${active
                    ? 'bg-[#EFF8FF] text-[#30AFFF] font-semibold shadow-2xs'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={18}
                    className={active ? 'text-[#30AFFF] stroke-[2.2]' : 'text-gray-400 stroke-[1.75]'}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-2xs ${item.label === 'Notifikasi' ? 'bg-rose-500' : 'bg-[#30AFFF]'
                      }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Divider & Secondary Nav Items */}
        <div className="border-t border-gray-100 pt-3">
          <p className="px-3 text-[10px] font-semibold tracking-wider uppercase text-gray-400 mb-2">
            {isAdmin ? 'Pengaturan Admin' : 'Pengaturan Akun'}
          </p>
          <nav className="space-y-1">
            {currentSecondaryNavItems.map((item) => {
              const active = isItemActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${active
                      ? 'bg-[#EFF8FF] text-[#30AFFF] font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <Icon
                    size={18}
                    className={active ? 'text-[#30AFFF]' : 'text-gray-400 stroke-[1.75]'}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Promo / Action Card (Only on dashboard for regular users, NOT on other pages or for admin) */}
        {!isAdmin && (pathname === '/dashboard' || pathname === '/beranda') && (
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
      <div className="px-6 py-4 border-t border-gray-50 text-[11px] text-gray-400">
        © 2026 Findly Inc. Hak Cipta Dilindungi.
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed Left) */}
      <aside className="hidden md:flex w-64 lg:w-72 flex-col fixed inset-y-0 left-0 z-30">
        {sidebarContent}
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
        className={`fixed inset-y-0 left-0 w-72 z-50 md:hidden transform transition-transform duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {sidebarContent}
      </div>
    </>
  );
}
