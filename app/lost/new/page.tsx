'use client';

import { useState } from 'react';
import AppSidebar from '@/src/components/layout/AppSidebar';
import AppHeader from '@/src/components/layout/AppHeader';
import LostItemForm from '@/src/components/lost/LostItemForm';

export default function NewLostItemPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
