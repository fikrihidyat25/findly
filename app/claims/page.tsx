'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLayout from '@/src/components/layout/AppLayout';
import {
  FileCheck2,
  Clock,
  MapPin,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Wallet,
  Smartphone,
  CreditCard,
  KeyRound,
  BookOpen,
  Plus,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { createClient } from '@/src/lib/supabase/client';

interface ClaimItem {
  id: string;
  itemName: string;
  itemCategory: string;
  counterpartName: string;
  counterpartRole: string;
  location: string;
  date: string;
  status: string;
  statusLabel: string;
  statusColor: {
    bg: string;
    text: string;
    border: string;
  };
  icon: any;
}

function getCategoryIcon(cat: string) {
  const lower = (cat || '').toLowerCase();
  if (lower.includes('elektronik') || lower.includes('hp') || lower.includes('gadget') || lower.includes('laptop')) {
    return Smartphone;
  }
  if (lower.includes('dompet') || lower.includes('aksesoris')) {
    return Wallet;
  }
  if (lower.includes('tas') || lower.includes('ransel')) {
    return Briefcase;
  }
  if (lower.includes('dokumen') || lower.includes('kartu') || lower.includes('ktm')) {
    return CreditCard;
  }
  if (lower.includes('kunci') || lower.includes('kendaraan') || lower.includes('motor')) {
    return KeyRound;
  }
  if (lower.includes('buku') || lower.includes('tulis')) {
    return BookOpen;
  }
  return Briefcase;
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'MENUNGGU':
      return {
        label: 'Menunggu Respon Penemu',
        color: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
      };
    case 'DIVERIFIKASI':
      return {
        label: 'Sedang Verifikasi Chat',
        color: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
      };
    case 'JADWAL_DIBUAT':
      return {
        label: 'Jadwal Serah Terima Dibuat',
        color: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
      };
    case 'SELESAI':
      return {
        label: 'Selesai & Dikembalikan',
        color: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
      };
    case 'DITOLAK':
      return {
        label: 'Klaim Ditolak',
        color: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
      };
    default:
      return {
        label: status,
        color: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
      };
  }
}

export default function ClaimsDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'outgoing' | 'incoming'>('outgoing');
  const [outgoingClaims, setOutgoingClaims] = useState<ClaimItem[]>([]);
  const [incomingClaims, setIncomingClaims] = useState<ClaimItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    async function loadClaims() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setIsGuest(true);
          setLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from('profil_pengguna')
          .select('tipe_akun, role_kampus')
          .eq('id', user.id)
          .single();

        if (profile?.tipe_akun === 'admin' || profile?.role_kampus === 'admin') {
          router.replace('/admin/klaim');
          return;
        }

        // 1. Fetch Outgoing Claims (klaim yang diajukan oleh user)
        const { data: outgoingData, error: outErr } = await supabase
          .from('klaim_barang')
          .select('*, laporan_barang(*, profil_pengguna:pelapor_id(nama_lengkap, role_kampus))')
          .eq('pengklaim_id', user.id)
          .order('dibuat_pada', { ascending: false });

        if (!outErr && outgoingData) {
          const mappedOut: ClaimItem[] = outgoingData.map((c: any) => {
            const badge = getStatusBadge(c.status);
            const report = c.laporan_barang;
            const isLost = report?.jenis_laporan === 'KEHILANGAN';
            const finder = report?.profil_pengguna;
            return {
              id: c.id,
              itemName: report?.nama_barang || (isLost ? 'Barang Hilang' : 'Barang Kampus'),
              itemCategory: report?.kategori || 'Barang Kampus',
              counterpartName: finder?.nama_lengkap || (isLost ? 'Pemilik Barang' : 'Penemu Barang'),
              counterpartRole: finder?.role_kampus || (isLost ? 'Pemilik Laporan' : 'Civitas Kampus'),
              location: report?.lokasi_terakhir || 'Lingkungan Kampus',
              date: new Date(c.dibuat_pada).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              }),
              status: c.status,
              statusLabel: badge.label,
              statusColor: badge.color,
              icon: getCategoryIcon(report?.kategori || ''),
            };
          });
          setOutgoingClaims(mappedOut);
        }

        // 2. Fetch Incoming Claims (klaim dari orang lain atas laporan milik user)
        const { data: myReports } = await supabase
          .from('laporan_barang')
          .select('id')
          .eq('pelapor_id', user.id);

        if (myReports && myReports.length > 0) {
          const reportIds = myReports.map((r: any) => r.id);
          const { data: incomingData, error: inErr } = await supabase
            .from('klaim_barang')
            .select('*, laporan_barang(*), profil_pengguna:pengklaim_id(nama_lengkap, role_kampus)')
            .in('laporan_id', reportIds)
            .order('dibuat_pada', { ascending: false });

          if (!inErr && incomingData) {
            const mappedIn: ClaimItem[] = incomingData.map((c: any) => {
              const badge = getStatusBadge(c.status);
              const report = c.laporan_barang;
              const isLost = report?.jenis_laporan === 'KEHILANGAN';
              const claimant = c.profil_pengguna;
              return {
                id: c.id,
                itemName: report?.nama_barang || (isLost ? 'Barang Hilang' : 'Barang Kampus'),
                itemCategory: report?.kategori || 'Barang Kampus',
                counterpartName: claimant?.nama_lengkap || (isLost ? 'Penemu Barang' : 'Pengaju Klaim'),
                counterpartRole: claimant?.role_kampus || (isLost ? 'Penemu Barang' : 'Civitas Kampus'),
                location: report?.lokasi_terakhir || 'Lingkungan Kampus',
                date: new Date(c.dibuat_pada).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                }),
                status: c.status,
                statusLabel: badge.label,
                statusColor: badge.color,
                icon: getCategoryIcon(report?.kategori || ''),
              };
            });
            setIncomingClaims(mappedIn);
          }
        }
      } catch (err) {
        console.error('Error loading claims:', err);
      } finally {
        setLoading(false);
      }
    }

    loadClaims();
  }, []);

  const claimsList = activeTab === 'outgoing' ? outgoingClaims : incomingClaims;

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
            href="/find"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#30AFFF] hover:bg-[#2196E8] text-white text-xs font-semibold rounded-xl shadow-sm transition-all shrink-0 self-start sm:self-auto"
          >
            <Plus size={15} />
            <span>Ajukan Klaim Baru</span>
          </Link>
        </div>

        {isGuest ? (
          <div className="bg-white p-8 sm:p-12 rounded-3xl border border-gray-100 text-center space-y-4 shadow-2xs max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#30AFFF] flex items-center justify-center mx-auto">
              <FileCheck2 size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-gray-900">Anda Belum Masuk</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Silakan masuk atau daftarkan akun kampus untuk mengajukan klaim dan memantau status verifikasi barang.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <Link
                href="/login?redirect=/claims"
                className="px-5 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold transition-all inline-flex items-center gap-1.5"
              >
                <LogIn size={13} />
                <span>Masuk</span>
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 rounded-xl bg-[#30AFFF] hover:bg-[#2196E8] text-white text-xs font-semibold shadow-2xs transition-all inline-flex items-center gap-1.5"
              >
                <UserPlus size={13} />
                <span>Daftar</span>
              </Link>
            </div>
          </div>
        ) : (
          <>
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
                Klaim Diajukan ({outgoingClaims.length})
              </button>
              <button
                onClick={() => setActiveTab('incoming')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'incoming'
                    ? 'bg-white text-gray-900 border border-gray-200 shadow-2xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Klaim Masuk ({incomingClaims.length})
              </button>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs animate-pulse flex gap-4 items-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-100 rounded w-1/3" />
                      <div className="h-3 bg-gray-100 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : claimsList.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center space-y-4 shadow-2xs">
                <div className="w-16 h-16 rounded-full bg-blue-50 text-[#30AFFF] flex items-center justify-center mx-auto">
                  <FileCheck2 size={28} />
                </div>
                <h3 className="font-bold text-base text-gray-900">
                  {activeTab === 'outgoing'
                    ? 'Belum ada klaim yang Anda ajukan'
                    : 'Belum ada klaim masuk atas laporan barang temuan Anda'}
                </h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  {activeTab === 'outgoing'
                    ? 'Jika Anda menemukan barang Anda di katalog Cari Barang, klik tombol Ajukan Klaim untuk memulai verifikasi kepemilikan.'
                    : 'Ketika seseorang mengklaim barang yang Anda laporkan ditemukan, daftar klaim akan muncul di sini.'}
                </p>
                <Link
                  href="/find"
                  className="inline-flex items-center px-4 py-2 bg-[#30AFFF] hover:bg-[#2196E8] text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
                >
                  Jelajahi Cari Barang
                </Link>
              </div>
            ) : (
              /* Claims List */
              <div className="space-y-3.5">
                {claimsList.map((claim) => {
                  const Icon = claim.icon;
                  return (
                    <div
                      key={claim.id}
                      className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50/80 text-[#30AFFF] flex items-center justify-center shrink-0 border border-blue-100/60 shadow-2xs">
                          <Icon size={24} className="stroke-[1.75]" />
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-[#30AFFF] transition-colors">
                              {claim.itemName}
                            </h3>
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${claim.statusColor.bg} ${claim.statusColor.text} ${claim.statusColor.border}`}
                            >
                              {claim.statusLabel}
                            </span>
                          </div>

                          <p className="text-xs text-gray-500">
                            {activeTab === 'outgoing' ? 'Penemu' : 'Pengaju Klaim'}:{' '}
                            <strong className="text-gray-700">{claim.counterpartName}</strong> ({claim.counterpartRole})
                          </p>

                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-400 pt-1">
                            <div className="flex items-center gap-1">
                              <MapPin size={11} className="text-gray-400" />
                              <span>{claim.location}</span>
                            </div>
                            <span>·</span>
                            <div className="flex items-center gap-1">
                              <Clock size={11} className="text-gray-400" />
                              <span>Diajukan pada {claim.date}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <Link
                          href={`/messages?id=${claim.id}`}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#30AFFF] hover:bg-[#2196E8] text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                        >
                          <MessageSquare size={14} />
                          <span>Buka Chat Verifikasi</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
