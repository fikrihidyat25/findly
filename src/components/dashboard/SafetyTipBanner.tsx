'use client';

import Link from 'next/link';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export default function SafetyTipBanner() {
  return (
    <div className="bg-white rounded-[6px] border border-slate-200 p-4 sm:p-5">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-[6px] bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center shrink-0">
            <ShieldCheck size={20} className="stroke-[2]" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 tracking-tight flex items-center gap-2">
              <span>Tips Keamanan Barang di Kampus</span>
              <span className="text-[10px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.2 rounded-[4px]">
                Keamanan
              </span>
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
              Selalu simpan barang berharga Anda di tempat yang aman dan jangan tinggalkan tanpa pengawasan di area perpustakaan, kantin, atau ruang kelas. Jika Anda kehilangan atau menemukan sesuatu, segera buat laporan melalui Findly.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          <Link
            href="/help"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-[6px] transition-all"
          >
            <span>Panduan Lengkap</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
