'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '@/src/components/layout/AppLayout';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  Share2,
  Bookmark,
  CheckCircle2,
  Eye,
  MessageSquare,
  Building,
  Briefcase,
  Smartphone,
  Wallet,
  CreditCard,
  KeyRound,
  BookOpen,
  PackageSearch,
  X,
  Send,
  AlertCircle,
  Loader2,
  Lock,
  Navigation,
} from 'lucide-react';
import { createClient } from '@/src/lib/supabase/client';
import LeafletSafeMap from '@/src/components/map/LeafletSafeMap';
import { SafePoint, getSafePoints, DEFAULT_SAFE_POINTS } from '@/src/lib/safePoints';
import { detectCategory, cleanDescription } from '@/src/lib/categories';

interface ItemDetail {
  id: string;
  title: string;
  type: 'lost' | 'found';
  category: string;
  location: string;
  timeAgo: string;
  date: string;
  description: string;
  finderName: string;
  finderRole: string;
  isVerifiedCivitas: boolean;
  safePoint: string;
  safePointObj?: SafePoint;
  pelaporId?: string;
  foto_url?: string | null;
  icon: any;
  colorScheme: {
    bg: string;
    text: string;
    border: string;
  };
}

function getCategoryIcon(cat: string) {
  const lower = (cat || '').toLowerCase();
  if (lower.includes('elektronik') || lower.includes('hp') || lower.includes('gadget') || lower.includes('laptop')) {
    return Smartphone;
  }
  if (lower.includes('dompet') || lower.includes('aksesoris')) {
    return Wallet;
  }
  if (lower.includes('tas') || lower.includes('ransel')) {
    return Briefcase;
  }
  if (lower.includes('dokumen') || lower.includes('kartu') || lower.includes('ktm')) {
    return CreditCard;
  }
  if (lower.includes('kunci') || lower.includes('kendaraan') || lower.includes('motor')) {
    return KeyRound;
  }
  if (lower.includes('buku') || lower.includes('tulis')) {
    return BookOpen;
  }
  return Briefcase;
}

function getColorScheme(type: 'lost' | 'found') {
  if (type === 'found') {
    return { bg: 'bg-emerald-50/70', text: 'text-emerald-700', border: 'border-emerald-200' };
  }
  return { bg: 'bg-rose-50/70', text: 'text-rose-700', border: 'border-rose-200' };
}

function formatRelativeTime(dateString: string) {
  try {
    const d = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) {
      const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
      return `${diffMins} menit yang lalu`;
    }
    if (diffHours < 24) {
      return `${diffHours} jam yang lalu`;
    }
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} hari yang lalu`;
  } catch {
    return 'Baru saja';
  }
}

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Modal template state for "Saya Menemukan Barang Ini"
  const [showFoundModal, setShowFoundModal] = useState(false);
  const [foundLocation, setFoundLocation] = useState('');
  const [storageType, setStorageType] = useState<'security' | 'frontdesk' | 'self' | 'other'>('security');
  const [storageNote, setStorageNote] = useState('');
  const [itemCondition, setItemCondition] = useState('Utuh & Baik');
  const [finderMessage, setFinderMessage] = useState('');
  const [isSubmittingFound, setIsSubmittingFound] = useState(false);
  const [foundError, setFoundError] = useState<string | null>(null);

  // Safe point & Leaflet OSM map states
  const [showMap, setShowMap] = useState(false);
  const [safePointsList, setSafePointsList] = useState<SafePoint[]>(DEFAULT_SAFE_POINTS);
  const [selectedSafePointId, setSelectedSafePointId] = useState<string>('sp-1');

  const itemId = typeof params?.id === 'string' ? params.id : '';

  useEffect(() => {
    try {
      const savedIds: string[] = JSON.parse(localStorage.getItem('findly_saved_items') || '[]');
      if (Array.isArray(savedIds) && savedIds.includes(itemId)) {
        setIsSaved(true);
      }
    } catch {
      // ignore
    }

    async function loadItem() {
      if (!itemId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const supabase = createClient();
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        if (authUser) {
          setCurrentUserId(authUser.id);
        }

        const { data, error } = await supabase
          .from('laporan_barang')
          .select('*, profil_pengguna:pelapor_id(nama_lengkap, role_kampus, universitas, status_kampus_terverifikasi)')
          .eq('id', itemId)
          .single();

        if (error || !data) {
          setItem(null);
          return;
        }

        const isFound = data.jenis_laporan === 'DITEMUKAN';
        const cat = detectCategory(data);
        const pelapor = data.profil_pengguna;
        const rawPhoto = data.foto_url;
        const foto_url = rawPhoto && !rawPhoto.startsWith('blob:') ? rawPhoto : null;

        // Fetch official campus safe meeting points
        const safePoints = await getSafePoints();
        setSafePointsList(safePoints);

        const matchedSafe = safePoints.find((sp) =>
          (data.lokasi_terakhir || '').toLowerCase().includes(sp.nama_lokasi.toLowerCase()) ||
          sp.nama_lokasi.toLowerCase().includes((data.lokasi_terakhir || '').toLowerCase())
        ) || safePoints[0];

        setItem({
          id: data.id,
          title: data.nama_barang,
          type: isFound ? 'found' : 'lost',
          category: cat,
          location: data.lokasi_terakhir || 'Lingkungan Kampus',
          timeAgo: formatRelativeTime(data.dibuat_pada),
          date: new Date(data.dibuat_pada).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
          description: cleanDescription(data.deskripsi) || 'Tidak ada deskripsi tambahan.',
          finderName: pelapor?.nama_lengkap || 'Civitas Kampus',
          finderRole: pelapor?.role_kampus
            ? pelapor.role_kampus.charAt(0).toUpperCase() + pelapor.role_kampus.slice(1)
            : 'Warga Kampus',
          isVerifiedCivitas: pelapor?.status_kampus_terverifikasi ?? false,
          safePoint: matchedSafe ? matchedSafe.nama_lokasi : 'Pos Satpam Utama Gerbang Barat',
          safePointObj: matchedSafe || safePoints[0],
          pelaporId: data.pelapor_id,
          foto_url,
          icon: getCategoryIcon(cat),
          colorScheme: getColorScheme(isFound ? 'found' : 'lost'),
        });
      } catch (err) {
        console.error('Error loading item detail:', err);
        setItem(null);
      } finally {
        setLoading(false);
      }
    }

    loadItem();
  }, [itemId]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleSave = () => {
    try {
      const savedIds: string[] = JSON.parse(localStorage.getItem('findly_saved_items') || '[]');
      const updated = savedIds.includes(itemId)
        ? savedIds.filter((id) => id !== itemId)
        : [...savedIds, itemId];
      localStorage.setItem('findly_saved_items', JSON.stringify(updated));
      setIsSaved(!isSaved);
    } catch {
      // ignore
    }
  };

  // Open modal template for "Saya Menemukan Barang Ini"
  const handleOpenFoundModal = async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push(`/login?redirect=/find/${itemId}`);
        return;
      }

      if (item?.pelaporId && user.id === item.pelaporId) {
        alert('Ini adalah laporan kehilangan yang Anda buat sendiri.');
        return;
      }

      setFoundLocation('');
      setStorageType('security');
      setStorageNote('');
      setItemCondition('Utuh & Baik');
      setFinderMessage(
        `Halo ${item?.finderName || 'Pemilik'}, saya telah menemukan barang Anda "${item?.title || ''}". Barang saat ini aman dan siap diserahterimakan.`
      );
      setFoundError(null);
      setShowFoundModal(true);
    } catch (err) {
      console.error('Error checking auth:', err);
    }
  };

  // Submit template form -> insert to klaim_barang -> go directly to /messages
  const handleSubmitFoundModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    if (!foundLocation.trim()) {
      setFoundError('Silakan isi lokasi spesifik barang ditemukan.');
      return;
    }

    setIsSubmittingFound(true);
    setFoundError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push(`/login?redirect=/find/${item.id}`);
        return;
      }

      const selectedPoint = safePointsList.find((sp) => sp.id === selectedSafePointId) || safePointsList[0];
      const storageDisplay = `🛡️ Dititipkan di ${selectedPoint.nama_lokasi} (${selectedPoint.alamat_lengkap})`;

      const formattedVerificationMessage = [
        `📢 KONFIRMASI PENEMUAN BARANG`,
        `📍 Lokasi Ditemukan: ${foundLocation.trim()}`,
        `🏢 Titik Temu / Tempat Penitipan: ${storageDisplay}`,
        `🔍 Kondisi Barang: ${itemCondition}`,
        `💬 Pesan Penemu: ${finderMessage.trim()}`,
      ].join('\n');

      const { data: claimData, error: claimError } = await supabase
        .from('klaim_barang')
        .insert({
          laporan_id: item.id,
          pengklaim_id: user.id,
          pesan_verifikasi: formattedVerificationMessage,
          status: 'MENUNGGU',
        })
        .select()
        .single();

      if (claimError) {
        throw claimError;
      }

      const claimId = claimData.id;
      const timeStr = new Date()
        .toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        .replace('.', ':');

      // Initialize chat in localStorage so it appears immediately
      const initialChat = [
        {
          id: `sys-${claimId}`,
          sender: 'system',
          text: `🔒 Sesi Verifikasi & Serah Terima Dibuka. Anda telah mengonfirmasi menemukan barang "${item.title}". Silakan koordinasikan verifikasi dan jadwal serah terima aman dengan ${item.finderName}.`,
          time: timeStr,
        },
        {
          id: `claim-${claimId}`,
          sender: 'me',
          text: `Halo ${item.finderName}, saya telah menemukan barang Anda "${item.title}":\n\n${formattedVerificationMessage}`,
          time: timeStr,
        },
      ];

      try {
        localStorage.setItem(`findly_chat_${claimId}`, JSON.stringify(initialChat));
        await supabase.from('pesan_chat').insert({
          klaim_id: claimId,
          pengirim_id: user.id,
          pesan: formattedVerificationMessage,
          tipe_pesan: 'teks',
        });
      } catch {
        // ignore
      }

      setShowFoundModal(false);
      // Directly navigate into the chat with this exact claim open!
      router.push(`/messages?id=${claimId}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengirim data penemuan. Silakan coba lagi.';
      setFoundError(msg);
    } finally {
      setIsSubmittingFound(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-2xs animate-pulse space-y-4">
            <div className="h-6 bg-gray-100 rounded w-1/4" />
            <div className="h-8 bg-gray-100 rounded w-1/2" />
            <div className="h-40 bg-gray-100 rounded-2xl w-full" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!item) {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto my-12 bg-white p-8 rounded-3xl border border-gray-100 text-center space-y-4 shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <PackageSearch size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Laporan Tidak Ditemukan</h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            Laporan barang ini mungkin telah dihapus, diselesaikan oleh pemiliknya, atau tautan yang Anda buka tidak valid.
          </p>
          <Link
            href="/find"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#30AFFF] hover:bg-[#2196E8] text-white text-xs font-semibold shadow-2xs transition-all"
          >
            Kembali ke Cari Barang
          </Link>
        </div>
      </AppLayout>
    );
  }

  const Icon = item.icon;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        {/* Navigation / Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/find"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Pencarian</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Share2 size={14} />
              <span>{copied ? 'Tautan Disalin!' : 'Bagikan'}</span>
            </button>
            <button
              onClick={toggleSave}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${isSaved
                ? 'border-[#30AFFF] bg-[#EFF8FF] text-[#30AFFF]'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
            >
              <Bookmark size={14} className={isSaved ? 'fill-[#30AFFF]' : ''} />
              <span>{isSaved ? 'Tersimpan' : 'Simpan'}</span>
            </button>
          </div>
        </div>

        {/* Main Item Card */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-2xs space-y-6">
          {/* Top Badges & Title */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${item.type === 'found'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
              >
                {item.type === 'found' ? 'Ditemukan' : 'Dilaporkan Hilang'}
              </span>
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {item.category}
              </span>
              <span className="text-xs font-medium text-gray-400 ml-auto flex items-center gap-1">
                <Clock size={12} />
                <span>{item.timeAgo}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {item.title}
            </h1>
          </div>

          {/* Visual Showcase Banner */}
          {item.foto_url ? (
            <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-2xs max-h-96 flex items-center justify-center bg-gray-50">
              <img
                src={item.foto_url}
                alt={item.title}
                className="w-full h-auto max-h-96 object-contain"
              />
            </div>
          ) : (
            <div className="rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/80 border border-gray-100 p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-3">
              <div
                className={`w-24 h-24 rounded-3xl ${item.colorScheme.bg} ${item.colorScheme.text} border ${item.colorScheme.border} flex items-center justify-center shadow-sm`}
              >
                <Icon size={48} className="stroke-[1.75]" />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Foto / Ikon Representasi Barang
                </span>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Foto detail barang belum diunggah atau dirahasiakan oleh pelapor.
                </p>
              </div>
            </div>
          )}

          {/* Key Facts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-1">
              <span className="text-gray-400 text-[11px] font-medium flex items-center gap-1">
                <MapPin size={13} className="text-[#30AFFF]" />
                Lokasi Ditemukan / Hilang
              </span>
              <p className="font-semibold text-gray-900 text-sm">{item.location}</p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-1">
              <span className="text-gray-400 text-[11px] font-medium flex items-center gap-1">
                <Calendar size={13} className="text-[#30AFFF]" />
                Waktu Pelaporan
              </span>
              <p className="font-semibold text-gray-900 text-sm">{item.date}</p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-gray-900">Keterangan Lengkap</h3>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
              {item.description}
            </p>
          </div>

          {/* Reporter / Finder Information Card */}
          <div className="p-5 rounded-2xl bg-[#EFF8FF] border border-[#BFDBFE]/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#30AFFF] text-white font-bold flex items-center justify-center text-sm shadow-2xs">
                  {item.finderName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-xs sm:text-sm text-gray-900">
                      {item.finderName}
                    </h4>
                    {item.isVerifiedCivitas && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                        <CheckCircle2 size={12} className="text-emerald-600" />
                        Verified Civitas
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500">{item.finderRole}</p>
                </div>
              </div>
            </div>

            {/* Titik Kumpul / Pengambilan Aman Resmi Kampus */}
            <div className="pt-3.5 border-t border-[#BFDBFE]/60 space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#30AFFF]/10 text-[#30AFFF] flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <strong className="text-gray-900 text-xs sm:text-sm">
                      Titik Kumpul / Pengambilan Aman:
                    </strong>
                    <span className="text-[10px] font-bold text-[#30AFFF] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      Resmi Kampus
                    </span>
                  </div>
                  <p className="text-xs font-bold text-gray-800 mt-1">
                    {item.safePointObj?.nama_lokasi || item.safePoint}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {item.safePointObj?.alamat_lengkap || 'Area Kampus Terpantau'}
                  </p>

                  {/* Security & Hours Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    {item.safePointObj?.ada_satpam && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        👮 Ada Satpam Standby
                      </span>
                    )}
                    {item.safePointObj?.ada_cctv && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        📹 Pantauan CCTV 24 Jam
                      </span>
                    )}
                    {item.safePointObj?.jam_buka && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                        <Clock size={11} className="text-gray-500" />
                        {item.safePointObj.jam_buka} - {item.safePointObj.jam_tutup} WIB
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons: View Map and Open Navigation/Ojol */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowMap(!showMap)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <MapPin size={14} className="text-[#30AFFF]" />
                  <span>{showMap ? 'Tutup Peta' : 'Lihat Peta (Leaflet OSM)'}</span>
                </button>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${item.safePointObj?.latitude || -6.36442},${item.safePointObj?.longitude || 106.82861}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-[#30AFFF] hover:bg-[#2196E8] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  title="Buka lokasi di Google Maps atau aplikasi HP"
                >
                  <Navigation size={14} />
                  <span>Buka di Peta</span>
                </a>
              </div>

              {/* Interactive Leaflet OpenStreetMap */}
              {showMap && item.safePointObj && (
                <div className="pt-2 animate-in fade-in zoom-in-98 duration-200">
                  <LeafletSafeMap
                    lat={item.safePointObj.latitude}
                    lng={item.safePointObj.longitude}
                    locationName={item.safePointObj.nama_lokasi}
                    address={item.safePointObj.alamat_lengkap}
                    heightClass="h-[240px]"
                  />
                  <p className="text-[10px] text-gray-400 mt-1.5 text-center">
                    Peta interaktif gratis Leaflet.js • Data &copy; OpenStreetMap contributors
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Safety & Protocol Banner */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900 leading-relaxed">
            <ShieldCheck size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block mb-0.5">Panduan Pengambilan Aman Findly:</strong>
              <span>
                Pengambilan barang wajib melalui proses verifikasi klaim di sistem Findly dan diserahterimakan di Pos Satpam / Titik Kumpul Resmi Kampus demi keamanan bersama.
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            {currentUserId && item.pelaporId === currentUserId ? (
              <div className="w-full p-4 rounded-2xl bg-blue-50/80 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-xs text-blue-900">
                  <ShieldCheck size={20} className="text-[#30AFFF] shrink-0" />
                  <div>
                    <strong className="block font-semibold">
                      {item.type === 'found'
                        ? 'Anda adalah Penemu yang Melaporkan Barang Ini'
                        : 'Ini adalah Laporan Kehilangan Milik Anda'}
                    </strong>
                    <span className="text-gray-600 text-[11px] sm:text-xs">
                      {item.type === 'found'
                        ? 'Anda tidak dapat mengklaim barang temuan yang Anda laporkan sendiri. Menunggu pemilik sah mengajukan klaim verifikasi.'
                        : 'Anda tidak dapat melaporkan penemuan pada laporan kehilangan milik Anda sendiri. Menunggu civitas kampus yang menemukan memberikan respon.'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href="/messages"
                    className="px-4 py-2 rounded-xl bg-[#30AFFF] hover:bg-[#2196E8] text-white text-xs font-bold transition-colors shadow-2xs"
                  >
                    Lihat Pesan & Respon
                  </Link>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="px-3 py-2 rounded-xl border border-gray-200 hover:bg-white text-gray-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Bagikan
                  </button>
                </div>
              </div>
            ) : item.type === 'found' ? (
              <>
                <Link
                  href={`/claim/new?id=${item.id}`}
                  className="flex-1 py-3 px-5 rounded-2xl bg-[#30AFFF] hover:bg-[#2196E8] text-white text-xs sm:text-sm font-bold text-center transition-all shadow-md shadow-[#30AFFF]/20 flex items-center justify-center gap-2"
                >
                  <Eye size={16} />
                  <span>Ajukan Klaim Barang Ini</span>
                </Link>
                <Link
                  href="/messages"
                  className="py-3 px-5 rounded-2xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold text-center transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare size={16} />
                  <span>Kirim Pesan Tanya Jawab</span>
                </Link>
              </>
            ) : (
              <>
                {/* DIRECT TO CHAT MODAL TEMPLATE: Does not create a duplicate post on beranda */}
                <button
                  type="button"
                  onClick={handleOpenFoundModal}
                  className="flex-1 py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold text-center transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <CheckCircle2 size={16} />
                  <span>Saya Menemukan Barang Ini</span>
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="py-3 px-5 rounded-2xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold text-center transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Share2 size={16} />
                  <span>Bantu Sebarkan Info</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* MODAL TEMPLATE: Hubungi Pemilik Barang Hilang Secara Langsung */}
      {showFoundModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-gray-100 shadow-2xl p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-200 my-8">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0 shadow-2xs">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">
                    Saya Menemukan Barang Ini
                  </h3>
                  <p className="text-xs text-gray-500">
                    Kirim konfirmasi penemuan langsung ke ruang chat pemilik.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFoundModal(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Target Item Mini Card */}
            <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0 shadow-2xs">
                <Icon size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-xs sm:text-sm text-gray-900 truncate">
                  {item.title}
                </h4>
                <p className="text-[11px] text-gray-500 truncate">
                  Dilaporkan hilang oleh <strong className="text-gray-700">{item.finderName}</strong> ({item.location})
                </p>
              </div>
            </div>

            {foundError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
                <AlertCircle size={14} className="shrink-0" />
                <span>{foundError}</span>
              </div>
            )}

            {/* Template Form */}
            <form onSubmit={handleSubmitFoundModal} className="space-y-4">
              {/* Field 1: Lokasi Ditemukan */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800">
                  Lokasi Spesifik Ditemukan <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={foundLocation}
                    onChange={(e) => setFoundLocation(e.target.value)}
                    placeholder="Contoh: Meja Perpustakaan Lt 2, Kantin Gedung B..."
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                  />
                </div>
                <p className="text-[10px] text-gray-400">
                  Di mana Anda menemukan atau mengamankan barang ini?
                </p>
              </div>

              {/* Field 2: Status & Tempat Penyimpanan */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-800">
                    Pilih Titik Kumpul / Tempat Penitipan Aman <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                    Resmi Admin Kampus
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {safePointsList.map((sp) => {
                    const isSelected = selectedSafePointId === sp.id;
                    return (
                      <button
                        key={sp.id}
                        type="button"
                        onClick={() => {
                          setSelectedSafePointId(sp.id);
                          setStorageType('security');
                          setStorageNote(sp.nama_lokasi);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${isSelected
                          ? 'border-[#30AFFF] bg-blue-50/70 text-gray-900 font-semibold ring-2 ring-[#30AFFF]/20'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        <div className="font-bold text-xs text-gray-900 line-clamp-1">
                          🛡️ {sp.nama_lokasi}
                        </div>
                        <span className="block text-[10px] text-gray-500 mt-0.5 line-clamp-1">
                          {sp.alamat_lengkap}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-medium mt-1">
                          {sp.ada_satpam && <span>• 👮 Satpam</span>}
                          {sp.ada_cctv && <span>• 📹 CCTV</span>}
                          <span>• 🕒 {sp.jam_buka}-{sp.jam_tutup}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Field 3: Kondisi Barang */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800">
                  Kondisi Barang Saat Ditemukan
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Utuh & Baik', 'Ada Sedikit Lecet / Terbuka', 'Sebagian Saja'].map((cond) => (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => setItemCondition(cond)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${itemCondition === cond
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      {cond}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 4: Pesan Template untuk Pemilik */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800">
                  Pesan Pembuka untuk Pemilik ({item.finderName})
                </label>
                <textarea
                  rows={3}
                  value={finderMessage}
                  onChange={(e) => setFinderMessage(e.target.value)}
                  className="w-full p-3 bg-gray-50/70 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none resize-none leading-relaxed"
                  placeholder="Tuliskan pesan pembuka untuk pemilik barang..."
                />
              </div>

              {/* Safety notice */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/70 flex items-start gap-2 text-[11px] text-amber-800">
                <ShieldCheck size={14} className="text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Demi keamanan dan pencegahan penipuan, serah terima fisik barang wajib dikoordinasikan melalui chat ini dan dilakukan di Pos Satpam Kampus.
                </span>
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={isSubmittingFound}
                  onClick={() => setShowFoundModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingFound}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                >
                  {isSubmittingFound ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Mengirim Data & Membuka Chat...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Kirim & Buka Chat Pemilik</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
