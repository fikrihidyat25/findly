'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  UploadCloud,
  Check,
  ArrowRight,
  ArrowLeft,
  X,
  Lightbulb,
  MessageCircle,
  Calendar,
  Clock,
  MapPin,
  FileText,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { createClient } from '@/src/lib/supabase/client';
import { compressImage } from '@/src/lib/imageUtils';

export default function LostItemForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stepper State (1 to 4)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form Fields
  const [category, setCategory] = useState('');
  const [itemName, setItemName] = useState('');
  const [condition, setCondition] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [specialFeatures, setSpecialFeatures] = useState('');

  // Step 2: Location & Time
  const [building, setBuilding] = useState('');
  const [locationDetail, setLocationDetail] = useState('');
  const [lostDate, setLostDate] = useState('2026-09-03');
  const [lostTime, setLostTime] = useState('10:00');

  // Step 3: Description & Contact
  const [description, setDescription] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Step 4: Agreement
  const [agreed, setAgreed] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Handle Image Upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Ukuran file maksimal adalah 5MB.');
        return;
      }
      setErrorMsg(null);
      try {
        const base64 = await compressImage(file);
        setPhotoPreview(base64);
      } catch (err: any) {
        setErrorMsg(err.message || 'Gagal memproses gambar.');
      }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Ukuran file maksimal adalah 5MB.');
        return;
      }
      setErrorMsg(null);
      try {
        const base64 = await compressImage(file);
        setPhotoPreview(base64);
      } catch (err: any) {
        setErrorMsg(err.message || 'Gagal memproses gambar.');
      }
    }
  };

  // Validation before step progress
  const validateStep = (step: number) => {
    setErrorMsg(null);
    if (step === 1) {
      if (!category) {
        setErrorMsg('Silakan pilih kategori barang.');
        return false;
      }
      if (!itemName.trim()) {
        setErrorMsg('Silakan isi nama/jenis barang.');
        return false;
      }
      return true;
    }
    if (step === 2) {
      if (!building) {
        setErrorMsg('Silakan pilih lokasi kampus terakhir dilihat.');
        return false;
      }
      if (!lostDate) {
        setErrorMsg('Silakan tentukan tanggal terakhir terlihat.');
        return false;
      }
      return true;
    }
    if (step === 3) {
      if (!description.trim() && !specialFeatures.trim()) {
        setErrorMsg('Berikan deskripsi singkat kronologi atau ciri barang.');
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setErrorMsg(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setErrorMsg('Mohon setujui pernyataan pertanggungjawaban sebelum mengirimkan laporan.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setErrorMsg('Anda harus masuk/login terlebih dahulu untuk melaporkan barang hilang.');
        setIsSubmitting(false);
        return;
      }

      const fullDesc = `${description || ''}${specialFeatures ? `. Ciri rahasia/khusus: ${specialFeatures}` : ''}`;
      const locationFull = `${building}${locationDetail ? ` - ${locationDetail}` : ''}`;

      const { error } = await supabase
        .from('laporan_barang')
        .insert({
          pelapor_id: user.id,
          jenis_laporan: 'KEHILANGAN',
          nama_barang: itemName,
          deskripsi: fullDesc,
          foto_url: photoPreview || null,
          lokasi_terakhir: locationFull,
          status: 'MENCARI',
        });

      if (error) throw error;
      setIsSuccess(true);
    } catch (err: any) {
      console.error('Error submitting lost report:', err);
      setErrorMsg(err.message || 'Gagal mengirimkan laporan kehilangan. Silakan periksa koneksi Anda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success Celebration View
  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 sm:p-10 rounded-3xl border border-emerald-100 shadow-sm text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 size={36} />
        </div>
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
            Status: LOST (Hilang)
          </span>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Laporan Kehilangan Berhasil Dipublikasikan!
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
            Laporan barang <strong className="text-gray-900">{itemName}</strong> Anda telah tercatat dalam sistem Findly. Kami akan mengirimkan notifikasi instan begitu ada penemu yang melaporkan kecocokan barang ini.
          </p>
        </div>

        <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100 text-left space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span className="text-gray-400">Nama Barang:</span>
            <span className="font-semibold text-gray-800">{itemName}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span className="text-gray-400">Kategori:</span>
            <span className="font-semibold text-gray-800">{category}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span className="text-gray-400">Lokasi Terakhir:</span>
            <span className="font-semibold text-gray-800">{building} {locationDetail && `(${locationDetail})`}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-400">Tanggal:</span>
            <span className="font-semibold text-gray-800">{lostDate} · {lostTime} WIB</span>
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
            href="/find"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#30AFFF] hover:bg-[#2196E8] text-white text-xs font-semibold shadow-sm transition-colors"
          >
            Pantau di Cari Barang
          </Link>
        </div>
      </div>
    );
  }

  const steps = [
    { num: 1, label: 'Detail Barang' },
    { num: 2, label: 'Waktu Dan Lokasi' },
    { num: 3, label: 'Deskripsi' },
    { num: 4, label: 'Konfirmasi' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header Title */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Saya Kehilangan Barang
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
          Isi detail barang yang Anda kehilangan. Informasi ini akan membantu komunitas menemukan dan mengembalikan barang Anda.
        </p>
      </div>

      {/* Stepper Progress Bar */}
      <div className="py-2.5 px-2 sm:px-4 bg-white sm:bg-transparent rounded-2xl border border-gray-100 sm:border-0 shadow-2xs sm:shadow-none">
        {/* Mobile current step indicator */}
        <div className="sm:hidden mb-2 text-center">
          <span className="text-xs font-bold text-gray-800">
            Langkah {currentStep} dari {steps.length}: <span className="text-rose-500">{steps[currentStep - 1]?.label}</span>
          </span>
        </div>

        <div className="relative max-w-2xl mx-auto">
          {/* Connector Line Background */}
          <div className="absolute top-3.5 sm:top-4 left-[12.5%] right-[12.5%] h-[2px] bg-gray-200 -translate-y-1/2 z-0" />

          {/* Connector Line Active Fill */}
          <div
            className="absolute top-3.5 sm:top-4 left-[12.5%] h-[2px] bg-rose-500 -translate-y-1/2 transition-all duration-300 z-0"
            style={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 75}%`,
            }}
          />

          {/* Steps Grid */}
          <div className="grid grid-cols-4 relative z-10">
            {steps.map((step) => {
              const isCompleted = currentStep > step.num;
              const isCurrent = currentStep === step.num;

              return (
                <div key={step.num} className="flex flex-col items-center">
                  {/* Step Circle */}
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-2xs ${isCurrent
                      ? 'bg-rose-500 text-white ring-4 ring-rose-100 scale-105 sm:scale-110'
                      : isCompleted
                        ? 'bg-rose-500 text-white'
                        : 'bg-white text-gray-400 border border-gray-300'
                      }`}
                  >
                    {isCompleted ? <Check size={14} className="stroke-[2.5]" /> : step.num}
                  </div>

                  {/* Step Label */}
                  <span
                    className={`text-[10px] sm:text-xs font-semibold mt-1.5 sm:mt-2 text-center leading-tight max-w-[70px] sm:max-w-[110px] px-0.5 transition-colors ${isCurrent
                      ? 'text-gray-900 font-bold'
                      : isCompleted
                        ? 'text-rose-600 font-medium'
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
        {/* Left: Form Card */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs p-5 sm:p-7 space-y-6">
            {/* Error Notification Alert */}
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2 animate-in fade-in duration-200">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* ================= STEP 1: DETAIL BARANG ================= */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-sm text-gray-900 mb-3">
                    Informasi Barang
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Kategori Barang */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Kategori Barang <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 text-xs sm:text-sm text-gray-800 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all cursor-pointer"
                      >
                        <option value="" disabled hidden>Pilih Kategori Barang</option>
                        <option value="Elektronik & Gadget">Elektronik & Gadget</option>
                        <option value="Dompet & Aksesoris">Dompet & Aksesoris</option>
                        <option value="Tas & Ransel">Tas & Ransel</option>
                        <option value="Dokumen & Kartu">Dokumen & Kartu (KTM/KTP)</option>
                        <option value="Kunci & Kendaraan">Kunci & Kendaraan</option>
                        <option value="Buku & Alat Tulis">Buku & Alat Tulis</option>
                        <option value="Pakaian & Jaket">Pakaian & Jaket</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>

                    {/* Nama/Jenis Barang */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Nama/jenis barang <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        placeholder="Contoh: iPhone 13, Tas Ransel Abu-abu"
                        className="w-full px-3 py-2 text-xs sm:text-sm text-gray-800 placeholder-gray-400 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all"
                      />
                    </div>

                    {/* Kondisi Saat Hilang */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Kondisi Saat Hilang
                      </label>
                      <select
                        value={condition}
                        onChange={(e) => setCondition(e.target.value)}
                        className="w-full px-3 py-2 text-xs sm:text-sm text-gray-800 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all cursor-pointer"
                      >
                        <option value="" disabled hidden>Pilih Kondisi</option>
                        <option value="Sangat Baik / Baru">Sangat Baik / Baru</option>
                        <option value="Baik (Bekas Pemakaian Normal)">Baik (Bekas Pemakaian Normal)</option>
                        <option value="Cukup / Ada Goresan">Cukup / Ada Goresan</option>
                        <option value="Rusak Sebagian">Rusak Sebagian</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-5 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-0.5">
                      Foto Barang <span className="text-red-500">*</span>
                    </label>
                    <p className="text-[11px] text-gray-400">
                      Upload foto barang Anda, foto yang jelas akan sangat membantu proses identifikasi.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
                    {/* Drag & Drop Box */}
                    <div className="md:col-span-7">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={handleFileChange}
                        className="hidden"
                      />

                      {photoPreview ? (
                        <div className="relative rounded-2xl border border-gray-200 overflow-hidden h-44 bg-gray-50 flex items-center justify-center group">
                          <img
                            src={photoPreview}
                            alt="Pratinjau Foto Barang"
                            className="w-full h-full object-contain"
                          />
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
                              onClick={() => setPhotoPreview(null)}
                              className="p-1.5 bg-red-600 text-white rounded-lg shadow-sm hover:bg-red-700"
                              aria-label="Hapus Foto"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                          className="h-44 border-2 border-dashed border-gray-200 hover:border-[#30AFFF] rounded-2xl flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-[#EFF8FF]/30 group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#30AFFF] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                            <UploadCloud size={22} />
                          </div>
                          <p className="font-bold text-xs text-gray-800">
                            Klik Untuk Upload Foto
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            Atau seret & lepas file di sini
                          </p>
                          <span className="text-[10px] text-gray-400 mt-2 bg-white px-2 py-0.5 rounded border border-gray-200">
                            PNG, JPG, JPEG Maksimal 5MB
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Green Helper Box: Tips Foto */}
                    <div className="md:col-span-5 bg-emerald-50/70 border border-emerald-200/60 rounded-2xl p-4 flex flex-col justify-center text-emerald-950 space-y-2">
                      <p className="text-xs font-bold flex items-center gap-1.5 text-emerald-800">
                        <Sparkles size={13} className="text-emerald-600" />
                        <span>Tips foto yang baik:</span>
                      </p>
                      <ul className="text-[11px] text-emerald-800/90 space-y-1.5 leading-tight">
                        <li className="flex items-center gap-1.5">
                          <Check size={12} className="text-emerald-600 shrink-0 stroke-[2.5]" />
                          <span>Foto barang dengan jelas</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check size={12} className="text-emerald-600 shrink-0 stroke-[2.5]" />
                          <span>Ambil dari beberapa sudut</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check size={12} className="text-emerald-600 shrink-0 stroke-[2.5]" />
                          <span>Pastikan pencahayaan cukup</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check size={12} className="text-emerald-600 shrink-0 stroke-[2.5]" />
                          <span>Hindari blur atau tertutup objek lain</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Ciri-ciri Khusus */}
                <div className="border-t border-gray-100 pt-5 space-y-2">
                  <label className="block text-xs font-semibold text-gray-700">
                    Ciri-ciri Khusus <span className="text-gray-400 font-normal">(opsional)</span>
                  </label>
                  <p className="text-[11px] text-gray-400">
                    Tambahkan ciri-ciri khusus yang membedakan barang Anda dengan barang lainnya.
                  </p>
                  <textarea
                    rows={3}
                    value={specialFeatures}
                    onChange={(e) => setSpecialFeatures(e.target.value)}
                    placeholder="Contoh: Ada stiker di bagian belakang laptop, resleting rusak di sisi kanan tas, casing handphone warna biru muda..."
                    className="w-full px-3 py-2 text-xs sm:text-sm text-gray-800 placeholder-gray-400 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all resize-none"
                  />
                </div>
              </div>
            )}

            {/* ================= STEP 2: WAKTU DAN LOKASI ================= */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-sm text-gray-900 mb-1">
                    Waktu dan Lokasi Terakhir Terlihat
                  </h3>
                  <p className="text-xs text-gray-400 mb-4">
                    Informasi ini mempersempit pencarian agar satpam dan rekan kampus dapat menyisir area yang tepat.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Lokasi Gedung Kampus */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Area / Gedung Kampus <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={building}
                      onChange={(e) => setBuilding(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm text-gray-800 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all cursor-pointer"
                    >
                      <option value="" disabled hidden>Pilih Area Kampus</option>
                      <option value="Perpustakaan Pusat">Perpustakaan Pusat</option>
                      <option value="Gedung Rektorat">Gedung Rektorat</option>
                      <option value="Gedung Kuliah Bersama (GKB)">Gedung Kuliah Bersama (GKB)</option>
                      <option value="Fakultas Ilmu Komputer">Fakultas Ilmu Komputer</option>
                      <option value="Fakultas Teknik">Fakultas Teknik</option>
                      <option value="Fakultas Ekonomi & Bisnis">Fakultas Ekonomi & Bisnis</option>
                      <option value="Kantin Utama">Kantin Utama</option>
                      <option value="Masjid Kampus">Masjid Kampus</option>
                      <option value="Parkiran Gedung A / B / C">Parkiran Kendaraan</option>
                      <option value="Area Lainnya">Area Lainnya</option>
                    </select>
                  </div>

                  {/* Detail Spesifik Titik */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Titik Spesifik Ruangan / Meja
                    </label>
                    <input
                      type="text"
                      value={locationDetail}
                      onChange={(e) => setLocationDetail(e.target.value)}
                      placeholder="Contoh: Meja belajar lantai 2 dekat colokan"
                      className="w-full px-3 py-2 text-xs sm:text-sm text-gray-800 placeholder-gray-400 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all"
                    />
                  </div>

                  {/* Tanggal Terlihat */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Tanggal Terakhir Terlihat <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={lostDate}
                        onChange={(e) => setLostDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all"
                      />
                    </div>
                  </div>

                  {/* Perkiraan Jam */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Perkiraan Jam (WIB)
                    </label>
                    <input
                      type="time"
                      value={lostTime}
                      onChange={(e) => setLostTime(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ================= STEP 3: DESKRIPSI & KONTAK ================= */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-sm text-gray-900 mb-1">
                    Kronologi & Informasi Tambahan
                  </h3>
                  <p className="text-xs text-gray-400 mb-4">
                    Ceritakan ringkas bagaimana Anda baru menyadari barang ini hilang.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Kronologi Singkat Kehilangan
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Contoh: Selesai kelas praktikum jam 10 pagi di lab komputer, saya buru-buru ke kantin dan baru sadar tas ketinggalan saat kembali..."
                    className="w-full px-3 py-2 text-xs sm:text-sm text-gray-800 placeholder-gray-400 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all resize-none"
                  />
                </div>

                <div className="border-t border-gray-100 pt-5 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Nomor Kontak Darurat (WhatsApp)
                    </label>
                    <p className="text-[11px] text-gray-400 mb-2">
                      🔒 Nomor Anda dilindungi privasi dan tidak dipublikasikan secara terbuka. Hanya digunakan oleh bot notifikasi Findly.
                    </p>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="Contoh: 081234567890"
                      className="w-full sm:w-1/2 px-3 py-2 text-xs sm:text-sm text-gray-800 placeholder-gray-400 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ================= STEP 4: KONFIRMASI ================= */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-sm text-gray-900 mb-1">
                    Konfirmasi Laporan Kehilangan
                  </h3>
                  <p className="text-xs text-gray-400 mb-4">
                    Pastikan seluruh data yang Anda masukkan telah akurat sebelum dipublikasikan ke Cari Barang.
                  </p>
                </div>

                {/* Summary Card */}
                <div className="bg-gray-50/90 rounded-2xl p-4.5 border border-gray-200/80 space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-400 block text-[11px]">Nama Barang:</span>
                      <span className="font-bold text-gray-900 text-sm">{itemName || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">Kategori:</span>
                      <span className="font-semibold text-gray-800">{category || '-'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200/60">
                    <div>
                      <span className="text-gray-400 block text-[11px]">Lokasi Terakhir:</span>
                      <span className="font-medium text-gray-800">{building || '-'} {locationDetail && `(${locationDetail})`}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">Tanggal & Waktu:</span>
                      <span className="font-medium text-gray-800">{lostDate} · {lostTime} WIB</span>
                    </div>
                  </div>

                  {specialFeatures && (
                    <div className="pt-2 border-t border-gray-200/60">
                      <span className="text-gray-400 block text-[11px]">Ciri-ciri Khusus:</span>
                      <span className="text-gray-700 leading-relaxed">{specialFeatures}</span>
                    </div>
                  )}

                  {photoPreview && (
                    <div className="pt-2 border-t border-gray-200/60">
                      <span className="text-gray-400 block text-[11px] mb-1">Lampiran Foto:</span>
                      <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 bg-white">
                        <img src={photoPreview} alt="Foto Barang" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Agreement Checkbox */}
                <div className="flex items-start gap-2.5 pt-2">
                  <input
                    type="checkbox"
                    id="agreementCheck"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500 cursor-pointer accent-rose-600 mt-0.5"
                  />
                  <label htmlFor="agreementCheck" className="text-xs text-gray-600 cursor-pointer leading-normal">
                    Saya menyatakan bahwa informasi laporan kehilangan ini adalah benar dan dapat dipertanggungjawabkan sesuai tata tertib kampus.
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
                  href="/dashboard"
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 border border-transparent hover:border-gray-200 rounded-xl transition-all"
                >
                  Batalkan
                </Link>
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-[#EF4444] hover:bg-[#DC2626] active:scale-[0.98] rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <span>Lanjutkan</span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !agreed}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-[#EF4444] hover:bg-[#DC2626] active:scale-[0.98] disabled:opacity-50 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Memproses Laporan...</span>
                  ) : (
                    <>
                      <span>Publikasikan Laporan</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Helper Widgets */}
        <div className="lg:col-span-4 space-y-4">
          {/* Widget 1: Tips Melaporkan Kehilangan */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-50">
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                <Lightbulb size={16} />
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-gray-900">
                Tips Melaporkan Kehilangan
              </h4>
            </div>

            <ul className="space-y-3.5 text-xs">
              <li className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={12} className="stroke-[2.5]" />
                </div>
                <div>
                  <strong className="block text-gray-900 text-xs">Berikan Informasi Selengkap Mungkin</strong>
                  <span className="text-[11px] text-gray-500 leading-relaxed">
                    Detail yang lengkap meningkatkan peluang barang Anda ditemukan.
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={12} className="stroke-[2.5]" />
                </div>
                <div>
                  <strong className="block text-gray-900 text-xs">Upload Foto Yang Jelas</strong>
                  <span className="text-[11px] text-gray-500 leading-relaxed">
                    Foto yang jelas memudahkan orang mengenali barang Anda.
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={12} className="stroke-[2.5]" />
                </div>
                <div>
                  <strong className="block text-gray-900 text-xs">Sebutkan Lokasi Secara Spesifik</strong>
                  <span className="text-[11px] text-gray-500 leading-relaxed">
                    Lokasi yang detail membantu pencarian lebih efektif.
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={12} className="stroke-[2.5]" />
                </div>
                <div>
                  <strong className="block text-gray-900 text-xs">Periksa Kembali Sebelum Submit</strong>
                  <span className="text-[11px] text-gray-500 leading-relaxed">
                    Pastikan semua informasi sudah benar sebelum melanjutkan.
                  </span>
                </div>
              </li>
            </ul>
          </div>

          {/* Widget 2: Butuh Bantuan? */}
          <div className="bg-gray-50/80 rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-3">
            <h4 className="font-bold text-xs sm:text-sm text-gray-900">
              Butuh Bantuan?
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Jika Anda mengalami kendala atau membutuhkan mediasi darurat, tim Findly siap membantu Anda.
            </p>
            <Link
              href="/help"
              className="inline-flex items-center justify-center gap-2 w-full py-2 px-3 bg-white hover:bg-gray-100 text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl transition-all shadow-2xs"
            >
              <MessageCircle size={15} />
              <span>Hubungi Kami</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
