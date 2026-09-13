'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PackageOpen, CheckCircle2, Bookmark, FileText, ArrowRight } from 'lucide-react';
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
      label: 'Klaim Aktif',
      value: activeClaimsCount,
      href: '/claims',
      icon: PackageOpen,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'Barang Dikembalikan',
      value: returnedCount,
      href: '/claims',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      label: 'Barang Disimpan',
      value: savedCount,
      href: '/saved',
      icon: Bookmark,
      iconColor: 'text-[#30AFFF]',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Laporan Saya',
      value: totalReportsCount,
      href: '/my-reports',
      icon: FileText,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y divide-gray-100 lg:divide-y-0 lg:divide-x">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-gray-50/70 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl ${stat.bgColor} ${stat.iconColor} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200`}
                >
                  <Icon size={19} className="stroke-[1.9]" />
                </div>
                <div className="min-w-0">
                  <div className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-none">
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-500 font-medium truncate mt-1">
                    {stat.label}
                  </div>
                </div>
              </div>
              <ArrowRight
                size={14}
                className="text-gray-300 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all shrink-0 mr-1"
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
