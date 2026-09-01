import Link from 'next/link';
import { Search, ShieldCheck, Users, Menu } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      {/* Navbar */}
      <header className="flex items-center justify-between px-8 lg:px-32 py-5 border-b border-gray-100 w-full">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-white p-1.5 rounded-box font-bold flex items-center justify-center w-8 h-8">
            F
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-900">Findly</span>
        </div>

        <nav className="hidden md:flex items-center gap-10 text-sm font-medium text-gray-600">
          <Link href="/" className="text-gray-900">Home</Link>
          <Link href="/find" className="text-primary border-b-2 border-primary pb-1">Find Items</Link>
          <Link href="/report" className="hover:text-primary transition-colors">Report Items</Link>
          <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
        </nav>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Login
          </Link>
          <Link 
            href="/register" 
            className="bg-primary hover:bg-primary-hover text-white text-sm font-medium px-6 py-2.5 rounded-box transition-colors"
          >
            Sign Up
          </Link>
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden text-gray-600">
          <Menu size={24} />
        </button>
      </header>

      <main className="flex-grow flex flex-col">
        {/* Hero Section */}
        <section className="px-8 lg:px-32 py-16 md:py-24 grid md:grid-cols-12 gap-12 items-center w-full">
          <div className="md:col-span-6 space-y-6">
            <h1 className="text-4xl md:text-[2.75rem] font-bold text-gray-900 leading-tight">
              Menemukan Barang Lebih Mudah, Mengembalikan Lebih Bermakna.
            </h1>
            <p className="text-gray-500 text-lg max-w-lg leading-relaxed">
              Findly menghubungkan orang-orang kehilangan dengan penemu barang secara transparan, aman, dan tanpa biaya.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Link 
                href="/claim" 
                className="bg-primary hover:bg-primary-hover text-white text-center font-medium px-8 py-3 rounded-box transition-colors"
              >
                Ajukan Klaim
              </Link>
              <Link 
                href="/report" 
                className="border border-primary text-primary hover:bg-blue-50 text-center font-medium px-8 py-3 rounded-box transition-colors"
              >
                Laporkan Barang
              </Link>
            </div>
          </div>
          
          <div className="md:col-span-6 relative w-full hidden md:flex justify-end items-center">
            <div className="w-full max-w-[500px] aspect-[4/3] bg-blue-50/50 rounded-box flex items-center justify-center p-8">
              <div className="relative w-full h-full opacity-70">
                <div className="absolute top-4 left-4 bg-primary/10 rounded-box p-6 transform -rotate-12">
                  <Search className="text-primary" size={32}/>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-100 rounded-full w-28 h-28 flex items-center justify-center shadow-lg">
                  <ShieldCheck className="text-primary" size={56}/>
                </div>
                <div className="absolute bottom-4 right-4 bg-primary/10 rounded-box p-6 transform rotate-6">
                  <Users className="text-primary" size={32}/>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-blue-50 border-y border-blue-100 w-full">
          <div className="px-8 lg:px-32 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-blue-200">
              <div className="pt-4 md:pt-0">
                <div className="text-4xl font-bold text-primary mb-2">2,345</div>
                <div className="text-sm text-gray-500 font-medium">Barang Ditemukan</div>
              </div>
              <div className="pt-4 md:pt-0">
                <div className="text-4xl font-bold text-primary mb-2">1,875</div>
                <div className="text-sm text-gray-500 font-medium">Pengguna Aktif</div>
              </div>
              <div className="pt-4 md:pt-0">
                <div className="text-4xl font-bold text-primary mb-2">98%</div>
                <div className="text-sm text-gray-500 font-medium">Tingkat Keberhasilan</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-8 lg:px-32 py-24 text-center w-full">
          <div className="mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Fitur Utama</h2>
            <p className="text-gray-500">Nikmati kemudahan pelaporan dan pencarian yang terstruktur.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-left">
            {/* Feature 1 */}
            <div className="border border-gray-100 p-8 rounded-box shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-blue-50 w-14 h-14 flex items-center justify-center rounded-box mb-6">
                <Users className="text-primary" size={28} />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-3">Komunitas Peduli</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Dibangun dari rasa gotong royong masyarakat untuk saling peduli barang sesama.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="border border-gray-100 p-8 rounded-box shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-blue-50 w-14 h-14 flex items-center justify-center rounded-box mb-6">
                <ShieldCheck className="text-primary" size={28} />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-3">Verifikasi Aman</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Setiap pengajuan klaim diverifikasi dengan ketat demi menghindari penipuan.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="border border-gray-100 p-8 rounded-box shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-blue-50 w-14 h-14 flex items-center justify-center rounded-box mb-6">
                <Search className="text-primary" size={28} />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-3">Mudah Digunakan</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Sistem pencarian dan filter cepat sesuai dengan kebutuhan penemuan Anda.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white w-full">
        <div className="px-8 lg:px-32 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-primary text-white p-1 rounded-box font-bold flex items-center justify-center w-6 h-6 text-xs">
                  F
                </div>
                <span className="font-bold text-lg text-gray-900">Findly</span>
              </div>
              <p className="text-gray-500 text-sm max-w-sm leading-relaxed">
                Misi kami adalah mengembalikan barang berharga yang hilang ke pemilik aslinya demi keadilan dan kenyamanan bertransaksi sosial.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-900 mb-6 text-sm">Layanan</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li><Link href="/find" className="hover:text-primary transition-colors">Cari Barang</Link></li>
                <li><Link href="/report" className="hover:text-primary transition-colors">Laporkan Barang</Link></li>
                <li><Link href="/claim" className="hover:text-primary transition-colors">Klaim Kepemilikan</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-6 text-sm">Perusahaan</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li><Link href="/about" className="hover:text-primary transition-colors">Tentang Kami</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Hubungi Kami</Link></li>
                <li><Link href="/terms" className="hover:text-primary transition-colors">Syarat & Ketentuan</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
            <div>© 2026 Findly Inc. Hak Cipta Dilindungi.</div>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-gray-600 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-gray-600 transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
