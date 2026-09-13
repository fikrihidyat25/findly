'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/src/components/layout/AppLayout';
import {
  Bell,
  Lock,
  Check,
  Save,
} from 'lucide-react';
import { createClient } from '@/src/lib/supabase/client';

export default function SettingsPage() {
  const [emailNotif, setEmailNotif] = useState(true);
  const [waNotif, setWaNotif] = useState(true);
  const [hidePhone, setHidePhone] = useState(true);
  const [hideEmail, setHideEmail] = useState(true);
  const [maskNIM, setMaskNIM] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [tipeAkun, setTipeAkun] = useState<'campus' | 'community' | 'admin'>('community');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserRole() {
      setLoading(true);
      try {
        const isAdminSession =
          typeof document !== 'undefined' &&
          document.cookie.includes('findly_admin_session=true');
        if (isAdminSession) {
          setTipeAkun('admin');
          setLoading(false);
          return;
        }

        const supabase = createClient();
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!authUser) {
          setLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from('profil_pengguna')
          .select('tipe_akun')
          .eq('id', authUser.id)
          .single();

        const rawTipe =
          profile?.tipe_akun ||
          authUser.user_metadata?.tipe_akun ||
          'community';
        setTipeAkun(
          rawTipe === 'campus'
            ? 'campus'
            : rawTipe === 'admin'
            ? 'admin'
            : 'community'
        );
      } catch (err) {
        console.error('Error loading user role in settings:', err);
      } finally {
        setLoading(false);
      }
    }

    loadUserRole();
  }, []);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const isCampus = tipeAkun === 'campus';

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Pengaturan
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            {isCampus
              ? 'Kelola preferensi notifikasi, privasi data akademik, dan keamanan akun Anda.'
              : 'Kelola preferensi notifikasi, privasi data pribadi, dan keamanan akun Anda.'}
          </p>
        </div>

        {savedSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in duration-200">
            <Check size={16} className="text-emerald-600 shrink-0" />
            <span>Pengaturan preferensi akun Anda berhasil disimpan!</span>
          </div>
        )}

        {/* Notifikasi Section */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
            <Bell size={18} className="text-[#30AFFF]" />
            <h2 className="font-bold text-sm text-gray-900">Preferensi Notifikasi</h2>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="space-y-0.5">
                <span className="font-bold text-gray-900 block">Notifikasi Email</span>
                <span className="text-gray-500 text-[11px]">
                  Terima email saat ada orang yang merespons laporan atau klaim barang Anda.
                </span>
              </div>
              <input
                type="checkbox"
                checked={emailNotif}
                onChange={(e) => setEmailNotif(e.target.checked)}
                className="w-4 h-4 rounded text-[#30AFFF] focus:ring-[#30AFFF] cursor-pointer accent-[#30AFFF]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="space-y-0.5">
                <span className="font-bold text-gray-900 block">Pemberitahuan WhatsApp Otomatis</span>
                <span className="text-gray-500 text-[11px]">
                  Dapatkan pesan WhatsApp saat obrolan verifikasi atau klaim dibuka.
                </span>
              </div>
              <input
                type="checkbox"
                checked={waNotif}
                onChange={(e) => setWaNotif(e.target.checked)}
                className="w-4 h-4 rounded text-[#30AFFF] focus:ring-[#30AFFF] cursor-pointer accent-[#30AFFF]"
              />
            </label>
          </div>
        </div>

        {/* Privasi Section */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
            <Lock size={18} className="text-emerald-600" />
            <h2 className="font-bold text-sm text-gray-900">
              {isCampus ? 'Privasi & Keamanan Kampus' : 'Privasi & Keamanan Akun'}
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            {/* Opsi sensor NIM hanya relevan dan hanya ditampilkan untuk akun Warga Kampus */}
            {isCampus && (
              <label className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="space-y-0.5">
                  <span className="font-bold text-gray-900 block">Sensor Otomatis NIM (Disarankan)</span>
                  <span className="text-gray-500 text-[11px]">
                    Menampilkan format sensor (•••••5678) agar nomor induk akademik Anda tidak disalahgunakan.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={maskNIM}
                  onChange={(e) => setMaskNIM(e.target.checked)}
                  className="w-4 h-4 rounded text-[#30AFFF] focus:ring-[#30AFFF] cursor-pointer accent-[#30AFFF]"
                />
              </label>
            )}

            <label className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="space-y-0.5">
                <span className="font-bold text-gray-900 block">Sembunyikan Nomor HP dari Publik</span>
                <span className="text-gray-500 text-[11px]">
                  Seluruh komunikasi dialihkan melalui ruang obrolan internal Findly untuk menjaga privasi Anda.
                </span>
              </div>
              <input
                type="checkbox"
                checked={hidePhone}
                onChange={(e) => setHidePhone(e.target.checked)}
                className="w-4 h-4 rounded text-[#30AFFF] focus:ring-[#30AFFF] cursor-pointer accent-[#30AFFF]"
              />
            </label>

            {/* Opsi privasi email untuk Masyarakat Umum */}
            {!isCampus && (
              <label className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="space-y-0.5">
                  <span className="font-bold text-gray-900 block">Sembunyikan Alamat Email dari Publik</span>
                  <span className="text-gray-500 text-[11px]">
                    Alamat email Anda tidak akan dicantumkan secara terbuka pada detail laporan.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={hideEmail}
                  onChange={(e) => setHideEmail(e.target.checked)}
                  className="w-4 h-4 rounded text-[#30AFFF] focus:ring-[#30AFFF] cursor-pointer accent-[#30AFFF]"
                />
              </label>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-[#30AFFF] hover:bg-[#2196E8] text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save size={15} />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
