'use client';

import { useState } from 'react';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';

interface AppLayoutProps {
  children: React.ReactNode;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  fullHeight?: boolean;
}

export default function AppLayout({
  children,
  searchQuery = '',
  onSearchChange,
  fullHeight = false,
}: AppLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div
      className={`bg-[#F8FAFC] flex font-sans antialiased text-gray-900 selection:bg-[#30AFFF]/20 selection:text-[#30AFFF] ${
        fullHeight ? 'h-screen overflow-hidden' : 'min-h-screen'
      }`}
    >
      {/* Sidebar (Desktop Fixed & Mobile Drawer) */}
      <AppSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Column */}
      <div
        className={`flex-1 md:pl-64 lg:pl-72 flex flex-col min-w-0 ${
          fullHeight ? 'h-screen overflow-hidden' : ''
        }`}
      >
        {/* Sticky Header */}
        <AppHeader
          onOpenMobileMenu={() => setMobileSidebarOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
        />

        {/* Content Viewport */}
        <main
          className={`flex-1 w-full mx-auto ${
            fullHeight
              ? 'p-2 sm:p-4 lg:p-5 max-w-7xl flex flex-col min-h-0 overflow-hidden'
              : 'p-4 sm:p-6 lg:p-8 max-w-7xl'
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
