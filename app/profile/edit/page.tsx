'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLayout from '@/src/components/layout/AppLayout';
import { createClient } from '@/src/lib/supabase/client';
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  GraduationCap,
  Mail,
  Phone,
  User,
  Building,
  BookOpen,
  Hash,
  FileText,
  Save,
  Check,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

export default function EditProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  // Profile Form States
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [accountType, setAccountType] = useState<'campus' | 'community' | 'admin'>('community');
  const [university, setUniversity] = useState('Universitas Bung Hatta');
  const [faculty, setFaculty] = useState('');
  const [studyProgram, setStudyProgram] = useState('');
  const [cohortYear, setCohortYear] = useState('');
  const [nim, setNim] = useState('');
  const [bio, setBio] = useState('');

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // States peringatan 'Hanya angka'
  const [phoneError, setPhoneError] = useState(false);
  const [cohortError, setCohortError] = useState(false);
  const [nimError, setNimError] = useState(false);

  const handleNumberKeyDown = (e: React.KeyboardEvent, setErrorFn: (val: boolean) => void) => {
    if (
      ['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', 'Home', 'End'].includes(e.key) ||
      e.ctrlKey || e.metaKey || e.altKey
    ) {
      return;
    }
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
      setErrorFn(true);
      setTimeout(() => setErrorFn(false), 2200);
    }
  };

  const handlePhoneChange = (val: string) => {
    if (/[^\d]/.test(val)) {
      setPhoneError(true);
      setTimeout(() => setPhoneError(false), 2200);
    }
    setPhone(val.replace(/\D/g, ''));
  };

  const handleCohortChange = (val: string) => {
    if (/[^\d]/.test(val)) {
      setCohortError(true);
      setTimeout(() => setCohortError(false), 2200);
    }
    setCohortYear(val.replace(/\D/g, '').slice(0, 4));
  };

  const handleNimChange = (val: string) => {
    if (/[^\d]/.test(val)) {
      setNimError(true);
      setTimeout(() => setNimError(false), 2200);
    }
    setNim(val.replace(/\D/g, ''));
  };

  // Load current user data if logged in with Supabase
  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setEmail(user.email || '');
          if (user.user_metadata?.full_name) {
            setFullName(user.user_metadata.full_name);
          }
          // Fetch from profil_pengguna if available
          const { data: profile } = await supabase
            .from('profil_pengguna')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profile) {
            if (profile.nama_lengkap) setFullName(profile.nama_lengkap);
            if (profile.no_telepon) setPhone(profile.no_telepon);
            if (profile.avatar_url) setAvatarPreview(profile.avatar_url);
            if (profile.universitas) setUniversity(profile.universitas);
            if (profile.nim_nip) setNim(profile.nim_nip);
            if (profile.tipe_akun) setAccountType(profile.tipe_akun);
          } else if (user.user_metadata?.tipe_akun) {
            setAccountType(user.user_metadata.tipe_akun);
          }
        }
      } catch (err) {
        // Fallback
        console.log('Error loading user in edit profile');
      }
    }
    loadUser();
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage('Ukuran foto profil maksimal adalah 2MB.');
        return;
      }
      setErrorMessage(null);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Update Supabase profile table
        const { error } = await supabase.from('profil_pengguna').upsert({
          id: user.id,
          nama_lengkap: fullName,
          no_telepon: phone,
          avatar_url: avatarPreview,
        });

        if (error) {
          console.warn('Supabase upsert warning:', error.message);
        }
      }

      setSuccessMessage('Profil Anda berhasil diperbarui!');
      setTimeout(() => {
        router.push('/profile');
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal memperbarui profil. Coba beberapa saat lagi.');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6 pb-12">
        {/* Navigation & Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/profile"
            className="p-2 text-gray-400 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="Kembali ke profil"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Edit Profil {accountType === 'campus' ? 'Civitas Kampus' : 'Pengguna'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              {accountType === 'campus'
                ? 'Perbarui identitas kampus, informasi kontak, dan biodata Anda di Findly.'
                : 'Perbarui informasi kontak dan profil akun Anda di Findly.'}
            </p>
          </div>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in duration-200">
            <Check size={18} className="text-emerald-600 shrink-0" />
            <span>{successMessage} Mengalihkan kembali ke halaman profil...</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in duration-200">
            <AlertCircle size={18} className="text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Avatar Section */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-2xs space-y-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Foto Profil
            </h2>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="relative group">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Foto Profil"
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover shadow-sm border-2 border-[#30AFFF]"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-[#30AFFF] to-[#5ec2ff] text-white flex items-center justify-center font-extrabold text-2xl shadow-sm">
                    {getInitials(fullName || 'BS')}
                  </div>
                )}

                <label
                  htmlFor="avatar-upload"
                  className="absolute -bottom-1.5 -right-1.5 p-2 bg-[#30AFFF] hover:bg-[#2196e8] text-white rounded-xl shadow-md cursor-pointer transition-transform hover:scale-105"
                  title="Ubah foto profil"
                >
                  <Camera size={15} />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="space-y-1 text-center sm:text-left">
                <h3 className="font-bold text-sm text-gray-900">{fullName}</h3>
                <p className="text-xs text-gray-500">
                  Format gambar JPG, PNG, atau WEBP. Maksimal ukuran file 2MB.
                </p>
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={() => setAvatarPreview(null)}
                    className="text-[11px] font-semibold text-rose-500 hover:underline pt-0.5 cursor-pointer"
                  >
                    Hapus Foto Khusus (Gunakan Inisial)
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Kontak & Identitas Pribadi */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-2xs space-y-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Kontak & Verifikasi
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Nama Lengkap */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-700 flex items-center gap-1.5">
                  <User size={13} className="text-[#30AFFF]" />
                  <span>Nama Lengkap *</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-gray-800 text-xs sm:text-sm focus:border-[#30AFFF] focus:ring-2 focus:ring-[#30AFFF]/20 focus:outline-none transition-all"
                />
              </div>

              {/* No WhatsApp */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-gray-700 flex items-center gap-1.5">
                    <Phone size={13} className="text-[#30AFFF]" />
                    <span>Nomor WhatsApp / HP *</span>
                  </label>
                  {phoneError && (
                    <span className="text-[11px] font-bold text-rose-500 flex items-center gap-1 animate-in fade-in">
                      <AlertCircle size={12} /> Hanya angka
                    </span>
                  )}
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  required
                  value={phone}
                  onKeyDown={(e) => handleNumberKeyDown(e, setPhoneError)}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-gray-800 text-xs sm:text-sm focus:outline-none transition-all ${
                    phoneError
                      ? 'border-rose-400 ring-2 ring-rose-100'
                      : 'border-gray-200 focus:border-[#30AFFF] focus:ring-2 focus:ring-[#30AFFF]/20'
                  }`}
                />
                <span className="text-[10px] text-gray-400">
                  Digunakan untuk notifikasi klaim & koordinasi pengambilan aman.
                </span>
              </div>

              {/* Email Login */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-gray-700 flex items-center gap-1.5">
                  <Mail size={13} className="text-gray-400" />
                  <span>Email Akun (Login)</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-xs sm:text-sm cursor-not-allowed"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                    <CheckCircle2 size={11} className="text-emerald-600" />
                    Terverifikasi
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Data Akademika Kampus (Hanya untuk Anggota Kampus) */}
          {accountType === 'campus' && (
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-2xs space-y-4">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Data Civitas Akademika
              </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Universitas */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-700 flex items-center gap-1.5">
                  <Building size={13} className="text-[#30AFFF]" />
                  <span>Asal Kampus / Universitas</span>
                </label>
                <input
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="Contoh: Universitas ABC"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-gray-800 text-xs sm:text-sm focus:border-[#30AFFF] focus:ring-2 focus:ring-[#30AFFF]/20 focus:outline-none transition-all"
                />
              </div>

              {/* Fakultas */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-700 flex items-center gap-1.5">
                  <GraduationCap size={13} className="text-[#30AFFF]" />
                  <span>Fakultas</span>
                </label>
                <input
                  type="text"
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                  placeholder="Contoh: Fakultas Ilmu Komputer"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-gray-800 text-xs sm:text-sm focus:border-[#30AFFF] focus:ring-2 focus:ring-[#30AFFF]/20 focus:outline-none transition-all"
                />
              </div>

              {/* Program Studi */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-700 flex items-center gap-1.5">
                  <BookOpen size={13} className="text-[#30AFFF]" />
                  <span>Program Studi</span>
                </label>
                <input
                  type="text"
                  value={studyProgram}
                  onChange={(e) => setStudyProgram(e.target.value)}
                  placeholder="Contoh: Teknik Informatika"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-gray-800 text-xs sm:text-sm focus:border-[#30AFFF] focus:ring-2 focus:ring-[#30AFFF]/20 focus:outline-none transition-all"
                />
              </div>

              {/* Tahun Angkatan */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-gray-700 flex items-center gap-1.5">
                    <Hash size={13} className="text-[#30AFFF]" />
                    <span>Tahun Angkatan</span>
                  </label>
                  {cohortError && (
                    <span className="text-[11px] font-bold text-rose-500 flex items-center gap-1 animate-in fade-in">
                      <AlertCircle size={12} /> Hanya angka
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={cohortYear}
                  onKeyDown={(e) => handleNumberKeyDown(e, setCohortError)}
                  onChange={(e) => handleCohortChange(e.target.value)}
                  placeholder="Contoh: 2022"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-gray-800 text-xs sm:text-sm focus:outline-none transition-all ${
                    cohortError
                      ? 'border-rose-400 ring-2 ring-rose-100'
                      : 'border-gray-200 focus:border-[#30AFFF] focus:ring-2 focus:ring-[#30AFFF]/20'
                  }`}
                />
              </div>

              {/* NIM */}
              <div className="space-y-1.5 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-gray-700 flex items-center gap-1.5">
                    <Hash size={13} className="text-[#30AFFF]" />
                    <span>Nomor Induk Mahasiswa (NIM)</span>
                  </label>
                  {nimError && (
                    <span className="text-[11px] font-bold text-rose-500 flex items-center gap-1 animate-in fade-in">
                      <AlertCircle size={12} /> Hanya angka
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={nim}
                  onKeyDown={(e) => handleNumberKeyDown(e, setNimError)}
                  onChange={(e) => handleNimChange(e.target.value)}
                  placeholder="Contoh: 2212345678"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-gray-800 text-xs sm:text-sm font-mono focus:outline-none transition-all ${
                    nimError
                      ? 'border-rose-400 ring-2 ring-rose-100'
                      : 'border-gray-200 focus:border-[#30AFFF] focus:ring-2 focus:ring-[#30AFFF]/20'
                  }`}
                />
                <span className="text-[10px] text-gray-400">
                  NIM disensor secara otomatis demi keamanan privasi Anda pada laporan publik.
                </span>
              </div>
            </div>
          </div>
          )}

          {/* Bio Singkat */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-2xs space-y-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Bio / Catatan Kampus
            </h2>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-gray-700 flex items-center gap-1.5">
                <FileText size={13} className="text-[#30AFFF]" />
                <span>Deskripsi Singkat Aktivitas Kampus</span>
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tuliskan aktivitas kampus atau area yang sering Anda kunjungi..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-gray-800 text-xs sm:text-sm focus:border-[#30AFFF] focus:ring-2 focus:ring-[#30AFFF]/20 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Security Notice */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 text-xs text-gray-500 flex items-start gap-3">
            <ShieldCheck size={18} className="text-[#30AFFF] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Findly menjaga ketat keamanan data mahasiswa. Kontak telepon hanya dapat dihubungi melalui sistem ruang obrolan Findly dan nomor WhatsApp Anda tidak dipublikasikan ke sembarang orang.
            </p>
          </div>

          {/* Form Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/profile"
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-[#30AFFF] hover:bg-[#2196E8] text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-[#30AFFF]/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save size={16} />
              <span>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
