'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/src/components/layout/AppLayout';
import QuickActions from '@/src/components/dashboard/QuickActions';
import ProfileVerificationCard from '@/src/components/dashboard/ProfileVerificationCard';
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
      <div className="space-y-6 sm:space-y-8">
        {/* Welcome Greeting Banner */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {displayName ? `Selamat datang kembali, ${displayName}!` : 'Selamat datang di Findly!'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-normal">
            Mari bersama ciptakan lingkungan kampus yang aman, transparan, dan peduli sesama.
          </p>
        </div>

        {/* Quick Actions & Profile Widget Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left: Quick Actions (Saya Kehilangan & Saya Menemukan) */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            <QuickActions />
          </div>

          {/* Right: Profile & University Verification Card */}
          <div className="lg:col-span-4">
            <ProfileVerificationCard />
          </div>
        </div>

        {/* Quick Metrics Statistics */}
        <QuickStats />

        {/* Recent Items Feed */}
        <RecentItemsFeed />

        {/* Safety Tip Banner */}
        <SafetyTipBanner />
      </div>
    </AppLayout>
  );
}
