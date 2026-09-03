'use client';

import { useState } from 'react';
import AppLayout from '@/src/components/layout/AppLayout';
import {
  Bell,
  Lock,
  ShieldCheck,
  Smartphone,
  Mail,
  Check,
  Save,
} from 'lucide-react';

export default function SettingsPage() {
  const [emailNotif, setEmailNotif] = useState(true);
  const [waNotif, setWaNotif] = useState(true);
  const [hidePhone, setHidePhone] = useState(true);
  const [maskNIM, setMaskNIM] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Pengaturan
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Kelola preferensi notifikasi, privasi civitas kampus, dan keamanan akun Anda.
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
                <span className="font-bold text-gray-900 block">Notifikasi Email Kampus</span>
                <span className="text-gray-500 text-[11px]">Terima email instan saat ada orang yang merespon laporan atau klaim Anda.</span>
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
                <span className="text-gray-500 text-[11px]">Dapatkan pesan WhatsApp saat ruang chat verifikasi dibuka.</span>
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
            <h2 className="font-bold text-sm text-gray-900">Privasi & Keamanan Kampus</h2>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="space-y-0.5">
                <span className="font-bold text-gray-900 block">Sensor Otomatis NIM (Disarankan)</span>
                <span className="text-gray-500 text-[11px]">Menampilkan format sensor (•••••5678) agar data akademik Anda tidak disalahgunakan.</span>
              </div>
              <input
                type="checkbox"
                checked={maskNIM}
                onChange={(e) => setMaskNIM(e.target.checked)}
                className="w-4 h-4 rounded text-[#30AFFF] focus:ring-[#30AFFF] cursor-pointer accent-[#30AFFF]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="space-y-0.5">
                <span className="font-bold text-gray-900 block">Sembunyikan Nomor HP dari Publik</span>
                <span className="text-gray-500 text-[11px]">Seluruh komunikasi dialihkan melalui ruang chat internal Findly.</span>
              </div>
              <input
                type="checkbox"
                checked={hidePhone}
                onChange={(e) => setHidePhone(e.target.checked)}
                className="w-4 h-4 rounded text-[#30AFFF] focus:ring-[#30AFFF] cursor-pointer accent-[#30AFFF]"
              />
            </label>
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
