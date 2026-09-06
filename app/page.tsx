'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${
                            isLost
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
        className={`fixed inset-0 bg-black/50 backdrop-blur-xs z-[100] md:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Mobile Drawer Panel */}
      <div
        className={`fixed inset-y-0 right-0 w-72 max-w-[85vw] bg-white z-[101] p-6 flex flex-col justify-between shadow-2xl md:hidden transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
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
  );
}
