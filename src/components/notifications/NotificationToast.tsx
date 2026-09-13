'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  Bell,
  MessageSquare,
  FileCheck2,
  AlertCircle,
  ShieldCheck,
  X,
  ExternalLink,
} from 'lucide-react';
import { AppNotification } from '@/src/lib/notifications';

interface NotificationToastProps {
  notification: AppNotification | null;
  onClose: () => void;
  onRead?: (id: string) => void;
}

export default function NotificationToast({
  notification,
  onClose,
  onRead,
}: NotificationToastProps) {
  const [progress, setProgress] = useState(100);
  const onCloseRef = useRef(onClose);
  const notificationId = notification?.id;

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!notificationId) return;
    setProgress(100);

    const duration = 6000; // 6 seconds
    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(timer);
          onCloseRef.current();
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [notificationId]);


  if (!notification) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'chat':
        return <MessageSquare size={18} className="text-[#30AFFF]" />;
      case 'claim':
        return <FileCheck2 size={18} className="text-amber-500" />;
      case 'found':
        return <AlertCircle size={18} className="text-emerald-500" />;
      case 'resolved':
        return <ShieldCheck size={18} className="text-emerald-600" />;
      default:
        return <Bell size={18} className="text-blue-500" />;
    }
  };

  const handleClick = () => {
    if (onRead) onRead(notification.id);
    onClose();
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-4 relative overflow-hidden backdrop-blur-md bg-white/95">
        {/* Progress Bar */}
        <div
          className="absolute bottom-0 left-0 h-1 bg-[#30AFFF] transition-all ease-linear"
          style={{ width: `${progress}%` }}
        />

        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50/80 flex items-center justify-center shrink-0 shadow-2xs border border-blue-100/50">
            {getIcon()}
          </div>

          <div className="flex-1 min-w-0 pr-5">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-md">
                Baru
              </span>
              <span className="text-[11px] text-gray-400 font-medium">Baru saja</span>
            </div>
            <h4 className="font-bold text-xs text-gray-900 mt-1 truncate">
              {notification.title}
            </h4>
            <p className="text-[11px] text-gray-600 line-clamp-2 mt-0.5 leading-relaxed">
              {notification.desc}
            </p>

            <div className="mt-2.5 flex items-center gap-2">
              <Link
                href={notification.link}
                onClick={handleClick}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#30AFFF] hover:bg-[#2196E8] text-white text-[11px] font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                <span>Buka Sekarang</span>
                <ExternalLink size={11} />
              </Link>
            </div>
          </div>

          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Tutup notifikasi"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
