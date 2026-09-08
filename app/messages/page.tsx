'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/src/components/layout/AppLayout';
import {
  Send,
  Paperclip,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  MessageSquare,
  Search,
  Check,
  Loader2,
  LogIn,
  X,
  Image as ImageIcon,
  MapPin,
  Navigation,
} from 'lucide-react';
import { createClient } from '@/src/lib/supabase/client';
import LeafletSafeMap from '@/src/components/map/LeafletSafeMap';
import { SafePoint, getSafePoints, DEFAULT_SAFE_POINTS } from '@/src/lib/safePoints';

export interface ChatConversation {
  id: string;
  counterpartName: string;
  counterpartRole: string;
  itemTitle: string;
  lastMessage: string;
  lastTime: string;
  unread: boolean;
  status: 'VERIFYING' | 'RESOLVED' | 'DISPUTED';
  initialPesanVerifikasi?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'me' | 'other' | 'system';
  text: string;
  time: string;
  imageUrl?: string;
}

function compressImage(file: File, maxWidth = 1000, quality = 0.78): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

function parseChatMessage(rawText: string): { text: string; imageUrl?: string } {
  if (!rawText) return { text: '' };

  if (rawText.startsWith('{') && rawText.endsWith('}')) {
    try {
      const parsed = JSON.parse(rawText);
      if (parsed && typeof parsed === 'object') {
        return {
          text: typeof parsed.text === 'string' ? parsed.text : '',
          imageUrl: typeof parsed.imageUrl === 'string' ? parsed.imageUrl : undefined,
        };
      }
    } catch {
      // ignore
    }
  }

  if (rawText.includes('[GAMBAR]:')) {
    const parts = rawText.split('[GAMBAR]:');
    return {
      text: parts[0].trim(),
      imageUrl: parts[1].trim(),
    };
  }

  if (rawText.startsWith('data:image/') || rawText.startsWith('blob:')) {
    return { text: '', imageUrl: rawText };
  }

  return { text: rawText };
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<ChatConversation | null>(null);
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>({});
  const [inputMessage, setInputMessage] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [isDisputed, setIsDisputed] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  // Image attachment & zoom states
  const [selectedImage, setSelectedImage] = useState<{
    dataUrl: string;
    name: string;
    size: number;
  } | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Safe Handover Points states
  const [safePointsList, setSafePointsList] = useState<SafePoint[]>(DEFAULT_SAFE_POINTS);
  const [showSafePointModal, setShowSafePointModal] = useState(false);
  const [selectedSafePointModalId, setSelectedSafePointModalId] = useState<string>('sp-1');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch safe points
  useEffect(() => {
    getSafePoints().then((pts) => {
      setSafePointsList(pts);
      if (pts.length > 0) setSelectedSafePointModalId(pts[0].id);
    });
  }, []);

  const handleShareSafePoint = async () => {
    if (!selectedConv) return;
    const pt = safePointsList.find((p) => p.id === selectedSafePointModalId) || safePointsList[0];
    const timeStr = getCurrentTime();

    const textMsg = `📍 KESEPAKATAN TITIK TEMU AMAN KAMPUS\n🏛️ Lokasi: ${pt.nama_lokasi}\n📌 Alamat: ${pt.alamat_lengkap}\n🕒 Jam Operasional: ${pt.jam_buka} - ${pt.jam_tutup} WIB\n🛡️ Keamanan: ${pt.ada_satpam ? 'Satpam Standby' : ''} ${pt.ada_cctv ? '• CCTV Aktif' : ''}\nGPS: ${pt.latitude},${pt.longitude}`;

    const tempId = `sp-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: tempId,
      sender: 'me',
      text: textMsg,
      time: timeStr,
    };

    const updated = [...(messagesMap[selectedConv.id] || []), newMsg];
    setMessagesMap((prev) => ({
      ...prev,
      [selectedConv.id]: updated,
    }));

    try {
      localStorage.setItem(`findly_chat_${selectedConv.id}`, JSON.stringify(updated));
      const supabase = createClient();
      await supabase.from('pesan_chat').insert({
        klaim_id: selectedConv.id,
        pengirim_id: currentUserId,
        pesan: textMsg,
        tipe_pesan: 'teks',
      });
    } catch (err) {
      console.warn('Error syncing safe point to chat:', err);
    }

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConv.id
          ? { ...c, lastMessage: `📍 Titik Temu: ${pt.nama_lokasi}`, lastTime: timeStr }
          : c
      )
    );

    setShowSafePointModal(false);
  };

  // Load real user conversations from Supabase klaim_barang
  useEffect(() => {
    // Purge legacy demo keys if any exist in browser
    try {
      ['c1', 'c2', 'conv-1', 'conv-2'].forEach((k) => {
        localStorage.removeItem(`findly_chat_${k}`);
      });
    } catch {
      // ignore
    }
    async function loadUserChats() {
      setLoading(true);
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setIsGuest(true);
          setLoading(false);
          return;
        }

        setCurrentUserId(user.id);

        // 1. Klaim yang diajukan oleh user saat ini (User sebagai Claimant)
        const { data: outgoingClaims } = await supabase
          .from('klaim_barang')
          .select('*, laporan_barang(*, profil_pengguna:pelapor_id(nama_lengkap, role_kampus, universitas))')
          .eq('pengklaim_id', user.id)
          .order('dibuat_pada', { ascending: false });

        // 2. Laporan milik user yang diklaim oleh orang lain (User sebagai Finder)
        const { data: myReports } = await supabase
          .from('laporan_barang')
          .select('id')
          .eq('pelapor_id', user.id);

        let incomingClaims: any[] = [];
        if (myReports && myReports.length > 0) {
          const reportIds = myReports.map((r) => r.id);
          const { data: inc } = await supabase
            .from('klaim_barang')
            .select('*, laporan_barang(*), profil_pengguna:pengklaim_id(nama_lengkap, role_kampus, universitas)')
            .in('laporan_id', reportIds)
            .order('dibuat_pada', { ascending: false });
          if (inc) incomingClaims = inc;
        }

        const convList: ChatConversation[] = [];
        const initMsgMap: Record<string, ChatMessage[]> = {};

        // Format outgoing claims (User sebagai Claimant / Finder)
        (outgoingClaims || []).forEach((c: any) => {
          const report = c.laporan_barang;
          const isLostReport = report?.jenis_laporan === 'KEHILANGAN';
          const finder = report?.profil_pengguna;
          const counterpartName = finder?.nama_lengkap || (isLostReport ? 'Pemilik Barang' : 'Penemu Barang');
          const counterpartRole = finder?.role_kampus
            ? finder.role_kampus.charAt(0).toUpperCase() + finder.role_kampus.slice(1)
            : (isLostReport ? 'Pemilik Barang' : 'Civitas Kampus');
          const itemTitle = report?.nama_barang || (isLostReport ? 'Barang Hilang' : 'Barang Temuan');

          let status: 'VERIFYING' | 'RESOLVED' | 'DISPUTED' = 'VERIFYING';
          if (c.status === 'SELESAI') status = 'RESOLVED';
          if (c.status === 'DITOLAK') status = 'DISPUTED';

          const timeStr = c.dibuat_pada
            ? new Date(c.dibuat_pada).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':')
            : 'Baru saja';

          convList.push({
            id: c.id,
            counterpartName,
            counterpartRole,
            itemTitle,
            lastMessage: c.pesan_verifikasi ? c.pesan_verifikasi.split('\n')[0] : 'Sesi verifikasi dibuka',
            lastTime: timeStr,
            unread: false,
            status,
            initialPesanVerifikasi: c.pesan_verifikasi,
          });

          // Check saved messages in localStorage
          try {
            const savedMsgs = localStorage.getItem(`findly_chat_${c.id}`);
            if (savedMsgs) {
              initMsgMap[c.id] = JSON.parse(savedMsgs);
            } else {
              initMsgMap[c.id] = [
                {
                  id: `sys-${c.id}`,
                  sender: 'system',
                  text: isLostReport
                    ? `🔒 Sesi Verifikasi & Serah Terima Dibuka. Anda telah mengonfirmasi menemukan barang "${itemTitle}". Silakan koordinasikan verifikasi dan jadwal serah terima dengan ${counterpartName}.`
                    : '🔒 Sesi Verifikasi Pemilik Sah Dibuka. Penemu memegang detail rahasia barang. Silakan lakukan tanya jawab untuk membuktikan kepemilikan sebelum serah terima.',
                  time: timeStr,
                },
                ...(c.pesan_verifikasi
                  ? [
                      {
                        id: `claim-${c.id}`,
                        sender: 'me' as const,
                        text: isLostReport && c.pesan_verifikasi.startsWith('📢')
                          ? c.pesan_verifikasi
                          : `Halo ${counterpartName}, saya ingin memverifikasi barang "${itemTitle}":\n\n${c.pesan_verifikasi}`,
                        time: timeStr,
                      },
                    ]
                  : []),
              ];
            }
          } catch {
            initMsgMap[c.id] = [];
          }
        });

        // Format incoming claims (User sebagai Pemilik Laporan)
        (incomingClaims || []).forEach((c: any) => {
          const report = c.laporan_barang;
          const isLostReport = report?.jenis_laporan === 'KEHILANGAN';
          const claimant = c.profil_pengguna;
          const counterpartName = claimant?.nama_lengkap || (isLostReport ? 'Penemu Barang' : 'Pengaju Klaim');
          const counterpartRole = claimant?.role_kampus
            ? claimant.role_kampus.charAt(0).toUpperCase() + claimant.role_kampus.slice(1)
            : (isLostReport ? 'Penemu Barang' : 'Civitas Kampus');
          const itemTitle = report?.nama_barang || (isLostReport ? 'Barang Hilang' : 'Barang Temuan');

          let status: 'VERIFYING' | 'RESOLVED' | 'DISPUTED' = 'VERIFYING';
          if (c.status === 'SELESAI') status = 'RESOLVED';
          if (c.status === 'DITOLAK') status = 'DISPUTED';

          const timeStr = c.dibuat_pada
            ? new Date(c.dibuat_pada).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':')
            : 'Baru saja';

          convList.push({
            id: c.id,
            counterpartName,
            counterpartRole,
            itemTitle,
            lastMessage: c.pesan_verifikasi ? c.pesan_verifikasi.split('\n')[0] : 'Permohonan klaim baru',
            lastTime: timeStr,
            unread: true,
            status,
            initialPesanVerifikasi: c.pesan_verifikasi,
          });

          try {
            const savedMsgs = localStorage.getItem(`findly_chat_${c.id}`);
            if (savedMsgs) {
              initMsgMap[c.id] = JSON.parse(savedMsgs);
            } else {
              initMsgMap[c.id] = [
                {
                  id: `sys-${c.id}`,
                  sender: 'system',
                  text: isLostReport
                    ? `🔒 Sesi Verifikasi & Serah Terima Dibuka. ${counterpartName} telah mengonfirmasi menemukan barang Anda "${itemTitle}". Silakan koordinasikan verifikasi dan jadwal serah terima aman.`
                    : '🔒 Sesi Verifikasi Pemilik Sah Dibuka. Anda sebagai penemu memegang informasi rahasia. Ajukan pertanyaan untuk memastikan barang ini adalah miliknya.',
                  time: timeStr,
                },
                ...(c.pesan_verifikasi
                  ? [
                      {
                        id: `claim-${c.id}`,
                        sender: 'other' as const,
                        text: isLostReport && c.pesan_verifikasi.startsWith('📢')
                          ? c.pesan_verifikasi
                          : `Halo, saya telah mengajukan klaim untuk "${itemTitle}":\n\n${c.pesan_verifikasi}`,
                        time: timeStr,
                      },
                    ]
                  : []),
              ];
            }
          } catch {
            initMsgMap[c.id] = [];
          }
        });

        // Check if there is an id or claimId in url search params
        const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        const targetId = urlParams?.get('id') || urlParams?.get('claimId');

        setConversations(convList);
        setMessagesMap(initMsgMap);
        if (convList.length > 0) {
          const match = targetId ? convList.find((c) => c.id === targetId) : null;
          setSelectedConv(match || convList[0]);
        }
      } catch (err) {
        console.error('Error loading conversations:', err);
      } finally {
        setLoading(false);
      }
    }

    loadUserChats();
  }, []);

  const currentMessages = selectedConv ? messagesMap[selectedConv.id] || [] : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, selectedConv]);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
  };

  // Realtime subscription & database fetch for selected conversation
  useEffect(() => {
    if (!selectedConv || !currentUserId) return;
    const convId = selectedConv.id;
    const supabase = createClient();
    let isMounted = true;

    async function fetchDbMessages() {
      try {
        const { data, error } = await supabase
          .from('pesan_chat')
          .select('*')
          .eq('klaim_id', convId)
          .order('dibuat_pada', { ascending: true });

        if (!error && data && data.length > 0 && isMounted) {
          const dbMsgs: ChatMessage[] = data.map((m: any) => {
            const parsed = parseChatMessage(m.pesan);
            return {
              id: m.id,
              sender: m.tipe_pesan === 'sistem' ? 'system' : (m.pengirim_id === currentUserId ? 'me' : 'other'),
              text: parsed.text,
              imageUrl: parsed.imageUrl,
              time: new Date(m.dibuat_pada).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':'),
            };
          });

          setMessagesMap((prev) => {
            const currentList = prev[convId] || [];
            const systemWelcome = currentList.find((msg) => msg.id.startsWith('sys-'));
            const merged = systemWelcome && !dbMsgs.some((msg) => msg.id === systemWelcome.id)
              ? [systemWelcome, ...dbMsgs]
              : dbMsgs;

            try {
              localStorage.setItem(`findly_chat_${convId}`, JSON.stringify(merged));
            } catch {
              // ignore
            }

            return {
              ...prev,
              [convId]: merged,
            };
          });

          const last = dbMsgs[dbMsgs.length - 1];
          if (last) {
            const snippet = last.imageUrl ? (last.text ? `📷 ${last.text}` : '📷 Mengirim foto') : last.text.split('\n')[0];
            setConversations((prev) =>
              prev.map((c) =>
                c.id === convId
                  ? { ...c, lastMessage: snippet, lastTime: last.time }
                  : c
              )
            );
          }
        }
      } catch (err) {
        // graceful fallback if table not yet created
      }
    }

    fetchDbMessages();

    // Realtime channel listener
    const channel = supabase
      .channel(`chat_realtime_${convId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pesan_chat',
          filter: `klaim_id=eq.${convId}`,
        },
        (payload) => {
          const m = payload.new as any;
          if (!m || !isMounted) return;

          const parsed = parseChatMessage(m.pesan);
          const newChat: ChatMessage = {
            id: m.id,
            sender: m.tipe_pesan === 'sistem' ? 'system' : (m.pengirim_id === currentUserId ? 'me' : 'other'),
            text: parsed.text,
            imageUrl: parsed.imageUrl,
            time: new Date(m.dibuat_pada).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':'),
          };

          setMessagesMap((prev) => {
            const list = prev[convId] || [];
            if (list.some((existing) => existing.id === newChat.id)) return prev;
            const nextList = [...list, newChat];
            try {
              localStorage.setItem(`findly_chat_${convId}`, JSON.stringify(nextList));
            } catch {
              // ignore
            }
            return {
              ...prev,
              [convId]: nextList,
            };
          });

          const snippet = newChat.imageUrl ? (newChat.text ? `📷 ${newChat.text}` : '📷 Mengirim foto') : newChat.text.split('\n')[0];
          setConversations((prev) =>
            prev.map((c) =>
              c.id === convId
                ? { ...c, lastMessage: snippet, lastTime: newChat.time }
                : c
            )
          );
        }
      )
      .subscribe();

    // Auto-sync polling every 3.5 seconds as fallback
    const interval = setInterval(() => {
      fetchDbMessages();
    }, 3500);

    return () => {
      isMounted = false;
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [selectedConv?.id, currentUserId]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Hanya file foto/gambar yang diperbolehkan (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran gambar maksimal adalah 10MB.');
      return;
    }

    setIsUploadingImage(true);
    try {
      const compressed = await compressImage(file, 1000, 0.78);
      setSelectedImage({
        dataUrl: compressed,
        name: file.name,
        size: file.size,
      });
      inputRef.current?.focus();
    } catch (err) {
      console.error('Error processing image:', err);
      alert('Gagal memproses gambar. Silakan pilih foto lain.');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputMessage.trim() && !selectedImage) || !selectedConv) return;

    const userText = inputMessage.trim();
    const imageToSend = selectedImage?.dataUrl;
    const timeStr = getCurrentTime();

    setInputMessage('');
    setSelectedImage(null);

    const tempId = `temp-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: tempId,
      sender: 'me',
      text: userText,
      imageUrl: imageToSend || undefined,
      time: timeStr,
    };

    const updated = [...(messagesMap[selectedConv.id] || []), newMsg];
    setMessagesMap((prev) => ({
      ...prev,
      [selectedConv.id]: updated,
    }));

    try {
      localStorage.setItem(`findly_chat_${selectedConv.id}`, JSON.stringify(updated));
    } catch {
      // ignore
    }

    const previewSnippet = imageToSend
      ? (userText ? `📷 ${userText}` : '📷 Mengirim foto')
      : userText;

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConv.id ? { ...c, lastMessage: previewSnippet, lastTime: timeStr } : c
      )
    );

    // Save to Supabase database (Real cloud sync!)
    try {
      const supabase = createClient();
      const payloadString = imageToSend
        ? JSON.stringify({ text: userText, imageUrl: imageToSend })
        : userText;

      const { data: dbData, error } = await supabase
        .from('pesan_chat')
        .insert({
          klaim_id: selectedConv.id,
          pengirim_id: currentUserId,
          pesan: payloadString,
          tipe_pesan: imageToSend ? 'gambar' : 'teks',
        })
        .select()
        .single();

      if (!error && dbData) {
        setMessagesMap((prev) => ({
          ...prev,
          [selectedConv.id]: (prev[selectedConv.id] || []).map((m) =>
            m.id === tempId ? { ...m, id: dbData.id } : m
          ),
        }));
      }
    } catch (err) {
      console.warn('Sync to pesan_chat fallback to local:', err);
    }
  };

  const handleApprove = async () => {
    if (!selectedConv) return;
    setIsApproved(true);
    const timeStr = getCurrentTime();
    const approveMsg: ChatMessage = {
      id: `sys-${Date.now()}`,
      sender: 'system',
      text: '✅ Kepemilikan Telah Disepakati! Status klaim disetujui. Silakan lakukan serah terima di titik kumpul kampus yang aman (Pos Satpam / Lobi Rektorat).',
      time: timeStr,
    };

    const updated = [...(messagesMap[selectedConv.id] || []), approveMsg];
    setMessagesMap((prev) => ({
      ...prev,
      [selectedConv.id]: updated,
    }));

    try {
      localStorage.setItem(`findly_chat_${selectedConv.id}`, JSON.stringify(updated));
      const supabase = createClient();
      await supabase.from('klaim_barang').update({ status: 'SELESAI' }).eq('id', selectedConv.id);
    } catch (err) {
      console.error('Error syncing approval:', err);
    }

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConv.id
          ? { ...c, status: 'RESOLVED', lastMessage: '✅ Kepemilikan Telah Disepakati' }
          : c
      )
    );
  };

  const handleDispute = async () => {
    if (!selectedConv) return;
    setIsDisputed(true);
    const timeStr = getCurrentTime();
    const disputeMsg: ChatMessage = {
      id: `sys-${Date.now()}`,
      sender: 'system',
      text: '⚖️ Sengketa Diteruskan ke Mediator Admin. Status klaim diubah menjadi DISPUTED. Tim mediator kampus akan meninjau percakapan verifikasi ini.',
      time: timeStr,
    };

    const updated = [...(messagesMap[selectedConv.id] || []), disputeMsg];
    setMessagesMap((prev) => ({
      ...prev,
      [selectedConv.id]: updated,
    }));

    try {
      localStorage.setItem(`findly_chat_${selectedConv.id}`, JSON.stringify(updated));
      const supabase = createClient();
      await supabase.from('klaim_barang').update({ status: 'DITOLAK' }).eq('id', selectedConv.id);
    } catch (err) {
      console.error('Error syncing dispute:', err);
    }

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

        {/* Guest Warning */}
        {isGuest ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-12 text-center shadow-sm max-w-lg mx-auto space-y-4 my-8">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-[#30AFFF] flex items-center justify-center mx-auto">
              <MessageSquare size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-900">Masuk untuk Mengakses Pesan</h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Anda harus login terlebih dahulu untuk mengakses ruang chat verifikasi barang hilang & temuan.
              </p>
            </div>
            <Link
              href="/login?redirect=/messages"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#30AFFF] hover:bg-[#2196E8] text-white text-xs font-semibold shadow-sm transition-all"
            >
              <LogIn size={15} />
              <span>Masuk Sekarang</span>
            </Link>
          </div>
        ) : loading ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-sm flex flex-col items-center justify-center gap-3 min-h-[400px]">
            <Loader2 size={32} className="animate-spin text-[#30AFFF]" />
            <p className="text-xs text-gray-500">Memuat sesi obrolan verifikasi...</p>
          </div>
        ) : conversations.length === 0 ? (
          /* Clean Empty State: No Fake Dummy Data */
          <div className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-14 text-center shadow-sm max-w-2xl mx-auto space-y-5 my-6 animate-in fade-in duration-200">
            <div className="w-20 h-20 rounded-full bg-[#EFF8FF] text-[#30AFFF] flex items-center justify-center mx-auto shadow-2xs">
              <MessageSquare size={38} className="stroke-[1.75]" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                Belum Ada Sesi Pesan & Verifikasi
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                Sesi diskusi verifikasi peer-to-peer akan muncul secara otomatis saat Anda mengajukan klaim atas barang temuan, atau saat ada pengguna lain yang mengklaim barang yang Anda laporkan.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/find"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#30AFFF] hover:bg-[#2196E8] active:scale-[0.98] text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <Search size={14} />
                <span>Cari Barang Temuan</span>
              </Link>
              <Link
                href="/claims"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-all flex items-center justify-center gap-2"
              >
                <span>Lihat Riwayat Klaim</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Real Chat Layout */
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
                  const active = selectedConv?.id === conv.id;
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
                          <span className="text-[10px] text-gray-400 shrink-0">{conv.lastTime}</span>
                        </div>

                        <p className="text-[11px] font-semibold text-[#30AFFF] truncate mt-0.5">
                          {conv.itemTitle}
                        </p>

                        <p className="text-xs text-gray-500 truncate mt-1">{conv.lastMessage}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Active Chat Room */}
            {selectedConv && (
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
                          {selectedConv.counterpartRole}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400">
                        Membahas barang: <strong className="text-gray-700">{selectedConv.itemTitle}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons in Header */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowSafePointModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#30AFFF] border border-blue-200 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                      title="Pilih titik temu aman resmi kampus"
                    >
                      <MapPin size={13} />
                      <span className="hidden sm:inline">Titik Temu Aman</span>
                    </button>

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
                    const isMeetingCard = msg.text?.includes('TITIK TEMU AMAN KAMPUS');

                    if (isMeetingCard) {
                      const matchedPt =
                        safePointsList.find((p) => msg.text.includes(p.nama_lokasi)) || safePointsList[0];
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in duration-200`}
                        >
                          <div
                            className={`max-w-md p-4 rounded-2xl text-xs sm:text-sm shadow-sm ${
                              isMe
                                ? 'bg-gradient-to-br from-[#30AFFF] to-[#1E88E5] text-white rounded-br-xs'
                                : 'bg-white text-gray-800 border border-blue-200 rounded-bl-xs'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] mb-1.5 opacity-90">
                              <ShieldCheck size={14} />
                              <span>Titik Temu Resmi Terverifikasi</span>
                            </div>
                            <h4 className="font-bold text-sm mb-1">{matchedPt.nama_lokasi}</h4>
                            <p className={`text-xs mb-2.5 leading-relaxed ${isMe ? 'text-white/90' : 'text-gray-600'}`}>
                              {matchedPt.alamat_lengkap}
                            </p>
                            <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold mb-3">
                              {matchedPt.ada_satpam && (
                                <span className={`px-2 py-0.5 rounded-md ${isMe ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}>
                                  👮 Satpam 24 Jam
                                </span>
                              )}
                              {matchedPt.ada_cctv && (
                                <span className={`px-2 py-0.5 rounded-md ${isMe ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-800 border border-blue-200'}`}>
                                  📹 CCTV Aktif
                                </span>
                              )}
                              <span className={`px-2 py-0.5 rounded-md ${isMe ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'}`}>
                                🕒 {matchedPt.jam_buka} - {matchedPt.jam_tutup} WIB
                              </span>
                            </div>
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${matchedPt.latitude},${matchedPt.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 ${
                                isMe
                                  ? 'bg-white text-[#1E88E5] hover:bg-gray-100'
                                  : 'bg-[#30AFFF] hover:bg-[#2196E8] text-white'
                              }`}
                              title="Buka lokasi di Google Maps atau aplikasi HP"
                            >
                              <Navigation size={13} />
                              <span>Buka di Peta</span>
                            </a>
                          </div>
                          <span className="text-[10px] text-gray-400 mt-1 px-1">{msg.time}</span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in duration-200`}
                      >
                        <div
                          className={`max-w-md p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs whitespace-pre-wrap ${
                            isMe
                              ? 'bg-[#30AFFF] text-white rounded-br-xs'
                              : 'bg-white text-gray-800 border border-gray-100 rounded-bl-xs'
                          }`}
                        >
                          {msg.imageUrl && (
                            <div className="mb-2">
                              <img
                                src={msg.imageUrl}
                                alt="Foto Verifikasi"
                                onClick={() => setZoomedImage(msg.imageUrl || null)}
                                className="rounded-xl max-h-60 max-w-full object-cover cursor-pointer hover:opacity-95 transition-opacity border border-black/10 shadow-xs"
                              />
                            </div>
                          )}
                          {msg.text ? <span>{msg.text}</span> : null}
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 px-1">{msg.time}</span>
                      </div>
                    );
                  })}

                  <div ref={messagesEndRef} />
                </div>

                {/* Floating Image Preview Bar if selectedImage is present */}
                {selectedImage && (
                  <div className="px-4 py-2 bg-blue-50/80 border-t border-blue-100 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2 duration-150">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <img
                        src={selectedImage.dataUrl}
                        alt="Preview"
                        className="w-11 h-11 rounded-lg object-cover border border-blue-200 shadow-xs shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">{selectedImage.name}</p>
                        <p className="text-[10px] text-gray-500">
                          {(selectedImage.size / 1024).toFixed(0)} KB • Siap dikirim
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImage(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-colors cursor-pointer"
                      title="Batalkan lampiran"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                {/* Chat Input Bar */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 sm:p-4 border-t border-gray-100 bg-white flex items-center gap-2 sticky bottom-0 z-10"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="p-2 text-gray-400 hover:text-[#30AFFF] rounded-xl hover:bg-blue-50 transition-colors cursor-pointer relative"
                    aria-label="Lampirkan foto"
                    title="Kirim Foto Bukti / Barang"
                  >
                    <Paperclip size={18} />
                    {selectedImage && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#30AFFF] rounded-full ring-2 ring-white" />
                    )}
                  </button>
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={selectedImage ? "Tambah keterangan foto (opsional)..." : `Balas pesan ke ${selectedConv.counterpartName}...`}
                    className="flex-1 bg-gray-50 hover:bg-white focus:bg-white px-4 py-2.5 rounded-xl text-xs sm:text-sm text-gray-800 border border-gray-200 focus:border-[#30AFFF] focus:ring-2 focus:ring-[#30AFFF]/20 focus:outline-none transition-all shadow-2xs"
                  />
                  <button
                    type="submit"
                    disabled={(!inputMessage.trim() && !selectedImage) || isUploadingImage}
                    className="p-2.5 bg-[#30AFFF] hover:bg-[#2196E8] text-white rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center min-w-[38px]"
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
            )}
          </div>
        )}

        {/* Lightbox / Zoom Modal */}
        {zoomedImage && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setZoomedImage(null)}
          >
            <div className="relative max-w-3xl max-h-[90vh] flex flex-col items-center">
              <button
                type="button"
                onClick={() => setZoomedImage(null)}
                className="absolute -top-10 right-0 sm:-right-10 p-2 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 rounded-full transition-colors cursor-pointer"
                title="Tutup"
              >
                <X size={20} />
              </button>
              <img
                src={zoomedImage}
                alt="Zoomed"
                className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl border border-white/10"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}

        {/* Safe Meeting Point Selector Modal */}
        {showSafePointModal && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
            onClick={() => setShowSafePointModal(false)}
          >
            <div
              className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#30AFFF]/10 text-[#30AFFF] flex items-center justify-center">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                      Pilih Titik Temu Aman Resmi Kampus
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      Disarankan bertemu di lokasi resmi yang diawasi keamanan kampus.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSafePointModal(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 overflow-y-auto space-y-4">
                {/* List of Points */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {safePointsList.map((pt) => {
                    const isSelected = selectedSafePointModalId === pt.id;
                    return (
                      <button
                        key={pt.id}
                        type="button"
                        onClick={() => setSelectedSafePointModalId(pt.id)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#30AFFF] bg-blue-50/70 text-gray-900 font-semibold ring-2 ring-[#30AFFF]/20'
                            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-bold text-xs text-gray-900 line-clamp-1">
                          🛡️ {pt.nama_lokasi}
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                          {pt.alamat_lengkap}
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-medium mt-1.5">
                          {pt.ada_satpam && <span>• 👮 Satpam</span>}
                          {pt.ada_cctv && <span>• 📹 CCTV</span>}
                          <span>• 🕒 {pt.jam_buka}-{pt.jam_tutup}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Leaflet OSM Map Preview for selected point */}
                {(() => {
                  const currentPt =
                    safePointsList.find((p) => p.id === selectedSafePointModalId) ||
                    safePointsList[0];
                  if (!currentPt) return null;
                  return (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-800">
                          Pratinjau Peta (Leaflet OpenStreetMap):
                        </span>
                        <span className="text-[10px] text-gray-400">Gratis & Presisi</span>
                      </div>
                      <LeafletSafeMap
                        lat={currentPt.latitude}
                        lng={currentPt.longitude}
                        locationName={currentPt.nama_lokasi}
                        address={currentPt.alamat_lengkap}
                        heightClass="h-[180px]"
                      />
                    </div>
                  );
                })()}

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowSafePointModal(false)}
                    className="px-4 py-2 border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleShareSafePoint}
                    className="px-5 py-2 bg-[#30AFFF] hover:bg-[#2196E8] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <MapPin size={14} />
                    <span>Bagikan ke Chat Ini</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
