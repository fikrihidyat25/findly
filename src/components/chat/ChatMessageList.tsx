'use client';

import React from 'react';
import { ShieldCheck, Navigation, ArrowDown } from 'lucide-react';
import { ChatMessage } from '@/src/types/chat';
import { SafePoint } from '@/src/lib/safePoints';

interface ChatMessageListProps {
  messages: ChatMessage[];
  safePointsList: SafePoint[];
  onZoomImage: (url: string) => void;
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onScroll: () => void;
  isAtBottom: boolean;
  scrollToBottom: (smooth?: boolean, force?: boolean) => void;
}

export default function ChatMessageList({
  messages,
  safePointsList,
  onZoomImage,
  messagesContainerRef,
  messagesEndRef,
  onScroll,
  isAtBottom,
  scrollToBottom,
}: ChatMessageListProps) {
  return (
    <div
      ref={messagesContainerRef}
      onScroll={onScroll}
      className="flex-1 min-h-0 p-4 sm:p-6 overflow-y-scroll custom-scrollbar space-y-3.5 bg-slate-50/50"
    >
      {messages.map((msg, mIdx) => {
        if (msg.sender === 'system') {
          return (
            <div
              key={`msg-sys-${msg.id || mIdx}-${mIdx}`}
              className="p-3 bg-white border border-slate-200 rounded-[6px] text-xs text-slate-600 max-w-md mx-auto text-center leading-relaxed shadow-2xs"
            >
              <p>{msg.text}</p>
            </div>
          );
        }

        const isMe = msg.sender === 'me';
        const isMeetingCard = msg.text?.includes('TITIK TEMU AMAN KAMPUS');

        if (isMeetingCard) {
          const matchedPt =
            safePointsList.find((p) => msg.text.includes(p.nama_lokasi)) || safePointsList[0];
          return (
            <div
              key={`msg-meet-${msg.id || mIdx}-${mIdx}`}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in duration-200`}
            >
              <div
                className={`max-w-md p-4 rounded-[6px] text-xs sm:text-sm shadow-2xs ${
                  isMe
                    ? 'bg-[#0369A1] text-white'
                    : 'bg-white text-slate-800 border border-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] mb-1.5 opacity-90">
                  <ShieldCheck size={14} />
                  <span>Titik Temu Resmi Terverifikasi</span>
                </div>
                <h4 className="font-bold text-sm mb-1">{matchedPt.nama_lokasi}</h4>
                <p className={`text-xs mb-2.5 leading-relaxed ${isMe ? 'text-white/90' : 'text-slate-600'}`}>
                  {matchedPt.alamat_lengkap}
                </p>
                <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold mb-3">
                  {matchedPt.ada_satpam && (
                    <span className={`px-2 py-0.5 rounded-[4px] ${isMe ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}>
                      👮 Satpam 24 Jam
                    </span>
                  )}
                  {matchedPt.ada_cctv && (
                    <span className={`px-2 py-0.5 rounded-[4px] ${isMe ? 'bg-white/20 text-white' : 'bg-sky-50 text-sky-800 border border-sky-200'}`}>
                      📹 CCTV Aktif
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded-[4px] ${isMe ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
                    🕒 {matchedPt.jam_buka} - {matchedPt.jam_tutup} WIB
                  </span>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${matchedPt.latitude},${matchedPt.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-2 px-3 rounded-[6px] font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 ${
                    isMe
                      ? 'bg-white text-[#0369A1] hover:bg-slate-100'
                      : 'bg-[#0284C7] hover:bg-[#0369A1] text-white'
                  }`}
                  title="Buka lokasi di Google Maps"
                >
                  <Navigation size={13} />
                  <span>Buka di Peta</span>
                </a>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
            </div>
          );
        }

        return (
          <div
            key={`msg-body-${msg.id || mIdx}-${mIdx}`}
            className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in duration-200`}
          >
            <div
              className={`max-w-md p-3.5 rounded-[6px] text-xs sm:text-sm leading-relaxed shadow-2xs whitespace-pre-wrap ${
                isMe
                  ? 'bg-[#0284C7] text-white'
                  : 'bg-white text-slate-800 border border-slate-200'
              }`}
            >
              {msg.imageUrl && (
                <div className="mb-2">
                  <img
                    src={msg.imageUrl}
                    alt="Foto Verifikasi"
                    onClick={() => onZoomImage(msg.imageUrl || '')}
                    className="rounded-[6px] max-h-60 max-w-full object-cover cursor-pointer hover:opacity-95 transition-opacity border border-black/10 shadow-xs"
                  />
                </div>
              )}
              {msg.text ? <span>{msg.text}</span> : null}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
          </div>
        );
      })}

      <div ref={messagesEndRef} />

      {/* Floating button to jump to newest messages */}
      {!isAtBottom && (
        <div className="sticky bottom-3 flex justify-end pointer-events-none">
          <button
            type="button"
            onClick={() => scrollToBottom(true, true)}
            className="pointer-events-auto px-3 py-1.5 rounded-[6px] bg-white text-sky-600 border border-sky-200 shadow-md text-xs font-semibold flex items-center gap-1.5 hover:bg-sky-50 transition-all cursor-pointer animate-in fade-in duration-150"
          >
            <ArrowDown size={14} />
            <span>Pesan Terbaru</span>
          </button>
        </div>
      )}
    </div>
  );
}
