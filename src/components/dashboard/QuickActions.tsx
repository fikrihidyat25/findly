'use client';

import Link from 'next/link';
import { PackageMinus, Search, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

export default function QuickActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
      {/* Action 1: Saya Kehilangan Barang */}
      <Link
        href="/lost/new"
        className="group relative overflow-hidden bg-white p-5 sm:p-6 rounded-2xl border border-rose-100/80 hover:border-rose-200 shadow-2xs hover:shadow-md transition-all duration-300 flex items-center justify-between gap-4"
      >
        <div className="flex items-start gap-4 min-w-0 flex-1">
          <div className="w-12 h-12 rounded-2xl bg-rose-50/90 text-rose-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300 border border-rose-100/60 shadow-2xs mt-0.5">
            <PackageMinus size={22} className="stroke-[1.8]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60 shrink-0">
                <AlertCircle size={10} />
                Lapor Cepat
              </span>
            </div>
            <h3 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-rose-600 transition-colors leading-snug">
              Saya Kehilangan Barang
            </h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
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
        <div className="flex items-start gap-4 min-w-0 flex-1">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50/90 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300 border border-emerald-100/60 shadow-2xs mt-0.5">
            <Search size={22} className="stroke-[1.8]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 shrink-0">
                <Sparkles size={10} />
                Bantu Sesama
              </span>
            </div>
            <h3 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-emerald-600 transition-colors leading-snug">
              Saya Menemukan Barang
            </h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
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
