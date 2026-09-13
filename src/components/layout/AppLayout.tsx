'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';
import { createClient } from '@/src/lib/supabase/client';
import {
  AppNotification,
  fetchUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/src/lib/notifications';
import { playNotificationSound } from '@/src/lib/audioNotification';
import NotificationToast from '@/src/components/notifications/NotificationToast';

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
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isSidebarPinned, setIsSidebarPinned] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('findly_sidebar_pinned');
      if (saved !== null) {
        setIsSidebarPinned(saved === 'true');
      }
    } catch {}
  }, []);

  const handleTogglePin = useCallback(() => {
    setIsSidebarPinned((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('findly_sidebar_pinned', String(next));
      } catch {}
      return next;
    });
  }, []);

  const isExpanded = isSidebarPinned || isSidebarHovered;

  const prevLatestNotifIdRef = useRef<string | null>(null);
  const isInitialMountRef = useRef(true);

  const loadNotifications = useCallback(async () => {
    try {
      const supabase = createClient();
      const isAdminSession =
        typeof document !== 'undefined' && document.cookie.includes('findly_admin_session=true');
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const userId = user?.id || (isAdminSession ? 'admin-env-user' : null);
      if (!userId) return;

      setCurrentUserId(userId);

      const notifs = await fetchUserNotifications(userId);
      setNotifications(notifs);

      const unreadN = notifs.filter((n) => n.unread && n.type !== 'chat').length;
      const unreadM = notifs.filter((n) => n.unread && n.type === 'chat').length;
      setUnreadNotifs(unreadN);
      setUnreadMessages(unreadM);

      // Check for incoming new unread notification to trigger toast & sound
      if (notifs.length > 0) {
        const newest = notifs[0];
        if (
          !isInitialMountRef.current &&
          newest.unread &&
          newest.id !== prevLatestNotifIdRef.current
        ) {
          const isMessagesPage = typeof window !== 'undefined' && window.location.pathname.startsWith('/messages');
          if (!(isMessagesPage && newest.type === 'chat')) {
            setActiveToast(newest);
            playNotificationSound();
          }
        }
        prevLatestNotifIdRef.current = newest.id;
      }
      isInitialMountRef.current = false;
    } catch {
      // silently ignore
    }
  }, []);

  const handleMarkAllAsRead = useCallback(() => {
    if (!currentUserId) return;
    const ids = notifications.map((n) => n.id);
    markAllNotificationsAsRead(currentUserId, ids);
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    setUnreadNotifs(0);
    setUnreadMessages(0);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('findly:counts_updated'));
    }
  }, [currentUserId, notifications]);

  const handleReadNotification = useCallback(
    (id: string) => {
      if (!currentUserId) return;
      markNotificationAsRead(currentUserId, id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
      );
      setUnreadNotifs((prev) => Math.max(0, prev - 1));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('findly:counts_updated'));
      }
    },
    [currentUserId]
  );

  useEffect(() => {
    loadNotifications();

    const handleStorageOrFocus = () => {
      loadNotifications();
    };

    window.addEventListener('focus', handleStorageOrFocus);
    window.addEventListener('storage', handleStorageOrFocus);
    window.addEventListener('findly:counts_updated', handleStorageOrFocus);

    // Heartbeat polling: every 5 seconds for instant updates without reload
    const interval = setInterval(loadNotifications, 5000);

    // Setup Supabase realtime subscriptions
    const supabase = createClient();
    const channel = supabase
      .channel('app_layout_realtime_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'klaim_barang' },
        () => {
          loadNotifications();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pesan_chat' },
        () => {
          loadNotifications();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'laporan_barang' },
        () => {
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('focus', handleStorageOrFocus);
      window.removeEventListener('storage', handleStorageOrFocus);
      window.removeEventListener('findly:counts_updated', handleStorageOrFocus);
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [loadNotifications]);

  return (
    <div
      className={`bg-[#F8FAFC] flex font-sans antialiased text-gray-900 selection:bg-[#30AFFF]/20 selection:text-[#30AFFF] ${
        fullHeight ? 'h-screen overflow-hidden' : 'min-h-screen'
      }`}
    >
      {/* Floating In-App Toast Notification */}
      <NotificationToast
        notification={activeToast}
        onClose={() => setActiveToast(null)}
        onRead={handleReadNotification}
      />

      {/* Sidebar (Desktop Fixed with Hover/Motion Expand & Mobile Drawer) */}
      <AppSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        unreadNotifs={unreadNotifs}
        unreadMessages={unreadMessages}
        isPinned={isSidebarPinned}
        onTogglePin={handleTogglePin}
        isHovered={isSidebarHovered}
        onHoverChange={setIsSidebarHovered}
      />

      {/* Main Content Column with Smooth Padding Transition (shifts search & content seamlessly without overlap) */}
      <div
        className={`flex-1 ${
          isExpanded ? 'md:pl-64 lg:pl-72' : 'md:pl-[72px]'
        } flex flex-col min-w-0 transition-[padding] duration-300 ease-in-out ${
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
          notifications={notifications}
          onMarkAllAsRead={handleMarkAllAsRead}
          onReadNotification={handleReadNotification}
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
