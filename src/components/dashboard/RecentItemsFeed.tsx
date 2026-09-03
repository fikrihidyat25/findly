'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Bookmark,
  MapPin,
  Clock,
  ArrowRight,
  Wallet,
  Briefcase,
  Smartphone,
  CreditCard,
  KeyRound,
  Filter,
} from 'lucide-react';

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

const INITIAL_ITEMS: RecentItem[] = [
  {
    id: '1',
    title: 'Dompet Kulit Hitam',
    type: 'lost',
    category: 'Dompet & Aksesoris',
    location: 'Perpustakaan Pusat',
    timeAgo: '2 jam yang lalu',
    colorScheme: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200/80' },
    icon: Wallet,
  },
  {
    id: '2',
    title: 'Tas Ransel Abu-abu',
    type: 'found',
    category: 'Tas & Ransel',
    location: 'Perpustakaan Pusat',
    timeAgo: '3 jam yang lalu',
    colorScheme: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200/80' },
    icon: Briefcase,
  },
  {
    id: '3',
    title: 'iPhone 13 Pro Biru',
    type: 'lost',
    category: 'Elektronik & Gadget',
    location: 'Gedung B Lantai 2',
    timeAgo: '5 jam yang lalu',
    colorScheme: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200/80' },
    icon: Smartphone,
  },
  {
    id: '4',
    title: 'Kartu Tanda Mahasiswa',
    type: 'found',
    category: 'Dokumen & Kartu',
    location: 'Kantin Utama',
    timeAgo: '1 hari yang lalu',
    colorScheme: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200/80' },
    icon: CreditCard,
  },
  {
    id: '5',
    title: 'Kunci Motor Honda',
    type: 'lost',
    category: 'Kunci & Kendaraan',
    location: 'Parkiran Gedung C',
    timeAgo: '1 hari yang lalu',
    colorScheme: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200/80' },
    icon: KeyRound,
  },
];

export default function RecentItemsFeed() {
  const [activeTab, setActiveTab] = useState<'all' | 'lost' | 'found'>('all');
  const [savedItems, setSavedItems] = useState<string[]>([]);

  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSavedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredItems = INITIAL_ITEMS.filter((item) => {
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
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white text-gray-900 shadow-2xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Semua ({INITIAL_ITEMS.length})
          </button>
          <button
            onClick={() => setActiveTab('lost')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'lost'
                ? 'bg-white text-rose-600 shadow-2xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Hilang
          </button>
          <button
            onClick={() => setActiveTab('found')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'found'
                ? 'bg-white text-emerald-600 shadow-2xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Ditemukan
          </button>
        </div>
      </div>

      {/* Items Cards Horizontal / Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 sm:gap-4">
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
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs ${
                      isLost
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
                  className={`absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-2xs transition-all hover:scale-110 cursor-pointer ${
                    isSaved ? 'text-[#30AFFF]' : 'text-gray-400 hover:text-gray-700'
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
                  <h4 className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-[#30AFFF] transition-colors line-clamp-1 mt-0.5">
                    {item.title}
                  </h4>
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

      {/* Bottom View All Link */}
      <div className="text-center pt-2">
        <Link
          href="/find"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#30AFFF] hover:text-[#2196E8] py-1.5 px-3 rounded-lg hover:bg-blue-50/50 transition-colors"
        >
          <span>Jelajahi seluruh laporan di Cari Barang</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
