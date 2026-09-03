import Link from 'next/link';
import Image from 'next/image';
import { Search, ShieldCheck, Users, Menu } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans flex flex-col selection:bg-[#30AFFF]/20 selection:text-[#30AFFF]">
      {/* Header / Navbar */}
      <header className="w-full max-w-[1300px] mx-auto px-6 sm:px-10 lg:px-12 py-5 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#30AFFF] text-white font-bold flex items-center justify-center text-base shadow-sm">
            F
          </div>
          <span className="font-bold text-xl text-gray-900 tracking-tight">Findly</span>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-9 text-sm font-medium">
          <Link href="/" className="text-gray-700 hover:text-gray-900 transition-colors">
            Home
          </Link>
          <div className="border-b-2 border-[#30AFFF] pb-0.5">
            <Link href="/find" className="text-[#30AFFF] font-semibold">
              Find Items
            </Link>
          </div>
          <Link href="/report" className="text-gray-600 hover:text-gray-900 transition-colors">
            Report Items
          </Link>
          <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
            About Us
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
        <button className="md:hidden text-gray-600 p-1" aria-label="Menu">
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
                href="/claim"
                className="bg-[#30AFFF] hover:bg-[#2196e8] text-white font-medium text-sm px-6 py-2.5 rounded-lg transition-colors shadow-sm"
              >
                Ajukan Klaim
              </Link>
              <Link
                href="/report"
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

        {/* Features Section */}
        <section className="w-full max-w-[1300px] mx-auto px-6 sm:px-10 lg:px-12 py-16 lg:py-20 text-center">
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
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#30AFFF] text-white font-bold flex items-center justify-center text-base shadow-sm">
                  F
                </div>
                <span className="font-bold text-xl text-gray-900 tracking-tight">Findly</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                Membantu mengembalikan barang berharga yang hilang ke pemiliknya dengan verifikasi yang terpercaya dan aman.
              </p>
            </div>

            <div className="flex gap-16 md:gap-24">
              <div>
                <h4 className="font-bold text-gray-900 mb-4 text-sm">Layanan</h4>
                <ul className="space-y-3 text-sm text-gray-500">
                  <li><Link href="/find" className="hover:text-[#30AFFF] transition-colors">Cari Barang</Link></li>
                  <li><Link href="/report" className="hover:text-[#30AFFF] transition-colors">Laporkan Barang</Link></li>
                  <li><Link href="/claim" className="hover:text-[#30AFFF] transition-colors">Klaim Kepemilikan</Link></li>
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
    </div>
  );
}
