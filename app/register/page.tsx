

'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Mail,
  Lock,
  User,
  GraduationCap,
  Users,
  Building2,
  IdCard,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Info,
  ShieldCheck,
} from 'lucide-react';
import AuthBanner from '@/src/components/auth/AuthBanner';
import SocialButtons from '@/src/components/auth/SocialButtons';
import { createClient } from '@/src/lib/supabase/client';

type AccountType = 'campus' | 'community';
type CampusRole = 'mahasiswa' | 'dosen' | 'staff';

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const formContainerRef = useRef<HTMLDivElement>(null);
  const fullNameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [accountType, setAccountType] = useState<AccountType>('campus');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [university, setUniversity] = useState('Universitas Bung Hatta');
  const [campusRole, setCampusRole] = useState<CampusRole>('mahasiswa');

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
    const noticeParam = searchParams.get('notice');
    if (noticeParam) {
      setEmailSentNotice(noticeParam);
    }
  }, [searchParams]);
  const [nimNip, setNimNip] = useState('');

  // UI & Loading State
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isEmailFormOpen, setIsEmailFormOpen] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [emailSentNotice, setEmailSentNotice] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [nimError, setNimError] = useState(false);

  const handleResendVerification = async () => {
    if (!emailSentNotice) return;
    setIsResending(true);
    setResendStatus(null);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: emailSentNotice,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });
      if (error) throw error;
      setResendStatus('Tautan konfirmasi baru berhasil dikirim ulang ke inbox/spam email Anda!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengirim ulang email konfirmasi.';
      setResendStatus(msg);
    } finally {
      setIsResending(false);
    }
  };

  // 1. Google OAuth Register Handler (Otomatis deteksi akun Google aktif & langsung terverifikasi)
  const handleGoogleRegister = async () => {
    setErrorMessage(null);
    setEmailSentNotice(null);
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
          queryParams: {
            prompt: 'select_account',
          },
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghubungkan ke akun Google.';
      setErrorMessage(msg);
      setIsGoogleLoading(false);
    }
  };

  // 2. Email & Password Register Handler
  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setEmailSentNotice(null);

    // Validasi form dasar
    if (!fullName.trim()) {
      setErrorMessage('Nama lengkap wajib diisi.');
      fullNameInputRef.current?.focus();
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Alamat email wajib diisi.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password minimal harus 6 karakter.');
      return;
    }

    if (accountType === 'campus' && !nimNip.trim()) {
      setErrorMessage('NIM / NIP wajib diisi untuk verifikasi akun Campus Member.');
      return;
    }

    setIsLoading(true);

    try {
      // Siapkan metadata pengguna sesuai SYSTEM_FLOW.md
      const isVerified = accountType === 'campus' && nimNip.trim().length > 0;
      const userMetadata = {
        nama_lengkap: fullName.trim(),
        tipe_akun: accountType,
        universitas: accountType === 'campus' ? university.trim() : null,
        role_kampus: accountType === 'campus' ? campusRole : null,
        nim_nip: accountType === 'campus' ? nimNip.trim() : null,
        status_kampus_terverifikasi: isVerified,
      };

      // 1. Pendaftaran Langsung via Supabase Auth SignUp (Mengirim Tautan Konfirmasi Email Otomatis)
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: userMetadata,
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered') || signUpError.message.includes('already exists')) {
          throw new Error('Email ini sudah terdaftar. Silakan login ke akun Anda.');
        }

        const isSmtpFailure =
          signUpError.message.toLowerCase().includes('rate limit') ||
          signUpError.message.includes('504') ||
          signUpError.message.toLowerCase().includes('timeout') ||
          signUpError.message.toLowerCase().includes('gateway') ||
          signUpError.message.toLowerCase().includes('connection') ||
          signUpError.message.toLowerCase().includes('failed to send');

        // Jika terjadi kendala SMTP / rate limit / 504 timeout, otomatis fallback daftarkan langsung via database RPC
        if (isSmtpFailure) {
          const { data: rpcData, error: rpcError } = await supabase.rpc('daftar_pengguna_cepat', {
            p_email: email.trim(),
            p_password: password,
            p_nama_lengkap: fullName.trim(),
            p_tipe_akun: accountType,
            p_universitas: accountType === 'campus' ? university.trim() : '',
            p_role_kampus: accountType === 'campus' ? campusRole : '',
            p_nim_nip: accountType === 'campus' ? nimNip.trim() : '',
          });

          if (rpcError) {
            throw new Error('Gagal mendaftarkan akun. Silakan periksa koneksi atau coba beberapa saat lagi.');
          }

          if (rpcData && !rpcData.success) {
            throw new Error(rpcData.message || 'Gagal mendaftarkan akun.');
          }

          // Otomatis login ke sesi yang baru didaftarkan
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password,
          });

          if (signInError) {
            setSuccessMessage('Pendaftaran berhasil! Silakan login dengan email dan password Anda.');
            setTimeout(() => {
              router.push('/login');
            }, 1200);
            return;
          }

          setSuccessMessage('Pendaftaran berhasil! Mengalihkan ke Dashboard...');
          setTimeout(() => {
            router.push('/dashboard');
            router.refresh();
          }, 1000);
          return;
        }

        throw signUpError;
      }

      const user = data.user;

      // Sinkronisasi profil ke tabel profil_pengguna
      if (user) {
        try {
          await supabase.from('profil_pengguna').upsert({
            id: user.id,
            nama_lengkap: fullName.trim(),
            tipe_akun: accountType,
            universitas: accountType === 'campus' ? university.trim() : null,
            role_kampus: accountType === 'campus' ? campusRole : null,
            nim_nip: accountType === 'campus' ? nimNip.trim() : null,
            status_kampus_terverifikasi: isVerified,
          });
        } catch {
          // Ditangani juga oleh trigger on_auth_user_created
        }
      }

      // Evaluasi apakah sesi langsung aktif atau harus konfirmasi email terlebih dahulu
      if (data.session) {
        setSuccessMessage('Pendaftaran berhasil! Mengalihkan ke Dashboard...');
        setTimeout(() => {
          router.push('/dashboard');
          router.refresh();
        }, 1000);
      } else {
        // Tampilkan layar notifikasi "Periksa Link Konfirmasi di Email"
        setEmailSentNotice(email.trim());
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat pendaftaran.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Fokus atau buka bagian form email
  const handleEmailButtonClick = () => {
    setIsEmailFormOpen(true);
    setTimeout(() => {
      fullNameInputRef.current?.focus();
      fullNameInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center p-3 sm:p-6 lg:p-10 font-sans">
      {/* Main Card Container */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-5xl flex overflow-hidden min-h-[640px]">
        {/* Left Side: Auth Banner */}
        <AuthBanner />

        {/* Right Side: Register Form */}
        <div className="flex-1 p-6 sm:p-8 lg:p-10 flex flex-col justify-between overflow-y-auto max-h-[92vh]">
          <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-center">


            {/* Header Title */}
            <div className="text-center mb-5">
              <h1 className="text-2xl sm:text-[26px] font-bold text-gray-900 tracking-tight">
                Buat Akun Baru
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 mt-1 font-normal">
                Daftar akun Findly Anda dengan mudah
              </p>
            </div>

            {/* Notice Konfirmasi Email */}
            {emailSentNotice ? (
              <div className="bg-[#EFF8FF] border border-[#BFDBFE] rounded-3xl p-6 text-center space-y-4 my-4 animate-in fade-in zoom-in duration-300 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-[#30AFFF] text-white flex items-center justify-center mx-auto shadow-sm">
                  <Mail size={26} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                    Kami telah mengirimkan tautan konfirmasi ke email Anda
                  </h3>
                  <div>
                    <span className="font-bold text-[#0284C7] bg-white px-3 py-1.5 rounded-xl border border-[#BFDBFE]/60 inline-block text-xs">
                      {emailSentNotice}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Silakan periksa inbox atau folder spam email Anda untuk mengaktifkan akun.
                  </p>
                </div>

                {resendStatus && (
                  <div className="p-2.5 bg-white border border-[#BFDBFE] text-[#0284C7] rounded-xl text-xs font-medium">
                    {resendStatus}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="button"
                    disabled={isResending}
                    onClick={handleResendVerification}
                    className="w-full bg-[#30AFFF] hover:bg-[#2196E8] text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isResending ? 'Mengirim ulang...' : 'Kirim Ulang Link'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Error Alert */}
                {errorMessage && (
                  <div className="mb-4 p-3.5 bg-red-50/80 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2.5 leading-relaxed animate-in fade-in duration-200">
                    <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
                    <div className="flex-1">
                      <p>{errorMessage}</p>
                    </div>
                  </div>
                )}

                {/* Success Alert */}
                {successMessage && (
                  <div className="mb-4 p-3.5 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="shrink-0 text-green-600" />
                    <span>{successMessage}</span>
                  </div>
                )}

                {/* Social Login Buttons (Google & Email) */}
                <SocialButtons
                  actionLabel="Daftar"
                  isLoading={isLoading}
                  isGoogleLoading={isGoogleLoading}
                  onGoogleLogin={handleGoogleRegister}
                  onEmailClick={handleEmailButtonClick}
                />


                {/* Divider 'or' */}
                <div className="relative my-4 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100" />
                  </div>
                  <span className="relative bg-white px-3 text-xs text-gray-400 select-none">
                    or
                  </span>
                </div>

                {/* Form Pendaftaran dengan Email */}
                <div ref={formContainerRef} className="space-y-4">
                  {/* Selector Tipe Akun (Campus Member vs Community Member) */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Pilih Tipe Keanggotaan
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {/* Option 1: Campus Member */}
                      <button
                        type="button"
                        onClick={() => setAccountType('campus')}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between relative ${accountType === 'campus'
                          ? 'border-[#30AFFF] bg-[#EFF8FF] ring-2 ring-[#30AFFF]/20 shadow-2xs'
                          : 'border-gray-200 bg-white hover:bg-gray-50/80 text-gray-600'
                          }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <GraduationCap
                            size={18}
                            className={accountType === 'campus' ? 'text-[#30AFFF]' : 'text-gray-400'}
                          />
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${accountType === 'campus'
                              ? 'bg-[#30AFFF] text-white'
                              : 'bg-gray-100 text-gray-500'
                              }`}
                          >
                            ✓ Verified
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">Campus Member</p>
                          <p className="text-[11px] text-gray-500 line-clamp-1">
                            Mahasiswa, Dosen, Staff
                          </p>
                        </div>
                      </button>

                      {/* Option 2: Community Member */}
                      <button
                        type="button"
                        onClick={() => setAccountType('community')}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between relative ${accountType === 'community'
                          ? 'border-[#30AFFF] bg-[#EFF8FF] ring-2 ring-[#30AFFF]/20 shadow-2xs'
                          : 'border-gray-200 bg-white hover:bg-gray-50/80 text-gray-600'
                          }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <Users
                            size={18}
                            className={accountType === 'community' ? 'text-[#30AFFF]' : 'text-gray-400'}
                          />
                          <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md">
                            Publik
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">Community Member</p>
                          <p className="text-[11px] text-gray-500 line-clamp-1">
                            Masyarakat / Tamu
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Formulir Lengkap */}
                  <form onSubmit={handleEmailRegister} className="space-y-3">
                    {/* Nama Lengkap */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Nama Lengkap <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          ref={fullNameInputRef}
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Contoh: Budi Pratama"
                          className="w-full px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 placeholder-gray-400 border border-gray-200 rounded-xl focus:outline-none focus:border-[#30AFFF] focus:ring-2 focus:ring-[#30AFFF]/20 transition-all pr-10"
                        />
                        <User
                          size={17}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none stroke-[1.75]"
                        />
                      </div>
                    </div>

                    {/* Khusus Campus Member: Universitas, Peran Kampus, NIM/NIP */}
                    {accountType === 'campus' && (
                      <div className="p-3 bg-gray-50/70 rounded-2xl border border-gray-100 space-y-3">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#30AFFF]">
                          <Sparkles size={13} />
                          <span>Identitas Kampus untuk Badge Terverifikasi</span>
                        </div>

                        {/* Asal Universitas */}
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                            Asal Universitas
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={university}
                              onChange={(e) => setUniversity(e.target.value)}
                              placeholder="Nama Universitas Anda"
                              className="w-full px-3 py-2 text-xs text-gray-800 placeholder-gray-400 border border-gray-200 bg-white rounded-lg focus:outline-none focus:border-[#30AFFF] focus:ring-2 focus:ring-[#30AFFF]/20 transition-all pr-9"
                            />
                            <Building2
                              size={15}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                            />
                          </div>
                        </div>

                        {/* Peran Kampus & NIM Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {/* Role Kampus */}
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                              Peran di Kampus
                            </label>
                            <select
                              value={campusRole}
                              onChange={(e) => setCampusRole(e.target.value as CampusRole)}
                              className="w-full px-2.5 py-2 text-xs text-gray-800 border border-gray-200 bg-white rounded-lg focus:outline-none focus:border-[#30AFFF] focus:ring-2 focus:ring-[#30AFFF]/20 transition-all cursor-pointer"
                            >
                              <option value="mahasiswa">Mahasiswa</option>
                              <option value="dosen">Dosen</option>
                              <option value="staff">Tenaga Kependidikan / Staff</option>
                            </select>
                          </div>

                          {/* NIM / NIP */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-[11px] font-semibold text-gray-700">
                                NIM / NIP / NoBP <span className="text-red-500">*</span>
                              </label>
                              {nimError && (
                                <span className="text-[10px] font-bold text-rose-500 flex items-center gap-0.5 animate-in fade-in">
                                  Hanya angka
                                </span>
                              )}
                            </div>
                            <div className="relative">
                              <input
                                type="text"
                                inputMode="numeric"
                                required
                                value={nimNip}
                                onKeyDown={(e) => {
                                  if (
                                    ['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', 'Home', 'End'].includes(e.key) ||
                                    e.ctrlKey || e.metaKey || e.altKey
                                  ) return;
                                  if (!/^\d$/.test(e.key)) {
                                    e.preventDefault();
                                    setNimError(true);
                                    setTimeout(() => setNimError(false), 2200);
                                  }
                                }}
                                onChange={(e) => {
                                  if (/[^\d]/.test(e.target.value)) {
                                    setNimError(true);
                                    setTimeout(() => setNimError(false), 2200);
                                  }
                                  setNimNip(e.target.value.replace(/\D/g, ''));
                                }}
                                placeholder="Nomor Induk (Angka)"
                                className={`w-full px-2.5 py-2 text-xs text-gray-800 placeholder-gray-400 border rounded-lg focus:outline-none transition-all pr-8 font-mono ${
                                  nimError
                                    ? 'border-rose-400 ring-2 ring-rose-100 bg-rose-50/20'
                                    : 'border-gray-200 bg-white focus:border-[#30AFFF] focus:ring-2 focus:ring-[#30AFFF]/20'
                                }`}
                              />
                              <IdCard
                                size={15}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                          <Info size={12} className="shrink-0 text-gray-400" />
                          <span>NIM hanya digunakan untuk verifikasi badge dan disensor di publik.</span>
                        </div>
                      </div>
                    )}

                    {/* Email Input */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-gray-700">
                          Email Aktif <span className="text-red-500">*</span>
                        </label>
                        {!email.includes('@') && email.trim().length > 0 && (
                          <button
                            type="button"
                            onClick={() => setEmail((prev) => `${prev.trim()}@gmail.com`)}
                            className="text-[10px] font-semibold text-[#4285F4] hover:underline bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 cursor-pointer"
                          >
                            + Tambah @gmail.com
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          ref={emailInputRef}
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="nama@email.com atau @kampus.ac.id"
                          className="w-full px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 placeholder-gray-400 border border-gray-200 rounded-xl focus:outline-none focus:border-[#30AFFF] focus:ring-2 focus:ring-[#30AFFF]/20 transition-all pr-10"
                        />
                        <Mail
                          size={17}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none stroke-[1.75]"
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Buat Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Minimal 6 karakter"
                          className="w-full px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 placeholder-gray-400 border border-gray-200 rounded-xl focus:outline-none focus:border-[#30AFFF] focus:ring-2 focus:ring-[#30AFFF]/20 transition-all pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                          aria-label="Toggle password visibility"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading || isGoogleLoading}
                      className="w-full bg-[#30AFFF] hover:bg-[#2196E8] active:bg-[#1A85D6] text-white font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed mt-3"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          <span>Mendaftarkan Akun...</span>
                        </>
                      ) : (
                        <span>
                          Daftar sebagai {accountType === 'campus' ? 'Campus Member' : 'Community Member'}
                        </span>
                      )}
                    </button>
                  </form>
                </div>

                {/* Switch to Login */}
                <div className="text-center mt-4 text-xs text-gray-500">
                  Sudah punya akun?{' '}
                  <Link
                    href="/login"
                    className="text-[#30AFFF] font-semibold hover:underline"
                  >
                    Login di sini
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Footer Legal Links */}
          <div className="flex items-center justify-center gap-6 pt-5 text-[11px] text-gray-400 border-t border-gray-50 mt-4">
            <Link href="/privacy" className="hover:text-gray-600 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-gray-600 transition-colors">
              Terms of Service
            </Link>
            <Link href="/help" className="hover:text-gray-600 transition-colors">
              Bantuan
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center p-4 text-xs text-gray-500">Memuat formulir...</div>}>
      <RegisterFormContent />
    </Suspense>
  );
}
