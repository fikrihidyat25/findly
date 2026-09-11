'use client';

import React from 'react';
import { ShieldCheck, Navigation, ArrowDown } from 'lucide-react';
import { ChatMessage } from '@/src/types/chat';
import { SafePoint } from '@/src/lib/safePoints';

interface ChatMessageListProps {
  messages: ChatMessage[];
  isAdmin?: boolean;
  isDisputed?: boolean;
  safePointsList: SafePoint[];
  onZoomImage: (url: string) => void;
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onScroll: () => void;
  isAtBottom: boolean;
  scrollToBottom: (smooth?: boolean, force?: boolean) => void;
}

// Warna untuk role pengirim (admin mediator view)
const SENDER_COLORS: Record<string, { name: string; bg: string; border: string; text: string }> = {
  pengklaim: { name: 'Pengklaim', bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700' },
  pelapor: { name: 'Pelapor/Penemu', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
  admin: { name: 'Admin Mediator', bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-800' },
};

export default function ChatMessageList({
  messages,
  isAdmin = false,
  isDisputed = false,
  safePointsList,
  onZoomImage,
  messagesContainerRef,
  messagesEndRef,
  onScroll,
  isAtBottom,
  scrollToBottom,
}: ChatMessageListProps) {

  // Deduplicate consecutive system messages with identical text
  const deduped: ChatMessage[] = [];
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (msg.sender === 'system' && i > 0) {
      const prev = deduped[deduped.length - 1];
      if (prev && prev.sender === 'system' && prev.text === msg.text) {
        continue; // Skip duplicate consecutive system message
      }
    }
    deduped.push(msg);
  }

  return (
    <div
      ref={messagesContainerRef}
      onScroll={onScroll}
      className="flex-1 min-h-0 p-4 sm:p-6 overflow-y-scroll custom-scrollbar bg-slate-50/50"
    >
      {deduped.map((msg, mIdx) => {
        const prevMsg = mIdx > 0 ? deduped[mIdx - 1] : null;
        const nextMsg = mIdx < deduped.length - 1 ? deduped[mIdx + 1] : null;

        const isAdminMsg = Boolean(msg.senderRole === 'admin' || msg.isAdminSender);

        // Grouping: same sender and role in consecutive messages
        const isSamePersonAsPrev = Boolean(
          prevMsg &&
          prevMsg.sender === msg.sender &&
          prevMsg.sender !== 'system' &&
          msg.sender !== 'system' &&
          prevMsg.senderRole === msg.senderRole &&
          prevMsg.senderName === msg.senderName
        );

        const isSamePersonAsNext = Boolean(
          nextMsg &&
          nextMsg.sender === msg.sender &&
          nextMsg.sender !== 'system' &&
          msg.sender !== 'system' &&
          nextMsg.senderRole === msg.senderRole &&
          nextMsg.senderName === msg.senderName
        );

        // System messages
        if (msg.sender === 'system') {
          return (
            <div
              key={`msg-sys-${msg.id || mIdx}-${mIdx}`}
              className="my-3 p-3 bg-white border border-slate-200 rounded-[6px] text-xs text-slate-600 max-w-md mx-auto text-center leading-relaxed shadow-2xs"
            >
              <p>{msg.text}</p>
              <span className="text-[10px] text-slate-400 mt-1 block">{msg.time}</span>
            </div>
          );
        }

        const isMe = msg.sender === 'me';
        const isMeetingCard = msg.text?.includes('TITIK TEMU AMAN KAMPUS');

        // Spacing: tight if same person as previous, normal gap otherwise
        const topSpacing = isSamePersonAsPrev ? 'mt-0.5' : 'mt-3.5';
        // Only show time on last message of a group
        const showTime = !isSamePersonAsNext;

        // Show sender name tag on first message of a group:
        // - ALWAYS if sender is admin
        // - In mediation mode (isDisputed) or when viewer is admin, for other participants
        const showSenderLabel =
          !isSamePersonAsPrev &&
          (isAdminMsg || ((isAdmin || isDisputed) && !isMe && Boolean(msg.senderName)));

        // Bubble border-radius: WhatsApp-style connected bubbles
        const isFirst = !isSamePersonAsPrev;
        const isLast = !isSamePersonAsNext;
        const bubbleRadius = isMe
          ? `${isFirst ? 'rounded-tl-[12px] rounded-tr-[4px]' : 'rounded-tl-[12px] rounded-tr-[4px]'} ${isLast ? 'rounded-bl-[12px] rounded-br-[12px]' : 'rounded-bl-[12px] rounded-br-[4px]'}`
          : `${isFirst ? 'rounded-tl-[4px] rounded-tr-[12px]' : 'rounded-tl-[4px] rounded-tr-[12px]'} ${isLast ? 'rounded-bl-[12px] rounded-br-[12px]' : 'rounded-bl-[4px] rounded-br-[12px]'}`;

        // Color scheme for sender role
        const roleColor = msg.senderRole ? SENDER_COLORS[msg.senderRole] : null;

        // Meeting point card
        if (isMeetingCard) {
          const matchedPt =
            safePointsList.find((p) => msg.text.includes(p.nama_lokasi)) || safePointsList[0];
          return (
            <div
              key={`msg-meet-${msg.id || mIdx}-${mIdx}`}
              className={`${topSpacing} flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in duration-200`}
            >
              {showSenderLabel && (
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  {isAdminMsg ? (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gradient-to-r from-purple-100 via-indigo-100 to-purple-50 text-purple-950 border border-purple-300 shadow-2xs">
                      <ShieldCheck size={13} className="text-purple-700 shrink-0" />
                      <span>{isMe ? 'Anda (Admin Mediasi)' : (msg.senderName || 'Admin Mediasi Kampus')}</span>
                      <span className="bg-purple-700 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full tracking-wider uppercase shadow-2xs">
                        ADMIN
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-800">
                        {msg.senderName}
                      </span>
                      {msg.senderRole && roleColor && (
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-[4px] border ${roleColor.bg} ${roleColor.border} ${roleColor.text}`}>
                          {roleColor.name}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
              <div
                className={`max-w-md p-4 rounded-[6px] text-xs sm:text-sm shadow-2xs ${
                  isAdminMsg
                    ? isMe
                      ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white'
                      : 'bg-gradient-to-b from-purple-50/90 to-white text-slate-900 border border-purple-200'
                    : isMe
                      ? 'bg-[#0369A1] text-white'
                      : isAdmin && roleColor
                        ? `${roleColor.bg} text-slate-800 border ${roleColor.border}`
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
              {showTime && <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>}
            </div>
          );
        }

        // Regular chat bubble
        return (
          <div
            key={`msg-body-${msg.id || mIdx}-${mIdx}`}
            className={`${topSpacing} flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in duration-200`}
          >
            {/* Sender label / Name Tag */}
            {showSenderLabel && (
              <div className="flex items-center gap-1.5 mb-1 px-1">
                {isAdminMsg ? (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gradient-to-r from-purple-100 via-indigo-100 to-purple-50 text-purple-950 border border-purple-300 shadow-2xs">
                    <ShieldCheck size={13} className="text-purple-700 shrink-0" />
                    <span>{isMe ? 'Anda (Admin Mediasi)' : (msg.senderName || 'Admin Mediasi Kampus')}</span>
                    <span className="bg-purple-700 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full tracking-wider uppercase shadow-2xs">
                      ADMIN
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-800">
                      {msg.senderName}
                    </span>
                    {msg.senderRole && roleColor && (
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-[4px] border ${roleColor.bg} ${roleColor.border} ${roleColor.text}`}>
                        {roleColor.name}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            <div
              className={`max-w-md p-3 text-xs sm:text-sm leading-relaxed shadow-2xs whitespace-pre-wrap ${bubbleRadius} ${
                isAdminMsg
                  ? isMe
                    ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-xs'
                    : 'bg-gradient-to-b from-purple-50/90 to-white text-slate-900 border border-purple-200/90 shadow-2xs ring-1 ring-purple-100/70'
                  : isMe
                    ? 'bg-[#0284C7] text-white'
                    : isAdmin && roleColor
                      ? `${roleColor.bg} text-slate-800 border ${roleColor.border}`
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
            {showTime && <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>}
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
