'use client';

import { useState, useEffect, useCallback } from 'react';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';
import { createClient } from '@/src/lib/supabase/client';
import { fetchUnreadCounts } from '@/src/lib/notifications';

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
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const loadCounts = useCallback(async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const counts = await fetchUnreadCounts(user.id);
      setUnreadNotifs(counts.unreadNotifs);
      setUnreadMessages(counts.unreadMessages);
    } catch {
      // silently ignore
    }
  }, []);

  useEffect(() => {
    loadCounts();

    const handleStorageOrFocus = () => {
      loadCounts();
    };

    window.addEventListener('focus', handleStorageOrFocus);
    window.addEventListener('storage', handleStorageOrFocus);
    window.addEventListener('findly:counts_updated', handleStorageOrFocus);

    // Setup Supabase realtime subscriptions
    const supabase = createClient();
    const channel = supabase
      .channel('app_layout_realtime_counts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'klaim_barang' },
        () => {
          loadCounts();
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'pesan_chat' },
        () => {
          loadCounts();
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('focus', handleStorageOrFocus);
      window.removeEventListener('storage', handleStorageOrFocus);
      window.removeEventListener('findly:counts_updated', handleStorageOrFocus);
      supabase.removeChannel(channel);
    };
  }, [loadCounts]);

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
        unreadNotifs={unreadNotifs}
        unreadMessages={unreadMessages}
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
          unreadNotifs={unreadNotifs}
          unreadMessages={unreadMessages}
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
