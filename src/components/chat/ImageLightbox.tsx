'use client';

import React from 'react';
import { X } from 'lucide-react';

interface ImageLightboxProps {
  imageUrl: string | null;
  onClose: () => void;
}

export default function ImageLightbox({ imageUrl, onClose }: ImageLightboxProps) {
  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div className="relative max-w-3xl max-h-[90vh] flex flex-col items-center">
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-10 right-0 sm:-right-10 p-2 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 rounded-full transition-colors cursor-pointer"
          title="Tutup"
        >
          <X size={20} />
        </button>
        <img
          src={imageUrl}
          alt="Zoomed"
          className="max-w-full max-h-[85vh] rounded-[6px] object-contain shadow-2xl border border-white/10"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
}
