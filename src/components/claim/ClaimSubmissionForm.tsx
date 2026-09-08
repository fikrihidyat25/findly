'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Calendar,
  Eye,
  CheckCircle2,
  Check,
  Headphones,
  UploadCloud,
  FileText,
  AlertCircle,
  Briefcase,
  Wallet,
  Smartphone,
  CreditCard,
  KeyRound,
  BookOpen,
  PackageSearch,
  X,
  MessageSquare,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import { createClient } from '@/src/lib/supabase/client';

export interface ItemDetails {
  id?: string;
  name: string;
  location: string;
  foundDate: string;
  category: string;
  type?: 'lost' | 'found';
  description?: string;
  pelaporName?: string;
  pelaporRole?: string;
  foto_url?: string;
}

interface ClaimSubmissionFormProps {
  initialItem?: ItemDetails;
}

function getCategoryIcon(nameOrCat: string) {
  const lower = (nameOrCat || '').toLowerCase();
  if (
    lower.includes('elektronik') ||
    lower.includes('hp') ||
    lower.includes('gadget') ||
    lower.includes('laptop') ||
    lower.includes('airpods') ||
    lower.includes('headphone')
  ) {
    return Smartphone;
  }
  if (
    lower.includes('dompet') ||
    lower.includes('wallet') ||
    lower.includes('uang') ||
    lower.includes('aksesoris')
  ) {
    return Wallet;
  }
  if (lower.includes('tas') || lower.includes('ransel') || lower.includes('bag')) {
    return Briefcase;
  }
  if (
    lower.includes('dokumen') ||
    lower.includes('kartu') ||
    lower.includes('ktm') ||
    lower.includes('ktp') ||
    lower.includes('sim')
  ) {
    return CreditCard;
  }
  if (lower.includes('kunci') || lower.includes('kendaraan') || lower.includes('motor')) {
    return KeyRound;
  }
  if (lower.includes('buku') || lower.includes('tulis') || lower.includes('binder')) {
    return BookOpen;
  }
  return PackageSearch;
}

export default function ClaimSubmissionForm({ initialItem }: ClaimSubmissionFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const paramItemId = searchParams?.get('id') || searchParams?.get('item_id') || initialItem?.id || '';

  const [item, setItem] = useState<ItemDetails>(
    initialItem || {
      id: paramItemId,
      name: 'Memuat data barang...',
      location: 'Sedang mengambil lokasi...',
      foundDate: 'Sedang memuat tanggal...',
      category: 'Barang Temuan',
      type: 'found',
      description: '',
    }
  );
  const [isLoadingItem, setIsLoadingItem] = useState<boolean>(true);

  // Stepper state (1 to 3)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSelfReport, setIsSelfReport] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Form Fields - Step 1
  const [reason, setReason] = useState('');
  const [lastSeen, setLastSeen] = useState('');

  // Form Fields - Step 2
  const [secretDetails, setSecretDetails] = useState('');
  const [evidencePreview, setEvidencePreview] = useState<string | null>(null);

  // Form Fields - Step 3
  const [agreed, setAgreed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch real item data from Supabase
  useEffect(() => {
    async function loadItemData() {
      setIsLoadingItem(true);
      try {
        const supabase = createClient();
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        let query = supabase
          .from('laporan_barang')
          .select('*, profil_pengguna:pelapor_id(nama_lengkap, role_kampus, universitas, status_kampus_terverifikasi)');

        if (paramItemId) {
          query = query.eq('id', paramItemId);
        } else {
          // If no query parameter, load the latest found item from database
          query = query.eq('jenis_laporan', 'DITEMUKAN').order('dibuat_pada', { ascending: false }).limit(1);
        }

        const { data, error } = await query.maybeSingle();

        if (error || !data) {
          console.warn('Item not found for claim:', error);
          if (initialItem) {
            setItem(initialItem);
          } else {
            setItem({
              id: '',
              name: 'Barang Tidak Ditemukan',
              location: 'Lokasi tidak tersedia',
              foundDate: '-',
              category: 'Umum',
              type: 'found',
            });
          }
          return;
        }

        if (authUser && data.pelapor_id === authUser.id) {
          setIsSelfReport(true);
        }

        const isFound = data.jenis_laporan === 'DITEMUKAN';
        const pelapor = data.profil_pengguna;

        setItem({
          id: data.id,
          name: data.nama_barang,
          location: data.lokasi_terakhir || 'Lingkungan Kampus',
          foundDate: data.dibuat_pada
            ? new Date(data.dibuat_pada).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })
            : 'Baru saja',
          category: data.kategori || (isFound ? 'Barang Ditemukan' : 'Barang Kehilangan'),
          type: isFound ? 'found' : 'lost',
          description: data.deskripsi || '',
          pelaporName: pelapor?.nama_lengkap || 'Civitas Kampus',
          pelaporRole: pelapor?.role_kampus || 'Warga Kampus',
          foto_url: data.foto_url || undefined,
        });
      } catch (err) {
        console.error('Error fetching claim item:', err);
      } finally {
        setIsLoadingItem(false);
      }
    }

    loadItemData();
  }, [paramItemId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Ukuran file maksimal adalah 5MB.');
        return;
      }
      setErrorMessage(null);
      const url = URL.createObjectURL(file);
      setEvidencePreview(url);
    }
  };

  const handleNext = () => {
    setErrorMessage(null);
    if (currentStep === 1) {
      if (!reason.trim()) {
        setErrorMessage('Mohon jelaskan alasan mengapa Anda yakin ini adalah barang Anda.');
        return;
      }
      if (!lastSeen.trim()) {
        setErrorMessage('Mohon sebutkan kapan dan di mana Anda terakhir kali melihat barang ini.');
        return;
      }
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStep === 2) {
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setErrorMessage(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setErrorMessage('Anda wajib mencentang pernyataan keaslian klaim sebelum mengirimkan permohonan.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        const currentUrl = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/claim';
        router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
        return;
      }

      if (item.id) {
        const verificationNotes = [
          `Alasan Kepemilikan: ${reason.trim()}`,
          `Terakhir Dilihat: ${lastSeen.trim()}`,
          secretDetails.trim() ? `Ciri Khusus / Rahasia: ${secretDetails.trim()}` : null,
        ]
          .filter(Boolean)
          .join('\n\n');

        const { error: insertError } = await supabase.from('klaim_barang').insert({
          laporan_id: item.id,
          pengklaim_id: user.id,
          pesan_verifikasi: verificationNotes,
          status: 'MENUNGGU',
        });

        if (insertError) {
          console.warn('Gagal mencatat klaim ke database:', insertError.message);
        }
      }

      setIsSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kendala saat memproses klaim.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const ItemIcon = getCategoryIcon(item.category || item.name);

  // Success Celebration
  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 sm:p-10 rounded-3xl border border-sky-100 shadow-sm text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-full bg-sky-50 text-[#30AFFF] flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 size={36} />
        </div>
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            Status: PENDING (Menunggu Penemu)
          </span>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Pengajuan Klaim Berhasil Terkirim!
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
            Permintaan klaim Anda untuk <strong className="text-gray-900">{item.name}</strong> telah diteruskan ke penemu barang. Anda dapat memantau prosesnya di halaman Klaim Saya.
          </p>
        </div>

        <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100 text-left space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span className="text-gray-400">Barang:</span>
            <span className="font-semibold text-gray-800">{item.name}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span className="text-gray-400">Tempat Ditemukan:</span>
            <span className="font-semibold text-gray-800">{item.location}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-400">Langkah Berikutnya:</span>
            <span className="font-semibold text-[#30AFFF]">Verifikasi & Diskusi dengan Penemu</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold transition-colors"
          >
            Kembali ke Beranda
          </Link>
          <Link
            href="/claims"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#30AFFF] hover:bg-[#2196E8] text-white text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={14} />
            <span>Lihat di Klaim Saya</span>
          </Link>
        </div>
      </div>
    );
  }

  if (isSelfReport) {
    return (
      <div className="max-w-xl mx-auto bg-white p-8 sm:p-10 rounded-3xl border border-gray-100 shadow-sm text-center space-y-5 animate-in fade-in duration-200 my-8">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <AlertCircle size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Tidak Dapat Mengklaim Laporan Sendiri
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
            Anda adalah pelapor dari barang <strong className="text-gray-900">&quot;{item.name}&quot;</strong>. Anda tidak dapat mengajukan klaim verifikasi atas barang yang Anda laporkan sendiri.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/find"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-all"
          >
            Kembali ke Katalog
          </Link>
          <Link
            href="/messages"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#30AFFF] hover:bg-[#2196E8] text-white text-xs font-semibold shadow-sm transition-all"
          >
            Lihat Pesan & Klaim Masuk
          </Link>
        </div>
      </div>
    );
  }

  const claimSteps = [
    { num: 1, label: 'Informasi Klaim' },
    { num: 2, label: 'Bukti Kepemilikan' },
    { num: 3, label: 'Tinjau & Kirim' },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Back button */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Link href="/dashboard" className="hover:text-gray-600 transition-colors">
            Beranda
          </Link>
          <span>&gt;</span>
          <Link
            href={item.id ? `/find/${item.id}` : '/find'}
            className="hover:text-gray-600 transition-colors"
          >
            Detail Barang
          </Link>
          <span>&gt;</span>
          <span className="text-gray-800 font-semibold">Ajukan Klaim</span>
        </div>

        <div>
          <Link
            href={item.id ? `/find/${item.id}` : '/find'}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors shadow-2xs"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Detail</span>
          </Link>
        </div>
      </div>

      {/* Header Subtitle */}
      <div>
        <p className="text-xs sm:text-sm text-gray-600">
          Lengkapi informasi di bawah ini untuk membuktikan bahwa barang tersebut milik Anda.
        </p>
      </div>

      {/* Stepper (3 Steps) */}
      <div className="py-2.5 px-2 sm:px-4 bg-white sm:bg-transparent rounded-2xl border border-gray-100 sm:border-0 shadow-2xs sm:shadow-none">
        {/* Mobile current step indicator */}
        <div className="sm:hidden mb-2 text-center">
          <span className="text-xs font-bold text-gray-800">
            Langkah {currentStep} dari {claimSteps.length}:{' '}
            <span className="text-[#30AFFF]">{claimSteps[currentStep - 1]?.label}</span>
          </span>
        </div>

        <div className="relative max-w-xl mx-auto">
          {/* Connector Line Background */}
          <div className="absolute top-3.5 sm:top-4 left-[16.66%] right-[16.66%] h-[2px] bg-gray-200 -translate-y-1/2 z-0" />

          {/* Connector Line Active Fill */}
          <div
            className="absolute top-3.5 sm:top-4 left-[16.66%] h-[2px] bg-[#30AFFF] -translate-y-1/2 transition-all duration-300 z-0"
            style={{
              width: `${((currentStep - 1) / (claimSteps.length - 1)) * 66.66}%`,
            }}
          />

          {/* Steps Grid */}
          <div className="grid grid-cols-3 relative z-10">
            {claimSteps.map((step) => {
              const isCompleted = currentStep > step.num;
              const isCurrent = currentStep === step.num;

              return (
                <div key={step.num} className="flex flex-col items-center">
                  {/* Step Circle */}
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-2xs ${
                      isCurrent
                        ? 'bg-[#30AFFF] text-white ring-4 ring-[#30AFFF]/20 scale-105 sm:scale-110'
                        : isCompleted
                        ? 'bg-[#30AFFF] text-white'
                        : 'bg-white text-gray-400 border border-gray-300'
                    }`}
                  >
                    {isCompleted ? <Check size={14} className="stroke-[2.5]" /> : step.num}
                  </div>

                  {/* Step Label */}
                  <span
                    className={`text-[10px] sm:text-xs font-semibold mt-1.5 sm:mt-2 text-center leading-tight max-w-[80px] sm:max-w-[120px] px-0.5 transition-colors ${
                      isCurrent
                        ? 'text-gray-900 font-bold'
                        : isCompleted
                        ? 'text-[#30AFFF] font-medium'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: Form on Left, Widgets on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Card */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs p-5 sm:p-7 space-y-6">
            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2 animate-in fade-in duration-200">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* ================= STEP 1: INFORMASI KLAIM ================= */}
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* Section 1: Informasi Dasar (Pre-filled read only) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-gray-900">Informasi Dasar</h3>
                    {isLoadingItem && (
                      <span className="flex items-center gap-1.5 text-xs text-[#30AFFF]">
                        <Loader2 size={13} className="animate-spin" />
                        <span>Memuat data barang...</span>
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Nama Barang */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Nama Barang
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={item.name}
                        className="w-full px-3 py-2 text-xs sm:text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl cursor-not-allowed select-none font-medium"
                      />
                    </div>

                    {/* Dilaporkan ditemukan di */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Dilaporkan ditemukan di
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          readOnly
                          value={item.location}
                          className="w-full pl-3 pr-8 py-2 text-xs sm:text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl cursor-not-allowed select-none font-medium"
                        />
                        <MapPin size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>

                    {/* Tanggal Ditemukan */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Tanggal Ditemukan
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={item.foundDate}
                        className="w-full px-3 py-2 text-xs sm:text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl cursor-not-allowed select-none font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Ceritakan tentang barang Anda */}
                <div className="border-t border-gray-100 pt-5 space-y-4">
                  <h3 className="font-bold text-sm text-gray-900">Ceritakan tentang barang Anda</h3>

                  {/* Field: Mengapa Anda yakin ini adalah barang Anda? */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-700">
                      Mengapa Anda yakin ini adalah barang Anda? <span className="text-red-500">*</span>
                    </label>
                    <p className="text-[11px] text-gray-400 leading-normal">
                      Jelaskan secara detail agar penemu dapat memverifikasi kepemilikan Anda.
                    </p>
                    <div className="relative">
                      <textarea
                        rows={4}
                        maxLength={800}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder={`Contoh: Saya kehilangan ${item.name || 'barang ini'} saat beraktivitas di kampus. Ciri-ciri utama dan isinya sangat sesuai dengan yang saya miliki.`}
                        className="w-full px-3 py-2 text-xs sm:text-sm text-gray-800 placeholder-gray-400 border border-gray-200 rounded-xl focus:outline-none focus:border-[#30AFFF] focus:ring-2 focus:ring-[#30AFFF]/20 transition-all resize-none"
                      />
                      <span className="block text-right text-[10px] text-gray-400 mt-1">
                        {reason.length}/800
                      </span>
                    </div>
                  </div>

                  {/* Field: Kapan dan dimana Anda terakhir kali melihat barang ini? */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-700">
                      Kapan dan dimana Anda terakhir kali melihat barang ini? <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={lastSeen}
                      onChange={(e) => setLastSeen(e.target.value)}
                      placeholder="Contoh: Kemarin sore sekitar pukul 16.00 di sekitar lokasi penemuan."
                      className="w-full px-3 py-2 text-xs sm:text-sm text-gray-800 placeholder-gray-400 border border-gray-200 rounded-xl focus:outline-none focus:border-[#30AFFF] focus:ring-2 focus:ring-[#30AFFF]/20 transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ================= STEP 2: BUKTI KEPEMILIKAN ================= */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-sm text-gray-900 mb-1">
                    Bukti Pendukung & Ciri Khusus
                  </h3>
                  <p className="text-xs text-gray-400 mb-4">
                    Unggah bukti pendukung atau sebutkan ciri rahasia yang hanya diketahui oleh pemilik sah.
                  </p>
                </div>

                {/* Upload Foto Bukti */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700">
                    Foto Bukti Kepemilikan <span className="text-gray-400 font-normal">(opsional tapi dianjurkan)</span>
                  </label>
                  <p className="text-[11px] text-gray-400">
                    Bisa berupa foto saat menggunakan barang, nota/struk, nomor seri, kartu garansi, atau foto identitas pendukung.
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {evidencePreview ? (
                    <div className="relative rounded-2xl border border-gray-200 overflow-hidden h-40 bg-gray-50 flex items-center justify-center group">
                      <img src={evidencePreview} alt="Bukti Kepemilikan" className="w-full h-full object-contain" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 bg-white text-xs font-semibold text-gray-800 rounded-lg shadow-sm hover:bg-gray-100"
                        >
                          Ganti Foto
                        </button>
                        <button
                          type="button"
                          onClick={() => setEvidencePreview(null)}
                          className="p-1.5 bg-red-600 text-white rounded-lg shadow-sm hover:bg-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="h-36 border-2 border-dashed border-gray-200 hover:border-[#30AFFF] rounded-2xl flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-[#EFF8FF]/30 group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#30AFFF] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                        <UploadCloud size={20} />
                      </div>
                      <p className="font-bold text-xs text-gray-800">Unggah Bukti Kepemilikan</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">PNG, JPG, JPEG Maksimal 5MB</p>
                    </div>
                  )}
                </div>

                {/* Ciri Rahasia Tambahan */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700">
                    Ciri Rahasia Lainnya
                  </label>
                  <p className="text-[11px] text-gray-400">
                    Tuliskan ciri khas yang tidak terlihat pada foto publik (misal: isi bagian dalam, gantungan kunci tersembunyi, goresan unik).
                  </p>
                  <textarea
                    rows={3}
                    value={secretDetails}
                    onChange={(e) => setSecretDetails(e.target.value)}
                    placeholder="Contoh: Di dalamnya tersimpan kartu tanda pengenal atas nama saya, serta aksesoris khusus..."
                    className="w-full px-3 py-2 text-xs sm:text-sm text-gray-800 placeholder-gray-400 border border-gray-200 rounded-xl focus:outline-none focus:border-[#30AFFF] focus:ring-2 focus:ring-[#30AFFF]/20 transition-all resize-none"
                  />
                </div>
              </div>
            )}

            {/* ================= STEP 3: TINJAU & KIRIM ================= */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-sm text-gray-900 mb-1">
                    Tinjau Informasi Klaim Anda
                  </h3>
                  <p className="text-xs text-gray-400 mb-4">
                    Periksa kembali data sebelum diteruskan kepada penemu barang.
                  </p>
                </div>

                {/* Summary Card */}
                <div className="bg-gray-50/90 rounded-2xl p-4.5 border border-gray-200/80 space-y-3 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[11px]">Barang yang Diklaim:</span>
                    <span className="font-bold text-gray-900 text-sm">{item.name}</span>
                  </div>

                  <div className="pt-2 border-t border-gray-200/60">
                    <span className="text-gray-400 block text-[11px]">Alasan Kepemilikan:</span>
                    <p className="text-gray-800 leading-relaxed mt-0.5">{reason}</p>
                  </div>

                  <div className="pt-2 border-t border-gray-200/60">
                    <span className="text-gray-400 block text-[11px]">Waktu & Lokasi Terakhir Terlihat:</span>
                    <p className="text-gray-800 leading-relaxed mt-0.5">{lastSeen}</p>
                  </div>

                  {secretDetails && (
                    <div className="pt-2 border-t border-gray-200/60">
                      <span className="text-gray-400 block text-[11px]">Ciri Rahasia:</span>
                      <p className="text-gray-800 leading-relaxed mt-0.5">{secretDetails}</p>
                    </div>
                  )}

                  {evidencePreview && (
                    <div className="pt-2 border-t border-gray-200/60">
                      <span className="text-gray-400 block text-[11px] mb-1">Bukti Foto Terlampir:</span>
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                        <img src={evidencePreview} alt="Bukti" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Verification Flow Notice */}
                <div className="p-3.5 bg-blue-50/70 border border-blue-200/60 rounded-xl flex items-start gap-2.5 text-xs text-blue-900">
                  <ShieldAlert size={17} className="text-[#30AFFF] shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Setelah klaim terkirim, penemu barang akan menerima permohonan klaim ini. Anda dapat mendiskusikan proses verifikasi dan serah terima secara aman di titik kumpul kampus.
                  </p>
                </div>

                {/* Agreement Checkbox */}
                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="claimAgree"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#30AFFF] focus:ring-[#30AFFF] cursor-pointer accent-[#30AFFF] mt-0.5"
                  />
                  <label htmlFor="claimAgree" className="text-xs text-gray-700 cursor-pointer leading-normal">
                    Saya menyatakan dengan jujur bahwa barang ini adalah milik saya dan saya bersedia mempertanggungjawabkan informasi ini di bawah ketentuan tata tertib Findly.
                  </label>
                </div>
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="pt-5 border-t border-gray-100 flex items-center justify-between">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 border border-gray-200 hover:bg-gray-50 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Kembali</span>
                </button>
              ) : (
                <Link
                  href={item.id ? `/find/${item.id}` : '/find'}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 border border-transparent hover:border-gray-200 rounded-xl transition-all"
                >
                  Batal
                </Link>
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-[#30AFFF] hover:bg-[#2196E8] active:scale-[0.98] rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <span>Lanjutkan</span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !agreed}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-[#30AFFF] hover:bg-[#2196E8] active:scale-[0.98] disabled:opacity-50 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin" />
                      <span>Mengirimkan Klaim...</span>
                    </span>
                  ) : (
                    <>
                      <span>Kirim Pengajuan Klaim</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Widgets */}
        <div className="lg:col-span-4 space-y-4">
          {/* Widget 1: Ringkasan Barang */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-gray-900">Ringkasan Barang</h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                {item.type === 'found' ? 'Ditemukan' : 'Kehilangan'}
              </span>
            </div>

            <div className="flex items-center gap-3.5 p-2.5 bg-amber-50/50 rounded-xl border border-amber-100/60">
              <div className="w-14 h-14 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center shrink-0 shadow-2xs">
                <ItemIcon size={26} className="stroke-[1.75]" />
              </div>
              <div className="space-y-1 min-w-0">
                <h5 className="font-bold text-xs text-gray-900 leading-snug truncate">
                  {item.name}
                </h5>
                <div className="flex items-center gap-1 text-[11px] text-gray-500">
                  <MapPin size={11} className="shrink-0 text-gray-400" />
                  <span className="truncate">{item.location}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-gray-400">
                  <Calendar size={11} className="shrink-0" />
                  <span>{item.foundDate}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowDetailModal(true)}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-[#30AFFF]/50 text-[#30AFFF] hover:bg-[#EFF8FF] text-xs font-semibold transition-all shadow-2xs cursor-pointer"
            >
              <Eye size={13} />
              <span>Lihat detail Barang</span>
            </button>
          </div>

          {/* Widget 2: Proses Klaim Timeline */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-2xs space-y-3.5">
            <h4 className="font-bold text-xs text-gray-900">Proses Klaim</h4>

            <div className="space-y-2.5">
              {/* Step 1 in timeline */}
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#EFF8FF] border border-[#BFDBFE]/60">
                <div className="w-6 h-6 rounded-full bg-[#30AFFF] text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <strong className="block text-xs text-gray-900">Ajukan Klaim</strong>
                  <span className="text-[11px] text-gray-500 leading-tight">
                    Kirim permintaan klaim ke penemu
                  </span>
                </div>
              </div>

              {/* Step 2 in timeline */}
              <div className="flex items-start gap-2.5 p-2 text-gray-400">
                <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <strong className="block text-xs text-gray-600">Verifikasi & Chat</strong>
                  <span className="text-[11px] text-gray-400 leading-tight">
                    Berdiskusi dan verifikasi kepemilikan
                  </span>
                </div>
              </div>

              {/* Step 3 in timeline */}
              <div className="flex items-start gap-2.5 p-2 text-gray-400">
                <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <strong className="block text-xs text-gray-600">Keputusan Klaim</strong>
                  <span className="text-[11px] text-gray-400 leading-tight">
                    Penemu menyetujui atau menolak
                  </span>
                </div>
              </div>

              {/* Step 4 in timeline */}
              <div className="flex items-start gap-2.5 p-2 text-gray-400">
                <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <strong className="block text-xs text-gray-600">Serah Terima Aman</strong>
                  <span className="text-[11px] text-gray-400 leading-tight">
                    Ambil barang di titik kumpul resmi
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Widget 3: Tips Klaim Berhasil */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-2xs space-y-3">
            <h4 className="font-bold text-xs text-gray-900">Tips Klaim Berhasil</h4>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-[11px] text-gray-600 leading-snug">
                  Jelaskan ciri-ciri khusus yang hanya Anda ketahui
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-[11px] text-gray-600 leading-snug">
                  Unggah bukti pendukung jika ada
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-[11px] text-gray-600 leading-snug">
                  Bersikap jujur dan komunikatif dengan penemu
                </span>
              </li>
            </ul>
          </div>

          {/* Widget 4: Butuh Bantuan? */}
          <div className="bg-gray-50/80 rounded-2xl border border-gray-200/80 p-4.5 shadow-2xs space-y-2.5">
            <h4 className="font-bold text-xs text-gray-900">Butuh Bantuan?</h4>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Jika mengalami kendala saat proses pengajuan klaim.
            </p>
            <Link
              href="/help"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 bg-white hover:bg-gray-100 text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl transition-all shadow-2xs"
            >
              <Headphones size={14} className="text-[#30AFFF]" />
              <span>Hubungi tim Findly</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Modal Detail Barang */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  {item.type === 'found' ? 'Ditemukan' : 'Kehilangan'}
                </span>
                <span className="text-xs text-gray-500 font-medium">{item.category}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                aria-label="Tutup modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Item Primary Info */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100/80 shadow-2xs">
                <ItemIcon size={30} />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-gray-900 leading-snug truncate">
                  {item.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                  <MapPin size={13} className="text-[#30AFFF] shrink-0" />
                  <span>{item.location}</span>
                </p>
                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                  <Calendar size={13} className="shrink-0" />
                  <span>Ditemukan pada: {item.foundDate}</span>
                </p>
              </div>
            </div>

            {/* Finder Verification Box */}
            <div className="p-4 bg-[#EFF8FF] rounded-2xl border border-[#BFDBFE]/60 space-y-1.5">
              <div className="flex items-center gap-1.5 text-[#0284C7] font-semibold text-xs">
                <CheckCircle2 size={15} className="text-emerald-600" />
                <span>
                  Pelapor / Penemu: {item.pelaporName || 'Civitas Kampus'}
                  {item.pelaporRole ? ` (${item.pelaporRole})` : ''}
                </span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Barang saat ini disimpan di: <strong className="text-gray-800">{item.location}</strong>
              </p>
            </div>

            {/* Public Description */}
            <div className="space-y-1.5 text-xs">
              <span className="font-bold text-gray-800 block">Keterangan Publik Penemu:</span>
              <p className="text-gray-600 bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100 leading-relaxed text-xs">
                {item.description || 'Tidak ada deskripsi tambahan yang dicantumkan penemu.'}
              </p>
            </div>

            {/* Safe Notice */}
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 leading-relaxed">
              <ShieldAlert size={17} className="text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Privasi & Keamanan:</strong> Jangan membagikan data rahasia seperti PIN kartu atau sandi. Jelaskan ciri fisik atau isi khas yang membuktikan Anda pemilik asli pada form klaim.
              </span>
            </div>

            {/* Modal Actions */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#30AFFF] hover:bg-[#2196E8] text-xs font-semibold text-white transition-colors shadow-sm cursor-pointer"
                >
                  Lanjutkan Form Klaim
                </button>
              </div>
              {item.id && (
                <Link
                  href={`/find/${item.id}`}
                  target="_blank"
                  className="block text-center text-[11px] font-medium text-[#30AFFF] hover:underline"
                >
                  Buka detail di halaman penuh (tab baru) →
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
