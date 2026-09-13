'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/src/components/layout/AppLayout';
import QuickStats from '@/src/components/dashboard/QuickStats';
import RecentItemsFeed from '@/src/components/dashboard/RecentItemsFeed';
import SafetyTipBanner from '@/src/components/dashboard/SafetyTipBanner';
import { createClient } from '@/src/lib/supabase/client';

export default function DashboardPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profil_pengguna')
          .select('nama_lengkap, tipe_akun, role_kampus')
          .eq('id', user.id)
          .single();

        if (
          profile?.tipe_akun === 'admin' ||
          profile?.role_kampus === 'admin' ||
          user.user_metadata?.tipe_akun === 'admin'
        ) {
          router.replace('/admin');
          return;
        }

        const fullName = profile?.nama_lengkap || user.user_metadata?.nama_lengkap || user.user_metadata?.full_name || user.email?.split('@')[0];
        if (fullName) {
          const firstName = fullName.trim().split(' ')[0];
          setDisplayName(firstName);
        }
      }
    }
    loadUser();
  }, [router]);

  return (
    <AppLayout searchQuery={searchQuery} onSearchChange={setSearchQuery}>
      <div className="space-y-5 max-w-7xl mx-auto">
        {/* Crisp Hero Header */}
        <div className="pb-2 border-b border-gray-100">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              {displayName ? `Halo, ${displayName} 👋` : 'Selamat datang di Findly 👋'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-normal">
              Cari barang yang hilang atau laporkan temuan Anda untuk membantu sesama di sekitar kampus.
            </p>
          </div>
        </div>

        {/* Safety Tip Reminder at the Top */}
        <SafetyTipBanner />

        {/* Streamlined Metrics Status Ribbon */}
        <QuickStats />

        {/* Primary Content: Live Campus Items Feed with Real Photos & Anti-Fraud Shield */}
        <RecentItemsFeed />
      </div>
    </AppLayout>
  );
}
