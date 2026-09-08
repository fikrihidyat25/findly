'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { createClient } from '@/src/lib/supabase/client';
import {
  AppNotification,
  fetchUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/src/lib/notifications';

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setUserId(user.id);
          const data = await fetchUserNotifications(user.id);
          setItems(data);
        }
      } catch (err) {
        console.error('Error loading notifications:', err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

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
    return true;
  });

  const unreadCount = items.filter((i) => i.unread).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Notifikasi
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Pembaruan langsung mengenai klaim barang, pesan verifikasi, dan aktivitas akun Anda.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#30AFFF] hover:text-[#2196E8] hover:underline self-start sm:self-auto cursor-pointer"
            >
              <CheckCheck size={15} />
              <span>Tandai semua sudah dibaca</span>
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-[#30AFFF] text-white shadow-2xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Semua Notifikasi ({items.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filter === 'unread'
                ? 'bg-[#30AFFF] text-white shadow-2xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Belum Dibaca ({unreadCount})
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 size={28} className="animate-spin text-[#30AFFF]" />
            <p className="text-xs text-gray-400">Memuat notifikasi aktivitas...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-[#30AFFF] flex items-center justify-center mx-auto">
              <Bell size={28} />
            </div>
            <h3 className="font-bold text-sm text-gray-800">Tidak Ada Notifikasi</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {filter === 'unread'
                ? 'Semua notifikasi telah Anda baca.'
                : 'Belum ada aktivitas klaim atau pesan baru untuk akun Anda.'}
            </p>
          </div>
        ) : (
          /* Notifications List */
          <div className="space-y-3">
            {filteredItems.map((item) => {
              return (
                <Link
                  key={item.id}
                  href={item.link}
                  onClick={() => handleClickItem(item.id)}
                  className={`block p-4 sm:p-5 rounded-2xl border transition-all duration-200 group ${
                    item.unread
                      ? 'bg-white border-blue-200 shadow-2xs hover:shadow-md'
                      : 'bg-white/80 border-gray-100 hover:border-gray-200 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 shadow-2xs ${
                        item.type === 'chat'
                          ? 'bg-blue-50 text-[#30AFFF]'
                          : item.type === 'claim'
                          ? 'bg-amber-50 text-amber-600'
                          : item.type === 'found'
                          ? 'bg-emerald-50 text-emerald-600'
                          : item.type === 'resolved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-gray-100 text-gray-600'
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
                        <h4 className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-[#30AFFF] transition-colors">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-1 text-[11px] text-gray-400 shrink-0">
                          <Clock size={11} />
                          <span>{item.timeAgo}</span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 leading-relaxed mt-1">
                        {item.desc}
                      </p>
                    </div>

                    {item.unread && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#30AFFF] shrink-0 mt-2" />
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
