'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/src/components/layout/AppLayout';
import {
  Search,
  Filter,
  MapPin,
  Clock,
  Bookmark,
  Wallet,
  Briefcase,
  Smartphone,
  CreditCard,
  KeyRound,
  BookOpen,
  PackageSearch,
  PlusCircle,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { createClient } from '@/src/lib/supabase/client';

interface CampusItem {
  id: string;
  title: string;
  type: 'lost' | 'found';
  category: string;
  location: string;
  timeAgo: string;
  date: string;
  description: string;
  icon: any;
  foto_url?: string | null;
  pelaporId?: string;
  colorScheme: {
    bg: string;
    text: string;
    border: string;
  };
}

const CATEGORIES = [
  'Semua',
  'Elektronik & Gadget',
  'Dompet & Aksesoris',
  'Tas & Ransel',
  'Dokumen & Kartu',
  'Kunci & Kendaraan',
  'Buku & Alat Tulis',
];

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

function getColorScheme(type: 'lost' | 'found') {
  if (type === 'found') {
    return { bg: 'bg-emerald-50/70', text: 'text-emerald-700', border: 'border-emerald-200' };
  }
  return { bg: 'bg-rose-50/70', text: 'text-rose-700', border: 'border-rose-200' };
}

function formatRelativeTime(dateString: string) {
  try {
    const d = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) {
      const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
      return `${diffMins} menit yang lalu`;
    }
    if (diffHours < 24) {
      return `${diffHours} jam yang lalu`;
    }
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} hari yang lalu`;
  } catch {
    return 'Baru saja';
  }
}

export default function FindItemsPage() {
  const [items, setItems] = useState<CampusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'lost' | 'found'>('all');
  const [savedItems, setSavedItems] = useState<string[]>([]);

  useEffect(() => {
    // Load saved bookmarks from localStorage
    try {
      const saved = JSON.parse(localStorage.getItem('findly_saved_items') || '[]');
      if (Array.isArray(saved)) setSavedItems(saved);
    } catch {
      // ignore
    }

    async function fetchItems() {
      setLoading(true);
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setCurrentUserId(user.id);
          const { data: profile } = await supabase
            .from('profil_pengguna')
            .select('tipe_akun, role_kampus')
            .eq('id', user.id)
            .single();

          if (profile?.tipe_akun === 'admin' || profile?.role_kampus === 'admin' || user.user_metadata?.tipe_akun === 'admin') {
            setIsAdmin(true);
          }
        }

        const { data, error } = await supabase
          .from('laporan_barang')
          .select('*')
          .order('dibuat_pada', { ascending: false });

        if (error) throw error;

        if (data) {
          const mapped: CampusItem[] = data.map((row: any) => {
            const isFound = row.jenis_laporan === 'DITEMUKAN';
            const cat = row.kategori || 'Barang Kampus';
            return {
              id: row.id,
              title: row.nama_barang,
              type: isFound ? 'found' : 'lost',
              category: cat,
              location: row.lokasi_terakhir || 'Lingkungan Kampus',
              timeAgo: formatRelativeTime(row.dibuat_pada),
              date: new Date(row.dibuat_pada).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              }),
              description: row.deskripsi || '',
              icon: getCategoryIcon(cat),
              foto_url: row.foto_url || null,
              pelaporId: row.pelapor_id,
              colorScheme: getColorScheme(isFound ? 'found' : 'lost'),
            };
          });
          setItems(mapped);
        }
      } catch (err) {
        console.error('Error loading campus items:', err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, []);

  const toggleSave = (id: string) => {
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
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'Semua' || item.category.toLowerCase() === selectedCategory.toLowerCase();

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

          {!isAdmin && (
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
          )}
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

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3 animate-pulse">
                <div className="h-40 bg-gray-100 rounded-xl w-full" />
                <div className="h-4 bg-gray-100 rounded w-1/3" />
                <div className="h-5 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-full" />
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          /* Clean Empty State */
          <div className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-12 text-center space-y-4 shadow-2xs max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#30AFFF] flex items-center justify-center mx-auto shadow-xs">
              <PackageSearch size={32} />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-bold text-base sm:text-lg text-gray-900">
                Belum Ada Laporan Barang
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-md mx-auto">
                {searchQuery || selectedCategory !== 'Semua' || selectedStatus !== 'all'
                  ? 'Tidak ada barang yang cocok dengan kata kunci atau filter yang dipilih.'
                  : 'Belum ada barang hilang atau temuan yang dilaporkan. Mulai daftarkan barang untuk membantu sesama warga kampus.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <Link
                href="/lost/new"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-all cursor-pointer"
              >
                + Lapor Kehilangan
              </Link>
              <Link
                href="/found/new"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#30AFFF] hover:bg-[#2196E8] text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              >
                + Lapor Temuan
              </Link>
            </div>
          </div>
        ) : (
          /* Catalog Items Grid */
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
                    className={`relative w-full h-40 ${item.foto_url ? 'bg-gray-100' : item.colorScheme.bg} border-b ${item.colorScheme.border} flex items-center justify-center overflow-hidden`}
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

                    {/* Photo or Category Fallback */}
                    {item.foto_url ? (
                      <img
                        src={item.foto_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className={`w-16 h-16 rounded-2xl bg-white/90 shadow-2xs flex items-center justify-center ${item.colorScheme.text} group-hover:scale-110 transition-transform duration-300`}>
                        <Icon size={32} className="stroke-[1.75]" />
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                        {item.category}
                      </span>
                      <Link href={`/find/${item.id}`}>
                        <h3 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-[#30AFFF] transition-colors line-clamp-1 mt-0.5 hover:underline decoration-[#30AFFF]">
                          {item.title}
                        </h3>
                      </Link>
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

                    {/* Action Button without AI Slop Arrows */}
                    <div className="pt-2">
                      {currentUserId && item.pelaporId === currentUserId ? (
                        <Link
                          href={`/find/${item.id}`}
                          className="w-full inline-flex items-center justify-center py-2 px-3 rounded-xl border border-gray-200 bg-gray-50/70 hover:bg-gray-100 text-gray-700 text-xs font-semibold transition-all"
                        >
                          Laporan Milik Anda
                        </Link>
                      ) : item.type === 'found' ? (
                        <Link
                          href={`/claim/new?id=${item.id}`}
                          className="w-full inline-flex items-center justify-center py-2 px-3 rounded-xl bg-[#30AFFF] hover:bg-[#2196E8] text-white text-xs font-semibold transition-all shadow-2xs"
                        >
                          Ajukan Klaim
                        </Link>
                      ) : (
                        <Link
                          href={`/find/${item.id}`}
                          className="w-full inline-flex items-center justify-center py-2 px-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-all"
                        >
                          Saya Menemukan Ini
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
