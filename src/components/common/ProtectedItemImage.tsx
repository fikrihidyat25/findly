'use client';

import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

export interface ProtectedItemImageProps {
  src?: string | null;
  alt: string;
  type: 'lost' | 'found';
  category?: string;
  isOwnerOrAdmin?: boolean;
  variant?: 'thumbnail' | 'detail';
  Icon?: any;
  colorScheme?: { bg: string; text: string; border: string };
  className?: string;
}

export default function ProtectedItemImage({
  src,
  alt,
  type,
  category,
  isOwnerOrAdmin = false,
  variant = 'thumbnail',
  Icon,
  colorScheme = { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
  className = '',
}: ProtectedItemImageProps) {
  const [error, setError] = useState(false);
  const isValid = Boolean(src && !src.startsWith('blob:') && !error);

  const isFound = type === 'found';
  // Jika barang temuan dan yang melihat bukan pelapor/admin, foto disamarkan dengan blur & watermark
  const shouldMask = isFound && !isOwnerOrAdmin;

  // Jika tidak ada foto valid, tampilkan ikon representasi kategori
  if (!isValid) {
    if (variant === 'detail') {
      return (
        <div
          className={`rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/80 border border-slate-200 p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-3 ${className}`}
        >
          <div
            className={`w-20 h-20 rounded-2xl ${colorScheme.bg} ${colorScheme.text} border ${colorScheme.border} flex items-center justify-center shadow-xs`}
          >
            {Icon && <Icon size={40} className="stroke-[1.75]" />}
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {category || 'Representasi Barang'}
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Foto belum diunggah oleh pelapor.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`w-16 h-16 rounded-2xl bg-white/90 shadow-2xs flex items-center justify-center ${colorScheme.text} group-hover:scale-105 transition-transform duration-300 ${className}`}
      >
        {Icon && <Icon size={32} className="stroke-[1.75]" />}
      </div>
    );
  }

  // Tampilan halaman Detail (/find/[id])
  if (variant === 'detail') {
    if (shouldMask) {
      return (
        <div
          className={`relative rounded-2xl border border-slate-200 overflow-hidden shadow-xs max-h-96 flex items-center justify-center bg-slate-950 ${className}`}
        >
          {/* Foto asli dengan efek blur */}
          <img
            src={src!}
            alt={alt}
            onError={() => setError(true)}
            className="w-full h-auto max-h-96 object-cover filter blur-2xl scale-110 opacity-50 select-none pointer-events-none"
          />

          {/* Watermark diagonal anti-screenshot/fraud */}
          <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center rotate-[-15deg] select-none text-white font-black text-xl sm:text-2xl tracking-[0.3em] uppercase text-center">
            FINDLY • PROTECTED
          </div>

          {/* Watermark label kecil di pojok */}
          <div className="absolute bottom-3 right-3 pointer-events-none px-2.5 py-1 rounded-[6px] bg-slate-900/70 backdrop-blur-md text-[10px] font-medium text-white/80 border border-white/10 select-none shadow-xs">
            FINDLY • PRIVASI DILINDUNGI
          </div>
        </div>
      );
    }

    // Tampilan detail jika yang melihat adalah pelapor/admin atau barang hilang
    return (
      <div
        className={`relative rounded-2xl border border-slate-200 overflow-hidden shadow-xs max-h-96 flex items-center justify-center bg-slate-900/5 ${className}`}
      >
        <img
          src={src!}
          alt={alt}
          onError={() => setError(true)}
          className="w-full h-auto max-h-96 object-contain"
        />

        {/* Watermark pengaman */}
        <div className="absolute bottom-3 right-3 pointer-events-none px-2.5 py-1 rounded-[6px] bg-slate-900/60 backdrop-blur-md text-[10px] font-semibold text-white/90 border border-white/20 select-none shadow-xs">
          FINDLY KAMPUS • BUKTI RESMI
        </div>

        {/* Lencana khusus pelapor / petugas */}
        {isFound && isOwnerOrAdmin && (
          <div className="absolute top-3 left-3 pointer-events-none inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-emerald-900/80 backdrop-blur-md text-[10px] font-semibold text-emerald-200 border border-emerald-500/40 select-none shadow-xs">
            <ShieldCheck size={12} className="text-emerald-400" />
            <span>Foto Asli (Hanya Anda & Petugas)</span>
          </div>
        )}
      </div>
    );
  }

  // Tampilan Thumbnail di Kartu Katalog (/find, /dashboard, atau /saved)
  if (shouldMask) {
    return (
      <div className={`relative w-full h-full overflow-hidden bg-slate-950 flex items-center justify-center ${className}`}>
        {/* Foto blur */}
        <img
          src={src!}
          alt={alt}
          onError={() => setError(true)}
          className="w-full h-full object-cover filter blur-xl scale-110 opacity-70 select-none pointer-events-none"
        />

        {/* Watermark (WM) tebal / tegas di tengah */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center select-none">
          <span className="text-white/40 font-black tracking-[0.25em] text-xs sm:text-sm uppercase rotate-[-15deg] select-none">
            FINDLY • PROTECTED
          </span>
        </div>

        {/* Watermark kecil di pojok bawah */}
        <div className="absolute bottom-2 right-2 pointer-events-none px-1.5 py-0.5 rounded-[4px] bg-black/40 backdrop-blur-xs text-[9px] font-medium text-white/80 select-none">
          FINDLY
        </div>
      </div>
    );
  }

  // Tampilan jernih untuk barang hilang atau pemilik/admin
  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <img
        src={src!}
        alt={alt}
        onError={() => setError(true)}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />

      {/* Watermark kecil di pojok kanan bawah */}
      <div className="absolute bottom-2 right-2 pointer-events-none px-1.5 py-0.5 rounded-[4px] bg-black/40 backdrop-blur-xs text-[9px] font-medium text-white/80 select-none">
        FINDLY
      </div>

      {isFound && isOwnerOrAdmin && (
        <div className="absolute bottom-2 left-2 pointer-events-none inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] bg-emerald-900/80 backdrop-blur-xs text-[9px] font-medium text-emerald-200 select-none">
          <ShieldCheck size={10} className="text-emerald-400" />
          <span>Foto Asli</span>
        </div>
      )}
    </div>
  );
}
