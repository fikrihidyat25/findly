'use client';

import Link from 'next/link';
import { CheckCircle2, GraduationCap, ShieldCheck, ArrowUpRight } from 'lucide-react';

export default function ProfileVerificationCard() {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full">
      <div>
        {/* Header Widget */}
        <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#30AFFF]" />
            <h4 className="font-bold text-xs sm:text-sm text-gray-900 tracking-tight">
              Profil & Verifikasi
            </h4>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
            <CheckCircle2 size={11} className="text-emerald-600" />
            <span>University Verified</span>
          </span>
        </div>

        {/* Profile Details */}
        <div className="flex items-start gap-3.5">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#30AFFF] to-[#5ec2ff] text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
            BS
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-gray-900">Budi Santoso</span>
              <span className="text-[11px] text-gray-400 font-normal">· Mahasiswa</span>
            </div>
            <p className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
              <GraduationCap size={13} className="text-[#30AFFF]" />
              <span>Universitas ABC</span>
            </p>
            <p className="text-[11px] text-gray-500">
              Fakultas Ilmu Komputer
            </p>
            <p className="text-[11px] font-mono text-gray-400 pt-0.5">
              NIM: <span className="tracking-widest">•••••</span>5678
            </p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-4 mt-4 border-t border-gray-50">
        <Link
          href="/profile"
          className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-[#30AFFF]/40 text-[#30AFFF] hover:bg-[#EFF8FF] text-xs font-semibold transition-all duration-200"
        >
          <span>Lihat Profil Lengkap</span>
          <ArrowUpRight size={13} />
        </Link>
      </div>
    </div>
  );
}
