'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import AppLayout from '@/src/components/layout/AppLayout';
import {
  Bell,
  MessageSquare,
  AlertCircle,
  FileCheck2,
  Clock,
  ShieldCheck,
  CheckCheck,
  Loader2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { createClient } from '@/src/lib/supabase/client';
import {
  AppNotification,
  fetchUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/src/lib/notifications';
import { playNotificationSound } from '@/src/lib/audioNotification';

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread' | 'chat' | 'claim'>('all');
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const prevFirstIdRef = useRef<string | null>(null);
  const isInitialRef = useRef(true);

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      const supabase = createClient();
      const isAdminSession =
        typeof document !== 'undefined' && document.cookie.includes('findly_admin_session=true');
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const currentUid = user?.id || (isAdminSession ? 'admin-env-user' : null);
      if (currentUid) {
        setUserId(currentUid);
        const data = await fetchUserNotifications(currentUid);

        // Sound alert if new notification arrived while staying on this tab
        if (data.length > 0 && !isInitialRef.current) {
          const newest = data[0];
          if (newest.unread && newest.id !== prevFirstIdRef.current) {
            playNotificationSound();
          }
        }
        if (data.length > 0) {
          prevFirstIdRef.current = data[0].id;
        }
        isInitialRef.current = false;

        setItems(data);
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData(false);

    const handleUpdateEvent = () => {
      loadData(true);
    };

    window.addEventListener('focus', handleUpdateEvent);
    window.addEventListener('storage', handleUpdateEvent);
    window.addEventListener('findly:counts_updated', handleUpdateEvent);

    // Live Heartbeat Polling: every 4 seconds for instant real-time sync without reload
    const pollTimer = setInterval(() => {
      loadData(true);
    }, 4000);

    // Supabase Realtime Channels
    const supabase = createClient();
    const channel = supabase
      .channel('notifications_page_realtime_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'klaim_barang' },
        () => loadData(true)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pesan_chat' },
        () => loadData(true)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'laporan_barang' },
        () => loadData(true)
      )
      .subscribe();

    return () => {
      window.removeEventListener('focus', handleUpdateEvent);
      window.removeEventListener('storage', handleUpdateEvent);
      window.removeEventListener('findly:counts_updated', handleUpdateEvent);
      clearInterval(pollTimer);
      supabase.removeChannel(channel);
    };
  }, [loadData]);

  const handleMarkAllAsRead = () => {
    if (!userId) return;
    const ids = items.map((i) => i.id);
    markAllNotificationsAsRead(userId, ids);
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('findly:counts_updated'));
    }
  };

  const handleClickItem = (notifId: string) => {
    if (!userId) return;
    markNotificationAsRead(userId, notifId);
    setItems((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, unread: false } : n))
    );
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('findly:counts_updated'));
    }
  };

  const filteredItems = items.filter((item) => {
    if (filter === 'unread') return item.unread;
    if (filter === 'chat') return item.type === 'chat';
    if (filter === 'claim') return item.type === 'claim' || item.type === 'found';
    return true;
  });

  const unreadCount = items.filter((i) => i.unread).length;
  const chatCount = items.filter((i) => i.type === 'chat').length;
  const claimCount = items.filter((i) => i.type === 'claim' || i.type === 'found').length;

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Notifikasi
              </h1>
              {/* Real-time Indicator Badge */}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>Live Real-time</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">
              Pembaruan langsung aktivitas klaim barang, pesan chat verifikasi, dan laporan kampus tanpa perlu reload.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => loadData(false)}
              disabled={refreshing}
              className="p-2.5 rounded-2xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 transition-all cursor-pointer shadow-2xs"
              title="Segarkan notifikasi sekarang"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin text-[#30AFFF]' : ''} />
            </button>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-sky-50 text-[#30AFFF] hover:bg-sky-100 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                <CheckCheck size={14} />
                <span>Tandai Semua Dibaca</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-2xl overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              filter === 'all'
                ? 'bg-white text-gray-900 shadow-2xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Bell size={13} className={filter === 'all' ? 'text-[#30AFFF]' : 'text-gray-400'} />
            <span>Semua</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-gray-200/80 text-gray-700 font-semibold">
              {items.length}
            </span>
          </button>

          <button
            onClick={() => setFilter('unread')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              filter === 'unread'
                ? 'bg-white text-gray-900 shadow-2xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Belum Dibaca</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${
                unreadCount > 0 ? 'bg-rose-500 text-white' : 'bg-gray-200/80 text-gray-700'
              }`}
            >
              {unreadCount}
            </span>
          </button>

          <button
            onClick={() => setFilter('chat')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              filter === 'chat'
                ? 'bg-white text-gray-900 shadow-2xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <MessageSquare size={13} className={filter === 'chat' ? 'text-[#30AFFF]' : 'text-gray-400'} />
            <span>Pesan Chat</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-gray-200/80 text-gray-700 font-semibold">
              {chatCount}
            </span>
          </button>

          <button
            onClick={() => setFilter('claim')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              filter === 'claim'
                ? 'bg-white text-gray-900 shadow-2xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <FileCheck2 size={13} className={filter === 'claim' ? 'text-amber-500' : 'text-gray-400'} />
            <span>Klaim & Laporan</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-gray-200/80 text-gray-700 font-semibold">
              {claimCount}
            </span>
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center flex flex-col items-center justify-center gap-3 shadow-2xs">
            <Loader2 size={28} className="animate-spin text-[#30AFFF]" />
            <p className="text-xs text-gray-400">Sinkronisasi notifikasi real-time...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center space-y-3 shadow-2xs">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#30AFFF] flex items-center justify-center mx-auto border border-blue-100">
              <Bell size={24} />
            </div>
            <h3 className="font-bold text-sm text-gray-800">Tidak Ada Notifikasi</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
              {filter === 'unread'
                ? 'Semua notifikasi telah Anda baca. Saat ada aktivitas baru, akan langsung tampil otomatis di sini!'
                : 'Belum ada aktivitas klaim atau pesan baru untuk akun Anda saat ini.'}
            </p>
          </div>
        ) : (
          /* Notifications List */
          <div className="space-y-2.5">
            {filteredItems.map((item) => {
              return (
                <Link
                  key={item.id}
                  href={item.link}
                  onClick={() => handleClickItem(item.id)}
                  className={`block p-4 sm:p-5 rounded-2xl border transition-all duration-200 group ${
                    item.unread
                      ? 'bg-white border-blue-200 shadow-2xs hover:shadow-md hover:border-[#30AFFF]'
                      : 'bg-white/80 border-gray-100 hover:border-gray-200 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 shadow-2xs border ${
                        item.type === 'chat'
                          ? 'bg-blue-50 text-[#30AFFF] border-blue-100'
                          : item.type === 'claim'
                          ? 'bg-amber-50 text-amber-600 border-amber-100'
                          : item.type === 'found'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : item.type === 'resolved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}
                    >
                      {item.type === 'chat' ? (
                        <MessageSquare size={18} />
                      ) : item.type === 'claim' ? (
                        <FileCheck2 size={18} />
                      ) : item.type === 'found' ? (
                        <AlertCircle size={18} />
                      ) : item.type === 'resolved' ? (
                        <ShieldCheck size={18} />
                      ) : (
                        <Bell size={18} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 truncate">
                          <h4 className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-[#30AFFF] transition-colors truncate">
                            {item.title}
                          </h4>
                          {item.unread && (
                            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                              Baru
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-gray-400 shrink-0">
                          <Clock size={11} />
                          <span>{item.timeAgo}</span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-600 leading-relaxed mt-1">
                        {item.desc}
                      </p>

                      {item.itemTitle && (
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-gray-50 border border-gray-100 text-[11px] text-gray-500 font-medium">
                          <span className="text-gray-400">Terkait:</span>
                          <span className="text-gray-800 font-semibold">{item.itemTitle}</span>
                        </div>
                      )}
                    </div>

                    {item.unread && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#30AFFF] shrink-0 mt-2 animate-pulse" />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
