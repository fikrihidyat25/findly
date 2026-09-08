'use client';

import React from 'react';
import { ShieldCheck, MapPin, X } from 'lucide-react';
import { SafePoint } from '@/src/lib/safePoints';
import LeafletSafeMap from '@/src/components/map/LeafletSafeMap';

interface SafePointModalProps {
  isOpen: boolean;
  onClose: () => void;
  safePointsList: SafePoint[];
  selectedSafePointId: string;
  onSelectSafePointId: (id: string) => void;
  onShareSafePoint: () => void;
}

export default function SafePointModal({
  isOpen,
  onClose,
  safePointsList,
  selectedSafePointId,
  onSelectSafePointId,
  onShareSafePoint,
}: SafePointModalProps) {
  if (!isOpen) return null;

  const currentPt =
    safePointsList.find((p) => p.id === selectedSafePointId) ||
    safePointsList[0];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[6px] max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[6px] bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Pilih Titik Temu Aman Resmi Kampus
              </h3>
              <p className="text-[11px] text-slate-500">
                Disarankan bertemu di lokasi resmi yang diawasi keamanan kampus.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-[4px] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* List of Points */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {safePointsList.map((pt, pIdx) => {
              const isSelected = selectedSafePointId === pt.id;
              return (
                <button
                  key={`safe-pt-${pt.id}-${pIdx}`}
                  type="button"
                  onClick={() => onSelectSafePointId(pt.id)}
                  className={`p-3 rounded-[6px] border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-slate-800 bg-slate-50 text-slate-900 font-semibold ring-1 ring-slate-800'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-900 line-clamp-1">
                    🛡️ {pt.nama_lokasi}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                    {pt.alamat_lengkap}
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-800 font-medium mt-1.5">
                    {pt.ada_satpam && <span>• 👮 Satpam</span>}
                    {pt.ada_cctv && <span>• 📹 CCTV</span>}
                    <span>• 🕒 {pt.jam_buka}-{pt.jam_tutup}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Leaflet OSM Map Preview for selected point */}
          {currentPt && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">
                  Pratinjau Peta (Leaflet OpenStreetMap):
                </span>
                <span className="text-[10px] text-slate-400">Gratis & Presisi</span>
              </div>
              <LeafletSafeMap
                lat={currentPt.latitude}
                lng={currentPt.longitude}
                locationName={currentPt.nama_lokasi}
                address={currentPt.alamat_lengkap}
                heightClass="h-[180px]"
              />
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-[6px] transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={onShareSafePoint}
              className="px-5 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-[6px] shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <MapPin size={14} />
              <span>Bagikan ke Chat Ini</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
