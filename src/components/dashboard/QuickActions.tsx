'use client';

import Link from 'next/link';
import { PackageMinus, Search, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export default function QuickActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
      {/* Action 1: Saya Kehilangan Barang */}
      <Link
        href="/lost/new"
        className="group relative bg-white p-5 rounded-[6px] border border-slate-200 hover:border-rose-300 hover:shadow-xs transition-all duration-200 flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-[4px] border border-rose-200">
              <AlertCircle size={11} />
              Lapor Cepat
            </span>
            <div className="w-9 h-9 rounded-[6px] bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100 group-hover:scale-105 transition-transform duration-200">
              <PackageMinus size={18} className="stroke-[2]" />
            </div>
          </div>
          <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-rose-600 transition-colors leading-snug">
            Saya Kehilangan Barang
          </h3>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
            Laporkan barang yang hilang agar lebih mudah ditemukan oleh civitas kampus.
          </p>
        </div>

        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-rose-600">
          <span>Buat Laporan Kehilangan</span>
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </div>
      </Link>

      {/* Action 2: Saya Menemukan Barang */}
      <Link
        href="/found/new"
        className="group relative bg-white p-5 rounded-[6px] border border-slate-200 hover:border-emerald-300 hover:shadow-xs transition-all duration-200 flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-[4px] border border-emerald-200">
              <Sparkles size={11} />
              Bantu Sesama
            </span>
            <div className="w-9 h-9 rounded-[6px] bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 group-hover:scale-105 transition-transform duration-200">
              <Search size={18} className="stroke-[2]" />
            </div>
          </div>
          <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-emerald-600 transition-colors leading-snug">
            Saya Menemukan Barang
          </h3>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
            Laporkan barang yang Anda temukan agar pemilik aslinya bisa segera mengambilnya.
          </p>
        </div>

        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-600">
          <span>Buat Laporan Temuan</span>
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </div>
      </Link>
    </div>
  );
}
