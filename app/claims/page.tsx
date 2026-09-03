'use client';

import { useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/src/components/layout/AppLayout';
import {
  FileCheck2,
  Clock,
  MapPin,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Briefcase,
  Wallet,
  Smartphone,
  Plus,
} from 'lucide-react';

interface ClaimRecord {
  id: string;
  itemName: string;
  itemCategory: string;
  counterpartName: string;
  counterpartRole: string;
  location: string;
  date: string;
  status: 'PENDING' | 'VERIFYING' | 'APPROVED' | 'RESOLVED';
  statusLabel: string;
  statusColor: {
    bg: string;
    text: string;
    border: string;
  };
  icon: any;
}

const MY_OUTGOING_CLAIMS: ClaimRecord[] = [
  {
    id: 'claim-1',
    itemName: 'Tas Ransel Kuning Nike',
    itemCategory: 'Tas & Ransel',
    counterpartName: 'Megawati',
    counterpartRole: 'Mahasiswa · Univ ABC',
    location: 'Perpustakaan Pusat, Lantai 2',
    date: '01 Sep 2026',
    status: 'VERIFYING',
    statusLabel: 'Sedang Verifikasi Chat',
    statusColor: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    icon: Briefcase,
  },
  {
    id: 'claim-2',
    itemName: 'Dompet Kulit Hitam Baellerry',
    itemCategory: 'Dompet & Aksesoris',
    counterpartName: 'Ahmad Satpam',
    counterpartRole: 'Staff Keamanan Kampus',
    location: 'Pos Satpam Utama',
    date: '28 Agu 2026',
    status: 'RESOLVED',
    statusLabel: 'Selesai & Dikembalikan',
    statusColor: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    icon: Wallet,
  },
];

const MY_INCOMING_CLAIMS: ClaimRecord[] = [
  {
    id: 'claim-3',
    itemName: 'Kartu Tanda Mahasiswa (KTM)',
    itemCategory: 'Dokumen & Kartu',
    counterpartName: 'Rian Pratama',
    counterpartRole: 'Mahasiswa · Teknik Elektro',
    location: 'Masjid Kampus Baitul Ilmi',
    date: '31 Agu 2026',
    status: 'PENDING',
    statusLabel: 'Menunggu Tanggapan Anda',
    statusColor: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    icon: Smartphone,
  },
];

export default function ClaimsDashboardPage() {
  const [activeTab, setActiveTab] = useState<'outgoing' | 'incoming'>('outgoing');

  const claimsList = activeTab === 'outgoing' ? MY_OUTGOING_CLAIMS : MY_INCOMING_CLAIMS;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Klaim Saya
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Pantau seluruh riwayat pengajuan klaim barang dan respon verifikasi dari penemu.
            </p>
          </div>

          <Link
            href="/claim/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#30AFFF] hover:bg-[#2196E8] text-white text-xs font-semibold rounded-xl shadow-sm transition-all shrink-0 self-start sm:self-auto"
          >
            <Plus size={15} />
            <span>Ajukan Klaim Baru</span>
          </Link>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
          <button
            onClick={() => setActiveTab('outgoing')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'outgoing'
                ? 'bg-white text-gray-900 border border-gray-200 shadow-2xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Klaim Diajukan ({MY_OUTGOING_CLAIMS.length})
          </button>
          <button
            onClick={() => setActiveTab('incoming')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'incoming'
                ? 'bg-white text-gray-900 border border-gray-200 shadow-2xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Klaim Masuk ({MY_INCOMING_CLAIMS.length})
          </button>
        </div>

        {/* Claims List */}
        <div className="space-y-4">
          {claimsList.map((claim) => {
            const Icon = claim.icon;

            return (
              <div
                key={claim.id}
                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#30AFFF] flex items-center justify-center shrink-0 border border-blue-100/60 shadow-2xs">
                    <Icon size={24} className="stroke-[1.75]" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-sm sm:text-base text-gray-900">
                        {claim.itemName}
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${claim.statusColor.bg} ${claim.statusColor.text} ${claim.statusColor.border}`}
                      >
                        {claim.statusLabel}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500">
                      {activeTab === 'outgoing' ? 'Penemu: ' : 'Pengklaim: '}
                      <strong className="text-gray-700">{claim.counterpartName}</strong> ({claim.counterpartRole})
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-400 pt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {claim.location}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        Diajukan pada {claim.date}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-gray-50">
                  <Link
                    href="/messages"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#30AFFF] hover:bg-[#2196E8] text-white text-xs font-semibold shadow-2xs transition-all w-full md:w-auto"
                  >
                    <MessageSquare size={14} />
                    <span>Buka Chat Verifikasi</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
