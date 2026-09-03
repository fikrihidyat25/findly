'use client';

import Link from 'next/link';
import { PackageOpen, CheckCircle2, Bookmark, FileText, ArrowRight } from 'lucide-react';

export default function QuickStats() {
  const stats = [
    {
      label: 'Klaim aktif',
      value: '2',
      href: '/claims',
      icon: PackageOpen,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50/80',
      borderColor: 'border-amber-100/70',
    },
    {
      label: 'Barang Dikembalikan',
      value: '5',
      href: '/claims?status=returned',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50/80',
      borderColor: 'border-emerald-100/70',
    },
    {
      label: 'Disimpan',
      value: '3',
      href: '/saved',
      icon: Bookmark,
      iconColor: 'text-[#30AFFF]',
      bgColor: 'bg-blue-50/80',
      borderColor: 'border-blue-100/70',
    },
    {
      label: 'Total Laporan',
      value: '8',
      href: '/my-reports',
      icon: FileText,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50/80',
      borderColor: 'border-purple-100/70',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-white p-4 sm:p-4.5 rounded-2xl border border-gray-100 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
          >
            <div className="flex items-start justify-between gap-2">
              <div
                className={`w-10 h-10 rounded-xl ${stat.bgColor} ${stat.iconColor} ${stat.borderColor} border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200`}
              >
                <Icon size={20} className="stroke-[1.8]" />
              </div>
              <span className="font-extrabold text-2xl sm:text-3xl text-gray-900 tracking-tight">
                {stat.value}
              </span>
            </div>

            <div className="mt-3 pt-2 border-t border-gray-50 flex items-center justify-between text-xs">
              <span className="font-medium text-gray-600 text-[11px] sm:text-xs truncate">
                {stat.label}
              </span>
              <Link
                href={stat.href}
                className="text-[#30AFFF] font-semibold hover:underline flex items-center gap-0.5 text-[11px] shrink-0"
              >
                <span>Lihat semua</span>
                <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
