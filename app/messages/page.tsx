'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import AppLayout from '@/src/components/layout/AppLayout';
import {
  MessageSquare,
  MessageSquareOff,
  Search,
  Loader2,
  LogIn,
  FileCheck2,
  Check,
  Clock,
} from 'lucide-react';
import { createClient } from '@/src/lib/supabase/client';
import { SafePoint, getSafePoints, DEFAULT_SAFE_POINTS } from '@/src/lib/safePoints';
import { ChatConversation, ChatMessage, SelectedImageAttachment } from '@/src/types/chat';
import { compressImage, parseChatMessage, getCurrentTime } from '@/src/lib/chatUtils';
import ConversationList from '@/src/components/chat/ConversationList';
import ChatHeader from '@/src/components/chat/ChatHeader';
import ChatMessageList from '@/src/components/chat/ChatMessageList';
import ChatInput from '@/src/components/chat/ChatInput';
import SafePointModal from '@/src/components/chat/SafePointModal';
import ImageLightbox from '@/src/components/chat/ImageLightbox';

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetClaimId = searchParams.get('id');
  const [emptyNotice, setEmptyNotice] = useState<{ claimTitle: string; claimId: string } | null>(null);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<ChatConversation | null>(null);
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>({});
  const [inputMessage, setInputMessage] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [isDisputed, setIsDisputed] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [disetujuiPelapor, setDisetujuiPelapor] = useState(false);
  const [disetujuiPengklaim, setDisetujuiPengklaim] = useState(false);

  // Image attachment & zoom states
  const [selectedImage, setSelectedImage] = useState<SelectedImageAttachment | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Safe Handover Points states
  const [safePointsList, setSafePointsList] = useState<SafePoint[]>(DEFAULT_SAFE_POINTS);
  const [showSafePointModal, setShowSafePointModal] = useState(false);
  const [selectedSafePointModalId, setSelectedSafePointModalId] = useState<string>('sp-1');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const profilesCacheRef = useRef<Record<string, { id: string; nama_lengkap: string; tipe_akun?: string; role_kampus?: string; email?: string }>>({});

  // Fetch safe points
  useEffect(() => {
    getSafePoints().then((pts) => {
      setSafePointsList(pts);
      if (pts.length > 0) setSelectedSafePointModalId(pts[0].id);
    });
  }, []);

  const scrollToBottom = (smooth = true, force = false) => {
    if (!messagesContainerRef.current) return;
    const { scrollHeight, clientHeight, scrollTop } = messagesContainerRef.current;
    const distanceToBottom = scrollHeight - (scrollTop + clientHeight);

    if (force || distanceToBottom < 120) {
      if (smooth) {
        messagesContainerRef.current.scrollTo({
          top: scrollHeight,
          behavior: 'smooth',
        });
      } else {
        messagesContainerRef.current.scrollTop = scrollHeight;
      }
      setIsAtBottom(true);
    }
  };

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollHeight, clientHeight, scrollTop } = messagesContainerRef.current;
    const distanceToBottom = scrollHeight - (scrollTop + clientHeight);
    setIsAtBottom(distanceToBottom <= 40);
  };

  // Load real user conversations from Supabase klaim_barang
  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    async function loadUserConversations() {
      setLoading(true);
      try {
        // 1. Coba ambil session aktif dari local/cookie terlebih dahulu
        const { data: sessionData } = await supabase.auth.getSession();
        let user = sessionData?.session?.user ?? null;

        // 2. Jika session belum siap, panggil getUser
        if (!user) {
          const { data: userData } = await supabase.auth.getUser();
          user = userData?.user ?? null;
        }

        // 3. Dukung mode login admin (.env / cookie)
        const isAdminSession = typeof window !== 'undefined' && (
          document.cookie.includes('findly_admin_session=true') ||
          localStorage.getItem('findly_admin_session') === 'true'
        );

        if (!user && isAdminSession) {
          const adminEmail = (typeof localStorage !== 'undefined' && localStorage.getItem('findly_admin_email')) || process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@findly.com';
          user = {
            id: 'admin-mediator-id',
            email: adminEmail,
            user_metadata: { tipe_akun: 'admin' },
          } as any;
        }

        if (!user) {
          if (isMounted) {
            setIsGuest(true);
            setLoading(false);
          }
          return;
        }

        if (isMounted) {
          setIsGuest(false);
          setCurrentUserId(user.id);
        }

        let profile: any = null;
        if (user.id !== 'admin-mediator-id') {
          const { data: p } = await supabase
            .from('profil_pengguna')
            .select('tipe_akun, role_kampus, nama_lengkap')
            .eq('id', user.id)
            .maybeSingle();
          profile = p;
        }

        const userIsAdmin = Boolean(
          isAdminSession ||
          user.id === 'admin-mediator-id' ||
          profile?.tipe_akun === 'admin' ||
          profile?.role_kampus === 'admin' ||
          user.user_metadata?.tipe_akun === 'admin' ||
          user.email?.toLowerCase().includes('admin')
        );

        if (isMounted) setIsAdmin(userIsAdmin);

        const loadedConversations: ChatConversation[] = [];

        if (userIsAdmin) {
          // Admin hanya menangani klaim yang memerlukan intervensi mediator (status = 'DITOLAK' / DISPUTED)
          const { data: allClaims } = await supabase
            .from('klaim_barang')
            .select('*, laporan_barang(*, profil_pengguna:pelapor_id(nama_lengkap, role_kampus, universitas)), profil_pengguna:pengklaim_id(nama_lengkap, role_kampus, universitas)')
            .eq('status', 'DITOLAK')
            .order('dibuat_pada', { ascending: false });

          // Ambil preview pesan terakhir untuk setiap tiket mediasi
          const claimIds = (allClaims || []).map((c: any) => c.id);
          const latestMessagesMap: Record<string, { text: string; time: string }> = {};
          if (claimIds.length > 0) {
            const { data: recentMsgs } = await supabase
              .from('pesan_chat')
              .select('klaim_id, pesan, tipe_pesan, dibuat_pada')
              .in('klaim_id', claimIds)
              .order('dibuat_pada', { ascending: true });

            (recentMsgs || []).forEach((m: any) => {
              const d = new Date(m.dibuat_pada);
              const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
              const parsed = parseChatMessage(m.pesan);
              const snippet = parsed.imageUrl ? (parsed.text ? `📷 ${parsed.text}` : '📷 Foto') : parsed.text.split('\n')[0];
              latestMessagesMap[m.klaim_id] = { text: snippet, time: timeStr };
            });
          }

          (allClaims || []).forEach((c: any) => {
            const report = c.laporan_barang;
            const claimant = c.profil_pengguna;
            const pelapor = report?.profil_pengguna;

            const claimantName = claimant?.nama_lengkap || 'Pengklaim';
            const pelaporName = pelapor?.nama_lengkap || 'Pelapor';
            const counterpartName = `${claimantName} & ${pelaporName}`;
            const counterpartRole = 'Sengketa Mediasi';

            const d = new Date(c.dibuat_pada);
            const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

            let convStatus: 'VERIFYING' | 'RESOLVED' | 'DISPUTED' = 'DISPUTED';
            if (c.status === 'SELESAI') convStatus = 'RESOLVED';

            const latest = latestMessagesMap[c.id];
            const initialText = latest ? latest.text : (c.pesan_verifikasi || 'Permintaan mediasi sengketa baru.');
            const lastTime = latest ? latest.time : timeStr;

            loadedConversations.push({
              id: c.id,
              counterpartName,
              counterpartRole,
              itemTitle: report?.nama_barang || 'Barang Kampus',
              lastMessage: initialText,
              lastTime,
              unread: false,
              status: convStatus,
              initialPesanVerifikasi: c.pesan_verifikasi,
              pengklaimId: c.pengklaim_id,
              pelaporId: report?.pelapor_id,
              pengklaimName: claimantName,
              pelaporName: pelaporName,
              disetujuiPelapor: Boolean(c.disetujui_oleh_pelapor),
              disetujuiPengklaim: Boolean(c.disetujui_oleh_pengklaim),
            });
          });
        } else {
          // 1. Klaim yang diajukan oleh user sendiri (User = Pengklaim)
          const { data: myOutgoingClaims } = await supabase
            .from('klaim_barang')
            .select('*, laporan_barang(*, profil_pengguna:pelapor_id(nama_lengkap, role_kampus, universitas))')
            .eq('pengklaim_id', user.id)
            .order('dibuat_pada', { ascending: false });

          // 2. Klaim dari orang lain atas laporan milik user (User = Pelapor)
          const { data: myReports } = await supabase
            .from('laporan_barang')
            .select('id, nama_barang')
            .eq('pelapor_id', user.id);

          const reportIds = (myReports || []).map((r) => r.id);

          let myIncomingClaims: any[] = [];
          if (reportIds.length > 0) {
            const { data: incoming } = await supabase
              .from('klaim_barang')
              .select('*, laporan_barang(*), profil_pengguna:pengklaim_id(nama_lengkap, role_kampus, universitas)')
              .in('laporan_id', reportIds)
              .order('dibuat_pada', { ascending: false });
            myIncomingClaims = incoming || [];
          }

          // Ambil preview pesan terakhir untuk chat user
          const allUserClaimIds = [
            ...(myOutgoingClaims || []).map((c: any) => c.id),
            ...(myIncomingClaims || []).map((c: any) => c.id),
          ];
          const userLatestMsgsMap: Record<string, { text: string; time: string }> = {};
          if (allUserClaimIds.length > 0) {
            const { data: userRecentMsgs } = await supabase
              .from('pesan_chat')
              .select('klaim_id, pesan, tipe_pesan, dibuat_pada')
              .in('klaim_id', allUserClaimIds)
              .order('dibuat_pada', { ascending: true });

            (userRecentMsgs || []).forEach((m: any) => {
              const d = new Date(m.dibuat_pada);
              const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
              const parsed = parseChatMessage(m.pesan);
              const snippet = parsed.imageUrl ? (parsed.text ? `📷 ${parsed.text}` : '📷 Foto') : parsed.text.split('\n')[0];
              userLatestMsgsMap[m.klaim_id] = { text: snippet, time: timeStr };
            });
          }

          (myOutgoingClaims || []).forEach((c: any) => {
            const report = c.laporan_barang;
            const pelapor = report?.profil_pengguna;
            const counterpartName = pelapor?.nama_lengkap || 'Pelapor Temuan';
            const counterpartRole = pelapor?.role_kampus ? pelapor.role_kampus.charAt(0).toUpperCase() + pelapor.role_kampus.slice(1) : 'Civitas Kampus';

            const d = new Date(c.dibuat_pada);
            const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

            let convStatus: 'VERIFYING' | 'RESOLVED' | 'DISPUTED' = 'VERIFYING';
            if (c.status === 'SELESAI') convStatus = 'RESOLVED';
            else if (c.status === 'DITOLAK') convStatus = 'DISPUTED';

            const latest = userLatestMsgsMap[c.id];
            const lastMsg = latest ? latest.text : (c.pesan_verifikasi || 'Halo, saya telah mengajukan klaim atas barang ini.');

            loadedConversations.push({
              id: c.id,
              counterpartName,
              counterpartRole,
              itemTitle: report?.nama_barang || 'Barang Temuan',
              lastMessage: lastMsg,
              lastTime: timeStr,
              unread: false,
              status: convStatus,
              initialPesanVerifikasi: c.pesan_verifikasi,
              pengklaimId: c.pengklaim_id,
              pelaporId: report?.pelapor_id,
              pengklaimName: profile?.nama_lengkap || 'Pengklaim',
              pelaporName: counterpartName,
              disetujuiPelapor: Boolean(c.disetujui_oleh_pelapor),
              disetujuiPengklaim: Boolean(c.disetujui_oleh_pengklaim),
            });
          });

          (myIncomingClaims || []).forEach((c: any) => {
            if (loadedConversations.some((x) => x.id === c.id)) return;

            const pengklaim = c.profil_pengguna;
            const counterpartName = pengklaim?.nama_lengkap || 'Calon Pemilik';
            const counterpartRole = pengklaim?.role_kampus ? pengklaim.role_kampus.charAt(0).toUpperCase() + pengklaim.role_kampus.slice(1) : 'Pengklaim Barang';

            const d = new Date(c.dibuat_pada);
            const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

            let convStatus: 'VERIFYING' | 'RESOLVED' | 'DISPUTED' = 'VERIFYING';
            if (c.status === 'SELESAI') convStatus = 'RESOLVED';
            else if (c.status === 'DITOLAK') convStatus = 'DISPUTED';

            const latest = userLatestMsgsMap[c.id];
            const lastMsg = latest ? latest.text : (c.pesan_verifikasi || 'Pengguna mengajukan klaim atas barang yang Anda laporkan.');

            loadedConversations.push({
              id: c.id,
              counterpartName,
              counterpartRole,
              itemTitle: c.laporan_barang?.nama_barang || 'Barang Laporan Anda',
              lastMessage: lastMsg,
              lastTime: timeStr,
              unread: true,
              status: convStatus,
              initialPesanVerifikasi: c.pesan_verifikasi,
              pengklaimId: c.pengklaim_id,
              pelaporId: c.laporan_barang?.pelapor_id,
              pengklaimName: counterpartName,
              pelaporName: profile?.nama_lengkap || 'Pelapor',
              disetujuiPelapor: Boolean(c.disetujui_oleh_pelapor),
              disetujuiPengklaim: Boolean(c.disetujui_oleh_pengklaim),
            });
          });
        }

        if (isMounted) {
          setConversations(loadedConversations);

          if (targetClaimId) {
            const matched = loadedConversations.find((c) => c.id === targetClaimId);
            if (matched) {
              setSelectedConv(matched);
              setEmptyNotice(null);
            } else {
              // Cek apakah klaim spesifik ini ada di database
              const { data: targetClaim } = await supabase
                .from('klaim_barang')
                .select('*, laporan_barang(*, profil_pengguna:pelapor_id(nama_lengkap, role_kampus, universitas)), profil_pengguna:pengklaim_id(nama_lengkap, role_kampus, universitas)')
                .eq('id', targetClaimId)
                .maybeSingle();

              // Cek apakah klaim ini benar-benar memiliki riwayat pesan
              const { count: msgCount } = await supabase
                .from('pesan_chat')
                .select('id', { count: 'exact', head: true })
                .eq('klaim_id', targetClaimId);

              if (targetClaim && (msgCount ?? 0) > 0) {
                const report = targetClaim.laporan_barang;
                const claimant = targetClaim.profil_pengguna;
                const pelapor = report?.profil_pengguna;
                const claimantName = claimant?.nama_lengkap || 'Pengklaim';
                const pelaporName = pelapor?.nama_lengkap || 'Pelapor';
                const counterpartName = userIsAdmin ? `${claimantName} & ${pelaporName}` : pelaporName;

                const customConv: ChatConversation = {
                  id: targetClaim.id,
                  counterpartName,
                  counterpartRole: userIsAdmin ? 'Mediasi Klaim' : (pelapor?.role_kampus || 'Warga Kampus'),
                  itemTitle: report?.nama_barang || 'Barang Laporan',
                  lastMessage: targetClaim.pesan_verifikasi || 'Percakapan terkait klaim.',
                  lastTime: 'Baru',
                  unread: false,
                  status: targetClaim.status === 'SELESAI' ? 'RESOLVED' : targetClaim.status === 'DITOLAK' ? 'DISPUTED' : 'VERIFYING',
                  initialPesanVerifikasi: targetClaim.pesan_verifikasi,
                  pengklaimId: targetClaim.pengklaim_id,
                  pelaporId: report?.pelapor_id,
                  pengklaimName: claimantName,
                  pelaporName: pelaporName,
                  disetujuiPelapor: Boolean(targetClaim.disetujui_oleh_pelapor),
                  disetujuiPengklaim: Boolean(targetClaim.disetujui_oleh_pengklaim),
                };

                setConversations((prev) => [customConv, ...prev.filter((p) => p.id !== customConv.id)]);
                setSelectedConv(customConv);
                setEmptyNotice(null);
              } else {
                // Klaim ini TIDAK memiliki riwayat pesan mediasi. JANGAN buka mediasi orang lain!
                setSelectedConv(null);
                setEmptyNotice({
                  claimTitle: targetClaim?.laporan_barang?.nama_barang || 'Klaim Terkait',
                  claimId: targetClaimId,
                });
              }
            }
          } else {
            if (loadedConversations.length > 0) {
              setSelectedConv(loadedConversations[0]);
            } else {
              setSelectedConv(null);
            }
            setEmptyNotice(null);
          }
        }
      } catch (err) {
        console.error('Error loading conversations:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadUserConversations();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user && isMounted) {
        setIsGuest(false);
        loadUserConversations();
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, [targetClaimId]);

  // Update conversation status
  useEffect(() => {
    if (selectedConv) {
      setIsApproved(selectedConv.status === 'RESOLVED');
      setIsDisputed(selectedConv.status === 'DISPUTED');
      setDisetujuiPelapor(Boolean(selectedConv.disetujuiPelapor));
      setDisetujuiPengklaim(Boolean(selectedConv.disetujuiPengklaim));
    }
  }, [selectedConv]);

  // Load Realtime Messages for active conversation
  useEffect(() => {
    if (!selectedConv?.id) return;
    const convId = selectedConv.id;
    const supabase = createClient();
    let isMounted = true;

    async function fetchDbMessages() {
      try {
        const { data: dbRows, error } = await supabase
          .from('pesan_chat')
          .select('*, profil_pengguna:pengirim_id(id, nama_lengkap, role_kampus, tipe_akun, email)')
          .eq('klaim_id', convId)
          .order('dibuat_pada', { ascending: true });

        if (error) throw error;

        if (dbRows && dbRows.length > 0) {
          // Cache profiles
          dbRows.forEach((r: any) => {
            if (r.pengirim_id && r.profil_pengguna) {
              profilesCacheRef.current[r.pengirim_id] = r.profil_pengguna;
            }
          });

          const mapped: ChatMessage[] = dbRows.map((r: any) => {
            const isMe = r.pengirim_id === currentUserId;
            const isSystem = r.tipe_pesan === 'sistem';
            const parsed = parseChatMessage(r.pesan);
            const d = new Date(r.dibuat_pada);
            const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

            const profile = r.profil_pengguna || profilesCacheRef.current[r.pengirim_id];

            // Check if sender is admin
            const isSenderAdmin = Boolean(
              profile?.tipe_akun === 'admin' ||
              profile?.role_kampus === 'admin' ||
              profile?.email?.toLowerCase().includes('admin') ||
              (isMe && isAdmin) ||
              (selectedConv?.pengklaimId &&
                selectedConv?.pelaporId &&
                r.pengirim_id !== selectedConv.pengklaimId &&
                r.pengirim_id !== selectedConv.pelaporId &&
                !isSystem)
            );

            let senderName: string | undefined;
            let senderRole: 'pengklaim' | 'pelapor' | 'admin' | undefined;

            if (isSenderAdmin) {
              senderRole = 'admin';
              senderName = profile?.nama_lengkap
                ? `Admin (${profile.nama_lengkap})`
                : 'Admin Mediasi Kampus';
            } else if (selectedConv && r.pengirim_id === selectedConv.pengklaimId) {
              senderRole = 'pengklaim';
              senderName = selectedConv.pengklaimName || profile?.nama_lengkap || 'Pengklaim';
            } else if (selectedConv && r.pengirim_id === selectedConv.pelaporId) {
              senderRole = 'pelapor';
              senderName = selectedConv.pelaporName || profile?.nama_lengkap || 'Pelapor';
            } else {
              senderName = profile?.nama_lengkap || (isMe ? 'Anda' : 'Pengguna');
            }

            return {
              id: r.id,
              sender: isSystem ? ('system' as const) : (isMe ? ('me' as const) : ('other' as const)),
              senderName,
              senderRole,
              isAdminSender: isSenderAdmin,
              text: parsed.text,
              imageUrl: parsed.imageUrl,
              time: timeStr,
            };
          });

          if (isMounted) {
            setMessagesMap((prev) => ({
              ...prev,
              [convId]: mapped,
            }));

            const lastOne = mapped[mapped.length - 1];
            if (lastOne) {
              const snippet = lastOne.imageUrl ? (lastOne.text ? `📷 ${lastOne.text}` : '📷 Mengirim foto') : lastOne.text.split('\n')[0];
              setConversations((prev) =>
                prev.map((c) =>
                  c.id === convId
                    ? { ...c, lastMessage: snippet, lastTime: lastOne.time }
                    : c
                )
              );
            }
          }
        } else {
          // Fallback to initial message
          const initialMsgs: ChatMessage[] = [];
          if (selectedConv?.initialPesanVerifikasi) {
            initialMsgs.push({
              id: `init-${convId}`,
              sender: 'other',
              senderRole: 'pengklaim',
              senderName: selectedConv.pengklaimName || 'Pengklaim',
              text: `Halo, saya mengajukan klaim dengan bukti verifikasi:\n"${selectedConv.initialPesanVerifikasi}"`,
              time: selectedConv.lastTime || 'Baru saja',
            });
          }
          if (isMounted) {
            setMessagesMap((prev) => ({
              ...prev,
              [convId]: initialMsgs,
            }));
          }
        }

        // Ambil status klaim dan persetujuan konsensus dari klaim_barang
        try {
          const { data: claimRow } = await supabase
            .from('klaim_barang')
            .select('*')
            .eq('id', convId)
            .maybeSingle();

          if (claimRow && isMounted) {
            let pAgreed = Boolean(claimRow.disetujui_oleh_pelapor);
            let kAgreed = Boolean(claimRow.disetujui_oleh_pengklaim);

            if (claimRow.status === 'SELESAI') {
              pAgreed = true;
              kAgreed = true;
              setIsApproved(true);
            } else if (claimRow.status === 'DITOLAK') {
              setIsDisputed(true);
            }

            // Fallback: deteksi persetujuan dari jejak pesan sistem jika kolom belum dimigrasi
            if (claimRow.status !== 'SELESAI' && claimRow.disetujui_oleh_pelapor === undefined && dbRows) {
              const consensusMsgs = dbRows.filter((r: any) => r.tipe_pesan === 'sistem' && (
                r.pesan.includes('menyetujui kesepakatan') ||
                r.pesan.includes('membatalkan pengajuan kesepakatan')
              ));
              for (const cm of consensusMsgs) {
                const isFromPelapor = cm.pesan.includes(selectedConv?.pelaporName || 'Pelapor');
                const isFromPengklaim = cm.pesan.includes(selectedConv?.pengklaimName || 'Pengklaim');
                const isCancel = cm.pesan.includes('membatalkan');
                if (isFromPelapor) pAgreed = !isCancel;
                if (isFromPengklaim) kAgreed = !isCancel;
              }
            }

            setDisetujuiPelapor(pAgreed);
            setDisetujuiPengklaim(kAgreed);
          }
        } catch (claimErr) {
          console.warn('Error fetching claim row details:', claimErr);
        }
      } catch (err) {
        console.warn('Error fetching db messages:', err);
      }
    }

    fetchDbMessages();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`room_${convId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pesan_chat',
          filter: `klaim_id=eq.${convId}`,
        },
        async (payload: any) => {
          const row = payload.new;
          if (row.pengirim_id === currentUserId) return;

          const isSystem = row.tipe_pesan === 'sistem';

          if (isSystem) {
            if (row.pesan.includes('Kepemilikan barang telah disepakati oleh kedua')) {
              setIsApproved(true);
              setDisetujuiPelapor(true);
              setDisetujuiPengklaim(true);
              setConversations((prev) =>
                prev.map((c) =>
                  c.id === convId ? { ...c, status: 'RESOLVED', disetujuiPelapor: true, disetujuiPengklaim: true } : c
                )
              );
            } else if (row.pesan.includes('menyetujui kesepakatan')) {
              const isFromPelapor = row.pesan.includes(selectedConv?.pelaporName || 'Pelapor');
              const isFromPengklaim = row.pesan.includes(selectedConv?.pengklaimName || 'Pengklaim');
              if (isFromPelapor) {
                setDisetujuiPelapor(true);
                setConversations((prev) =>
                  prev.map((c) => (c.id === convId ? { ...c, disetujuiPelapor: true } : c))
                );
              }
              if (isFromPengklaim) {
                setDisetujuiPengklaim(true);
                setConversations((prev) =>
                  prev.map((c) => (c.id === convId ? { ...c, disetujuiPengklaim: true } : c))
                );
              }
            } else if (row.pesan.includes('membatalkan pengajuan kesepakatan')) {
              const isFromPelapor = row.pesan.includes(selectedConv?.pelaporName || 'Pelapor');
              const isFromPengklaim = row.pesan.includes(selectedConv?.pengklaimName || 'Pengklaim');
              if (isFromPelapor) {
                setDisetujuiPelapor(false);
                setConversations((prev) =>
                  prev.map((c) => (c.id === convId ? { ...c, disetujuiPelapor: false } : c))
                );
              }
              if (isFromPengklaim) {
                setDisetujuiPengklaim(false);
                setConversations((prev) =>
                  prev.map((c) => (c.id === convId ? { ...c, disetujuiPengklaim: false } : c))
                );
              }
            }
          }

          const parsed = parseChatMessage(row.pesan);
          const d = new Date(row.dibuat_pada);
          const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

          let profile = profilesCacheRef.current[row.pengirim_id];
          if (!profile && !isSystem && row.pengirim_id) {
            try {
              const { data: p } = await supabase
                .from('profil_pengguna')
                .select('id, nama_lengkap, role_kampus, tipe_akun, email')
                .eq('id', row.pengirim_id)
                .single();
              if (p) {
                profile = p;
                profilesCacheRef.current[row.pengirim_id] = p;
              }
            } catch {
              // ignore
            }
          }

          const isSenderAdmin = Boolean(
            profile?.tipe_akun === 'admin' ||
            profile?.role_kampus === 'admin' ||
            profile?.email?.toLowerCase().includes('admin') ||
            (selectedConv?.pengklaimId &&
              selectedConv?.pelaporId &&
              row.pengirim_id !== selectedConv.pengklaimId &&
              row.pengirim_id !== selectedConv.pelaporId &&
              !isSystem)
          );

          let senderName: string | undefined;
          let senderRole: 'pengklaim' | 'pelapor' | 'admin' | undefined;

          if (isSenderAdmin) {
            senderRole = 'admin';
            senderName = profile?.nama_lengkap
              ? `Admin (${profile.nama_lengkap})`
              : 'Admin Mediasi Kampus';
          } else if (selectedConv && row.pengirim_id === selectedConv.pengklaimId) {
            senderRole = 'pengklaim';
            senderName = selectedConv.pengklaimName || profile?.nama_lengkap || 'Pengklaim';
          } else if (selectedConv && row.pengirim_id === selectedConv.pelaporId) {
            senderRole = 'pelapor';
            senderName = selectedConv.pelaporName || profile?.nama_lengkap || 'Pelapor';
          } else {
            senderName = profile?.nama_lengkap || 'Pengguna';
          }

          const newChat: ChatMessage = {
            id: row.id,
            sender: isSystem ? 'system' : 'other',
            senderName,
            senderRole,
            isAdminSender: isSenderAdmin,
            text: parsed.text,
            imageUrl: parsed.imageUrl,
            time: timeStr,
          };

          setMessagesMap((prev) => {
            const list = prev[convId] || [];
            if (list.some((m) => m.id === newChat.id)) return prev;
            return {
              ...prev,
              [convId]: [...list, newChat],
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
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'klaim_barang',
          filter: `id=eq.${convId}`,
        },
        (payload: any) => {
          const row = payload.new;
          if (!row) return;
          const pelaporAgreed = Boolean(row.disetujui_oleh_pelapor);
          const pengklaimAgreed = Boolean(row.disetujui_oleh_pengklaim);
          setDisetujuiPelapor(pelaporAgreed);
          setDisetujuiPengklaim(pengklaimAgreed);
          if (row.status === 'SELESAI') {
            setIsApproved(true);
          } else if (row.status === 'DITOLAK') {
            setIsDisputed(true);
          }
          setConversations((prev) =>
            prev.map((c) =>
              c.id === convId
                ? {
                    ...c,
                    status: row.status === 'SELESAI' ? 'RESOLVED' : row.status === 'DITOLAK' ? 'DISPUTED' : c.status,
                    disetujuiPelapor: pelaporAgreed,
                    disetujuiPengklaim: pengklaimAgreed,
                  }
                : c
            )
          );
        }
      )
      .subscribe();

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
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch (err) {
      console.error('Compress image failed:', err);
      alert('Gagal memproses gambar. Silakan coba lagi.');
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
      senderRole: isAdmin ? 'admin' : (selectedConv.pengklaimId === currentUserId ? 'pengklaim' : 'pelapor'),
      senderName: isAdmin ? 'Admin' : (selectedConv.pengklaimId === currentUserId ? selectedConv.pengklaimName : selectedConv.pelaporName),
      isAdminSender: isAdmin,
      text: userText,
      imageUrl: imageToSend || undefined,
      time: timeStr,
    };

    const updated = [...(messagesMap[selectedConv.id] || []), newMsg];
    setMessagesMap((prev) => ({
      ...prev,
      [selectedConv.id]: updated,
    }));
    setTimeout(() => scrollToBottom(true, true), 40);

    const previewSnippet = imageToSend
      ? (userText ? `📷 ${userText}` : '📷 Mengirim foto')
      : userText;

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConv.id ? { ...c, lastMessage: previewSnippet, lastTime: timeStr } : c
      )
    );

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

  // Deteksi peran user saat ini dalam percakapan aktif
  const isPengklaim = Boolean(currentUserId && selectedConv?.pengklaimId && currentUserId === selectedConv.pengklaimId);
  const isPelapor = Boolean(
    currentUserId && (
      (selectedConv?.pelaporId && currentUserId === selectedConv.pelaporId) ||
      (!isPengklaim && currentUserId !== selectedConv?.pengklaimId)
    )
  );

  const myAgreed = (isPelapor && disetujuiPelapor) || (isPengklaim && disetujuiPengklaim);
  const otherAgreed = (isPelapor && disetujuiPengklaim) || (isPengklaim && disetujuiPelapor);

  const handleApprove = async () => {
    if (!selectedConv) return;
    const timeStr = getCurrentTime();

    if (isAdmin) {
      // Admin memiliki hak override untuk menyetujui klaim secara sepihak/final
      setIsApproved(true);
      setDisetujuiPelapor(true);
      setDisetujuiPengklaim(true);

      const adminMsg: ChatMessage = {
        id: `sys-${Date.now()}`,
        sender: 'system',
        text: 'Persetujuan serah terima barang telah dikonfirmasi oleh admin. Silakan kedua pihak melakukan serah terima di titik temu aman kampus.',
        time: timeStr,
      };

      setMessagesMap((prev) => ({
        ...prev,
        [selectedConv.id]: [...(prev[selectedConv.id] || []), adminMsg],
      }));

      try {
        const supabase = createClient();
        await supabase
          .from('klaim_barang')
          .update({
            status: 'SELESAI',
            disetujui_oleh_pelapor: true,
            disetujui_oleh_pengklaim: true,
          })
          .eq('id', selectedConv.id);

        await supabase.from('pesan_chat').insert({
          klaim_id: selectedConv.id,
          pengirim_id: currentUserId,
          pesan: adminMsg.text,
          tipe_pesan: 'sistem',
        });
      } catch (err) {
        console.error('Error syncing admin approval:', err);
      }

      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConv.id
            ? {
                ...c,
                status: 'RESOLVED',
                disetujuiPelapor: true,
                disetujuiPengklaim: true,
                lastMessage: adminMsg.text.split('\n')[0],
                lastTime: timeStr,
              }
            : c
        )
      );
      return;
    }

    // Konsensus Dua Pihak:
    // Jika pihak kedua sudah sepakat, maka klik ini melengkapi konsensus (2/2) -> status SELESAI
    // Jika pihak kedua belum sepakat, maka klik ini mencatat kesepakatan pihak pertama (1/2) -> tunggu pihak kedua
    const willBothAgree = otherAgreed;
    const newPelaporAgreed = isPelapor ? true : disetujuiPelapor;
    const newPengklaimAgreed = isPengklaim ? true : disetujuiPengklaim;

    const myDisplayName = isPelapor
      ? (selectedConv.pelaporName || 'Pelapor')
      : (selectedConv.pengklaimName || 'Pengklaim');

    let sysMsgText = '';
    if (willBothAgree) {
      sysMsgText = '🎉 Kepemilikan barang telah disepakati oleh kedua belah pihak! Silakan atur jadwal dan lakukan serah terima di Titik Temu Aman kampus.';
      setIsApproved(true);
      setDisetujuiPelapor(true);
      setDisetujuiPengklaim(true);
    } else {
      sysMsgText = `🤝 ${myDisplayName} telah menyetujui kesepakatan kepemilikan barang (1/2). Menunggu konfirmasi dari pihak kedua untuk menyelesaikan serah terima.`;
      if (isPelapor) setDisetujuiPelapor(true);
      if (isPengklaim) setDisetujuiPengklaim(true);
    }

    const consentMsg: ChatMessage = {
      id: `sys-${Date.now()}`,
      sender: 'system',
      text: sysMsgText,
      time: timeStr,
    };

    setMessagesMap((prev) => ({
      ...prev,
      [selectedConv.id]: [...(prev[selectedConv.id] || []), consentMsg],
    }));

    try {
      const supabase = createClient();
      const updateData: any = {
        disetujui_oleh_pelapor: willBothAgree ? true : newPelaporAgreed,
        disetujui_oleh_pengklaim: willBothAgree ? true : newPengklaimAgreed,
      };
      if (willBothAgree) {
        updateData.status = 'SELESAI';
      }

      const { error: updateErr } = await supabase
        .from('klaim_barang')
        .update(updateData)
        .eq('id', selectedConv.id);

      if (updateErr && willBothAgree) {
        // Fallback jika kolom disetujui belum ditambahkan di database
        await supabase.from('klaim_barang').update({ status: 'SELESAI' }).eq('id', selectedConv.id);
      }

      await supabase.from('pesan_chat').insert({
        klaim_id: selectedConv.id,
        pengirim_id: currentUserId,
        pesan: consentMsg.text,
        tipe_pesan: 'sistem',
      });
    } catch (err) {
      console.error('Error syncing dual consensus approval:', err);
    }

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConv.id
          ? {
              ...c,
              status: willBothAgree ? 'RESOLVED' : c.status,
              disetujuiPelapor: willBothAgree ? true : newPelaporAgreed,
              disetujuiPengklaim: willBothAgree ? true : newPengklaimAgreed,
              lastMessage: consentMsg.text.split('\n')[0],
              lastTime: timeStr,
            }
          : c
      )
    );
  };

  const handleCancelApprove = async () => {
    if (!selectedConv || isApproved) return;
    const timeStr = getCurrentTime();

    const newPelaporAgreed = isPelapor ? false : disetujuiPelapor;
    const newPengklaimAgreed = isPengklaim ? false : disetujuiPengklaim;

    if (isPelapor) setDisetujuiPelapor(false);
    if (isPengklaim) setDisetujuiPengklaim(false);

    const myDisplayName = isPelapor
      ? (selectedConv.pelaporName || 'Pelapor')
      : (selectedConv.pengklaimName || 'Pengklaim');

    const cancelMsg: ChatMessage = {
      id: `sys-${Date.now()}`,
      sender: 'system',
      text: `↩️ ${myDisplayName} membatalkan pengajuan kesepakatan kepemilikan barang.`,
      time: timeStr,
    };

    setMessagesMap((prev) => ({
      ...prev,
      [selectedConv.id]: [...(prev[selectedConv.id] || []), cancelMsg],
    }));

    try {
      const supabase = createClient();
      await supabase
        .from('klaim_barang')
        .update({
          disetujui_oleh_pelapor: newPelaporAgreed,
          disetujui_oleh_pengklaim: newPengklaimAgreed,
        })
        .eq('id', selectedConv.id);

      await supabase.from('pesan_chat').insert({
        klaim_id: selectedConv.id,
        pengirim_id: currentUserId,
        pesan: cancelMsg.text,
        tipe_pesan: 'sistem',
      });
    } catch (err) {
      console.error('Error syncing cancel approval:', err);
    }

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConv.id
          ? {
              ...c,
              disetujuiPelapor: newPelaporAgreed,
              disetujuiPengklaim: newPengklaimAgreed,
              lastMessage: cancelMsg.text.split('\n')[0],
              lastTime: timeStr,
            }
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
      text: 'Permintaan mediasi telah diteruskan ke admin. Admin akan meninjau riwayat percakapan untuk menengahi kesalahpahaman dan memverifikasi bukti kepemilikan.',
      time: timeStr,
    };

    const updated = [...(messagesMap[selectedConv.id] || []), disputeMsg];
    setMessagesMap((prev) => ({
      ...prev,
      [selectedConv.id]: updated,
    }));

    try {
      const supabase = createClient();
      await supabase.from('klaim_barang').update({ status: 'DITOLAK' }).eq('id', selectedConv.id);
      await supabase.from('pesan_chat').insert({
        klaim_id: selectedConv.id,
        pengirim_id: currentUserId,
        pesan: disputeMsg.text,
        tipe_pesan: 'sistem',
      });
    } catch (err) {
      console.error('Error syncing dispute:', err);
    }

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConv.id
          ? { ...c, status: 'DISPUTED', lastMessage: 'Permintaan mediasi aktif' }
          : c
      )
    );
  };

  const handleRejectByAdmin = async () => {
    if (!selectedConv) return;
    if (!confirm('Tolak klaim ini setelah peninjauan bukti?')) return;
    setIsDisputed(true);
    const timeStr = getCurrentTime();
    const rejectMsg: ChatMessage = {
      id: `sys-${Date.now()}`,
      sender: 'system',
      text: 'Klaim telah ditolak oleh admin setelah peninjauan bukti verifikasi.',
      time: timeStr,
    };

    const updated = [...(messagesMap[selectedConv.id] || []), rejectMsg];
    setMessagesMap((prev) => ({
      ...prev,
      [selectedConv.id]: updated,
    }));

    try {
      const supabase = createClient();
      await supabase.from('klaim_barang').update({ status: 'DITOLAK' }).eq('id', selectedConv.id);
      await supabase.from('pesan_chat').insert({
        klaim_id: selectedConv.id,
        pengirim_id: currentUserId,
        pesan: rejectMsg.text,
        tipe_pesan: 'sistem',
      });
    } catch (err) {
      console.error('Error syncing rejection:', err);
    }

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConv.id
          ? { ...c, status: 'DISPUTED', lastMessage: 'Klaim ditolak oleh admin' }
          : c
      )
    );
  };

  const currentMessages = selectedConv ? messagesMap[selectedConv.id] || [] : [];

  return (
    <AppLayout fullHeight>
      <div className="flex-1 flex flex-col min-h-0 space-y-2.5 overflow-hidden">
        {/* Header Title */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {isAdmin ? 'Pesan & Mediasi' : 'Pesan & Verifikasi'}
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block mt-0.5">
              {isAdmin
                ? 'Ruang diskusi dan mediasi klaim kepemilikan barang di kampus.'
                : 'Ruang obrolan langsung antara penemu dan pemilik untuk verifikasi barang.'}
            </p>
          </div>
        </div>

        {/* Guest Warning */}
        {isGuest ? (
          <div className="bg-white rounded-[6px] border border-slate-200 p-8 sm:p-12 text-center shadow-xs max-w-lg mx-auto space-y-4 my-8">
            <div className="w-14 h-14 rounded-[6px] bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center mx-auto">
              <MessageSquare size={28} />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Masuk untuk Mengakses Pesan</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Anda harus login terlebih dahulu untuk mengakses ruang chat verifikasi barang hilang & temuan.
              </p>
            </div>
            <Link
              href="/login?redirect=/messages"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-[6px] bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition-all"
            >
              <LogIn size={15} />
              <span>Masuk Sekarang</span>
            </Link>
          </div>
        ) : loading ? (
          <div className="bg-white rounded-[6px] border border-slate-200 p-12 text-center shadow-xs flex flex-col items-center justify-center gap-3 min-h-[400px]">
            <Loader2 size={32} className="animate-spin text-sky-600" />
            <p className="text-xs text-slate-500">
              {isAdmin ? 'Memuat sesi mediasi...' : 'Memuat sesi obrolan verifikasi...'}
            </p>
          </div>
        ) : conversations.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-[6px] border border-slate-200 p-8 sm:p-14 text-center shadow-xs max-w-2xl mx-auto space-y-5 my-6">
            <div className="w-16 h-16 rounded-[6px] bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center mx-auto">
              <MessageSquare size={32} />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                {emptyNotice
                  ? 'Tidak Ada Pesan Mediasi'
                  : isAdmin
                    ? 'Belum Ada Sesi Mediasi Aktif'
                    : 'Belum Ada Sesi Pesan & Verifikasi'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                {emptyNotice
                  ? `Klaim untuk barang "${emptyNotice.claimTitle}" belum memiliki riwayat atau sesi pesan mediasi aktif.`
                  : isAdmin
                    ? 'Saat ini seluruh proses verifikasi berjalan lancar atau belum ada laporan sengketa yang membutuhkan bantuan admin mediator.'
                    : 'Sesi obrolan verifikasi akan muncul secara otomatis saat Anda mengajukan klaim atas barang temuan, atau saat ada pengguna lain yang mengklaim barang yang Anda laporkan.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {isAdmin ? (
                <>
                  <Link
                    href="/admin/klaim"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#30AFFF] hover:bg-[#2196E8] text-white text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-2"
                  >
                    <FileCheck2 size={14} />
                    <span>Kembali ke Kelola Klaim</span>
                  </Link>
                  <Link
                    href="/admin/laporan"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-[6px] border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <span>Moderasi Laporan</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/find"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-[6px] bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-2"
                  >
                    <Search size={14} />
                    <span>Cari Barang Temuan</span>
                  </Link>
                  <Link
                    href="/claims"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-[6px] border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <span>Lihat Riwayat Klaim</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        ) : (
          /* Real Chat Layout */
          <div className="flex-1 min-h-0 bg-white rounded-[6px] border border-slate-200 shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12">
            {/* Left Column: Conversations List */}
            <ConversationList
              conversations={conversations}
              selectedConv={selectedConv}
              onSelectConv={(conv) => {
                setSelectedConv(conv);
                setShowMobileChat(true);
              }}
              isAdmin={isAdmin}
              showMobileChat={showMobileChat}
            />

            {/* Right Column: Active Chat Room or Empty State */}
            {selectedConv ? (
              <div
                className={`lg:col-span-8 flex flex-col h-full min-h-0 bg-white ${!showMobileChat ? 'hidden lg:flex' : 'flex'
                  }`}
              >
                {/* Chat Room Top Bar */}
                <ChatHeader
                  selectedConv={selectedConv}
                  isAdmin={isAdmin}
                  isApproved={isApproved}
                  isDisputed={isDisputed}
                  myAgreed={myAgreed}
                  otherAgreed={otherAgreed}
                  onBackToConversations={() => setShowMobileChat(false)}
                  onOpenSafePointModal={() => setShowSafePointModal(true)}
                  onApprove={handleApprove}
                  onCancelApprove={handleCancelApprove}
                  onDispute={handleDispute}
                  onRejectByAdmin={handleRejectByAdmin}
                />

                {/* Banner Ajakan Konfirmasi jika Pihak Kedua Belum Setuju */}
                {!isAdmin && otherAgreed && !myAgreed && !isApproved && (
                  <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-emerald-900 shrink-0">
                    <div className="flex items-center gap-2.5">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                      </span>
                      <span>
                        <strong>{selectedConv.counterpartName}</strong> telah menyetujui kepemilikan barang ini. Konfirmasi kesepakatan Anda untuk menyelesaikan serah terima!
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleApprove}
                      className="shrink-0 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-[6px] transition-colors cursor-pointer shadow-xs flex items-center gap-1"
                    >
                      <Check size={13} className="stroke-[2.5]" />
                      <span>Setujui Sekarang</span>
                    </button>
                  </div>
                )}

                {/* Banner Info jika User Sedang Menunggu Pihak Kedua */}
                {!isAdmin && myAgreed && !otherAgreed && !isApproved && (
                  <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between gap-3 text-xs text-amber-900 shrink-0">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-amber-600 animate-pulse shrink-0" />
                      <span>
                        Anda telah menyetujui kesepakatan (1/2). Menunggu konfirmasi dari <strong>{selectedConv.counterpartName}</strong>.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCancelApprove}
                      className="text-amber-800 hover:text-rose-700 underline text-[11px] cursor-pointer shrink-0"
                    >
                      Batalkan Persetujuan
                    </button>
                  </div>
                )}

                {/* Messages Scroll Area */}
                <ChatMessageList
                  messages={currentMessages}
                  isAdmin={isAdmin}
                  isDisputed={isDisputed}
                  safePointsList={safePointsList}
                  onZoomImage={(url) => setZoomedImage(url)}
                  messagesContainerRef={messagesContainerRef}
                  messagesEndRef={messagesEndRef}
                  onScroll={handleScroll}
                  isAtBottom={isAtBottom}
                  scrollToBottom={scrollToBottom}
                />

                {/* Chat Input Bar */}
                <ChatInput
                  inputMessage={inputMessage}
                  setInputMessage={setInputMessage}
                  selectedImage={selectedImage}
                  onClearSelectedImage={() => {
                    setSelectedImage(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  isUploadingImage={isUploadingImage}
                  onSendMessage={handleSendMessage}
                  onImageSelect={handleImageSelect}
                  fileInputRef={fileInputRef}
                  inputRef={inputRef}
                />
              </div>
            ) : (
              <div
                className={`lg:col-span-8 flex flex-col items-center justify-center p-8 text-center bg-gray-50/50 ${
                  !showMobileChat ? 'hidden lg:flex' : 'flex'
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-sky-50 text-[#30AFFF] border border-sky-100 flex items-center justify-center mb-3">
                  <MessageSquareOff size={28} />
                </div>
                <h4 className="text-base font-bold text-gray-900 mb-1">
                  {emptyNotice ? 'Tidak Ada Pesan Mediasi' : 'Pilih Sesi Percakapan'}
                </h4>
                <p className="text-xs text-gray-500 max-w-md leading-relaxed mb-5">
                  {emptyNotice
                    ? `Klaim untuk barang "${emptyNotice.claimTitle}" belum memiliki riwayat atau sesi pesan mediasi aktif.`
                    : 'Pilih salah satu sesi percakapan dari daftar di sebelah kiri untuk membaca atau membalas pesan.'}
                </p>
                {isAdmin && (
                  <Link
                    href="/admin/klaim"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#30AFFF] hover:bg-[#2196E8] text-white text-xs font-semibold transition-all shadow-xs"
                  >
                    <FileCheck2 size={14} />
                    <span>Kembali ke Kelola Klaim</span>
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

        {/* Lightbox / Zoom Modal */}
        <ImageLightbox
          imageUrl={zoomedImage}
          onClose={() => setZoomedImage(null)}
        />

        {/* Safe Meeting Point Selector Modal */}
        <SafePointModal
          isOpen={showSafePointModal}
          onClose={() => setShowSafePointModal(false)}
          safePointsList={safePointsList}
          selectedSafePointId={selectedSafePointModalId}
          onSelectSafePointId={(id) => setSelectedSafePointModalId(id)}
          onShareSafePoint={handleShareSafePoint}
        />
      </div>
    </AppLayout>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center p-4">
          <Loader2 size={24} className="animate-spin text-[#30AFFF]" />
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
