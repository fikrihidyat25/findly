

'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Info
} from 'lucide-react';
import AuthBanner from '@/src/components/auth/AuthBanner';
import SocialButtons from '@/src/components/auth/SocialButtons';
import { createClient } from '@/src/lib/supabase/client';

type AccountType = 'campus' | 'community';
type CampusRole = 'mahasiswa' | 'dosen' | 'staff';

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const formContainerRef = useRef<HTMLDivElement>(null);
  const fullNameInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [accountType, setAccountType] = useState<AccountType>('campus');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [university, setUniversity] = useState('Universitas Bung Hatta');
  const [campusRole, setCampusRole] = useState<CampusRole>('mahasiswa');
  const [nimNip, setNimNip] = useState('');

  // UI & Loading State
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isEmailFormOpen, setIsEmailFormOpen] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [emailSentNotice, setEmailSentNotice] = useState<string | null>(null);

  // 1. Google OAuth Register Handler
  const handleGoogleRegister = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);
    setEmailSentNotice(null);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        // Cek jika Google provider belum diaktifkan di Supabase dashboard
        if (error.message.includes('not enabled') || error.message.includes('Unsupported provider')) {
          setErrorMessage(
            'Google OAuth belum diaktifkan di dashboard Supabase (Authentication > Providers > Google). Silakan gunakan formulir pendaftaran Email di bawah ini.'
          );
        } else {
          setErrorMessage(`Google OAuth error: ${error.message}`);
        }
        setIsGoogleLoading(false);
        return;
      }

      // Jika URL OAuth tersedia, browser akan otomatis redirect
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan pada Google OAuth.';
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

      // 1. Coba pendaftaran cepat via RPC (langsung aktif bebas rate limit email)
      let rpcHandled = false;
      try {
        const { data: rpcRes, error: rpcErr } = await supabase.rpc('daftar_pengguna_cepat', {
          p_email: email.trim(),
          p_password: password,
          p_nama_lengkap: fullName.trim(),
          p_tipe_akun: accountType,
          p_universitas: accountType === 'campus' ? university.trim() : null,
          p_role_kampus: accountType === 'campus' ? campusRole : null,
          p_nim_nip: accountType === 'campus' ? nimNip.trim() : '',
        });

        if (!rpcErr && rpcRes?.success) {
          rpcHandled = true;
          // Langsung login otomatis
          const { error: signInErr } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password,
          });

          if (!signInErr) {
            setSuccessMessage('Pendaftaran berhasil! Mengalihkan ke Dashboard...');
            setTimeout(() => {
              router.push('/dashboard');
              router.refresh();
            }, 800);
            return;
          }
        } else if (rpcRes && !rpcRes.success) {
          throw new Error(rpcRes.message || 'Pendaftaran gagal.');
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.message.includes('terdaftar')) {
          throw err;
        }
        // Jika RPC belum ada di database, lanjut ke alur standar signUp
      }

      if (!rpcHandled) {
        // 2. Alur Standar Supabase Auth SignUp
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: userMetadata,
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
          },
        });

        if (signUpError) {
          if (signUpError.message.includes('already registered')) {
            throw new Error('Email ini sudah terdaftar. Silakan login ke akun Anda.');
          }
          if (signUpError.message.includes('rate limit')) {
            throw new Error('Batas pengiriman email Supabase tercapai (rate limit). Silakan matikan "Confirm email" di Supabase atau klik tombol di bawah untuk langsung masuk ke Dashboard.');
          }
          throw signUpError;
        }

        const user = data.user;

        // Upayakan insert/upsert langsung ke tabel profil_pengguna
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
            // Abaikan jika ditangani oleh trigger
          }
        }

        // Evaluasi sesi
        if (data.session) {
          setSuccessMessage('Pendaftaran berhasil! Mengalihkan ke Dashboard...');
          setTimeout(() => {
            router.push('/dashboard');
            router.refresh();
          }, 1000);
        } else {
          setEmailSentNotice(email.trim());
        }
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
            {/* Back to Login Link */}
            <div className="mb-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Kembali ke login</span>
              </Link>
            </div>

            {/* Header Title */}
            <div className="text-center mb-5">
              <h1 className="text-2xl sm:text-[26px] font-bold text-gray-900 tracking-tight">
                Buat Akun Baru
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 mt-1 font-normal">
                Daftar akun Findly Anda dengan mudah
              </p>
            </div>

            {/* Notice Konfirmasi Email (Jika Email Verification Aktif di Supabase) */}
            {emailSentNotice ? (
              <div className="bg-[#EFF8FF] border border-[#BFDBFE] rounded-2xl p-5 text-center space-y-3 my-4 animate-in fade-in zoom-in duration-300">
                <div className="w-12 h-12 rounded-full bg-[#30AFFF] text-white flex items-center justify-center mx-auto shadow-sm">
                  <Mail size={22} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900">
                    Verifikasi Email Anda
                  </h3>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    Tautan konfirmasi telah dikirim ke{' '}
                    <span className="font-semibold text-gray-900">{emailSentNotice}</span>. Silakan
                    periksa inbox atau folder spam untuk mengaktifkan akun Findly Anda.
                  </p>
                </div>
                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    href="/login"
                    className="w-full bg-[#30AFFF] hover:bg-[#2196E8] text-white text-xs font-medium py-2.5 px-4 rounded-xl transition-all block"
                  >
                    Buka Halaman Login
                  </Link>
                  <button
                    type="button"
                    onClick={() => setEmailSentNotice(null)}
                    className="text-xs text-gray-500 hover:text-gray-700 underline"
                  >
                    Daftar dengan email lain
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Error Alert */}
                {errorMessage && (
                  <div className="mb-4 p-3.5 bg-red-50/80 border border-red-200 text-red-700 rounded-xl text-xs flex flex-col gap-2.5 leading-relaxed animate-in fade-in duration-200">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
                      <div className="flex-1">
                        <p>{errorMessage}</p>
                      </div>
                    </div>
                    {errorMessage.includes('rate limit') && (
                      <button
                        type="button"
                        onClick={() => {
                          router.push('/dashboard');
                          router.refresh();
                        }}
                        className="mt-1 bg-[#30AFFF] hover:bg-[#2196E8] text-white text-xs font-semibold py-2 px-3 rounded-lg shadow-sm w-full text-center transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>🚀 Lewati & Masuk Langsung ke Dashboard (Mode Demo)</span>
                      </button>
                    )}
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
                  isEmailActive={isEmailFormOpen}
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
                            <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                              NIM / NIP / NoBP <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                required
                                value={nimNip}
                                onChange={(e) => setNimNip(e.target.value)}
                                placeholder="Nomor Induk"
                                className="w-full px-2.5 py-2 text-xs text-gray-800 placeholder-gray-400 border border-gray-200 bg-white rounded-lg focus:outline-none focus:border-[#30AFFF] focus:ring-2 focus:ring-[#30AFFF]/20 transition-all pr-8"
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
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
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
                        Password <span className="text-red-500">*</span>
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
                        <>
                          <span>
                            Daftar sebagai {accountType === 'campus' ? 'Campus Member' : 'Community Member'}
                          </span>
                          <ArrowRight size={15} />
                        </>
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
