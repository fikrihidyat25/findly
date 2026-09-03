'use client';

import { useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/src/components/layout/AppLayout';
import {
  Search,
  Filter,
  MapPin,
  Clock,
  Bookmark,
  ArrowRight,
  Wallet,
  Briefcase,
  Smartphone,
  CreditCard,
  KeyRound,
  BookOpen,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface CampusItem {
  id: string;
  title: string;
  type: 'lost' | 'found';
  category: string;
  location: string;
  campusArea: string;
  timeAgo: string;
  date: string;
  description: string;
  icon: any;
  colorScheme: {
    bg: string;
    text: string;
    border: string;
  };
}

const ITEMS_DATA: CampusItem[] = [
  {
    id: '1',
    title: 'Tas Ransel Kuning Nike',
    type: 'found',
    category: 'Tas & Ransel',
    location: 'Perpustakaan Pusat, Lantai 2',
    campusArea: 'Perpustakaan',
    timeAgo: '1 jam yang lalu',
    date: '01 Sep 2026',
    description: 'Ditemukan tertinggal di dekat meja baca nomor 15 lantai 2.',
    icon: Briefcase,
    colorScheme: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  },
  {
    id: '2',
    title: 'Dompet Kulit Hitam Pria',
    type: 'lost',
    category: 'Dompet & Aksesoris',
    location: 'Kantin Utama Fasilkom',
    campusArea: 'Fasilkom',
    timeAgo: '2 jam yang lalu',
    date: '01 Sep 2026',
    description: 'Dompet merk Baellerry warna hitam, berisi KTM dan kartu perpus.',
    icon: Wallet,
    colorScheme: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  },
  {
    id: '3',
    title: 'iPhone 13 Pro Biru Sierra',
    type: 'lost',
    category: 'Elektronik & Gadget',
    location: 'Gedung Kuliah Bersama (GKB) Ruang 304',
    campusArea: 'GKB',
    timeAgo: '4 jam yang lalu',
    date: '01 Sep 2026',
    description: 'Casing bening transparan dengan stiker logo coding di belakang.',
    icon: Smartphone,
    colorScheme: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  },
  {
    id: '4',
    title: 'Kartu Tanda Mahasiswa (KTM)',
    type: 'found',
    category: 'Dokumen & Kartu',
    location: 'Masjid Kampus Baitul Ilmi',
    campusArea: 'Masjid',
    timeAgo: '1 hari yang lalu',
    date: '31 Agu 2026',
    description: 'KTM atas nama Budi Santoso, dititipkan sementara ke marbot masjid.',
    icon: CreditCard,
    colorScheme: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  },
  {
    id: '5',
    title: 'Kunci Motor Honda Vario & Gantungan Bear',
    type: 'lost',
    category: 'Kunci & Kendaraan',
    location: 'Parkiran Gedung C',
    campusArea: 'Parkiran',
    timeAgo: '1 hari yang lalu',
    date: '31 Agu 2026',
    description: 'Ada gantungan boneka beruang warna cokelat dan remote alarm.',
    icon: KeyRound,
    colorScheme: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  },
  {
    id: '6',
    title: 'Buku Catatan Algoritma Pemrograman',
    type: 'found',
    category: 'Buku & Alat Tulis',
    location: 'Laboratorium Software Engineering',
    campusArea: 'Fasilkom',
    timeAgo: '2 hari yang lalu',
    date: '30 Agu 2026',
    description: 'Buku binder binder hitam B5 penuh catatan praktikum bab 3-5.',
    icon: BookOpen,
    colorScheme: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  },
];

const CATEGORIES = [
  'Semua',
  'Elektronik & Gadget',
  'Dompet & Aksesoris',
  'Tas & Ransel',
  'Dokumen & Kartu',
  'Kunci & Kendaraan',
  'Buku & Alat Tulis',
];

export default function FindItemsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'lost' | 'found'>('all');
  const [savedItems, setSavedItems] = useState<string[]>(['1']);

  const toggleSave = (id: string) => {
    setSavedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredItems = ITEMS_DATA.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'Semua' || item.category === selectedCategory;

    const matchesStatus =
      selectedStatus === 'all' || item.type === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <AppLayout searchQuery={searchQuery} onSearchChange={setSearchQuery}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Cari Barang
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Jelajahi laporan barang hilang dan temuan di seluruh lingkungan universitas.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/lost/new"
              className="px-3.5 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all"
            >
              + Lapor Kehilangan
            </Link>
            <Link
              href="/found/new"
              className="px-3.5 py-2 text-xs font-semibold text-white bg-[#30AFFF] hover:bg-[#2196E8] rounded-xl shadow-sm transition-all"
            >
              + Lapor Temuan
            </Link>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-2xs space-y-4">
          {/* Top Row: Search input & Status toggle */}
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="relative w-full flex-1">
              <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ketik nama barang, lokasi kampus, atau ciri khusus..."
                className="w-full bg-gray-50/70 hover:bg-gray-50 focus:bg-white pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 border border-gray-200 focus:border-[#30AFFF] focus:ring-2 focus:ring-[#30AFFF]/20 focus:outline-none transition-all"
              />
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-1 bg-gray-100/90 p-1 rounded-xl shrink-0 w-full sm:w-auto justify-center">
              <button
                onClick={() => setSelectedStatus('all')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedStatus === 'all'
                    ? 'bg-white text-gray-900 shadow-2xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Semua Status
              </button>
              <button
                onClick={() => setSelectedStatus('found')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedStatus === 'found'
                    ? 'bg-white text-emerald-600 shadow-2xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Ditemukan
              </button>
              <button
                onClick={() => setSelectedStatus('lost')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedStatus === 'lost'
                    ? 'bg-white text-rose-600 shadow-2xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Hilang
              </button>
            </div>
          </div>

          {/* Category Chips Carousel / Row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Filter size={13} />
              Kategori:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#30AFFF] text-white font-semibold shadow-2xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200/80 hover:text-gray-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter & Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 px-1">
          <span>
            Menampilkan <strong className="text-gray-900">{filteredItems.length}</strong> laporan barang di kampus
          </span>
        </div>

        {/* Catalog Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const isSaved = savedItems.includes(item.id);
            const isLost = item.type === 'lost';
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                {/* Visual Thumbnail */}
                <div
                  className={`relative w-full h-40 ${item.colorScheme.bg} border-b ${item.colorScheme.border} flex items-center justify-center`}
                >
                  {/* Status Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${
                        isLost
                          ? 'bg-rose-500 text-white border-rose-600'
                          : 'bg-emerald-500 text-white border-emerald-600'
                      }`}
                    >
                      {isLost ? 'Hilang' : 'Ditemukan'}
                    </span>
                  </div>

                  {/* Bookmark Button */}
                  <button
                    onClick={() => toggleSave(item.id)}
                    className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-2xs transition-all hover:scale-110 cursor-pointer ${
                      isSaved ? 'text-[#30AFFF]' : 'text-gray-400 hover:text-gray-700'
                    }`}
                  >
                    <Bookmark size={15} className={isSaved ? 'fill-[#30AFFF] stroke-[#30AFFF]' : ''} />
                  </button>

                  <div className={`w-16 h-16 rounded-2xl bg-white/90 shadow-2xs flex items-center justify-center ${item.colorScheme.text} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={32} className="stroke-[1.75]" />
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                      {item.category}
                    </span>
                    <h3 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-[#30AFFF] transition-colors line-clamp-1 mt-0.5">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-50 space-y-1.5 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-gray-400 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                      <Clock size={12} className="shrink-0" />
                      <span>{item.timeAgo} ({item.date})</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2">
                    {item.type === 'found' ? (
                      <Link
                        href="/claim/new"
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#30AFFF] hover:bg-[#2196E8] text-white text-xs font-semibold transition-all shadow-2xs"
                      >
                        <span>Ajukan Klaim</span>
                        <ArrowRight size={13} />
                      </Link>
                    ) : (
                      <Link
                        href="/found/new"
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-all"
                      >
                        <span>Saya Menemukan Ini</span>
                        <ArrowRight size={13} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
