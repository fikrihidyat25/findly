'use client';

import Link from 'next/link';
import { PackageMinus, Search, ArrowRight, Sparkles } from 'lucide-react';

export default function QuickActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
      {/* Action 1: Saya Kehilangan Barang */}
      <Link
        href="/lost/new"
        className="group relative overflow-hidden bg-white p-5 sm:p-6 rounded-2xl border border-rose-100/80 hover:border-rose-200 shadow-2xs hover:shadow-md transition-all duration-300 flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-rose-50/90 text-rose-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300 border border-rose-100/60 shadow-2xs">
            <PackageMinus size={24} className="stroke-[1.8]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-rose-600 transition-colors">
                Saya Kehilangan Barang
              </h3>
            </div>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed max-w-xs">
              Laporkan barang yang hilang agar lebih mudah ditemukan oleh civitas kampus.
            </p>
          </div>
        </div>

        <div className="w-9 h-9 rounded-xl bg-gray-50 group-hover:bg-rose-500 group-hover:text-white text-gray-400 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:translate-x-1">
          <ArrowRight size={17} />
        </div>
      </Link>

      {/* Action 2: Saya Menemukan Barang */}
      <Link
        href="/found/new"
        className="group relative overflow-hidden bg-white p-5 sm:p-6 rounded-2xl border border-emerald-100/80 hover:border-emerald-200 shadow-2xs hover:shadow-md transition-all duration-300 flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-emerald-50/90 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300 border border-emerald-100/60 shadow-2xs">
            <Search size={24} className="stroke-[1.8]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-emerald-600 transition-colors">
                Saya Menemukan Barang
              </h3>
              <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                <Sparkles size={10} />
                Bantu Sesama
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed max-w-xs">
              Laporkan barang yang Anda temukan agar pemilik aslinya bisa segera mengambilnya.
            </p>
          </div>
        </div>

        <div className="w-9 h-9 rounded-xl bg-gray-50 group-hover:bg-emerald-600 group-hover:text-white text-gray-400 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:translate-x-1">
          <ArrowRight size={17} />
        </div>
      </Link>
    </div>
  );
}
