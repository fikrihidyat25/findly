'use client';

import { useState, useRef, useEffect } from 'react';
import AppLayout from '@/src/components/layout/AppLayout';
import {
  Send,
  Paperclip,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Briefcase,
  MapPin,
  Clock,
  Check,
  User,
  MoreVertical,
  HelpCircle,
  ArrowLeft,
  Smile,
} from 'lucide-react';

interface ChatConversation {
  id: string;
  counterpartName: string;
  counterpartRole: string;
  itemTitle: string;
  lastMessage: string;
  lastTime: string;
  unread: boolean;
  status: 'VERIFYING' | 'RESOLVED' | 'DISPUTED';
}

const INITIAL_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'conv-1',
    counterpartName: 'Megawati',
    counterpartRole: 'Mahasiswa · Univ ABC',
    itemTitle: 'Tas Ransel Kuning Nike',
    lastMessage: 'Cocok sekali! Semuanya persis sama. Bisa kita janjian serah terima di depan perpustakaan jam 2 siang ini?',
    lastTime: '10:45',
    unread: false,
    status: 'VERIFYING',
  },
  {
    id: 'conv-2',
    counterpartName: 'Rian Pratama',
    counterpartRole: 'Mahasiswa · Teknik Elektro',
    itemTitle: 'Kartu Tanda Mahasiswa (KTM)',
    lastMessage: 'Baik, terima kasih atas laporannya mas. Sudah saya titipkan di marbot masjid ya.',
    lastTime: 'Kemarin',
    unread: false,
    status: 'RESOLVED',
  },
  {
    id: 'conv-3',
    counterpartName: 'Bpk. Joko (Satpam)',
    counterpartRole: 'Petugas Keamanan Perpustakaan',
    itemTitle: 'Kunci Motor Honda Vario',
    lastMessage: 'Kunci aman dititipkan di pos satpam lantai 1. Bawa STNK saat mengambil ya.',
    lastTime: '31 Agu',
    unread: false,
    status: 'VERIFYING',
  },
];

interface ChatMessage {
  id: string;
  sender: 'me' | 'other' | 'system';
  text: string;
  time: string;
}

const INITIAL_MESSAGES_MAP: Record<string, ChatMessage[]> = {
  'conv-1': [
    {
      id: 'm1',
      sender: 'system',
      text: '🔒 Sesi Verifikasi Pemilik Sah Dibuka. Penemu memegang detail rahasia barang. Silakan lakukan tanya jawab untuk membuktikan kepemilikan sebelum menyepakati serah terima.',
      time: '10:30',
    },
    {
      id: 'm2',
      sender: 'other',
      text: 'Halo Budi! Saya yang menemukan tas ransel kuning di lantai 2 perpus. Bisa sebutkan apa saja isi di dalam kantong kecil tas ini untuk verifikasi?',
      time: '10:35',
    },
    {
      id: 'm3',
      sender: 'me',
      text: 'Halo Megawati, terima kasih banyak! Di kantong kecil depan ada flashdisk Sandisk 32GB warna merah, kartu perpustakaan atas nama saya, dan pulpen hitam.',
      time: '10:40',
    },
    {
      id: 'm4',
      sender: 'other',
      text: 'Cocok sekali! Semuanya persis sama. Bisa kita janjian serah terima di depan perpustakaan jam 2 siang ini?',
      time: '10:45',
    },
  ],
  'conv-2': [
    {
      id: 'm2-1',
      sender: 'system',
      text: '🔒 Sesi Verifikasi Pemilik Sah Dibuka.',
      time: 'Kemarin',
    },
    {
      id: 'm2-2',
      sender: 'other',
      text: 'Halo, saya menemukan KTM atas nama Budi Santoso di sekitar rak sepatu Masjid Kampus.',
      time: 'Kemarin',
    },
    {
      id: 'm2-3',
      sender: 'me',
      text: 'Wah betul itu punya saya mas Rian! Terjatuh saat sholat dhuhur kemarin.',
      time: 'Kemarin',
    },
    {
      id: 'm2-4',
      sender: 'other',
      text: 'Baik, terima kasih atas laporannya mas. Sudah saya titipkan di marbot masjid ya.',
      time: 'Kemarin',
    },
  ],
  'conv-3': [
    {
      id: 'm3-1',
      sender: 'system',
      text: '🔒 Titik Kumpul Keamanan Kampus Findly Terhubung.',
      time: '31 Agu',
    },
    {
      id: 'm3-2',
      sender: 'other',
      text: 'Kunci motor Vario warna hitam aman dititipkan di pos satpam lantai 1. Bawa STNK atau kunci cadangan saat mengambil ya.',
      time: '31 Agu',
    },
  ],
};

const AUTO_REPLIES = [
  'Baik kak! Informasi sudah saya catat. Nanti kita ketemu di titik kumpul aman yang disepakati ya.',
  'Siap kak! Saya tunggu di lokasi kampus. Nanti kabari saya kalau sudah sampai ya.',
  'Oke kak, terima kasih banyak atas konfirmasinya. Sampai jumpa nanti!',
  'Baik, nanti jangan lupa tunjukkan kartu mahasiswa / bukti verifikasi Findly saat serah terima ya kak.',
];

export default function MessagesPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>(INITIAL_CONVERSATIONS);
  const [selectedConv, setSelectedConv] = useState<ChatConversation>(INITIAL_CONVERSATIONS[0]);
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES_MAP);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(true);

  const [isDisputed, setIsDisputed] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentMessages = messagesMap[selectedConv.id] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, isTyping, selectedConv]);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage.trim();
    const timeStr = getCurrentTime();

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'me',
      text: userText,
      time: timeStr,
    };

    // 1. Tambahkan pesan saya ke state chat
    setMessagesMap((prev) => ({
      ...prev,
      [selectedConv.id]: [...(prev[selectedConv.id] || []), newMsg],
    }));

    // 2. Perbarui tampilan daftar obrolan di sidebar kiri
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConv.id
          ? { ...c, lastMessage: userText, lastTime: timeStr }
          : c
      )
    );

    setInputMessage('');

    // 3. Simulasi respon otomatis dari lawan bicara (Penemu / Megawati)
    setTimeout(() => {
      setIsTyping(true);
    }, 700);

    setTimeout(() => {
      setIsTyping(false);
      const replyTime = getCurrentTime();
      const randomReply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];

      const counterpartReply: ChatMessage = {
        id: `reply-${Date.now()}`,
        sender: 'other',
        text: randomReply,
        time: replyTime,
      };

      setMessagesMap((prev) => ({
        ...prev,
        [selectedConv.id]: [...(prev[selectedConv.id] || []), counterpartReply],
      }));

      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConv.id
            ? { ...c, lastMessage: randomReply, lastTime: replyTime }
            : c
        )
      );
    }, 2200);
  };

  const handleApprove = () => {
    setIsApproved(true);
    const timeStr = getCurrentTime();
    const approveMsg: ChatMessage = {
      id: `sys-${Date.now()}`,
      sender: 'system',
      text: '✅ Kepemilikan Telah Disepakati! Status barang diubah menjadi RETURNED. Silakan lakukan serah terima di area kampus yang aman.',
      time: timeStr,
    };

    setMessagesMap((prev) => ({
      ...prev,
      [selectedConv.id]: [...(prev[selectedConv.id] || []), approveMsg],
    }));

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConv.id
          ? { ...c, status: 'RESOLVED', lastMessage: '✅ Kepemilikan Telah Disepakati' }
          : c
      )
    );
  };

  const handleDispute = () => {
    setIsDisputed(true);
    const timeStr = getCurrentTime();
    const disputeMsg: ChatMessage = {
      id: `sys-${Date.now()}`,
      sender: 'system',
      text: '⚖️ Sengketa Diteruskan ke Mediator Admin. Status klaim diubah menjadi DISPUTED. Tim mediator kampus akan meninjau percakapan ini dalam 1x24 jam.',
      time: timeStr,
    };

    setMessagesMap((prev) => ({
      ...prev,
      [selectedConv.id]: [...(prev[selectedConv.id] || []), disputeMsg],
    }));

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConv.id
          ? { ...c, status: 'DISPUTED', lastMessage: '⚖️ Sengketa Diteruskan ke Mediator' }
          : c
      )
    );
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header Title */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Pesan & Verifikasi
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Ruang diskusi dan verifikasi kepemilikan peer-to-peer antara penemu dan pengklaim kampus.
          </p>
        </div>

        {/* Chat Layout Container */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px] max-h-[750px]">
          {/* Left Column: Conversations List */}
          <div
            className={`lg:col-span-4 border-r border-gray-100 flex flex-col h-full bg-gray-50/40 ${
              showMobileChat ? 'hidden lg:flex' : 'flex'
            }`}
          >
            <div className="p-4 border-b border-gray-100 bg-white">
              <h2 className="font-bold text-sm text-gray-900">Kotak Masuk Verifikasi</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {conversations.length} sesi chat aktif
              </p>
            </div>

            <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
              {conversations.map((conv) => {
                const active = selectedConv.id === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setSelectedConv(conv);
                      setShowMobileChat(true);
                    }}
                    className={`w-full p-4 text-left flex items-start gap-3 transition-colors cursor-pointer ${
                      active ? 'bg-[#EFF8FF]' : 'hover:bg-gray-50 bg-white'
                    }`}
                  >
                    <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#30AFFF] to-[#60c4ff] text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                      {conv.counterpartName.substring(0, 2).toUpperCase()}
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-white flex items-center justify-center">
                        <CheckCircle2 size={10} className="text-[#10B981] fill-white" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-bold text-xs text-gray-900 truncate">
                          {conv.counterpartName}
                        </h4>
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {conv.lastTime}
                        </span>
                      </div>

                      <p className="text-[11px] font-semibold text-[#30AFFF] truncate mt-0.5">
                        {conv.itemTitle}
                      </p>

                      <p className="text-xs text-gray-500 truncate mt-1">
                        {conv.lastMessage}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Chat Room */}
          <div
            className={`lg:col-span-8 flex flex-col h-full bg-white ${
              !showMobileChat ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {/* Chat Room Top Bar */}
            <div className="p-3.5 sm:p-4 border-b border-gray-100 flex items-center justify-between gap-3 bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowMobileChat(false)}
                  className="lg:hidden p-1.5 text-gray-500 hover:text-gray-900 rounded-xl hover:bg-gray-100 cursor-pointer"
                  aria-label="Kembali ke daftar pesan"
                >
                  <ArrowLeft size={18} />
                </button>

                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#30AFFF] flex items-center justify-center font-bold text-sm shrink-0">
                  {selectedConv.counterpartName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm text-gray-900">
                      {selectedConv.counterpartName}
                    </h3>
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                      <CheckCircle2 size={10} />
                      Verified
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Membahas barang: <strong className="text-gray-700">{selectedConv.itemTitle}</strong>
                  </p>
                </div>
              </div>

              {/* Action Buttons in Header */}
              <div className="flex items-center gap-2">
                {!isApproved && !isDisputed && (
                  <>
                    <button
                      onClick={handleApprove}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Check size={13} />
                      <span className="hidden sm:inline">Sepakati Pemilikan</span>
                      <span className="sm:hidden">Sepakati</span>
                    </button>
                    <button
                      onClick={handleDispute}
                      className="px-3 py-1.5 rounded-xl border border-purple-200 text-purple-700 hover:bg-purple-50 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <AlertTriangle size={13} />
                      <span className="hidden sm:inline">Panggil Mediator</span>
                    </button>
                  </>
                )}
                {isApproved && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                    ✓ Selesai / Dikembalikan
                  </span>
                )}
                {isDisputed && (
                  <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-xl border border-purple-200">
                    ⚖️ Dalam Mediasi Admin
                  </span>
                )}
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3.5 bg-gray-50/30">
              {currentMessages.map((msg) => {
                if (msg.sender === 'system') {
                  return (
                    <div
                      key={msg.id}
                      className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl text-xs text-blue-900 flex items-start gap-2.5 max-w-xl mx-auto shadow-2xs"
                    >
                      <ShieldCheck size={18} className="text-[#30AFFF] shrink-0 mt-0.5" />
                      <p className="leading-relaxed">{msg.text}</p>
                    </div>
                  );
                }

                const isMe = msg.sender === 'me';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in duration-200`}
                  >
                    <div
                      className={`max-w-md p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs ${
                        isMe
                          ? 'bg-[#30AFFF] text-white rounded-br-xs'
                          : 'bg-white text-gray-800 border border-gray-100 rounded-bl-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 px-1">{msg.time}</span>
                  </div>
                );
              })}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-white py-2 px-3.5 rounded-2xl border border-gray-100 w-fit shadow-2xs animate-in fade-in">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#30AFFF] animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#30AFFF] animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#30AFFF] animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                  <span className="text-[11px] text-gray-400">
                    {selectedConv.counterpartName} sedang mengetik balasan...
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 sm:p-4 border-t border-gray-100 bg-white flex items-center gap-2 sticky bottom-0 z-10"
            >
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Lampirkan foto"
              >
                <Paperclip size={18} />
              </button>
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Balas pesan ke ${selectedConv.counterpartName}...`}
                className="flex-1 bg-gray-50 hover:bg-white focus:bg-white px-4 py-2.5 rounded-xl text-xs sm:text-sm text-gray-800 border border-gray-200 focus:border-[#30AFFF] focus:ring-2 focus:ring-[#30AFFF]/20 focus:outline-none transition-all shadow-2xs"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="p-2.5 bg-[#30AFFF] hover:bg-[#2196E8] text-white rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Kirim Pesan"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
