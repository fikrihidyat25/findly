'use client';

import { useState } from 'react';
import { ShieldCheck, X } from 'lucide-react';

export default function SafetyTipBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-blue-50/70 border border-blue-100/80 p-4 sm:p-4.5 shadow-2xs transition-all duration-200">
      <div className="flex items-start justify-between gap-3.5">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-xl bg-[#30AFFF] text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
            <ShieldCheck size={20} className="stroke-[2.2]" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <h4 className="font-bold text-xs sm:text-sm text-gray-900 tracking-tight">
              Tips: Lindungi Barang Berharga Anda
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Selalu simpan barang berharga Anda di tempat yang aman dan jangan tinggalkan tanpa pengawasan di area perpustakaan, kantin, atau kelas. Jika Anda kehilangan atau menemukan sesuatu, segera laporkan di Findly.
            </p>
          </div>
        </div>

        {/* Close / Dismiss Button */}
        <button
          type="button"
          onClick={() => setIsVisible(false)}
          className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-blue-100/60 transition-colors shrink-0 cursor-pointer"
          aria-label="Tutup tips keamanan"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
