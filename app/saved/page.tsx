'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/src/components/layout/AppLayout';
import {
  Bookmark,
  MapPin,
  Trash2,
  Briefcase,
  Smartphone,
  Wallet,
  CreditCard,
  KeyRound,
  BookOpen,
} from 'lucide-react';
import { createClient } from '@/src/lib/supabase/client';

interface SavedItem {
  id: string;
  title: string;
  type: 'lost' | 'found';
  category: string;
  location: string;
  icon: any;
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
          const mapped: SavedItem[] = data.map((row: any) => ({
            id: row.id,
            title: row.nama_barang,
            type: row.jenis_laporan === 'DITEMUKAN' ? 'found' : 'lost',
            category: row.kategori || 'Barang Kampus',
            location: row.lokasi_terakhir || 'Lingkungan Kampus',
            icon: getCategoryIcon(row.kategori || ''),
          }));
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
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3 animate-pulse">
                <div className="h-12 w-12 bg-gray-100 rounded-xl" />
                <div className="h-4 bg-gray-100 rounded w-1/3" />
                <div className="h-5 bg-gray-100 rounded w-3/4" />
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
                  className="bg-white rounded-2xl border border-gray-100 shadow-2xs p-5 flex flex-col justify-between space-y-4 group hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#30AFFF] flex items-center justify-center shrink-0">
                      <Icon size={24} className="stroke-[1.75]" />
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        isLost
                          ? 'bg-rose-50 text-rose-600 border-rose-200'
                          : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                      }`}
                    >
                      {isLost ? 'Hilang' : 'Ditemukan'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                      {item.category}
                    </span>
                    <Link href={`/find/${item.id}`}>
                      <h3 className="font-bold text-sm sm:text-base text-gray-900 hover:text-[#30AFFF] transition-colors mt-0.5 cursor-pointer">
                        {item.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-2">
                      <MapPin size={12} className="text-gray-400 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-50 flex items-center justify-between gap-2">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
                      title="Hapus dari simpanan"
                    >
                      <Trash2 size={16} />
                    </button>

                    <Link
                      href={`/find/${item.id}`}
                      className="px-4 py-1.5 rounded-xl bg-[#30AFFF] hover:bg-[#2196E8] text-white text-xs font-semibold shadow-2xs transition-all text-center cursor-pointer"
                    >
                      {item.type === 'found' ? 'Ajukan Klaim' : 'Lihat Detail'}
                    </Link>
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
