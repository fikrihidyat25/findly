'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PackageOpen, CheckCircle2, Bookmark, FileText, ArrowUpRight } from 'lucide-react';
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
      iconColor: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
    },
    {
      label: 'Barang Selesai / Kembali',
      value: returnedCount,
      href: '/claims',
      icon: CheckCircle2,
      iconColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
    },
    {
      label: 'Barang Disimpan',
      value: savedCount,
      href: '/saved',
      icon: Bookmark,
      iconColor: 'text-sky-700',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-200',
    },
    {
      label: 'Laporan Saya',
      value: totalReportsCount,
      href: '/claims',
      icon: FileText,
      iconColor: 'text-indigo-700',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-white p-4 rounded-[6px] border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
                {stat.value}
              </span>
              <div
                className={`w-9 h-9 rounded-[6px] ${stat.bgColor} ${stat.iconColor} ${stat.borderColor} border flex items-center justify-center shrink-0`}
              >
                <Icon size={18} className="stroke-[2]" />
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600 text-[11px] sm:text-xs truncate">
                {stat.label}
              </span>
              <Link
                href={stat.href}
                className="text-sky-600 hover:text-sky-800 font-semibold text-[11px] shrink-0 inline-flex items-center gap-0.5"
              >
                <span>Lihat</span>
                <ArrowUpRight size={11} />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
