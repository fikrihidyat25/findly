'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import AuthBanner from '@/src/components/auth/AuthBanner';
import SocialButtons from '@/src/components/auth/SocialButtons';
import { createClient } from '@/src/lib/supabase/client';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const emailInputRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showResendConfirm, setShowResendConfirm] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    const verifiedParam = searchParams.get('verified');
    const emailParam = searchParams.get('email');

    if (emailParam) {
      setEmail(emailParam);
    }

    if (verifiedParam === 'true') {
      setSuccessMessage('Email Anda telah berhasil dikonfirmasi! Silakan masukkan kata sandi untuk masuk.');
      setErrorMessage(null);
      return;
    }

    if (errorParam) {
      const decoded = decodeURIComponent(errorParam);
      const lower = decoded.toLowerCase();
      if (lower.includes('pkce') || lower.includes('code verifier') || lower.includes('storage')) {
        // Tautan konfirmasi email sebenarnya sudah mengaktifkan akun di Supabase!
        setSuccessMessage('Email Anda telah berhasil dikonfirmasi! Silakan masukkan kata sandi untuk masuk.');
        setErrorMessage(null);
      } else if (errorParam === 'auth_callback_failed') {
        setErrorMessage('Gagal memproses sesi otentikasi. Silakan coba login kembali.');
      } else {
        setErrorMessage(decoded);
      }
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setResendStatus(null);
    setShowResendConfirm(false);
    setIsLoading(true);

    try {
      if (email && password) {
        const cleanEmail = email.trim();
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          const msg = error.message.toLowerCase();
          if (msg.includes('email not confirmed')) {
            setErrorMessage('Email Anda belum dikonfirmasi. Silakan periksa inbox atau folder spam di Gmail Anda dan klik tautan konfirmasi dari Supabase.');
            setShowResendConfirm(true);
            return;
          }
          if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
            // Cek ke database apakah email ini sebenarnya belum ada di database
            let emailExists: boolean | null = null;

            // 1. Coba RPC cek_email_terdaftar (mencari ke auth.users)
            try {
              const { data: exists, error: rpcErr } = await supabase.rpc('cek_email_terdaftar', {
                p_email: cleanEmail,
              });
              if (!rpcErr && typeof exists === 'boolean') {
                emailExists = exists;
              }
            } catch {
              // RPC belum dibuat di Supabase
            }

            // 2. Fallback: cek ke profil_pengguna
            if (emailExists === null) {
              try {
                const { data: profile } = await supabase
                  .from('profil_pengguna')
                  .select('id')
                  .ilike('email', cleanEmail)
                  .maybeSingle();

                if (profile) {
                  emailExists = true;
                }
              } catch {
                // Kolom belum ada
              }
            }

            if (emailExists === false) {
              setErrorMessage('Email ini belum terdaftar di database Findly.');
            } else if (emailExists === true) {
              setErrorMessage('Kata sandi yang Anda masukkan salah.');
            } else {
              setErrorMessage('Email atau kata sandi yang Anda masukkan salah.');
            }
            return;
          }
          if (msg.includes('querying schema')) {
            setErrorMessage('Akun ini tersimpan dengan token belum sinkron di database Supabase. Silakan jalankan query perbaikan di SQL Editor Supabase.');
            return;
          }
          setErrorMessage(error.message);
          return;
        }

        if (data.session) {
          const redirect = searchParams.get('redirect') || '/dashboard';
          router.push(redirect);
          router.refresh();
          return;
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat login.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email.trim()) {
      setErrorMessage('Silakan ketik email Anda pada kolom di bawah.');
      return;
    }
    setIsResending(true);
    setResendStatus(null);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
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

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleOAuthLogin = async (provider: 'google') => {
    setErrorMessage(null);
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

  const focusEmailInput = () => {
    emailInputRef.current?.focus();
    emailInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center p-3 sm:p-6 lg:p-10 font-sans">
      {/* Main Card Container */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-5xl flex overflow-hidden min-h-[640px]">
        {/* Left Side: Gradient Banner with Box Graphic */}
        <AuthBanner />

        {/* Right Side: Login Form */}
        <div className="flex-1 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
          <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-center">
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Welcome back!
              </h1>
              <p className="text-xs text-gray-400 mt-1 font-normal">
                Login to your Findly account
              </p>
            </div>

            {/* Success Notification (Setelah konfirmasi email berhasil) */}
            {successMessage && (
              <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600" />
                <span className="leading-relaxed font-medium">{successMessage}</span>
              </div>
            )}

            {/* Error Notification */}
            {errorMessage && (
              <div className="mb-4 p-3.5 bg-red-50/90 border border-red-200 text-red-700 rounded-xl text-xs space-y-2 animate-in fade-in duration-200">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
                {showResendConfirm && (
                  <div className="pt-1 border-t border-red-200/60 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      disabled={isResending}
                      onClick={handleResendConfirmation}
                      className="font-bold text-[#0284C7] hover:underline cursor-pointer text-[11px]"
                    >
                      {isResending ? 'Mengirim ulang...' : '✉️ Kirim Ulang Link Konfirmasi ke Gmail'}
                    </button>
                    {resendStatus && (
                      <span className="text-[10px] text-emerald-700 font-semibold">{resendStatus}</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Social Logins */}
            <SocialButtons
              actionLabel="Masuk"
              isLoading={isLoading}
              isGoogleLoading={isGoogleLoading}
              onGoogleLogin={() => handleOAuthLogin('google')}
              onEmailClick={focusEmailInput}
            />

            {/* Divider */}
            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <span className="relative bg-white px-3 text-xs text-gray-400">
                or
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-3.5">
              {/* Email */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-gray-700">
                    Email
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Masukkan email Anda"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 placeholder-gray-400 border border-gray-200 rounded-xl focus:outline-none focus:border-[#30AFFF] focus:ring-2 focus:ring-[#30AFFF]/20 transition-all pr-10"
                  />
                  <Mail
                    size={17}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none stroke-[1.75]"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-gray-700">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-[#30AFFF] hover:underline font-medium"
                  >
                    Lupa password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password Anda"
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

              {/* Remember Me Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/30 cursor-pointer accent-primary"
                />
                <label
                  htmlFor="rememberMe"
                  className="text-xs text-gray-500 cursor-pointer select-none"
                >
                  Ingat saya
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-2.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-60 mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <span>Masuk</span>
                )}
              </button>
            </form>

            {/* Switch to Register */}
            <div className="text-center mt-5 text-xs text-gray-500">
              Don&apos;t have an account?{' '}
              <Link
                href={email.trim() ? `/register?email=${encodeURIComponent(email.trim())}` : '/register'}
                className="text-primary font-semibold hover:underline"
              >
                Daftar
              </Link>
            </div>
          </div>

          {/* Footer Legal Links */}
          <div className="flex items-center justify-center gap-6 pt-6 text-[11px] text-gray-400">
            <Link href="/privacy" className="hover:text-gray-600 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-gray-600 transition-colors">
              Term of Service
            </Link>
            <Link href="/help" className="hover:text-gray-600 transition-colors">
              Help Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center p-4">Memuat...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
