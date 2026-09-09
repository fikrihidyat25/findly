'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/src/components/layout/AppLayout';
import {
  Bookmark,
  MapPin,
  Trash2,
} from 'lucide-react';
import { createClient } from '@/src/lib/supabase/client';
import { detectCategory, getCategoryIcon } from '@/src/lib/categories';

interface SavedItem {
  id: string;
  title: string;
  type: 'lost' | 'found';
  category: string;
  location: string;
  description?: string;
  foto_url?: string | null;
  icon: any;
  colorScheme: {
    bg: string;
    text: string;
    border: string;
  };
}

function CardImage({
  src,
  alt,
  Icon,
  colorScheme,
}: {
  src?: string | null;
  alt: string;
  Icon: any;
  colorScheme: { bg: string; text: string; border: string };
}) {
  const [error, setError] = useState(false);
  const isValid = Boolean(src && !src.startsWith('blob:') && !error);

  if (isValid) {
    return (
      <img
        src={src!}
        alt={alt}
        onError={() => setError(true)}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
    );
  }

  return (
    <div
      className={`w-16 h-16 rounded-2xl bg-white/90 shadow-2xs flex items-center justify-center ${colorScheme.text} group-hover:scale-110 transition-transform duration-300`}
    >
      <Icon size={32} className="stroke-[1.75]" />
    </div>
  );
}

export default function SavedItemsPage() {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSaved() {
      setLoading(true);
      try {
        const savedIds: string[] = JSON.parse(localStorage.getItem('findly_saved_items') || '[]');
        if (!Array.isArray(savedIds) || savedIds.length === 0) {
          setItems([]);
          setLoading(false);
          return;
        }

        const supabase = createClient();
        const { data, error } = await supabase
          .from('laporan_barang')
          .select('*')
          .in('id', savedIds);

        if (error) throw error;

        if (data) {
          const mapped: SavedItem[] = data.map((row: any) => {
            const isFound = row.jenis_laporan === 'DITEMUKAN';
            const cat = detectCategory(row);
            const rawPhoto = row.foto_url;
            const foto_url = rawPhoto && !rawPhoto.startsWith('blob:') ? rawPhoto : null;
            return {
              id: row.id,
              title: row.nama_barang,
              type: isFound ? 'found' : 'lost',
              category: cat,
              location: row.lokasi_terakhir || 'Lingkungan Kampus',
              description: row.deskripsi || '',
              foto_url,
              icon: getCategoryIcon(cat),
              colorScheme: isFound
                ? { bg: 'bg-emerald-50/70', text: 'text-emerald-700', border: 'border-emerald-200' }
                : { bg: 'bg-rose-50/70', text: 'text-rose-700', border: 'border-rose-200' },
            };
          });
          setItems(mapped);
        }
      } catch (err) {
        console.error('Error loading saved items:', err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }

    loadSaved();
  }, []);

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    try {
      const savedIds: string[] = JSON.parse(localStorage.getItem('findly_saved_items') || '[]');
      const updated = savedIds.filter((item) => item !== id);
      localStorage.setItem('findly_saved_items', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Barang Disimpan
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Daftar laporan barang yang Anda simpan untuk dipantau perkembangannya.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden space-y-3 animate-pulse">
                <div className="h-44 bg-gray-100 w-full" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                  <div className="h-5 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center space-y-4 shadow-2xs">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-[#30AFFF] flex items-center justify-center mx-auto">
              <Bookmark size={28} />
            </div>
            <h3 className="font-bold text-base text-gray-900">Belum ada barang yang disimpan</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Jelajahi halaman Cari Barang dan klik ikon bookmark pada laporan yang ingin Anda pantau.
            </p>
            <Link
              href="/find"
              className="inline-flex items-center px-4 py-2 bg-[#30AFFF] hover:bg-[#2196E8] text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
            >
              Jelajahi Cari Barang
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => {
              const Icon = item.icon;
              const isLost = item.type === 'lost';

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                >
                  {/* Visual Thumbnail */}
                  <div
                    className={`relative w-full h-44 ${item.foto_url ? 'bg-gray-100' : item.colorScheme.bg} border-b ${item.colorScheme.border} flex items-center justify-center overflow-hidden`}
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

                    {/* Delete / Remove from Saved */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-2xs text-gray-400 hover:text-rose-600 hover:bg-white hover:scale-110 transition-all cursor-pointer"
                      title="Hapus dari simpanan"
                    >
                      <Trash2 size={15} />
                    </button>

                    {/* Photo or Category Fallback */}
                    <CardImage
                      src={item.foto_url}
                      alt={item.title}
                      Icon={Icon}
                      colorScheme={item.colorScheme}
                    />
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
                      {item.description && (
                        <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-gray-50 flex items-center gap-1.5 text-xs text-gray-500">
                      <MapPin size={13} className="text-gray-400 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2">
                      <Link
                        href={`/find/${item.id}`}
                        className="w-full inline-flex items-center justify-center py-2 px-3 rounded-xl bg-[#30AFFF] hover:bg-[#2196E8] text-white text-xs font-semibold shadow-2xs transition-all text-center cursor-pointer"
                      >
                        {item.type === 'found' ? 'Ajukan Klaim' : 'Lihat Detail'}
                      </Link>
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
