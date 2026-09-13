'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Bell,
  MessageSquare,
  FileCheck2,
  AlertCircle,
  ShieldCheck,
  CheckCheck,
  ExternalLink,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { AppNotification } from '@/src/lib/notifications';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  unreadCount: number;
  onMarkAllAsRead: () => void;
  onReadItem: (id: string) => void;
}

export default function NotificationDropdown({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  onMarkAllAsRead,
  onReadItem,
}: NotificationDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const previewItems = notifications.slice(0, 5);

  const getIcon = (type: string) => {
    switch (type) {
      case 'chat':
        return <MessageSquare size={16} className="text-[#30AFFF]" />;
      case 'claim':
        return <FileCheck2 size={16} className="text-amber-500" />;
      case 'found':
        return <AlertCircle size={16} className="text-emerald-500" />;
      case 'resolved':
        return <ShieldCheck size={16} className="text-emerald-600" />;
      default:
        return <Bell size={16} className="text-blue-500" />;
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100/90 z-50 overflow-hidden animate-in zoom-in-95 duration-150"
    >
      {/* Header */}
      <div className="p-4 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-sm text-gray-900">Notifikasi</h3>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white leading-none">
              {unreadCount} baru
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#30AFFF] hover:text-[#2196E8] hover:underline cursor-pointer"
          >
            <CheckCheck size={13} />
            <span>Tandai dibaca</span>
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-100">
        {previewItems.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
              <Bell size={18} />
            </div>
            <p className="text-xs font-semibold text-gray-700">Belum Ada Notifikasi</p>
            <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
              Aktivitas klaim, pesan, dan laporan Anda akan langsung muncul di sini secara real-time.
            </p>
          </div>
        ) : (
          previewItems.map((item) => (
            <Link
              key={item.id}
              href={item.link}
              onClick={() => {
                onReadItem(item.id);
                onClose();
              }}
              className={`p-3.5 flex items-start gap-3 transition-colors hover:bg-gray-50/80 group ${
                item.unread ? 'bg-sky-50/30' : 'bg-white'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                  item.unread
                    ? 'bg-blue-50 border-blue-200 shadow-2xs'
                    : 'bg-gray-50 border-gray-100 text-gray-400'
                }`}
              >
                {getIcon(item.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4
                    className={`text-xs truncate ${
                      item.unread ? 'font-bold text-gray-900' : 'font-medium text-gray-700'
                    }`}
                  >
                    {item.title}
                  </h4>
                  {item.unread && (
                    <span className="w-2 h-2 rounded-full bg-[#30AFFF] shrink-0" />
                  )}
                </div>

                <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5 leading-snug">
                  {item.desc}
                </p>

                <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1">
                  <Clock size={10} />
                  <span>{item.timeAgo}</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 bg-gray-50/90 border-t border-gray-100 text-center">
        <Link
          href="/notifications"
          onClick={onClose}
          className="inline-flex items-center justify-center gap-1 text-xs font-bold text-[#30AFFF] hover:text-[#2196E8] hover:underline"
        >
          <span>Lihat Semua Notifikasi</span>
          <ChevronRight size={13} />
        </Link>
      </div>
    </div>
  );
}
