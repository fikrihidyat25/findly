'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AppLayout from '@/src/components/layout/AppLayout';
import {
<<<<<<< HEAD
=======
  ShieldCheck,
  LayoutDashboard,
  FileText,
  FileCheck2,
  Users,
  MapPin,
>>>>>>> 1f218a6 (niateams)
  Loader2,
  ShieldAlert,
  ArrowLeft,
} from 'lucide-react';
import { createClient } from '@/src/lib/supabase/client';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    async function verifyAdminAccess() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        setUserEmail(user.email || '');

        const { data: profile } = await supabase
          .from('profil_pengguna')
          .select('tipe_akun, role_kampus')
          .eq('id', user.id)
          .single();

        const hasAdminRole =
          profile?.tipe_akun === 'admin' ||
          profile?.role_kampus === 'admin' ||
          user.user_metadata?.tipe_akun === 'admin';

        setIsAdmin(hasAdminRole);
      } catch (err) {
        console.error('Error verifying admin access:', err);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    verifyAdminAccess();
  }, [pathname]);

<<<<<<< HEAD
=======
  const navTabs = [
    { label: 'Ringkasan', href: '/admin', icon: LayoutDashboard },
    { label: 'Moderasi Laporan', href: '/admin/laporan', icon: FileText },
    { label: 'Kelola Klaim', href: '/admin/klaim', icon: FileCheck2 },
    { label: 'Pengguna & Civitas', href: '/admin/pengguna', icon: Users },
    { label: 'Titik Temu Kampus', href: '/safe-zones', icon: MapPin },
  ];

>>>>>>> 1f218a6 (niateams)
  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
          <Loader2 size={28} className="animate-spin text-[#30AFFF] mb-3" />
          <p className="text-xs text-gray-500 font-medium">Memverifikasi hak akses administrator...</p>
        </div>
      </AppLayout>
    );
  }

  if (!isAdmin) {
    return (
      <AppLayout>
        <div className="max-w-lg mx-auto my-16 bg-white p-8 rounded-2xl border border-gray-200 text-center shadow-2xs">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mx-auto mb-4 border border-red-100">
            <ShieldAlert size={24} />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Akses Dibatasi</h2>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            Halaman ini khusus untuk Administrator Findly. Akun Anda saat ini (
            <span className="font-semibold text-gray-700">{userEmail || 'Tamu'}</span>) tidak memiliki wewenang administratif.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-all"
            >
              <ArrowLeft size={14} />
              <span>Kembali ke Beranda</span>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#30AFFF] hover:bg-[#2196E8] text-white text-xs font-semibold transition-all"
            >
              <span>Masuk Akun Admin</span>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
<<<<<<< HEAD
=======
        {/* Formal Admin Page Header */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#30AFFF] shrink-0">
                <ShieldCheck size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                    Panel Administrasi
                  </h1>
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#30AFFF] border border-blue-100 text-[10px] font-semibold">
                    Resmi
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Pusat kendali sistem, verifikasi civitas, dan mediasi laporan Findly.
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs text-gray-400">
              <p className="font-medium text-gray-700">Administrator</p>
              <p className="text-[11px] truncate max-w-xs">{userEmail}</p>
            </div>
          </div>

          {/* Clean Administrative Navigation Tabs */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive =
                tab.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(tab.href);

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${isActive
                      ? 'bg-[#EFF8FF] text-[#30AFFF] shadow-2xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  <Icon size={15} className={isActive ? 'text-[#30AFFF]' : 'text-gray-400'} />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

>>>>>>> 1f218a6 (niateams)
        {/* Content Area */}
        <main>{children}</main>
      </div>
    </AppLayout>
  );
}
