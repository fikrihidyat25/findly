'use client';

import { useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/src/components/layout/AppLayout';
import {
  Bookmark,
  MapPin,
  Clock,
  Trash2,
  ArrowRight,
  Briefcase,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';

export default function SavedItemsPage() {
  const [items, setItems] = useState([
    {
      id: '1',
      title: 'Tas Ransel Kuning Nike',
      type: 'found',
      category: 'Tas & Ransel',
      location: 'Perpustakaan Pusat, Lantai 2',
      date: '01 Sep 2026',
      icon: Briefcase,
    },
    {
      id: '3',
      title: 'iPhone 13 Pro Biru Sierra',
      type: 'lost',
      category: 'Elektronik & Gadget',
      location: 'Gedung Kuliah Bersama (GKB) Ruang 304',
      date: '01 Sep 2026',
      icon: Smartphone,
    },
  ]);

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
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

        {items.length === 0 ? (
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
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#30AFFF] hover:bg-[#2196E8] text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
            >
              <span>Jelajahi Cari Barang</span>
              <ArrowRight size={14} />
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
                    <h3 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-[#30AFFF] transition-colors mt-0.5">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-2">
                      <MapPin size={12} className="text-gray-400 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-50 flex items-center justify-between gap-2">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                      title="Hapus dari simpanan"
                    >
                      <Trash2 size={16} />
                    </button>

                    <Link
                      href={item.type === 'found' ? '/claim/new' : '/find'}
                      className="px-3.5 py-1.5 rounded-xl bg-[#30AFFF] hover:bg-[#2196E8] text-white text-xs font-semibold shadow-2xs transition-all flex items-center gap-1"
                    >
                      <span>{item.type === 'found' ? 'Ajukan Klaim' : 'Lihat Detail'}</span>
                      <ArrowRight size={13} />
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
