'use client';

import { useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/src/components/layout/AppLayout';
import {
  Bell,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Clock,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  timeAgo: string;
  type: 'chat' | 'claim' | 'system' | 'report';
  unread: boolean;
  link: string;
}

const NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Pesan Baru di Ruang Verifikasi',
    desc: 'Megawati membalas pertanyaan verifikasi mengenai Tas Ransel Kuning Nike: "Cocok sekali! Bisa kita janjian serah terima..."',
    timeAgo: '15 menit yang lalu',
    type: 'chat',
    unread: true,
    link: '/messages',
  },
  {
    id: 'n2',
    title: 'Klaim Anda Sedang Diproses',
    desc: 'Pengajuan klaim Anda untuk Tas Ransel Kuning Nike telah diterima oleh penemu. Silakan buka chat untuk berdiskusi.',
    timeAgo: '1 jam yang lalu',
    type: 'claim',
    unread: true,
    link: '/claims',
  },
  {
    id: 'n3',
    title: 'Laporan Kehilangan Berhasil Diterbitkan',
    desc: 'Laporan barang hilang iPhone 13 Pro Biru Sierra kini dapat dilihat oleh seluruh civitas kampus di Cari Barang.',
    timeAgo: '4 jam yang lalu',
    type: 'report',
    unread: false,
    link: '/find',
  },
  {
    id: 'n4',
    title: 'Verifikasi Kampus Sukses',
    desc: 'Selamat! Akun Anda telah berhasil diverifikasi sebagai Civitas Mahasiswa Universitas ABC (Fakultas Ilmu Komputer).',
    timeAgo: '1 hari yang lalu',
    type: 'system',
    unread: false,
    link: '/profile',
  },
];

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [items, setItems] = useState(NOTIFICATIONS);

  const markAllAsRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const filteredItems = items.filter((item) => {
    if (filter === 'unread') return item.unread;
    return true;
  });

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

          <button
            onClick={markAllAsRead}
            className="text-xs font-semibold text-[#30AFFF] hover:underline self-start sm:self-auto cursor-pointer"
          >
            Tandai semua sudah dibaca
          </button>
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
            Belum Dibaca ({items.filter((i) => i.unread).length})
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredItems.map((item) => {
            return (
              <Link
                key={item.id}
                href={item.link}
                className={`block p-4 sm:p-5 rounded-2xl border transition-all duration-200 group ${
                  item.unread
                    ? 'bg-white border-blue-200/80 shadow-2xs hover:shadow-md'
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
                        : item.type === 'report'
                        ? 'bg-purple-50 text-purple-600'
                        : 'bg-emerald-50 text-emerald-600'
                    }`}
                  >
                    {item.type === 'chat' ? (
                      <MessageSquare size={18} />
                    ) : item.type === 'claim' ? (
                      <FileCheck2 size={18} />
                    ) : item.type === 'report' ? (
                      <AlertCircle size={18} />
                    ) : (
                      <ShieldCheck size={18} />
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
      </div>
    </AppLayout>
  );
}
