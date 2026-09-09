'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bookmark,
  MapPin,
  Clock,
<<<<<<< HEAD
  PackageSearch,
} from 'lucide-react';
import { createClient } from '@/src/lib/supabase/client';
import { detectCategory, getCategoryIcon } from '@/src/lib/categories';
=======
  Wallet,
  Briefcase,
  Smartphone,
  CreditCard,
  KeyRound,
  BookOpen,
  PackageSearch,
} from 'lucide-react';
import { createClient } from '@/src/lib/supabase/client';
>>>>>>> 1f218a6 (niateams)

export interface RecentItem {
  id: string;
  title: string;
  type: 'lost' | 'found';
  category: string;
  location: string;
  timeAgo: string;
  colorScheme: {
    bg: string;
    text: string;
    border: string;
  };
  icon: any;
}

<<<<<<< HEAD
=======
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

>>>>>>> 1f218a6 (niateams)
function getColorScheme(type: 'lost' | 'found') {
  if (type === 'found') {
    return { bg: 'bg-emerald-50/70', text: 'text-emerald-700', border: 'border-emerald-200/80' };
  }
  return { bg: 'bg-rose-50/70', text: 'text-rose-700', border: 'border-rose-200/80' };
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
<<<<<<< HEAD
            const cat = detectCategory(row);
=======
            const cat = row.kategori || 'Barang Kampus';
>>>>>>> 1f218a6 (niateams)
            return {
              id: row.id,
              title: row.nama_barang,
              type: isFound ? 'found' : 'lost',
              category: cat,
              location: row.lokasi_terakhir || 'Lingkungan Kampus',
              timeAgo: formatRelativeTime(row.dibuat_pada),
              colorScheme: getColorScheme(isFound ? 'found' : 'lost'),
              icon: getCategoryIcon(cat),
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

  const filteredItems = items.filter((item) => {
    if (activeTab === 'all') return true;
    return item.type === activeTab;
  });

  return (
    <div className="space-y-4">
      {/* Feed Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-gray-100">
        <div>
          <h3 className="font-bold text-base sm:text-lg text-gray-900 tracking-tight">
            Barang terbaru di sekitarmu
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Laporan barang hilang dan temuan terkini di lingkungan kampus
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-gray-100/80 p-1 rounded-xl shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeTab === 'all'
                ? 'bg-white text-gray-900 shadow-2xs'
                : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Semua ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('lost')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeTab === 'lost'
                ? 'bg-white text-rose-600 shadow-2xs'
                : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Hilang
          </button>
          <button
            onClick={() => setActiveTab('found')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeTab === 'found'
                ? 'bg-white text-emerald-600 shadow-2xs'
                : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Ditemukan
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3 animate-pulse">
              <div className="h-28 bg-gray-100 rounded-xl" />
              <div className="h-4 bg-gray-100 rounded w-2/3" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#30AFFF] flex items-center justify-center mx-auto">
            <PackageSearch size={24} />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-gray-900">Belum Ada Aktivitas Barang</h4>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Belum ada laporan barang terbaru. Anda dapat mulai melaporkan barang temuan atau kehilangan.
            </p>
          </div>
          <div className="flex justify-center gap-2 pt-1">
            <Link
              href="/lost/new"
              className="px-3.5 py-1.5 rounded-xl border border-rose-200 text-rose-600 text-xs font-semibold hover:bg-rose-50 transition-colors"
            >
              Lapor Kehilangan
            </Link>
            <Link
              href="/found/new"
              className="px-3.5 py-1.5 rounded-xl bg-[#30AFFF] hover:bg-[#2196E8] text-white text-xs font-semibold shadow-2xs transition-colors"
            >
              Lapor Temuan
            </Link>
          </div>
        </div>
      ) : (
        /* Items Cards Horizontal / Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
          {filteredItems.map((item) => {
            const isSaved = savedItems.includes(item.id);
            const Icon = item.icon;
            const isLost = item.type === 'lost';

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                {/* Card Visual / Thumbnail Header */}
                <div
                  className={`relative w-full h-32 ${item.colorScheme.bg} border-b ${item.colorScheme.border} flex items-center justify-center transition-colors group-hover:bg-opacity-90`}
                >
                  {/* Status Badge */}
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs ${isLost
                          ? 'bg-rose-500 text-white border-rose-600'
                          : 'bg-emerald-500 text-white border-emerald-600'
                        }`}
                    >
                      {isLost ? 'Hilang' : 'Ditemukan'}
                    </span>
                  </div>

                  {/* Bookmark Toggle Button */}
                  <button
                    type="button"
                    onClick={(e) => toggleSave(item.id, e)}
                    aria-label="Simpan barang"
                    className={`absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-2xs transition-all hover:scale-110 cursor-pointer ${isSaved ? 'text-[#30AFFF]' : 'text-gray-400 hover:text-gray-700'
                      }`}
                  >
                    <Bookmark
                      size={14}
                      className={isSaved ? 'fill-[#30AFFF] stroke-[#30AFFF]' : 'stroke-[2]'}
                    />
                  </button>

                  {/* Item Category Icon Illustration */}
                  <div
                    className={`w-14 h-14 rounded-2xl bg-white/90 shadow-2xs flex items-center justify-center ${item.colorScheme.text} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon size={28} className="stroke-[1.75]" />
                  </div>
                </div>

                {/* Card Body Info */}
                <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                      {item.category}
                    </span>
                    <Link href={`/find/${item.id}`}>
                      <h4 className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-[#30AFFF] transition-colors line-clamp-1 mt-0.5 hover:underline">
                        {item.title}
                      </h4>
                    </Link>
                  </div>

                  <div className="pt-2 border-t border-gray-50 space-y-1 text-[11px] text-gray-500">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin size={12} className="text-gray-400 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400">
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

      {/* Bottom View All Link */}
      <div className="text-center pt-2">
        <Link
          href="/find"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#30AFFF] hover:text-[#2196E8] py-1.5 px-3 rounded-lg hover:bg-blue-50/50 transition-colors"
        >
          Jelajahi seluruh laporan di Cari Barang
        </Link>
      </div>
    </div>
  );
}
