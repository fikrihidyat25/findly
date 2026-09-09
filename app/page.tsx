'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
<<<<<<< HEAD
import Image from 'next/image';
import {
  Search,
  ShieldCheck,
  Users,
  Menu,
  X,
  MapPin,
  Clock,
  Lock,
  PackageSearch,
  Briefcase,
  Smartphone,
  Wallet,
  CreditCard,
  KeyRound,
  BookOpen,
} from 'lucide-react';
import { createClient } from '@/src/lib/supabase/client';

interface PreviewItem {
  id: string;
  title: string;
  type: 'lost' | 'found';
  category: string;
  location: string;
  timeAgo: string;
  description: string;
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
      return `${diffMins} menit lalu`;
    }
    if (diffHours < 24) {
      return `${diffHours} jam lalu`;
    }
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} hari lalu`;
  } catch {
    return 'Baru saja';
  }
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [previewItems, setPreviewItems] = useState<PreviewItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);

  useEffect(() => {
    async function loadItems() {
      setLoadingItems(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('laporan_barang')
          .select('*')
          .order('dibuat_pada', { ascending: false })
          .limit(6);

        if (!error && data) {
          const mapped: PreviewItem[] = data.map((row: any) => {
            const isFound = row.jenis_laporan === 'DITEMUKAN';
            const cat = row.kategori || 'Barang Kampus';
            return {
              id: row.id,
              title: row.nama_barang,
              type: isFound ? 'found' : 'lost',
              category: cat,
              location: row.lokasi_terakhir || 'Lingkungan Kampus',
              timeAgo: formatRelativeTime(row.dibuat_pada),
              description: row.deskripsi || '',
              icon: getCategoryIcon(cat),
              colorScheme: getColorScheme(isFound ? 'found' : 'lost'),
            };
          });
          setPreviewItems(mapped);
        }
      } catch (err) {
        console.error('Error loading landing items:', err);
      } finally {
        setLoadingItems(false);
      }
    }

    loadItems();
  }, []);

  const scrollToFindItems = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('find-items');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };


  return (
    <div className="min-h-screen bg-white font-sans flex flex-col selection:bg-[#30AFFF]/20 selection:text-[#30AFFF]">
      {/* Header / Navbar */}
      <header className="w-full max-w-[1300px] mx-auto px-6 sm:px-10 lg:px-12 py-5 flex items-center justify-between relative z-30">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center group">
          <span className="text-2xl font-black tracking-tight text-[#30AFFF] group-hover:opacity-85 transition-opacity">
            Findly.
          </span>
        </Link>

        {/* Center Navigation Links - Home has active hover indicator */}
        <nav className="hidden md:flex items-center gap-9 text-sm font-medium">
          <div className="border-b-2 border-[#30AFFF] pb-0.5">
            <Link href="/" className="text-[#30AFFF] font-semibold">
              Home
            </Link>
          </div>
          <button
            onClick={scrollToFindItems}
            className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          >
            Find Items
          </button>
          <Link
            href="/login?redirect=/lost/new"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Saya Kehilangan
          </Link>
          <Link
            href="/login?redirect=/found/new"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Saya Menemukan
          </Link>
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden md:flex items-center gap-5">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors px-2 py-1"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="bg-[#30AFFF] hover:bg-[#2196e8] text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors shadow-sm"
          >
            Sign Up
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden flex items-center justify-center p-2 rounded-xl text-gray-700 hover:text-[#30AFFF] hover:bg-[#EFF8FF] transition-colors cursor-pointer min-w-[42px] min-h-[42px]"
          aria-label="Buka Menu"
        >
          <Menu size={24} />
        </button>
      </header>

      <main className="flex-grow flex flex-col">
        {/* Hero Section */}
        <section className="w-full max-w-[1300px] mx-auto px-6 sm:px-10 lg:px-12 pt-6 pb-16 lg:pt-10 lg:pb-24 grid md:grid-cols-12 gap-8 lg:gap-8 items-center">
          <div className="md:col-span-7 lg:col-span-7 space-y-6">
            <h1 className="text-3xl sm:text-[34px] lg:text-[36px] xl:text-[38px] font-bold text-gray-900 leading-[1.25] tracking-tight">
              <span className="block md:whitespace-nowrap">Menemukan Barang Lebih Mudah,</span>
              <span className="block">Mengembalikan Lebih Bermakna.</span>
            </h1>
            <p className="text-gray-500 text-sm sm:text-base leading-relaxed max-w-lg">
              Findly menghubungkan orang-orang kehilangan dengan penemu barang secara transparan, aman, dan tanpa biaya.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <Link
                href="/login?redirect=/claim/new"
                className="bg-[#30AFFF] hover:bg-[#2196e8] text-white font-medium text-sm px-6 py-2.5 rounded-lg transition-colors shadow-sm"
              >
                Ajukan Klaim
              </Link>
              <Link
                href="/login?redirect=/lost/new"
                className="border border-[#30AFFF] text-[#30AFFF] hover:bg-blue-50/60 font-medium text-sm px-6 py-2.5 rounded-lg transition-colors"
              >
                Laporkan Barang
              </Link>
            </div>
          </div>

          <div className="md:col-span-5 lg:col-span-5 flex justify-center md:justify-end items-center">
            <div className="w-full max-w-[520px] flex items-center justify-center">
              <Image
                src="/hero-illustration-clean.png"
                alt="Findly Lost and Found Platform"
                width={600}
                height={460}
                priority
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-[#EEF7FF] w-full">
          <div className="max-w-[1300px] mx-auto px-6 sm:px-10 lg:px-12 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-[#30AFFF] tracking-tight">2,345</div>
                <div className="text-xs font-semibold text-gray-600 mt-1">Barang Ditemukan</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-[#30AFFF] tracking-tight">1,875</div>
                <div className="text-xs font-semibold text-gray-600 mt-1">Pengguna Aktif</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-[#30AFFF] tracking-tight">98%</div>
                <div className="text-xs font-semibold text-gray-600 mt-1">Tingkat Keberhasilan</div>
              </div>
            </div>
          </div>
        </section>

        {/* Find Items Preview Section (Directly on Landing Page) */}
        <section id="find-items" className="w-full max-w-[1300px] mx-auto px-6 sm:px-10 lg:px-12 py-16 lg:py-20 scroll-mt-10">
          <div className="mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0284C7] text-xs font-semibold mb-3 border border-blue-100">
              <Search size={13} />
              <span>Katalog Terdaftar di Kampus</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Barang Terbaru yang Dilaporkan
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
              Pratinjau barang temuan dan kehilangan di lingkungan kampus. Masuk untuk melihat detail lengkap atau mengajukan klaim.
            </p>
          </div>

          {/* Items Grid or Empty State */}
          {loadingItems ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3 animate-pulse">
                  <div className="h-32 bg-gray-100 rounded-xl" />
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                  <div className="h-5 bg-gray-100 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : previewItems.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center space-y-4 shadow-2xs max-w-xl mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#30AFFF] flex items-center justify-center mx-auto">
                <PackageSearch size={28} />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-gray-900">Belum Ada Laporan Terdaftar</h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                  Belum ada data barang hilang atau temuan di database. Masuk ke akun Anda untuk mendaftarkan barang pertama.
                </p>
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <Link
                  href="/login?redirect=/lost/new"
                  className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors"
                >
                  Lapor Kehilangan
                </Link>
                <Link
                  href="/login?redirect=/found/new"
                  className="px-4 py-2 rounded-xl bg-[#30AFFF] hover:bg-[#2196e8] text-white text-xs font-semibold shadow-2xs transition-colors"
                >
                  Lapor Temuan
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {previewItems.map((item) => {
                const Icon = item.icon;
                const isLost = item.type === 'lost';

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                  >
                    {/* Visual Thumbnail */}
                    <div
                      className={`relative w-full h-36 ${item.colorScheme.bg} border-b ${item.colorScheme.border} flex items-center justify-center`}
                    >
                      {/* Status Badge */}
                      <div className="absolute top-3 left-3 z-10">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${isLost
                              ? 'bg-rose-500 text-white border-rose-600'
                              : 'bg-emerald-500 text-white border-emerald-600'
                            }`}
                        >
                          {isLost ? 'Hilang' : 'Ditemukan'}
                        </span>
                      </div>

                      {/* Locked Preview Badge */}
                      <div className="absolute top-3 right-3 z-10">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/90 text-gray-600 shadow-2xs backdrop-blur-xs">
                          <Lock size={10} />
                          <span>Pratinjau</span>
                        </span>
                      </div>

                      <div className={`w-14 h-14 rounded-2xl bg-white/90 shadow-2xs flex items-center justify-center ${item.colorScheme.text}`}>
                        <Icon size={28} className="stroke-[1.75]" />
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                          {item.category}
                        </span>
                        <h3 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-[#30AFFF] transition-colors line-clamp-1 mt-0.5">
                          {item.title}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                          {item.description || 'Tidak ada deskripsi publik tambahan.'}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-gray-50 space-y-1 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin size={12} className="text-gray-400 shrink-0" />
                          <span className="truncate">{item.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                          <Clock size={11} className="shrink-0" />
                          <span>{item.timeAgo}</span>
                        </div>
                      </div>

                      {/* Action Button - Redirects to Login with redirect target */}
                      <div className="pt-2">
                        <Link
                          href={`/login?redirect=/find/${item.id}`}
                          className="w-full inline-flex items-center justify-center py-2 px-3 rounded-xl bg-[#30AFFF] hover:bg-[#2196e8] text-white text-xs font-semibold transition-all shadow-2xs"
                        >
                          {item.type === 'found' ? 'Login untuk Ajukan Klaim' : 'Login untuk Lihat Detail'}
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}


        </section>

        {/* Features Section */}
        <section className="w-full max-w-[1300px] mx-auto px-6 sm:px-10 lg:px-12 py-16 lg:py-20 text-center border-t border-gray-100">
          <div className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2.5">Fitur Utama</h2>
            <p className="text-gray-500 text-sm">Nikmati kemudahan pelaporan dan pencarian yang terstruktur.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Feature 1 */}
            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#EFF8FF] flex items-center justify-center shrink-0">
                <Users className="text-[#30AFFF]" size={22} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">Komunitas Peduli</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Dibangun dari rasa gotong royong masyarakat untuk saling peduli barang sesama.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#EFF8FF] flex items-center justify-center shrink-0">
                <ShieldCheck className="text-[#30AFFF]" size={22} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">Verifikasi Aman</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Setiap pengajuan klaim diverifikasi dengan ketat demi menghindari penipuan.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#EFF8FF] flex items-center justify-center shrink-0">
                <Search className="text-[#30AFFF]" size={22} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">Mudah Digunakan</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Sistem pencarian dan filter cepat sesuai dengan kebutuhan penemuan Anda.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-gray-100 bg-white">
        <div className="max-w-[1300px] mx-auto px-6 sm:px-10 lg:px-12 pt-14 pb-10">
          <div className="flex flex-col md:flex-row justify-between gap-10 mb-14">
            <div className="max-w-xs">
              <div className="flex items-center mb-4">
                <span className="text-2xl font-black tracking-tight text-[#30AFFF]">
                  Findly.
                </span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                Membantu mengembalikan barang berharga yang hilang ke pemiliknya dengan verifikasi yang terpercaya dan aman.
              </p>
            </div>

            <div className="flex gap-16 md:gap-24">
              <div>
                <h4 className="font-bold text-gray-900 mb-4 text-sm">Layanan</h4>
                <ul className="space-y-3 text-sm text-gray-500">
                  <li><Link href="/login?redirect=/find" className="hover:text-[#30AFFF] transition-colors">Cari Barang</Link></li>
                  <li><Link href="/login?redirect=/lost/new" className="hover:text-[#30AFFF] transition-colors">Laporkan Barang</Link></li>
                  <li><Link href="/login?redirect=/claim/new" className="hover:text-[#30AFFF] transition-colors">Klaim Kepemilikan</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-4 text-sm">Perusahaan</h4>
                <ul className="space-y-3 text-sm text-gray-500">
                  <li><Link href="/about" className="hover:text-[#30AFFF] transition-colors">Tentang Kami</Link></li>
                  <li><Link href="/contact" className="hover:text-[#30AFFF] transition-colors">Hubungi Kami</Link></li>
                  <li><Link href="/terms" className="hover:text-[#30AFFF] transition-colors">Syarat & Ketentuan</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400">
            <div>© 2026 Findly Inc. Hak Cipta Dilindungi.</div>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:text-gray-600 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-gray-600 transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Drawer Backdrop */}
      <div
        onClick={() => setMobileMenuOpen(false)}
        className={`fixed inset-0 bg-black/50 backdrop-blur-xs z-[100] md:hidden transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        aria-hidden="true"
      />

      {/* Mobile Drawer Panel */}
      <div
        className={`fixed inset-y-0 right-0 w-72 max-w-[85vw] bg-white z-[101] p-6 flex flex-col justify-between shadow-2xl md:hidden transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu Navigasi Mobile"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center">
              <span className="text-2xl font-black tracking-tight text-[#30AFFF]">
                Findly.
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Tutup menu"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#30AFFF] bg-[#EFF8FF] transition-colors"
            >
              Home (Beranda)
            </Link>
            <button
              onClick={scrollToFindItems}
              className="w-full text-left block px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Find Items
            </button>
            <Link
              href="/login?redirect=/lost/new"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Saya Kehilangan Barang
            </Link>
            <Link
              href="/login?redirect=/found/new"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Saya Menemukan Barang
            </Link>
          </nav>
        </div>

        <div className="space-y-2.5 pt-6 border-t border-gray-100">
          <Link
            href="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="block w-full text-center py-2.5 px-4 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            onClick={() => setMobileMenuOpen(false)}
            className="block w-full text-center py-2.5 px-4 rounded-xl bg-[#30AFFF] hover:bg-[#2196e8] text-white text-sm font-semibold transition-colors shadow-sm"
          >
            Daftar Akun Baru
          </Link>
        </div>
      </div>
    </div>
=======
import AppLayout from '@/src/components/layout/AppLayout';
import {
  CheckCircle2,
  GraduationCap,
  Mail,
  ShieldCheck,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { createClient } from '@/src/lib/supabase/client';

interface UserProfile {
  id: string;
  nama_lengkap: string;
  email: string;
  tipe_akun: string;
  universitas: string;
  role_kampus: string;
  nim_nip: string;
  status_kampus_terverifikasi: boolean;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFullNIM, setShowFullNIM] = useState(false);
  const [reportsCount, setReportsCount] = useState(0);
  const [resolvedCount, setResolvedCount] = useState(0);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) {
          setUser(null);
          setLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from('profil_pengguna')
          .select('*')
          .eq('id', authUser.id)
          .single();

        const nama = profile?.nama_lengkap || authUser.user_metadata?.nama_lengkap || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Pengguna';
        const rawTipe = profile?.tipe_akun || authUser.user_metadata?.tipe_akun || 'community';
        const isCampus = rawTipe === 'campus';
        const isAdmin = rawTipe === 'admin';
        const tipeAkun = isAdmin ? 'admin' : isCampus ? 'campus' : 'community';

        setUser({
          id: authUser.id,
          nama_lengkap: nama,
          email: authUser.email || '',
          tipe_akun: tipeAkun,
          universitas: isCampus ? (profile?.universitas || authUser.user_metadata?.universitas || 'Universitas Bung Hatta') : '',
          role_kampus: isCampus ? (profile?.role_kampus || authUser.user_metadata?.role_kampus || 'Mahasiswa') : '',
          nim_nip: isCampus ? (profile?.nim_nip || authUser.user_metadata?.nim_nip || '') : '',
          status_kampus_terverifikasi: isCampus ? (profile?.status_kampus_terverifikasi ?? false) : false,
        });

        // Count user's reports
        const { count: repCount } = await supabase
          .from('laporan_barang')
          .select('*', { count: 'exact', head: true })
          .eq('pelapor_id', authUser.id);
        setReportsCount(repCount || 0);

        // Count user's resolved returns
        const { count: resCount } = await supabase
          .from('klaim_barang')
          .select('*', { count: 'exact', head: true })
          .eq('pengklaim_id', authUser.id)
          .eq('status', 'SELESAI');
        setResolvedCount(resCount || 0);
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-2xs animate-pulse space-y-4">
          <div className="flex gap-4">
            <div className="w-20 h-20 rounded-3xl bg-gray-100" />
            <div className="space-y-2 flex-1">
              <div className="h-6 bg-gray-100 rounded w-1/3" />
              <div className="h-4 bg-gray-100 rounded w-1/4" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Guest State
  if (!user) {
    return (
      <AppLayout>
        <div className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-12 text-center space-y-4 shadow-2xs max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#30AFFF] flex items-center justify-center mx-auto shadow-xs">
            <ShieldCheck size={32} />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-gray-900">Anda Belum Masuk</h2>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-sm mx-auto">
              Silakan masuk atau daftarkan akun kampus untuk melihat profil, laporan, serta riwayat klaim Anda.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold transition-all inline-flex items-center justify-center gap-1.5"
            >
              <LogIn size={14} />
              <span>Masuk</span>
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#30AFFF] hover:bg-[#2196E8] text-white text-xs font-semibold shadow-2xs transition-all inline-flex items-center justify-center gap-1.5"
            >
              <UserPlus size={14} />
              <span>Daftar Akun</span>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  const isCampus = user.tipe_akun === 'campus';
  const isAdmin = user.tipe_akun === 'admin';

  const roleDisplay = isAdmin
    ? 'Admin Mediator'
    : isCampus
      ? user.role_kampus
        ? user.role_kampus.charAt(0).toUpperCase() + user.role_kampus.slice(1)
        : 'Civitas Kampus'
      : 'Anggota Komunitas';

  const maskedNIM = user.nim_nip
    ? user.nim_nip.length > 4
      ? `•••••${user.nim_nip.slice(-4)}`
      : user.nim_nip
    : '-';

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header Profile Hero Card */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className={`w-18 h-18 sm:w-20 sm:h-20 rounded-3xl text-white flex items-center justify-center font-extrabold text-2xl shadow-sm shrink-0 ${user.tipe_akun === 'admin'
                  ? 'bg-gradient-to-tr from-amber-500 to-orange-500'
                  : 'bg-gradient-to-tr from-[#30AFFF] to-[#5ec2ff]'
                }`}>
                {getInitials(user.nama_lengkap)}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                    {user.nama_lengkap}
                  </h1>
                  {isAdmin ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      <ShieldAlert size={12} className="text-amber-600" />
                      <span>Admin Mediator</span>
                    </span>
                  ) : user.status_kampus_terverifikasi ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                      <CheckCircle2 size={12} className="text-emerald-600" />
                      <span>University Verified</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                      <span>Community Member</span>
                    </span>
                  )}
                </div>

                {isCampus ? (
                  <p className="text-xs sm:text-sm text-gray-500 font-medium flex items-center gap-1.5">
                    <GraduationCap size={15} className="text-[#30AFFF]" />
                    <span>{user.universitas || 'Civitas Akademika'} · {roleDisplay}</span>
                  </p>
                ) : isAdmin ? (
                  <p className="text-xs sm:text-sm text-gray-500 font-medium flex items-center gap-1.5">
                    <ShieldAlert size={15} className="text-amber-600" />
                    <span>Administrator Platform & Mediator</span>
                  </p>
                ) : (
                  <p className="text-xs sm:text-sm text-gray-500 font-medium flex items-center gap-1.5">
                    <Users size={15} className="text-[#30AFFF]" />
                    <span>Masyarakat Umum / Tamu Kampus</span>
                  </p>
                )}
              </div>
            </div>

            <Link
              href="/profile/edit"
              className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-all self-stretch sm:self-auto text-center cursor-pointer hover:border-[#30AFFF] hover:text-[#30AFFF]"
            >
              Edit Profil
            </Link>
          </div>

          {/* User Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 mt-6 border-t border-gray-100 text-xs">
            <div className="space-y-1">
              <span className="text-gray-400 block text-[11px]">Email:</span>
              <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                <Mail size={13} className="text-gray-400" />
                {user.email}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-gray-400 block text-[11px]">Nomor Induk (NIM/NIP):</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-gray-800 tracking-wider">
                  {showFullNIM ? (user.nim_nip || '-') : maskedNIM}
                </span>
                {user.nim_nip && (
                  <button
                    type="button"
                    onClick={() => setShowFullNIM(!showFullNIM)}
                    className="text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                    title={showFullNIM ? 'Sembunyikan' : 'Tampilkan NIM'}
                  >
                    {showFullNIM ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-gray-400 block text-[11px]">Tipe Akun:</span>
              <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-[#30AFFF]" />
                {user.tipe_akun === 'admin'
                  ? 'Administrator Kampus'
                  : user.tipe_akun === 'campus'
                    ? 'Civitas Kampus Aktif'
                    : 'Anggota Komunitas'}
              </span>
            </div>
          </div>
        </div>

        {/* Contribution Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs space-y-1">
            <span className="text-xs text-gray-500 font-medium">Total Laporan Dibuat</span>
            <p className="text-2xl font-extrabold text-gray-900">{reportsCount}</p>
            <span className="text-[11px] text-gray-400">Laporan barang aktif & selesai</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs space-y-1">
            <span className="text-xs text-gray-500 font-medium">Barang Berhasil Dikembalikan</span>
            <p className="text-2xl font-extrabold text-emerald-600">{resolvedCount}</p>
            <span className="text-[11px] text-gray-400">Klaim terverifikasi sukses</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs space-y-1">
            <span className="text-xs text-gray-500 font-medium">
              {isCampus ? 'Status Akun Civitas' : isAdmin ? 'Status Akun Admin' : 'Status Akun Komunitas'}
            </span>
            <p className="text-2xl font-extrabold text-[#30AFFF]">Aktif</p>
            <span className="text-[11px] text-gray-400">Terdaftar resmi di Findly</span>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="p-4 bg-gray-50/90 rounded-2xl border border-gray-200/80 text-xs text-gray-500 flex items-start gap-3">
          <ShieldCheck size={18} className="text-[#30AFFF] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {isCampus ? (
              <>
                <strong>Komitmen Privasi Kampus:</strong> Nomor Induk Mahasiswa (NIM) dan kontak pribadi Anda disensor secara ketat pada publikasi laporan barang. Hanya identitas terverifikasi dan nama yang terlihat oleh sesama mahasiswa untuk menjamin keamanan civitas akademika.
              </>
            ) : (
              <>
                <strong>Komitmen Privasi:</strong> Data kontak pribadi Anda disensor secara ketat pada publikasi laporan barang untuk menjamin keamanan dan kenyamanan seluruh pengguna komunitas.
              </>
            )}
          </p>
        </div>
      </div>
    </AppLayout>
>>>>>>> 1f218a6 (niateams)
  );
}
