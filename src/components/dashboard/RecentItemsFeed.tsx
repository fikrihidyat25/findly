'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bookmark,
  MapPin,
  Clock,
  Wallet,
  Briefcase,
  Smartphone,
  CreditCard,
  KeyRound,
  BookOpen,
  PackageSearch,
  ArrowRight,
} from 'lucide-react';
import { createClient } from '@/src/lib/supabase/client';

export interface RecentItem {
  id: string;
  title: string;
  type: 'lost' | 'found';
  category: string;
  location: string;
  timeAgo: string;
  icon: any;
  foto_url?: string | null;
}

function getCategoryIcon(cat: string) {
  const lower = (cat || '').toLowerCase();
  if (lower.includes('elektronik') || lower.includes('hp') || lower.includes('gadget') || lower.includes('laptop')) {
    return Smartphone;
  }
  if (lower.includes('dompet') || lower.includes('aksesoris')) {
    return Wallet;
  }
  if (lower.includes('tas') || lower.includes('ransel')) {
    return Briefcase;
  }
  if (lower.includes('dokumen') || lower.includes('kartu') || lower.includes('ktm')) {
    return CreditCard;
  }
  if (lower.includes('kunci') || lower.includes('kendaraan') || lower.includes('motor')) {
    return KeyRound;
  }
  if (lower.includes('buku') || lower.includes('tulis')) {
    return BookOpen;
  }
  return Briefcase;
}

function formatRelativeTime(dateString: string) {
  try {
    const d = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) {
      const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
      return `${diffMins} menit lalu`;
    }
    if (diffHours < 24) {
      return `${diffHours} jam lalu`;
    }
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} hari lalu`;
  } catch {
    return 'Baru saja';
  }
}

export default function RecentItemsFeed() {
  const [items, setItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'lost' | 'found'>('all');
  const [savedItems, setSavedItems] = useState<string[]>([]);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('findly_saved_items') || '[]');
      if (Array.isArray(saved)) setSavedItems(saved);
    } catch {
      // ignore
    }

    async function loadRecent() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('laporan_barang')
          .select('*')
          .order('dibuat_pada', { ascending: false })
          .limit(8);

        if (error) throw error;

        if (data) {
          const mapped: RecentItem[] = data.map((row: any) => {
            const isFound = row.jenis_laporan === 'DITEMUKAN';
            const cat = row.kategori || 'Barang Kampus';
            return {
              id: row.id,
              title: row.nama_barang,
              type: isFound ? 'found' : 'lost',
              category: cat,
              location: row.lokasi_terakhir || 'Lingkungan Kampus',
              timeAgo: formatRelativeTime(row.dibuat_pada),
              icon: getCategoryIcon(cat),
              foto_url: row.foto_url || null,
            };
          });
          setItems(mapped);
        }
      } catch (err) {
        console.error('Error loading recent items:', err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }

    loadRecent();
  }, []);

  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSavedItems((prev) => {
      const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('findly_saved_items', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleImageError = (id: string) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  const filteredItems = items.filter((item) => {
    if (activeTab === 'all') return true;
    return item.type === activeTab;
  });

  return (
    <div className="space-y-4">
      {/* Feed Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h3 className="font-bold text-base text-slate-900 tracking-tight">
            Barang terbaru di sekitarmu
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Laporan barang hilang dan temuan terkini di lingkungan kampus
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-[6px] self-start sm:self-auto border border-slate-200">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-[4px] text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('lost')}
            className={`px-3 py-1 rounded-[4px] text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'lost'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hilang
          </button>
          <button
            onClick={() => setActiveTab('found')}
            className={`px-3 py-1 rounded-[4px] text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'found'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ditemukan
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-[6px] border border-slate-200 p-4 space-y-3 animate-pulse">
              <div className="h-28 bg-slate-100 rounded-[4px]" />
              <div className="h-4 bg-slate-100 rounded-[4px] w-2/3" />
              <div className="h-3 bg-slate-100 rounded-[4px] w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-[6px] border border-slate-200 p-8 text-center space-y-3">
          <div className="w-10 h-10 rounded-[6px] bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
            <PackageSearch size={20} />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-slate-900">Belum Ada Aktivitas Barang</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Belum ada laporan barang pada kategori ini. Anda dapat mulai membuat laporan baru.
            </p>
          </div>
          <div className="flex justify-center gap-2 pt-1">
            <Link
              href="/lost/new"
              className="px-3 py-1.5 rounded-[6px] border border-rose-200 text-rose-700 text-xs font-semibold hover:bg-rose-50 transition-colors"
            >
              Lapor Kehilangan
            </Link>
            <Link
              href="/found/new"
              className="px-3 py-1.5 rounded-[6px] bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-colors"
            >
              Lapor Temuan
            </Link>
          </div>
        </div>
      ) : (
        /* Items Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
          {filteredItems.map((item) => {
            const isSaved = savedItems.includes(item.id);
            const Icon = item.icon;
            const isLost = item.type === 'lost';
            const isImageFailed = Boolean(failedImages[item.id]);

            // Validate image URL: must be valid http/https or data URL and NOT a dead local blob
            const hasValidImage = Boolean(
              item.foto_url &&
              !item.foto_url.startsWith('blob:') &&
              (item.foto_url.startsWith('http://') ||
               item.foto_url.startsWith('https://') ||
               item.foto_url.startsWith('data:image/')) &&
              !isImageFailed
            );

            return (
              <div
                key={item.id}
                className="bg-white rounded-[6px] border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all duration-200 flex flex-col justify-between overflow-hidden group"
              >
                {/* Visual Header */}
                <div className="relative w-full h-28 bg-slate-50 border-b border-slate-100 flex items-center justify-center overflow-hidden">
                  {/* Status Badge */}
                  <div className="absolute top-2 left-2 z-10">
                    <span
                      className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-[4px] shadow-2xs ${
                        isLost
                          ? 'bg-rose-600 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {isLost ? 'Hilang' : 'Ditemukan'}
                    </span>
                  </div>

                  {/* Bookmark Button */}
                  <button
                    type="button"
                    onClick={(e) => toggleSave(item.id, e)}
                    aria-label="Simpan barang"
                    className={`absolute top-2 right-2 z-10 w-7 h-7 rounded-[4px] bg-white border border-slate-200 flex items-center justify-center transition-colors cursor-pointer ${
                      isSaved ? 'text-sky-600 border-sky-300' : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    <Bookmark
                      size={13}
                      className={isSaved ? 'fill-sky-600 stroke-sky-600' : 'stroke-[2]'}
                    />
                  </button>

                  {/* Display Image or Clean Category Icon */}
                  {hasValidImage ? (
                    <img
                      src={item.foto_url!}
                      alt=""
                      onError={() => handleImageError(item.id)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-[6px] bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:scale-105 transition-transform duration-200 shadow-2xs">
                      <Icon size={22} className="stroke-[1.75]" />
                    </div>
                  )}
                </div>

                {/* Body Info */}
                <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {item.category}
                    </span>
                    <Link href={`/find/${item.id}`} className="block mt-0.5">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-1">
                        {item.title}
                      </h4>
                    </Link>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin size={12} className="text-slate-400 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Clock size={12} className="shrink-0" />
                      <span>{item.timeAgo}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View All Link */}
      <div className="text-center pt-2">
        <Link
          href="/find"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-800 py-1 px-3 rounded-[4px] hover:bg-sky-50 transition-colors"
        >
          <span>Jelajahi seluruh laporan di Cari Barang</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
