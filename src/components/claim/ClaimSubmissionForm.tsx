'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  X,
  MessageSquare,
  ShieldAlert,
} from 'lucide-react';

interface ItemDetails {
  name: string;
  location: string;
  foundDate: string;
  category: string;
}

interface ClaimSubmissionFormProps {
  initialItem?: ItemDetails;
}

export default function ClaimSubmissionForm({
  initialItem = {
    name: 'Tas Ransel Kuning Nike',
    location: 'Perpustakaan Pusat, Lantai 2',
    foundDate: '01 September 2026',
    category: 'Tas & Ransel',
  },
}: ClaimSubmissionFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stepper state (1 to 3)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form Fields - Step 1
  const [reason, setReason] = useState('');
  const [lastSeen, setLastSeen] = useState('');

  // Form Fields - Step 2
  const [secretDetails, setSecretDetails] = useState('');
  const [evidencePreview, setEvidencePreview] = useState<string | null>(null);

  // Form Fields - Step 3
  const [agreed, setAgreed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setErrorMessage('Anda wajib mencentang pernyataan keaslian klaim sebelum mengirimkan permohonan.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1000);
  };

  // Success Celebration
  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 sm:p-10 rounded-3xl border border-sky-100 shadow-sm text-center space-y-5">
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
            Permintaan klaim Anda untuk <strong className="text-gray-900">{initialItem.name}</strong> telah diteruskan ke penemu barang. Ruang chat verifikasi telah otomatis dibuat.
          </p>
        </div>

        <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100 text-left space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span className="text-gray-400">Barang:</span>
            <span className="font-semibold text-gray-800">{initialItem.name}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span className="text-gray-400">Tempat Ditemukan:</span>
            <span className="font-semibold text-gray-800">{initialItem.location}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-400">Langkah Berikutnya:</span>
            <span className="font-semibold text-[#30AFFF]">Diskusi Verifikasi di Chat</span>
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
            href="/messages"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#30AFFF] hover:bg-[#2196E8] text-white text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <MessageSquare size={14} />
            <span>Buka Ruang Chat Verifikasi</span>
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
          <Link href="/find" className="hover:text-gray-600 transition-colors">
            Detail Barang
          </Link>
          <span>&gt;</span>
          <span className="text-gray-800 font-semibold">Ajukan Klaim</span>
        </div>

        <div>
          <Link
            href="/find"
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
      <div className="py-2">
        <div className="flex items-center justify-between max-w-xl mx-auto relative">
          {/* Connector Line */}
          <div className="absolute top-4 left-6 right-6 h-[2px] bg-gray-200 -z-0" />
          <div
            className="absolute top-4 left-6 h-[2px] bg-[#30AFFF] transition-all duration-300 -z-0"
            style={{ width: `${((currentStep - 1) / (claimSteps.length - 1)) * 100}%` }}
          />

          {claimSteps.map((step) => {
            const isCompleted = currentStep > step.num;
            const isCurrent = currentStep === step.num;

            return (
              <div key={step.num} className="flex flex-col items-center relative z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-2xs ${
                    isCurrent
                      ? 'bg-[#30AFFF] text-white ring-4 ring-sky-100 scale-110'
                      : isCompleted
                      ? 'bg-[#30AFFF] text-white'
                      : 'bg-white text-gray-400 border border-gray-300'
                  }`}
                >
                  {isCompleted ? <Check size={14} className="stroke-[2.5]" /> : step.num}
                </div>
                <span
                  className={`text-[11px] sm:text-xs font-semibold mt-2 text-center whitespace-nowrap ${
                    isCurrent ? 'text-gray-900 font-bold' : isCompleted ? 'text-[#30AFFF]' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
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
                  <h3 className="font-bold text-sm text-gray-900">
                    Informasi Dasar
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Nama Barang */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Nama Barang
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={initialItem.name}
                        className="w-full px-3 py-2 text-xs sm:text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl cursor-not-allowed select-none"
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
                          value={initialItem.location}
                          className="w-full pl-3 pr-8 py-2 text-xs sm:text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl cursor-not-allowed select-none"
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
                        value={initialItem.foundDate}
                        className="w-full px-3 py-2 text-xs sm:text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl cursor-not-allowed select-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Ceritakan tentang barang Anda */}
                <div className="border-t border-gray-100 pt-5 space-y-4">
                  <h3 className="font-bold text-sm text-gray-900">
                    Ceritakan tentang barang Anda
                  </h3>

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
                        placeholder="Contoh: Saya kehilangan tas ini saat selesai kelas di perpustakaan. Di dalamnya terdapat laptop, buku catatan, dan gantungan kunci kecil berwarna hitam."
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
                      placeholder="Contoh: 24 Mei 2026, sekitar pukul 15.00 di Perpustakaan Pusat, meja baca 15"
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
                    Bisa berupa foto lama saat memakai barang, nota/struk pembelian, nomor seri, atau kartu garansi.
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
                      <p className="font-bold text-xs text-gray-800">
                        Unggah Bukti Kepemilikan
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        PNG, JPG, JPEG Maksimal 5MB
                      </p>
                    </div>
                  )}
                </div>

                {/* Ciri Rahasia Tambahan */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700">
                    Ciri Rahasia Lainnya
                  </label>
                  <p className="text-[11px] text-gray-400">
                    Tuliskan sesuatu yang tidak terlihat pada foto publik barang (misal: isi kantong, nomor IMEI, goresan tertentu).
                  </p>
                  <textarea
                    rows={3}
                    value={secretDetails}
                    onChange={(e) => setSecretDetails(e.target.value)}
                    placeholder="Contoh: Di kantong depan ada flashdisk warna merah 32GB, dan kartu perpustakaan atas nama Budi..."
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
                    <span className="font-bold text-gray-900 text-sm">{initialItem.name}</span>
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
                    Setelah klaim terkirim, ruang chat verifikasi terenkripsi akan dibuka antara Anda dan penemu. Penemu dapat meminta pembuktian lebih lanjut sebelum menyetujui serah terima barang.
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
                    Saya menyatakan dengan jujur bahwa barang ini adalah milik saya dan saya bersedia mempertanggungjawabkan informasi ini di bawah tata tertib kampus.
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
                  href="/find"
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
                    <span>Mengirimkan Klaim...</span>
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
                Ditemukan
              </span>
            </div>

            <div className="flex items-center gap-3.5 p-2 bg-amber-50/50 rounded-xl border border-amber-100/60">
              <div className="w-14 h-14 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center shrink-0 shadow-2xs">
                <Briefcase size={26} className="stroke-[1.75]" />
              </div>
              <div className="space-y-1">
                <h5 className="font-bold text-xs text-gray-900 leading-snug">
                  {initialItem.name}
                </h5>
                <div className="flex items-center gap-1 text-[11px] text-gray-500">
                  <MapPin size={11} className="shrink-0 text-gray-400" />
                  <span className="truncate">{initialItem.location}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-gray-400">
                  <Calendar size={11} className="shrink-0" />
                  <span>{initialItem.foundDate}</span>
                </div>
              </div>
            </div>

            <Link
              href="/find"
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-[#30AFFF]/50 text-[#30AFFF] hover:bg-[#EFF8FF] text-xs font-semibold transition-all shadow-2xs"
            >
              <Eye size={13} />
              <span>Lihat detail Barang</span>
            </Link>
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
                  <strong className="block text-xs text-gray-700">Verifikasi & Chat</strong>
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
                  <strong className="block text-xs text-gray-700">Keputusan Klaim</strong>
                  <span className="text-[11px] text-gray-400 leading-tight">
                    Penemu menerima atau menolak klaim
                  </span>
                </div>
              </div>

              {/* Step 4 in timeline */}
              <div className="flex items-start gap-2.5 p-2 text-gray-400">
                <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <strong className="block text-xs text-gray-700">Pengambilan Barang</strong>
                  <span className="text-[11px] text-gray-400 leading-tight">
                    Ambil barang di lokasi yang disepakati
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Widget 3: Tips Klaim Berhasil */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-2xs space-y-3">
            <h4 className="font-bold text-xs text-gray-900">Tips Klaim Berhasil</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-[11px] text-gray-600 leading-snug">
                  Berikan informasi spesifik tentang barang Anda
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-[11px] text-gray-600 leading-snug">
                  Jelaskan ciri-ciri khusus yang hanya Anda tahu
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
    </div>
  );
}
