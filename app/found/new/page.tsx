'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import AppLayout from '@/src/components/layout/AppLayout';
import {
  UploadCloud,
  Check,
  ArrowRight,
  ArrowLeft,
  X,
  ShieldCheck,
  Lock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  MapPin,
  Building2,
} from 'lucide-react';

export default function FoundItemWizardPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stepper State (1 to 4)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Step 1: Info Publik
  const [category, setCategory] = useState('');
  const [itemName, setItemName] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Step 2: Detail Rahasia (Secret Attributes - GOLDEN RULE)
  const [secretQuestion, setSecretQuestion] = useState('');
  const [secretAnswer, setSecretAnswer] = useState('');

  // Step 3: Lokasi & Tempat Penyimpanan Fisik
  const [foundLocation, setFoundLocation] = useState('');
  const [locationDetail, setLocationDetail] = useState('');
  const [storageType, setStorageType] = useState('self'); // 'self' | 'security' | 'faculty'
  const [storageNote, setStorageNote] = useState('');

  // Step 4: Agreement
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
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const validateStep = (step: number) => {
    setErrorMessage(null);
    if (step === 1) {
      if (!category) {
        setErrorMessage('Silakan pilih kategori barang temuan.');
        return false;
      }
      if (!itemName.trim()) {
        setErrorMessage('Silakan masukkan nama umum barang temuan.');
        return false;
      }
      return true;
    }
    if (step === 2) {
      if (!secretQuestion.trim() || !secretAnswer.trim()) {
        setErrorMessage('Mohon lengkapi pertanyaan verifikasi dan jawaban rahasia untuk memfilter klaim palsu.');
        return false;
      }
      return true;
    }
    if (step === 3) {
      if (!foundLocation) {
        setErrorMessage('Silakan pilih lokasi kampus di mana barang ditemukan.');
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
    setErrorMessage(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setErrorMessage('Mohon setujui komitmen amanah pengembalian barang.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1000);
  };

  if (isSuccess) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto bg-white p-8 sm:p-10 rounded-3xl border border-emerald-100 shadow-sm text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 size={36} />
          </div>
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Status: FOUND (Ditemukan)
            </span>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Terima Kasih Atas Kejujuran Anda!
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
              Laporan barang temuan <strong className="text-gray-900">{itemName}</strong> telah aktif di Cari Barang. Detail rahasia Anda telah disimpan secara privat untuk menguji pengklaim di ruang chat verifikasi.
            </p>
          </div>

          <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100 text-left space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-400">Nama Barang:</span>
              <span className="font-semibold text-gray-800">{itemName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-400">Penyimpanan Fisik:</span>
              <span className="font-semibold text-gray-800">
                {storageType === 'self'
                  ? 'Disimpan sendiri oleh penemu'
                  : storageType === 'security'
                  ? 'Dititipkan ke Pos Satpam Utama'
                  : 'Dititipkan ke Tata Usaha Fakultas'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-400">Verifikasi Rahasia:</span>
              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                <Lock size={12} />
                Terproteksi (Hanya Anda yang tahu)
              </span>
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
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-semibold shadow-sm transition-colors"
            >
              Lihat di Cari Barang
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  const steps = [
    { num: 1, label: 'Info Publik' },
    { num: 2, label: 'Detail Rahasia' },
    { num: 3, label: 'Lokasi & Simpan' },
    { num: 4, label: 'Konfirmasi' },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200/60 mb-1">
            <Sparkles size={12} />
            <span>Aksi Kebaikan Kampus</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Saya Menemukan Barang
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Laporkan barang yang Anda temukan di kampus. Gunakan pertanyaan rahasia untuk memastikan barang kembali ke pemilik sah.
          </p>
        </div>

        {/* Stepper */}
        <div className="py-2">
          <div className="flex items-center justify-between max-w-2xl mx-auto relative">
            <div className="absolute top-4 left-6 right-6 h-[2px] bg-gray-200 -z-0" />
            <div
              className="absolute top-4 left-6 h-[2px] bg-emerald-500 transition-all duration-300 -z-0"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />

            {steps.map((step) => {
              const isCompleted = currentStep > step.num;
              const isCurrent = currentStep === step.num;

              return (
                <div key={step.num} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-2xs ${
                      isCurrent
                        ? 'bg-emerald-500 text-white ring-4 ring-emerald-100 scale-110'
                        : isCompleted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white text-gray-400 border border-gray-300'
                    }`}
                  >
                    {isCompleted ? <Check size={14} className="stroke-[2.5]" /> : step.num}
                  </div>
                  <span
                    className={`text-[11px] sm:text-xs font-semibold mt-2 text-center whitespace-nowrap ${
                      isCurrent ? 'text-gray-900 font-bold' : isCompleted ? 'text-emerald-600' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Form & Widget Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs p-5 sm:p-7 space-y-6">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Step 1: Info Publik */}
              {currentStep === 1 && (
                <div className="space-y-5">
                  <h3 className="font-bold text-sm text-gray-900">
                    Informasi Publik Barang Temuan
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Kategori Barang <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 text-xs sm:text-sm text-gray-800 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all cursor-pointer"
                      >
                        <option value="">Pilih Kategori</option>
                        <option value="Elektronik & Gadget">Elektronik & Gadget</option>
                        <option value="Dompet & Aksesoris">Dompet & Aksesoris</option>
                        <option value="Tas & Ransel">Tas & Ransel</option>
                        <option value="Dokumen & Kartu">Dokumen & Kartu</option>
                        <option value="Kunci & Kendaraan">Kunci & Kendaraan</option>
                        <option value="Buku & Alat Tulis">Buku & Alat Tulis</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Nama / Jenis Barang Umum <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        placeholder="Contoh: Tas Ransel Kuning, Dompet Kulit"
                        className="w-full px-3 py-2 text-xs sm:text-sm text-gray-800 placeholder-gray-400 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                      />
                    </div>
                  </div>

                  {/* Foto Barang Temuan */}
                  <div className="border-t border-gray-100 pt-4 space-y-2">
                    <label className="block text-xs font-semibold text-gray-700">
                      Foto Barang Temuan (Tampak Luar Saja)
                    </label>
                    <p className="text-[11px] text-gray-400">
                      ⚠️ Jangan foto bagian rahasia (seperti nomor kartu atau isi bagian dalam dompet) agar tidak disalahgunakan orang lain.
                    </p>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {photoPreview ? (
                      <div className="relative rounded-2xl border border-gray-200 overflow-hidden h-40 bg-gray-50 flex items-center justify-center group">
                        <img src={photoPreview} alt="Foto Temuan" className="w-full h-full object-contain" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1.5 bg-white text-xs font-semibold text-gray-800 rounded-lg shadow-sm"
                          >
                            Ganti Foto
                          </button>
                          <button
                            type="button"
                            onClick={() => setPhotoPreview(null)}
                            className="p-1.5 bg-red-600 text-white rounded-lg shadow-sm"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="h-36 border-2 border-dashed border-gray-200 hover:border-emerald-400 rounded-2xl flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-emerald-50/30"
                      >
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5">
                          <UploadCloud size={20} />
                        </div>
                        <p className="font-bold text-xs text-gray-800">Unggah Foto Tampak Luar</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">PNG, JPG, JPEG Maksimal 5MB</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Detail Rahasia (Secret Attributes) */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                      <Lock size={14} className="text-emerald-600" />
                      <span>Aturan Emas: Verifikasi Buta (Blind Verification)</span>
                    </div>
                    <p className="text-xs text-emerald-900/90 leading-relaxed">
                      Bagian ini <strong>TIDAK PERNAH DIPERLIHATKAN KE PUBLIK</strong>. Anda menyimpannya sebagai kunci verifikasi untuk menanyai pengklaim di ruang chat.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Pertanyaan Rahasia untuk Pengklaim <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={secretQuestion}
                        onChange={(e) => setSecretQuestion(e.target.value)}
                        placeholder="Contoh: Apa warna casing HP di dalamnya? / Ada berapa kartu di dompet?"
                        className="w-full px-3 py-2 text-xs sm:text-sm text-gray-800 placeholder-gray-400 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Kunci Jawaban Rahasia (Hanya Anda yang Tahu) <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        value={secretAnswer}
                        onChange={(e) => setSecretAnswer(e.target.value)}
                        placeholder="Contoh: Casing warna biru transparan dengan stiker kucing, ada uang Rp50.000 di kantong kiri."
                        className="w-full px-3 py-2 text-xs sm:text-sm text-gray-800 placeholder-gray-400 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Lokasi & Simpan */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  <h3 className="font-bold text-sm text-gray-900">
                    Lokasi Penemuan & Tempat Penyimpanan Fisik
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Area Kampus Lokasi Ditemukan <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={foundLocation}
                        onChange={(e) => setFoundLocation(e.target.value)}
                        className="w-full px-3 py-2 text-xs sm:text-sm text-gray-800 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all cursor-pointer"
                      >
                        <option value="">Pilih Area Kampus</option>
                        <option value="Perpustakaan Pusat">Perpustakaan Pusat</option>
                        <option value="Gedung Kuliah Bersama (GKB)">Gedung Kuliah Bersama</option>
                        <option value="Fakultas Ilmu Komputer">Fakultas Ilmu Komputer</option>
                        <option value="Kantin Utama">Kantin Utama</option>
                        <option value="Masjid Kampus">Masjid Kampus</option>
                        <option value="Parkiran Gedung A/B/C">Parkiran Kampus</option>
                        <option value="Area Kampus Lainnya">Area Kampus Lainnya</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Titik Spesifik Penemuan
                      </label>
                      <input
                        type="text"
                        value={locationDetail}
                        onChange={(e) => setLocationDetail(e.target.value)}
                        placeholder="Contoh: Dekat meja baca nomor 15 lantai 2"
                        className="w-full px-3 py-2 text-xs sm:text-sm text-gray-800 placeholder-gray-400 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                      />
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4 space-y-3">
                    <label className="block text-xs font-semibold text-gray-700">
                      Dimana Barang Fisik Ini Disimpan Sekarang?
                    </label>

                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                        <input
                          type="radio"
                          name="storage"
                          value="self"
                          checked={storageType === 'self'}
                          onChange={() => setStorageType('self')}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <div>
                          <span className="font-semibold text-xs text-gray-900 block">Saya Simpan Sendiri</span>
                          <span className="text-[11px] text-gray-500">Anda akan bertemu langsung dengan pemilik setelah klaim diverifikasi.</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                        <input
                          type="radio"
                          name="storage"
                          value="security"
                          checked={storageType === 'security'}
                          onChange={() => setStorageType('security')}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <div>
                          <span className="font-semibold text-xs text-gray-900 block">Dititipkan ke Pos Satpam Utama</span>
                          <span className="text-[11px] text-gray-500">Pemilik dapat mengambil langsung di pos satpam dengan menunjukkan bukti verifikasi Findly.</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                        <input
                          type="radio"
                          name="storage"
                          value="faculty"
                          checked={storageType === 'faculty'}
                          onChange={() => setStorageType('faculty')}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <div>
                          <span className="font-semibold text-xs text-gray-900 block">Dititipkan ke Tata Usaha / Helpdesk Fakultas</span>
                          <span className="text-[11px] text-gray-500">Barang disimpan aman di ruang TU fakultas terdekat.</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Konfirmasi */}
              {currentStep === 4 && (
                <div className="space-y-5">
                  <h3 className="font-bold text-sm text-gray-900">
                    Konfirmasi Laporan Barang Temuan
                  </h3>

                  <div className="bg-gray-50/90 rounded-2xl p-4.5 border border-gray-200/80 space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-400 block text-[11px]">Nama Barang:</span>
                        <span className="font-bold text-gray-900 text-sm">{itemName}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[11px]">Kategori:</span>
                        <span className="font-semibold text-gray-800">{category}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-200/60 grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-400 block text-[11px]">Lokasi Ditemukan:</span>
                        <span className="font-medium text-gray-800">{foundLocation} {locationDetail && `(${locationDetail})`}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[11px]">Penyimpanan Fisik:</span>
                        <span className="font-medium text-gray-800">
                          {storageType === 'self' ? 'Disimpan Sendiri' : storageType === 'security' ? 'Pos Satpam' : 'Tata Usaha'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-200/60">
                      <span className="text-gray-400 block text-[11px]">Pertanyaan Rahasia:</span>
                      <p className="text-gray-800 font-medium">{secretQuestion}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 pt-2">
                    <input
                      type="checkbox"
                      id="foundAgree"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600 mt-0.5"
                    />
                    <label htmlFor="foundAgree" className="text-xs text-gray-600 cursor-pointer leading-normal">
                      Saya bersedia menjaga amanah barang temuan ini dan menyerahkannya hanya kepada pemilik sah yang berhasil menjawab verifikasi rahasia.
                    </label>
                  </div>
                </div>
              )}

              {/* Navigation Controls */}
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
                    className="px-6 py-2.5 text-xs font-bold text-white bg-[#10B981] hover:bg-[#059669] active:scale-[0.98] rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                  >
                    <span>Lanjutkan</span>
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !agreed}
                    className="px-6 py-2.5 text-xs font-bold text-white bg-[#10B981] hover:bg-[#059669] active:scale-[0.98] disabled:opacity-50 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? 'Memproses Publikasi...' : 'Publikasikan Barang Temuan'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column Helpers */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-2xs space-y-3.5">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-900 pb-2 border-b border-gray-50">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span>Panduan Amanah Penemu</span>
              </div>
              <ul className="text-xs text-gray-600 space-y-2.5">
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Jaga kerahasiaan detail tersembunyi untuk proses tanya jawab saat ada klaim masuk.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Jika berupa barang berharga tinggi (emas/uang jumlah besar), titipkan ke Pos Satpam Utama.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Findly tidak memfasilitasi tebusan uang tunai. Seluruh proses berbasis kejujuran civitas.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
