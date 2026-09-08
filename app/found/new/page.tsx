'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLayout from '@/src/components/layout/AppLayout';
import {
  Check,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { createClient } from '@/src/lib/supabase/client';

export default function FoundItemWizardPage() {
  const router = useRouter();

  useEffect(() => {
    async function checkRole() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profil_pengguna')
            .select('tipe_akun, role_kampus')
            .eq('id', user.id)
            .single();

          if (profile?.tipe_akun === 'admin' || profile?.role_kampus === 'admin') {
            router.replace('/admin/laporan');
          }
        }
      } catch {
        // ignore
      }
    }
    checkRole();
  }, [router]);

  // Stepper State (1 to 4)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Step 1: Info Publik
  const [category, setCategory] = useState('');
  const [itemName, setItemName] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setErrorMessage('Mohon setujui komitmen amanah pengembalian barang.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setErrorMessage('Anda harus masuk/login terlebih dahulu untuk mengirimkan laporan temuan.');
        setIsSubmitting(false);
        return;
      }

      const storageDesc = storageType === 'self'
        ? 'Disimpan sendiri oleh penemu'
        : storageType === 'security'
        ? 'Dititipkan ke Pos Satpam Kampus'
        : 'Dititipkan ke Tata Usaha Fakultas';

      const fullDescription = `${storageDesc}${locationDetail ? ` (${locationDetail})` : ''}${storageNote ? `. Catatan: ${storageNote}` : ''}`;
      const ciriRahasiaCombined = `Pertanyaan: ${secretQuestion} | Jawaban: ${secretAnswer}`;

      const { error } = await supabase
        .from('laporan_barang')
        .insert({
          pelapor_id: user.id,
          jenis_laporan: 'DITEMUKAN',
          nama_barang: itemName,
          deskripsi: fullDescription,
          foto_url: null,
          lokasi_terakhir: foundLocation,
          ciri_rahasia: ciriRahasiaCombined,
          status: 'MENCARI',
        });

      if (error) throw error;
      setIsSuccess(true);
    } catch (err: any) {
      console.error('Error submitting found report:', err);
      setErrorMessage(err.message || 'Gagal menyimpan laporan temuan. Silakan periksa koneksi Anda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto bg-white p-8 sm:p-10 rounded-[6px] border border-slate-200 text-center space-y-5">
          <div className="w-14 h-14 rounded-[6px] bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} />
          </div>
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-[4px] bg-emerald-50 text-emerald-800 border border-emerald-200">
              Status: Ditemukan (Found)
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Terima Kasih Atas Kejujuran Anda!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Laporan barang temuan <strong className="text-slate-800 font-semibold">{itemName}</strong> telah berhasil dipublikasikan. Anda akan menerima pesan konfirmasi verifikasi saat pemilik sah mengajukan klaim.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-2.5">
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-[6px] border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Kembali ke Beranda
            </Link>
            <Link
              href="/claims"
              className="px-5 py-2.5 rounded-[6px] bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              Pantau Status Klaim
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  const steps = [
    { num: 1, label: 'Info Publik' },
    { num: 2, label: 'Ciri Rahasia' },
    { num: 3, label: 'Lokasi & Simpan' },
    { num: 4, label: 'Konfirmasi' },
  ];

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Title */}
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Laporkan Barang Temuan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Bantu kembalikan barang kepada pemilik aslinya dengan sistem verifikasi ciri rahasia kampus.
          </p>
        </div>

        {/* Stepper Wizard Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-[6px] border border-slate-200">
          <div className="relative max-w-2xl mx-auto">
            {/* Connector Line Background */}
            <div className="absolute top-3.5 sm:top-4 left-[12.5%] right-[12.5%] h-[2px] bg-slate-200 -translate-y-1/2 z-0" />

            {/* Connector Line Active Fill */}
            <div
              className="absolute top-3.5 sm:top-4 left-[12.5%] h-[2px] bg-emerald-600 -translate-y-1/2 transition-all duration-300 z-0"
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
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-[4px] flex items-center justify-center font-bold text-xs transition-all ${
                        isCurrent
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white text-slate-400 border border-slate-300'
                      }`}
                    >
                      {isCompleted ? <Check size={14} className="stroke-[2.5]" /> : step.num}
                    </div>

                    {/* Step Label */}
                    <span
                      className={`text-[10px] sm:text-xs font-semibold mt-1.5 text-center leading-tight max-w-[70px] sm:max-w-[110px] px-0.5 transition-colors ${
                        isCurrent
                          ? 'text-slate-900 font-bold'
                          : isCompleted
                          ? 'text-emerald-700 font-medium'
                          : 'text-slate-400'
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

        {/* Main Form & Widget Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[6px] border border-slate-200 p-5 sm:p-6 space-y-5">
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-[6px] text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Step 1: Info Publik */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
                    Informasi Publik Barang Temuan
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Kategori Barang <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 text-xs sm:text-sm text-slate-800 bg-white border border-slate-300 rounded-[6px] focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all cursor-pointer"
                      >
                        <option value="" disabled hidden>Pilih Kategori</option>
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
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Nama / Jenis Barang Umum <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        placeholder="Contoh: Tas Ransel Hitam, Dompet Kulit"
                        className="w-full px-3 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 border border-slate-300 rounded-[6px] focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Detail Rahasia (Secret Attributes) */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
                    Kunci Verifikasi Ciri Rahasia
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Pertanyaan Rahasia untuk Pengklaim <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={secretQuestion}
                        onChange={(e) => setSecretQuestion(e.target.value)}
                        placeholder="Contoh: Apa warna casing HP di dalamnya? / Ada berapa kartu di dompet?"
                        className="w-full px-3 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 border border-slate-300 rounded-[6px] focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Kunci Jawaban Rahasia (Hanya Anda yang Tahu) <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        value={secretAnswer}
                        onChange={(e) => setSecretAnswer(e.target.value)}
                        placeholder="Contoh: Casing warna biru transparan dengan stiker kucing, ada uang Rp50.000 di kantong kiri."
                        className="w-full px-3 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 border border-slate-300 rounded-[6px] focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Lokasi & Simpan */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
                    Lokasi Penemuan & Tempat Penyimpanan Fisik
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Area Kampus Lokasi Ditemukan <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={foundLocation}
                        onChange={(e) => setFoundLocation(e.target.value)}
                        className="w-full px-3 py-2 text-xs sm:text-sm text-slate-800 bg-white border border-slate-300 rounded-[6px] focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all cursor-pointer"
                      >
                        <option value="" disabled hidden>Pilih Area Kampus</option>
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
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Titik Spesifik Penemuan
                      </label>
                      <input
                        type="text"
                        value={locationDetail}
                        onChange={(e) => setLocationDetail(e.target.value)}
                        placeholder="Contoh: Dekat meja baca nomor 15 lantai 2"
                        className="w-full px-3 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 border border-slate-300 rounded-[6px] focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3 space-y-2.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Dimana Barang Fisik Ini Disimpan Sekarang?
                    </label>

                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3 rounded-[6px] border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                        <input
                          type="radio"
                          name="storage"
                          value="self"
                          checked={storageType === 'self'}
                          onChange={() => setStorageType('self')}
                          className="text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                        />
                        <div>
                          <span className="font-semibold text-xs text-slate-900 block">Saya Simpan Sendiri</span>
                          <span className="text-[11px] text-slate-500">Anda akan bertemu langsung dengan pemilik setelah klaim diverifikasi.</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 rounded-[6px] border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                        <input
                          type="radio"
                          name="storage"
                          value="security"
                          checked={storageType === 'security'}
                          onChange={() => setStorageType('security')}
                          className="text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                        />
                        <div>
                          <span className="font-semibold text-xs text-slate-900 block">Dititipkan ke Pos Satpam Utama</span>
                          <span className="text-[11px] text-slate-500">Pemilik dapat mengambil langsung di pos satpam dengan menunjukkan bukti verifikasi Findly.</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 rounded-[6px] border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                        <input
                          type="radio"
                          name="storage"
                          value="faculty"
                          checked={storageType === 'faculty'}
                          onChange={() => setStorageType('faculty')}
                          className="text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                        />
                        <div>
                          <span className="font-semibold text-xs text-slate-900 block">Dititipkan ke Tata Usaha / Helpdesk Fakultas</span>
                          <span className="text-[11px] text-slate-500">Barang disimpan aman di ruang TU fakultas terdekat.</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Konfirmasi */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
                    Konfirmasi Laporan Barang Temuan
                  </h3>

                  <div className="bg-slate-50 rounded-[6px] p-4 border border-slate-200 space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Nama Barang:</span>
                        <span className="font-bold text-slate-900 text-sm">{itemName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Kategori:</span>
                        <span className="font-semibold text-slate-800">{category}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Lokasi Ditemukan:</span>
                        <span className="font-medium text-slate-800">{foundLocation} {locationDetail && `(${locationDetail})`}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Penyimpanan Fisik:</span>
                        <span className="font-medium text-slate-800">
                          {storageType === 'self' ? 'Disimpan Sendiri' : storageType === 'security' ? 'Pos Satpam' : 'Tata Usaha'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-slate-400 block text-[11px]">Pertanyaan Rahasia:</span>
                      <p className="text-slate-800 font-medium">{secretQuestion}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 pt-1">
                    <input
                      type="checkbox"
                      id="foundAgree"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="w-4 h-4 rounded-[3px] border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600 mt-0.5"
                    />
                    <label htmlFor="foundAgree" className="text-xs text-slate-600 cursor-pointer leading-normal">
                      Saya bersedia menjaga amanah barang temuan ini dan menyerahkannya hanya kepada pemilik sah yang berhasil menjawab verifikasi rahasia.
                    </label>
                  </div>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 rounded-[6px] transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    <span>Kembali</span>
                  </button>
                ) : (
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 border border-transparent hover:border-slate-200 rounded-[6px] transition-all"
                  >
                    Batalkan
                  </Link>
                )}

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-[6px] transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Lanjutkan</span>
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !agreed}
                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-[6px] transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSubmitting ? 'Memproses Publikasi...' : 'Publikasikan Barang Temuan'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column Helpers */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-[6px] border border-slate-200 p-5 space-y-3.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 pb-2 border-b border-slate-100">
                <ShieldCheck size={16} className="text-emerald-700" />
                <span>Panduan Amanah Penemu</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-2.5">
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-700 shrink-0 mt-0.5" />
                  <span>Jaga kerahasiaan detail tersembunyi untuk proses tanya jawab saat ada klaim masuk.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-700 shrink-0 mt-0.5" />
                  <span>Jika berupa barang berharga tinggi (emas/uang jumlah besar), titipkan ke Pos Satpam Utama.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-700 shrink-0 mt-0.5" />
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
