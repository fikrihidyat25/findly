'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, PackageMinus } from 'lucide-react';
import AppLayout from '@/src/components/layout/AppLayout';
import QuickStats from '@/src/components/dashboard/QuickStats';
import RecentItemsFeed from '@/src/components/dashboard/RecentItemsFeed';
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
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Crisp Hero Header with Direct Action CTAs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              {displayName ? `Halo, ${displayName} 👋` : 'Selamat datang di Findly 👋'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-normal">
              Cari barang yang hilang atau laporkan temuan Anda untuk membantu sesama di sekitar kampus.
            </p>
          </div>

          {/* Quick Action CTAs */}
          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
            <Link
              href="/lost/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50/80 hover:border-rose-300 text-xs sm:text-sm font-semibold transition-all shadow-2xs cursor-pointer group"
            >
              <PackageMinus size={16} className="stroke-[2] text-rose-500 group-hover:scale-110 transition-transform" />
              <span>Saya Kehilangan</span>
            </Link>
            <Link
              href="/found/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#30AFFF] hover:bg-[#209be6] text-white text-xs sm:text-sm font-semibold transition-all shadow-2xs hover:shadow cursor-pointer group"
            >
              <Plus size={16} className="stroke-[2.2] group-hover:rotate-90 transition-transform duration-200" />
              <span>Saya Menemukan</span>
            </Link>
          </div>
        </div>

        {/* Streamlined Metrics Status Ribbon */}
        <QuickStats />

        {/* Primary Content: Live Campus Items Feed with Real Photos & Anti-Fraud Shield */}
        <RecentItemsFeed />
      </div>
    </AppLayout>
  );
}
