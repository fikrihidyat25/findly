'use client';

import { useState } from 'react';
import AppSidebar from '@/src/components/layout/AppSidebar';
import AppHeader from '@/src/components/layout/AppHeader';
import QuickActions from '@/src/components/dashboard/QuickActions';
import ProfileVerificationCard from '@/src/components/dashboard/ProfileVerificationCard';
import QuickStats from '@/src/components/dashboard/QuickStats';
import RecentItemsFeed from '@/src/components/dashboard/RecentItemsFeed';
import SafetyTipBanner from '@/src/components/dashboard/SafetyTipBanner';

export default function DashboardPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans antialiased text-gray-900 selection:bg-[#30AFFF]/20 selection:text-[#30AFFF]">
      {/* Sidebar (Desktop Fixed & Mobile Drawer) */}
      <AppSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main App Content Area */}
      <div className="flex-1 md:pl-64 lg:pl-72 flex flex-col min-w-0">
        {/* Sticky App Header */}
        <AppHeader
          onOpenMobileMenu={() => setMobileSidebarOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Dashboard Main Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 sm:space-y-8">
          {/* Welcome Greeting Banner */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Selamat datang kembali, Budi!
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
        </main>
      </div>
    </div>
  );
}
