'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '@/src/components/layout/AppLayout';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  Share2,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Wallet,
  Smartphone,
  CreditCard,
  KeyRound,
  BookOpen,
  Eye,
  MessageSquare,
  Building,
  HelpCircle,
} from 'lucide-react';

interface ItemDetail {
  id: string;
  title: string;
  type: 'lost' | 'found';
  category: string;
  location: string;
  campusArea: string;
  timeAgo: string;
  date: string;
  description: string;
  finderName: string;
  finderRole: string;
  safePoint: string;
  icon: any;
  colorScheme: {
    bg: string;
    text: string;
    border: string;
  };
}

const ITEMS_DATABASE: Record<string, ItemDetail> = {
  '1': {
    id: '1',
    title: 'Tas Ransel Kuning Nike',
    type: 'found',
    category: 'Tas & Ransel',
    location: 'Perpustakaan Pusat, Lantai 2 (Meja Baca No. 15)',
    campusArea: 'Perpustakaan Pusat',
    timeAgo: '1 jam yang lalu',
    date: '01 September 2026, 14:30 WIB',
    description:
      'Ditemukan tas ransel Nike warna kuning kombinasi abu-abu tertinggal di bawah kursi dekat meja baca 15 lantai 2. Kondisi bersih, ada botol minum di saku samping. Barang berharga di dalam kantong kecil sengaja tidak kami publikasikan untuk menguji keabsahan klaim pemilik.',
    finderName: 'Bpk. Joko (Satpam Perpustakaan)',
    finderRole: 'Petugas Keamanan Kampus',
    safePoint: 'Pos Keamanan Utama Perpustakaan Lantai 1',
    icon: Briefcase,
    colorScheme: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  },
  '2': {
    id: '2',
    title: 'Dompet Kulit Hitam Pria',
    type: 'lost',
    category: 'Dompet & Aksesoris',
    location: 'Kantin Utama Fasilkom, Meja Kasir',
    campusArea: 'Fasilkom',
    timeAgo: '2 jam yang lalu',
    date: '01 September 2026, 13:15 WIB',
    description:
      'Dompet merk Baellerry warna hitam lipat dua. Berisi KTM Universitas ABC atas nama Ahmad Rizki, beberapa uang tunai, dan kartu e-toll Flazz. Sangat dibutuhkan untuk keperluan ujian praktikum.',
    finderName: 'Ahmad Rizki',
    finderRole: 'Mahasiswa Teknik Informatika 2023',
    safePoint: 'Sekretariat BEM Fasilkom / Pos Satpam Fasilkom',
    icon: Wallet,
    colorScheme: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  },
  '3': {
    id: '3',
    title: 'iPhone 13 Pro Biru Sierra',
    type: 'lost',
    category: 'Elektronik & Gadget',
    location: 'Gedung Kuliah Bersama (GKB) Ruang 304',
    campusArea: 'Gedung Kuliah Bersama',
    timeAgo: '4 jam yang lalu',
    date: '01 September 2026, 11:00 WIB',
    description:
      'Casing bening transparan dengan stiker logo React & GitHub di bagian belakang. Layar terkunci dengan passcode. Bagi yang menemukan akan diberikan apresiasi terima kasih.',
    finderName: 'Sarah Amanda',
    finderRole: 'Mahasiswi Sistem Informasi 2022',
    safePoint: 'Ruang Dosen Sistem Informasi GKB Lantai 3',
    icon: Smartphone,
    colorScheme: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  },
  '4': {
    id: '4',
    title: 'Kartu Tanda Mahasiswa (KTM)',
    type: 'found',
    category: 'Dokumen & Kartu',
    location: 'Masjid Kampus Baitul Ilmi, Rak Sepatu Barat',
    campusArea: 'Masjid Kampus',
    timeAgo: '1 hari yang lalu',
    date: '31 Agustus 2026, 12:45 WIB',
    description:
      'KTM atas nama Budi Santoso, Fakultas Ilmu Komputer Angkatan 2022. Ditemukan terjatuh di sekitar rak sepatu area wudhu pria masjid kampus.',
    finderName: 'Ustadz Mansur (Pengurus DKM)',
    finderRole: 'Marbot & Pengurus Masjid Kampus',
    safePoint: 'Kantor Pengurus DKM Masjid Kampus Lantai 1',
    icon: CreditCard,
    colorScheme: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  },
  '5': {
    id: '5',
    title: 'Kunci Motor Honda Vario & Gantungan Bear',
    type: 'lost',
    category: 'Kunci & Kendaraan',
    location: 'Parkiran Motor Gedung C Kampus Barat',
    campusArea: 'Parkiran Kampus',
    timeAgo: '1 hari yang lalu',
    date: '31 Agustus 2026, 16:30 WIB',
    description:
      'Anak kunci kontak motor merk Honda dengan gantungan boneka rajut beruang warna cokelat dan remote smart key warna hitam.',
    finderName: 'Deni Kurniawan',
    finderRole: 'Mahasiswa Teknik Mesin 2021',
    safePoint: 'Pos Jaga Parkir Gedung C',
    icon: KeyRound,
    colorScheme: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  },
  '6': {
    id: '6',
    title: 'Buku Catatan Algoritma Pemrograman',
    type: 'found',
    category: 'Buku & Alat Tulis',
    location: 'Laboratorium Software Engineering Lantai 3',
    campusArea: 'Fasilkom',
    timeAgo: '2 hari yang lalu',
    date: '30 Agustus 2026, 17:00 WIB',
    description:
      'Buku binder loose leaf B5 motif hitam. Berisi catatan tulisan tangan algoritma pemrograman, flowchart, dan coretan pseudocode praktikum modul 3-5.',
    finderName: 'Lab Assistant (Kak Fani)',
    finderRole: 'Asisten Laboratorium Komputer',
    safePoint: 'Meja Asisten Lab Software Engineering',
    icon: BookOpen,
    colorScheme: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  },
};

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const itemId = typeof params?.id === 'string' ? params.id : '1';
  const item = ITEMS_DATABASE[itemId] || ITEMS_DATABASE['1'];
  const Icon = item.icon;

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        {/* Navigation / Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/find"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Pencarian</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Share2 size={14} />
              <span>{copied ? 'Tautan Disalin!' : 'Bagikan'}</span>
            </button>
            <button
              onClick={() => setIsSaved(!isSaved)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                isSaved
                  ? 'border-[#30AFFF] bg-[#EFF8FF] text-[#30AFFF]'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Bookmark size={14} className={isSaved ? 'fill-[#30AFFF]' : ''} />
              <span>{isSaved ? 'Tersimpan' : 'Simpan'}</span>
            </button>
          </div>
        </div>

        {/* Main Item Card */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-2xs space-y-6">
          {/* Top Badges & Title */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                  item.type === 'found'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {item.type === 'found' ? '✓ Ditemukan' : '! Dilaporkan Hilang'}
              </span>
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {item.category}
              </span>
              <span className="text-xs font-medium text-gray-400 ml-auto flex items-center gap-1">
                <Clock size={12} />
                <span>{item.timeAgo}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {item.title}
            </h1>
          </div>

          {/* Visual Showcase Banner */}
          <div className="rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/80 border border-gray-100 p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-3">
            <div
              className={`w-24 h-24 rounded-3xl ${item.colorScheme.bg} ${item.colorScheme.text} border ${item.colorScheme.border} flex items-center justify-center shadow-sm`}
            >
              <Icon size={48} className="stroke-[1.75]" />
            </div>
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Foto / Ikon Representasi Barang
              </span>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Foto detail internal dirahasiakan oleh sistem untuk melindungi verifikasi klaim kepemilikan.
              </p>
            </div>
          </div>

          {/* Key Facts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-1">
              <span className="text-gray-400 text-[11px] font-medium flex items-center gap-1">
                <MapPin size={13} className="text-[#30AFFF]" />
                Lokasi Ditemukan / Hilang
              </span>
              <p className="font-semibold text-gray-900 text-sm">{item.location}</p>
              <span className="text-gray-500 text-[11px]">Area: {item.campusArea}</span>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-1">
              <span className="text-gray-400 text-[11px] font-medium flex items-center gap-1">
                <Calendar size={13} className="text-[#30AFFF]" />
                Waktu Kejadian
              </span>
              <p className="font-semibold text-gray-900 text-sm">{item.date}</p>
              <span className="text-gray-500 text-[11px]">Status verifikasi sistem: Terverifikasi</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-gray-900">Keterangan Lengkap</h3>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
              {item.description}
            </p>
          </div>

          {/* Reporter / Finder Information Card */}
          <div className="p-5 rounded-2xl bg-[#EFF8FF] border border-[#BFDBFE]/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#30AFFF] text-white font-bold flex items-center justify-center text-sm shadow-2xs">
                  {item.finderName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-xs sm:text-sm text-gray-900">
                      {item.finderName}
                    </h4>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={12} className="text-emerald-600" />
                      Verified Civitas
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">{item.finderRole}</p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#BFDBFE]/60 text-xs text-gray-600 flex items-start gap-2">
              <Building size={14} className="text-[#0284C7] shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-800">Titik Kumpul / Pengambilan Aman:</strong>
                <p className="text-[11px] text-gray-600 mt-0.5">{item.safePoint}</p>
              </div>
            </div>
          </div>

          {/* Safety & Protocol Banner */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900 leading-relaxed">
            <ShieldCheck size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block mb-0.5">Panduan Pengambilan Aman Findly:</strong>
              <span>
                Pengambilan barang wajib melalui proses verifikasi klaim di sistem Findly dan diserahterimakan di Pos Satpam / Titik Kumpul Resmi Kampus demi keamanan bersama.
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            {item.type === 'found' ? (
              <>
                <Link
                  href={`/claim?item=${item.id}`}
                  className="flex-1 py-3 px-5 rounded-2xl bg-[#30AFFF] hover:bg-[#2196E8] text-white text-xs sm:text-sm font-bold text-center transition-all shadow-md shadow-[#30AFFF]/20 flex items-center justify-center gap-2"
                >
                  <Eye size={16} />
                  <span>Ajukan Klaim Barang Ini</span>
                </Link>
                <Link
                  href="/messages"
                  className="py-3 px-5 rounded-2xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold text-center transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare size={16} />
                  <span>Kirim Pesan Tanya Jawab</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/found/new"
                  className="flex-1 py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold text-center transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={16} />
                  <span>Saya Menemukan Barang Ini</span>
                </Link>
                <button
                  onClick={handleShare}
                  className="py-3 px-5 rounded-2xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold text-center transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Share2 size={16} />
                  <span>Bantu Sebarkan Info</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
