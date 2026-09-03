'use client';

import { useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/src/components/layout/AppLayout';
import {
  LifeBuoy,
  HelpCircle,
  ShieldCheck,
  Phone,
  Mail,
  ChevronDown,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface FAQ {
  q: string;
  a: string;
}

const FAQS: FAQ[] = [
  {
    q: 'Bagaimana cara membuktikan bahwa barang yang ditemukan adalah milik saya?',
    a: 'Saat mengajukan klaim, jelaskan ciri-ciri khusus barang. Penemu telah menyimpan "Pertanyaan Rahasia" (Secret Attributes) saat melaporkan barang. Di ruang chat verifikasi, penemu akan menanyakan detail tersebut untuk memastikan kebenaran kepemilikan.',
  },
  {
    q: 'Apakah ada biaya tebusan saat mengambil barang?',
    a: 'Tidak ada. Findly melarang keras segala bentuk tebusan uang tunai maupun pemerasan. Sistem ini dibangun atas dasar kejujuran dan kepedulian civitas akademika kampus.',
  },
  {
    q: 'Apa yang terjadi jika saya dan penemu tidak menemukan kesepakatan?',
    a: 'Anda atau penemu dapat mengklik tombol "Panggil Mediator". Status klaim akan menjadi DISPUTED, dan tim Admin / Satpam Kampus akan menjadi penengah untuk menyelesaikan verifikasi.',
  },
  {
    q: 'Di mana lokasi yang aman untuk melakukan serah terima barang?',
    a: 'Kami menyarankan serah terima dilakukan di tempat umum kampus pada jam operasional, seperti di depan Perpustakaan Pusat, Lobby Rektorat, atau Pos Satpam Utama.',
  },
];

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Pusat Bantuan & Panduan
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Temukan jawaban atas pertanyaan umum seputar alur Lost & Found, verifikasi rahasia, dan keamanan serah terima.
          </p>
        </div>

        {/* Emergency Campus Contacts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
              <Phone size={16} className="text-[#30AFFF]" />
              <span>Pos Satpam Utama Kampus</span>
            </div>
            <p className="text-xs text-gray-500">
              Pusat penitipan barang berharga dan mediasi fisik serah terima.
            </p>
            <p className="text-xs font-mono font-bold text-[#30AFFF]">
              Telp: (0751) 123456 / Ekstensi: 101
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
              <Mail size={16} className="text-emerald-600" />
              <span>Tim Dukungan Findly</span>
            </div>
            <p className="text-xs text-gray-500">
              Laporan kendala akun, akun mencurigakan, atau mediasi tiket dispute.
            </p>
            <p className="text-xs font-semibold text-emerald-600">
              support@findly-campus.id
            </p>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <HelpCircle size={18} className="text-[#30AFFF]" />
            <h2 className="font-bold text-sm text-gray-900">Pertanyaan yang Sering Diajukan (FAQ)</h2>
          </div>

          <div className="divide-y divide-gray-100">
            {FAQS.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div key={idx} className="py-3.5 first:pt-0 last:pb-0">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold text-gray-900 hover:text-[#30AFFF] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#30AFFF]' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <p className="mt-2 text-xs text-gray-600 leading-relaxed animate-in fade-in duration-150">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
