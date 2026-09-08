'use client';

import React from 'react';
import { Paperclip, Send, Loader2, X } from 'lucide-react';
import { SelectedImageAttachment } from '@/src/types/chat';

interface ChatInputProps {
  inputMessage: string;
  setInputMessage: (val: string) => void;
  selectedImage: SelectedImageAttachment | null;
  onClearSelectedImage: () => void;
  isUploadingImage: boolean;
  onSendMessage: (e: React.FormEvent) => void;
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export default function ChatInput({
  inputMessage,
  setInputMessage,
  selectedImage,
  onClearSelectedImage,
  isUploadingImage,
  onSendMessage,
  onImageSelect,
  fileInputRef,
  inputRef,
}: ChatInputProps) {
  return (
    <div className="shrink-0">
      {/* Floating Image Preview Bar */}
      {selectedImage && (
        <div className="px-4 py-2 bg-sky-50/80 border-t border-sky-100 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img
              src={selectedImage.dataUrl}
              alt="Preview"
              className="w-11 h-11 rounded-[4px] object-cover border border-sky-200 shadow-xs shrink-0"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">{selectedImage.name}</p>
              <p className="text-[10px] text-slate-500">
                {(selectedImage.size / 1024).toFixed(0)} KB • Siap dikirim
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClearSelectedImage}
            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-white rounded-[4px] transition-colors cursor-pointer"
            title="Batalkan lampiran"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Chat Input Bar */}
      <form
        onSubmit={onSendMessage}
        className="p-3 sm:p-4 border-t border-slate-200 bg-white flex items-center gap-2"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onImageSelect}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploadingImage}
          className="p-2 text-slate-500 hover:text-slate-800 rounded-[6px] hover:bg-slate-100 transition-colors cursor-pointer relative"
          aria-label="Lampirkan foto"
          title="Kirim Foto Bukti / Barang"
        >
          <Paperclip size={18} />
          {selectedImage && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-sky-600 rounded-full ring-2 ring-white" />
          )}
        </button>
        <input
          ref={inputRef}
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={
            selectedImage
              ? 'Tambah keterangan foto (opsional)...'
              : 'Ketik pesan...'
          }
          className="flex-1 bg-slate-50 hover:bg-white focus:bg-white px-4 py-2.5 rounded-[6px] text-xs sm:text-sm text-slate-800 border border-slate-300 focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/20 focus:outline-none transition-all shadow-2xs"
        />
        <button
          type="submit"
          disabled={(!inputMessage.trim() && !selectedImage) || isUploadingImage}
          className="p-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-[6px] shadow-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center min-w-[38px]"
          aria-label="Kirim Pesan"
        >
          {isUploadingImage ? (
            <Loader2 size={16} className="animate-spin text-white" />
          ) : (
            <Send size={16} />
          )}
        </button>
      </form>
    </div>
  );
}
