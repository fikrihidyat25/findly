'use client';

import { useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/src/components/layout/AppLayout';
import {
  CheckCircle2,
  GraduationCap,
  Mail,
  ShieldCheck,
  Eye,
  EyeOff,
  Calendar,
  Award,
  FileText,
  Clock,
  ExternalLink,
} from 'lucide-react';

export default function ProfilePage() {
  const [showFullNIM, setShowFullNIM] = useState(false);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header Profile Hero Card */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-[#30AFFF] to-[#5ec2ff] text-white flex items-center justify-center font-extrabold text-2xl shadow-sm shrink-0">
                BS
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                    Budi Santoso
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                    <CheckCircle2 size={12} className="text-emerald-600" />
                    <span>University Verified</span>
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-gray-500 font-medium flex items-center gap-1.5">
                  <GraduationCap size={15} className="text-[#30AFFF]" />
                  <span>Universitas ABC · Fakultas Ilmu Komputer</span>
                </p>

                <p className="text-xs text-gray-400">
                  Program Studi Teknik Informatika · Angkatan 2022
                </p>
              </div>
            </div>

            <Link
              href="/settings"
              className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-all self-stretch sm:self-auto text-center"
            >
              Edit Profil
            </Link>
          </div>

          {/* User Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 mt-6 border-t border-gray-100 text-xs">
            <div className="space-y-1">
              <span className="text-gray-400 block text-[11px]">Email Kampus:</span>
              <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                <Mail size={13} className="text-gray-400" />
                budi.santoso@univ-abc.ac.id
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-gray-400 block text-[11px]">Nomor Induk Mahasiswa (NIM):</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-gray-800 tracking-wider">
                  {showFullNIM ? '2212345678' : '•••••5678'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowFullNIM(!showFullNIM)}
                  className="text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                  title={showFullNIM ? 'Sembunyikan' : 'Tampilkan NIM'}
                >
                  {showFullNIM ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-gray-400 block text-[11px]">Tipe Akun:</span>
              <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-[#30AFFF]" />
                Civitas Mahasiswa Aktif
              </span>
            </div>
          </div>
        </div>

        {/* Contribution Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs space-y-1">
            <span className="text-xs text-gray-500 font-medium">Total Laporan Dibuat</span>
            <p className="text-2xl font-extrabold text-gray-900">8</p>
            <span className="text-[11px] text-gray-400">3 laporan kehilangan · 5 laporan temuan</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs space-y-1">
            <span className="text-xs text-gray-500 font-medium">Barang Berhasil Dikembalikan</span>
            <p className="text-2xl font-extrabold text-emerald-600">5</p>
            <span className="text-[11px] text-gray-400">Terverifikasi serah terima sukses</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs space-y-1">
            <span className="text-xs text-gray-500 font-medium">Skor Kejujuran Civitas</span>
            <p className="text-2xl font-extrabold text-[#30AFFF]">100%</p>
            <span className="text-[11px] text-gray-400">Tanpa riwayat dispute / penipuan</span>
          </div>
        </div>

        {/* Privacy Note according to SYSTEM_FLOW.md */}
        <div className="p-4 bg-gray-50/90 rounded-2xl border border-gray-200/80 text-xs text-gray-500 flex items-start gap-3">
          <ShieldCheck size={18} className="text-[#30AFFF] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Komitmen Privasi Kampus:</strong> Nomor Induk Mahasiswa (NIM) dan kontak pribadi Anda disensor secara ketat pada publikasi laporan barang. Hanya identitas terverifikasi dan inisial nama yang terlihat oleh sesama mahasiswa untuk menjamin kenyamanan civitas akademika.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
