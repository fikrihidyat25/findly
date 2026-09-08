'use client';

import Link from 'next/link';
import { ShieldCheck, ArrowRight, PhoneCall } from 'lucide-react';

export default function SafetyTipBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#EFF8FF] via-[#F0F7FE] to-[#EBF5FF] border border-[#BFDBFE]/70 p-5 sm:p-6 shadow-2xs">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#30AFFF] text-white flex items-center justify-center shrink-0 shadow-sm">
            <ShieldCheck size={24} className="stroke-[2]" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-xs sm:text-sm text-gray-900 tracking-tight flex items-center gap-2">
              <span>Tips: Lindungi Barang Berharga Anda</span>
              <span className="text-[10px] font-bold text-[#0284C7] bg-sky-100/80 px-2 py-0.5 rounded-full">
                Keamanan Kampus
              </span>
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed max-w-2xl">
              Selalu simpan barang berharga Anda di tempat yang aman dan jangan tinggalkan tanpa pengawasan di area perpustakaan, kantin, atau kelas. Jika Anda kehilangan atau menemukan sesuatu, segera laporkan di Findly.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
          <Link
            href="/help/safety"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#30AFFF] bg-white hover:bg-sky-50 border border-sky-200 px-3.5 py-2 rounded-xl transition-all shadow-2xs"
          >
            <span>Panduan Keamanan</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
