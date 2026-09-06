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
} from 'lucide-react';
import { createClient } from '@/src/lib/supabase/client';

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

  const itemId = typeof params?.id === 'string' ? params.id : '';

  useEffect(() => {
    // Check saved state in localStorage
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
        const cat = data.kategori || 'Barang Kampus';
        const pelapor = data.profil_pengguna;

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
          description: data.deskripsi || 'Tidak ada deskripsi tambahan.',
          finderName: pelapor?.nama_lengkap || 'Civitas Kampus',
          finderRole: pelapor?.role_kampus 
            ? pelapor.role_kampus.charAt(0).toUpperCase() + pelapor.role_kampus.slice(1)
            : 'Warga Kampus',
          isVerifiedCivitas: pelapor?.status_kampus_terverifikasi ?? false,
          safePoint: 'Pos Satpam Utama / Lobi Rektorat Kampus',
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
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                isSaved
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
                className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                  item.type === 'found'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {item.type === 'found' ? '✓ Ditemukan' : '! Dilaporkan Hilang'}
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
                Foto detail internal dirahasiakan oleh sistem untuk melindungi verifikasi klaim kepemilikan.
              </p>
            </div>
          </div>

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

            <div className="pt-3 border-t border-[#BFDBFE]/60 text-xs text-gray-600 flex items-start gap-2">
              <Building size={14} className="text-[#0284C7] shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-800">Titik Kumpul / Pengambilan Aman:</strong>
                <p className="text-[11px] text-gray-600 mt-0.5">{item.safePoint}</p>
              </div>
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
            {item.type === 'found' ? (
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
                <Link
                  href={`/found/new?ref=${item.id}`}
                  className="flex-1 py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold text-center transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={16} />
                  <span>Saya Menemukan Barang Ini</span>
                </Link>
                <button
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
    </AppLayout>
  );
}
