'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppSidebar from '@/src/components/layout/AppSidebar';
import AppHeader from '@/src/components/layout/AppHeader';
import LostItemForm from '@/src/components/lost/LostItemForm';
import { createClient } from '@/src/lib/supabase/client';

export default function NewLostItemPage() {
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkRole() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profil_pengguna')
            .select('tipe_akun, role_kampus')
            .eq('id', user.id)
            .single();

          if (profile?.tipe_akun === 'admin' || profile?.role_kampus === 'admin') {
            setIsAdmin(true);
            router.replace('/admin/laporan');
          }
        }
      } catch {
        // ignore
      }
    }
    checkRole();
  }, [router]);

  if (isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans antialiased text-gray-900 selection:bg-rose-500/20 selection:text-rose-600">
      {/* Sidebar */}
      <AppSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Container */}
      <div className="flex-1 md:pl-64 lg:pl-72 flex flex-col min-w-0">
        <AppHeader onOpenMobileMenu={() => setMobileSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <LostItemForm />
        </main>
      </div>
    </div>
  );
}
