'use client';

import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { ChatConversation } from '@/src/types/chat';

interface ConversationListProps {
  conversations: ChatConversation[];
  selectedConv: ChatConversation | null;
  onSelectConv: (conv: ChatConversation) => void;
  isAdmin: boolean;
  showMobileChat: boolean;
}

export default function ConversationList({
  conversations,
  selectedConv,
  onSelectConv,
  isAdmin,
  showMobileChat,
}: ConversationListProps) {
  return (
    <div
      className={`lg:col-span-4 border-r border-slate-200 flex flex-col h-full min-h-0 bg-slate-50/50 ${
        showMobileChat ? 'hidden lg:flex' : 'flex'
      }`}
    >
      <div className="p-3.5 sm:p-4 border-b border-slate-200 bg-white shrink-0">
        <h2 className="font-bold text-sm text-slate-900">
          {isAdmin ? 'Kotak Masuk Mediasi' : 'Kotak Masuk Verifikasi'}
        </h2>
        <p className="text-[11px] text-slate-400 mt-0.5">
          {conversations.length} {isAdmin ? 'sesi mediasi aktif' : 'sesi chat aktif'}
        </p>
      </div>

      <div className="overflow-y-auto custom-scrollbar flex-1 min-h-0 divide-y divide-slate-100">
        {conversations.map((conv, idx) => {
          const active = selectedConv?.id === conv.id;
          return (
            <button
              key={`conv-${conv.id}-${idx}`}
              onClick={() => onSelectConv(conv)}
              className={`w-full p-4 text-left flex items-start gap-3 transition-colors cursor-pointer ${
                active ? 'bg-slate-100/90 border-l-4 border-slate-800' : 'hover:bg-slate-50 bg-white'
              }`}
            >
              <div className="relative w-10 h-10 rounded-[6px] bg-slate-800 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                {conv.counterpartName.substring(0, 2).toUpperCase()}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-[6px] bg-white flex items-center justify-center">
                  <CheckCircle2 size={10} className="text-emerald-600 fill-white" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="font-bold text-xs text-slate-900 truncate">
                    {conv.counterpartName}
                  </h4>
                  <span className="text-[10px] text-slate-400 shrink-0">{conv.lastTime}</span>
                </div>

                <div className="flex items-center justify-between gap-1 mt-0.5">
                  <p className="text-[11px] font-semibold text-sky-700 truncate">
                    {conv.itemTitle}
                  </p>
                  {isAdmin ? (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-[4px] bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                      Sengketa Mediasi
                    </span>
                  ) : conv.status === 'DISPUTED' ? (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-[4px] bg-purple-50 text-purple-700 border border-purple-200 shrink-0 flex items-center gap-1">
                      <ShieldCheck size={10} />
                      <span>Mediasi</span>
                    </span>
                  ) : null}
                </div>

                <p className="text-xs text-slate-500 truncate mt-1">{conv.lastMessage}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
