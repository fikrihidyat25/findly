'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PackageOpen, CheckCircle2, Bookmark, FileText } from 'lucide-react';
import { createClient } from '@/src/lib/supabase/client';

export default function QuickStats() {
  const [activeClaimsCount, setActiveClaimsCount] = useState<number>(0);
  const [returnedCount, setReturnedCount] = useState<number>(0);
  const [savedCount, setSavedCount] = useState<number>(0);
  const [totalReportsCount, setTotalReportsCount] = useState<number>(0);

  useEffect(() => {
    async function fetchStats() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // Get saved count from localStorage
        if (typeof window !== 'undefined') {
          const saved = JSON.parse(localStorage.getItem('findly_saved_items') || '[]');
          setSavedCount(Array.isArray(saved) ? saved.length : 0);
        }

        if (!user) {
          // Guest mode: 0 across all
          setActiveClaimsCount(0);
          setReturnedCount(0);
          setTotalReportsCount(0);
          return;
        }

        // Fetch user's reports count
        const { count: reportsCount } = await supabase
          .from('laporan_barang')
          .select('*', { count: 'exact', head: true })
          .eq('pelapor_id', user.id);
        setTotalReportsCount(reportsCount || 0);

        // Fetch active claims count
        const { count: claimsCount } = await supabase
          .from('klaim_barang')
          .select('*', { count: 'exact', head: true })
          .eq('pengklaim_id', user.id)
          .neq('status', 'SELESAI');
        setActiveClaimsCount(claimsCount || 0);

        // Fetch returned / resolved items count
        const { count: resolvedCount } = await supabase
          .from('klaim_barang')
          .select('*', { count: 'exact', head: true })
          .eq('pengklaim_id', user.id)
          .eq('status', 'SELESAI');
        setReturnedCount(resolvedCount || 0);
      } catch (err) {
        console.error('Error fetching quick stats:', err);
      }
    }

    fetchStats();
  }, []);

  const stats = [
    {
      label: 'Klaim aktif',
      value: activeClaimsCount,
      href: '/claims',
      icon: PackageOpen,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50/80',
      borderColor: 'border-amber-100/70',
    },
    {
      label: 'Barang Dikembalikan',
      value: returnedCount,
      href: '/claims',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50/80',
      borderColor: 'border-emerald-100/70',
    },
    {
      label: 'Disimpan',
      value: savedCount,
      href: '/saved',
      icon: Bookmark,
      iconColor: 'text-[#30AFFF]',
      bgColor: 'bg-blue-50/80',
      borderColor: 'border-blue-100/70',
    },
    {
      label: 'Total Laporan',
      value: totalReportsCount,
      href: '/find',
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
                className="text-[#30AFFF] font-semibold hover:underline text-[11px] shrink-0"
              >
                Lihat semua
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
