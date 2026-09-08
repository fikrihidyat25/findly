'use client';

import { ArrowLeft, CheckCircle2, MapPin, Check, X, AlertTriangle } from 'lucide-react';
import { ChatConversation } from '@/src/types/chat';

interface ChatHeaderProps {
  selectedConv: ChatConversation;
  isAdmin: boolean;
  isApproved: boolean;
  isDisputed: boolean;
  onBackToConversations: () => void;
  onOpenSafePointModal: () => void;
  onApprove: () => void;
  onDispute: () => void;
  onRejectByAdmin: () => void;
}

export default function ChatHeader({
  selectedConv,
  isAdmin,
  isApproved,
  isDisputed,
  onBackToConversations,
  onOpenSafePointModal,
  onApprove,
  onDispute,
  onRejectByAdmin,
}: ChatHeaderProps) {
  return (
    <div className="p-3 sm:p-3.5 border-b border-slate-200 flex items-center justify-between gap-2 sm:gap-3 bg-white shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onBackToConversations}
          className="lg:hidden p-1.5 text-slate-500 hover:text-slate-900 rounded-[6px] hover:bg-slate-100 cursor-pointer shrink-0"
          aria-label="Kembali ke daftar pesan"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="w-10 h-10 rounded-[6px] bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center font-bold text-sm shrink-0">
          {selectedConv.counterpartName.substring(0, 2).toUpperCase()}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-bold text-sm text-slate-900 truncate">
              {selectedConv.counterpartName}
            </h3>
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-[4px] shrink-0 ${
                selectedConv.counterpartRole === 'Sengketa Mediasi'
                  ? 'bg-amber-50 text-amber-800 border border-amber-300'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-300'
              }`}
            >
              {selectedConv.counterpartRole === 'Sengketa Mediasi' ? (
                <AlertTriangle size={10} className="text-amber-700" />
              ) : (
                <CheckCircle2 size={10} className="text-emerald-700" />
              )}
              {selectedConv.counterpartRole}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 truncate">
            Membahas barang: <strong className="text-slate-800 font-semibold">{selectedConv.itemTitle}</strong>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Titik Temu Aman */}
        <button
          type="button"
          onClick={onOpenSafePointModal}
          className="px-2.5 sm:px-3 py-1.5 rounded-[6px] bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
          title="Pilih titik temu aman resmi kampus"
        >
          <MapPin size={13} className="text-sky-600 shrink-0" />
          <span className="hidden sm:inline">Titik Temu Aman</span>
        </button>

        {!isApproved && !isDisputed && (
          <>
            {isAdmin ? (
              <>
                <button
                  type="button"
                  onClick={onApprove}
                  className="px-2.5 sm:px-3 py-1.5 rounded-[6px] bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                >
                  <Check size={13} />
                  <span className="hidden sm:inline">Setujui Serah Terima</span>
                  <span className="sm:hidden">Setujui</span>
                </button>
                <button
                  type="button"
                  onClick={onRejectByAdmin}
                  className="px-2.5 sm:px-3 py-1.5 rounded-[6px] border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                >
                  <X size={13} />
                  <span className="hidden sm:inline">Tolak Klaim</span>
                  <span className="sm:hidden">Tolak</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onApprove}
                  className="px-2.5 sm:px-3 py-1.5 rounded-[6px] bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                >
                  <Check size={13} />
                  <span className="hidden sm:inline">Sepakati Pemilikan</span>
                  <span className="sm:hidden">Sepakati</span>
                </button>
                <button
                  type="button"
                  onClick={onDispute}
                  className="px-2.5 sm:px-3 py-1.5 rounded-[6px] border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                >
                  <AlertTriangle size={13} className="text-amber-600" />
                  <span className="hidden sm:inline">Panggil Mediator</span>
                  <span className="sm:hidden">Mediasi</span>
                </button>
              </>
            )}
          </>
        )}

        {isApproved && (
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-[4px] border border-emerald-300">
            Selesai
          </span>
        )}

        {isDisputed && (
          <span className="text-[11px] font-semibold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-[4px] border border-purple-300">
            Dalam Mediasi
          </span>
        )}
      </div>
    </div>
  );
}
