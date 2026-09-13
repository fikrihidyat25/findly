'use client';

import { ArrowLeft, CheckCircle2, MapPin, Check, X, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';
import { ChatConversation } from '@/src/types/chat';

interface ChatHeaderProps {
  selectedConv: ChatConversation;
  isAdmin: boolean;
  isApproved: boolean;
  isDisputed: boolean;
  myAgreed?: boolean;
  otherAgreed?: boolean;
  onBackToConversations: () => void;
  onOpenSafePointModal: () => void;
  onApprove: () => void;
  onCancelApprove?: () => void;
  onDispute: () => void;
  onRejectByAdmin: () => void;
}

export default function ChatHeader({
  selectedConv,
  isAdmin,
  isApproved,
  isDisputed,
  myAgreed = false,
  otherAgreed = false,
  onBackToConversations,
  onOpenSafePointModal,
  onApprove,
  onCancelApprove,
  onDispute,
  onRejectByAdmin,
}: ChatHeaderProps) {
  return (
    <div className="p-3 sm:p-3.5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white shrink-0">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 w-full md:w-auto">
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

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-bold text-sm text-slate-900 truncate max-w-full">
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
              <span>{selectedConv.counterpartRole}</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 truncate mt-0.5">
            Membahas barang: <span className="font-semibold text-slate-800">{selectedConv.itemTitle}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap shrink-0">
        <button
          type="button"
          onClick={onOpenSafePointModal}
          className="px-2.5 sm:px-3 py-1.5 rounded-[6px] border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
        >
          <MapPin size={13} className="text-[#30AFFF]" />
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
                {/* 1. Pengguna saat ini sudah sepakat, menunggu lawan bicara */}
                {myAgreed && !otherAgreed && (
                  <div className="flex items-center gap-1">
                    <span className="px-2.5 sm:px-3 py-1.5 rounded-[6px] bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold flex items-center gap-1.5 shadow-2xs">
                      <Clock size={13} className="text-amber-600 animate-pulse" />
                      <span className="hidden sm:inline">Menunggu Lawan Bicara (1/2)</span>
                      <span className="sm:hidden">Menunggu (1/2)</span>
                    </span>
                    {onCancelApprove && (
                      <button
                        type="button"
                        onClick={onCancelApprove}
                        className="px-1.5 py-1 text-[11px] text-gray-400 hover:text-rose-600 hover:underline cursor-pointer"
                        title="Batalkan pengajuan kesepakatan"
                      >
                        Batal
                      </button>
                    )}
                  </div>
                )}

                {/* 2. Lawan bicara sudah sepakat, pengguna ini belum */}
                {otherAgreed && !myAgreed && (
                  <button
                    type="button"
                    onClick={onApprove}
                    className="px-2.5 sm:px-3 py-1.5 rounded-[6px] bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 ring-2 ring-emerald-300/80 animate-pulse"
                    title="Lawan bicara telah menyepakati! Klik untuk mengonfirmasi serah terima"
                  >
                    <Check size={14} className="stroke-[2.5]" />
                    <span className="hidden sm:inline">Setujui Kesepakatan (1/2)</span>
                    <span className="sm:hidden">Setujui (1/2)</span>
                  </button>
                )}

                {/* 3. Belum ada yang sepakat */}
                {!myAgreed && !otherAgreed && (
                  <button
                    type="button"
                    onClick={onApprove}
                    className="px-2.5 sm:px-3 py-1.5 rounded-[6px] bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Check size={13} />
                    <span className="hidden sm:inline">Sepakati Pemilikan</span>
                    <span className="sm:hidden">Sepakati</span>
                  </button>
                )}

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
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-[4px] border border-emerald-300 flex items-center gap-1">
            <CheckCircle2 size={13} className="text-emerald-700" />
            <span>Selesai (Disepakati Kedua Pihak)</span>
          </span>
        )}

        {isDisputed && (
          <span className="text-[11px] font-semibold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-[4px] border border-purple-300 flex items-center gap-1 shadow-2xs">
            <ShieldCheck size={13} className="text-purple-600" />
            <span>Dalam Mediasi Admin</span>
          </span>
        )}
      </div>
    </div>
  );
}
