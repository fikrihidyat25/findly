'use client';

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import { SafePoint } from '@/src/lib/safePoints';

interface LeafletSafeMapProps {
  // Single location view or picker
  lat?: number;
  lng?: number;
  locationName?: string;
  address?: string;
  // Multiple points view (e.g. for safe zones directory)
  points?: SafePoint[];
  selectedPointId?: string;
  onSelectPoint?: (point: SafePoint) => void;
  // Picker mode for admin
  isPicker?: boolean;
  onCoordinatesChange?: (lat: number, lng: number) => void;
  heightClass?: string;
}

export default function LeafletSafeMap({
  lat = -0.95772,
  lng = 100.39579,
  locationName,
  address,
  points,
  selectedPointId,
  onSelectPoint,
  isPicker = false,
  onCoordinatesChange,
  heightClass = 'h-[260px] sm:h-[320px]',
}: LeafletSafeMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    let isMounted = true;

    // Dynamically import Leaflet so it only executes on the client
    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      if (mapInstanceRef.current) return; // Map already initialized

      // Configure default Leaflet icons for Next.js bundler
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Custom icon for Safe Points
      const safeIcon = L.divIcon({
        className: 'custom-safe-pin',
        html: `
          <div style="
            background-color: #30AFFF;
            color: white;
            width: 34px;
            height: 34px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(48, 175, 255, 0.4);
            border: 2px solid white;
          ">
            <div style="transform: rotate(45deg); font-size: 15px;">🛡️</div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -32],
      });

      const centerLat = points && points.length > 0 && selectedPointId
        ? (points.find((p) => p.id === selectedPointId)?.latitude ?? lat)
        : lat;
      const centerLng = points && points.length > 0 && selectedPointId
        ? (points.find((p) => p.id === selectedPointId)?.longitude ?? lng)
        : lng;

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: false,
      }).setView([centerLat, centerLng], isPicker ? 17 : 16);

      mapInstanceRef.current = map;

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Handle Multiple Points View
      if (points && points.length > 0) {
        markersRef.current = [];
        points.forEach((pt) => {
          const isSelected = pt.id === selectedPointId;
          const marker = L.marker([pt.latitude, pt.longitude], {
            icon: safeIcon,
          }).addTo(map);

          const popupContent = `
            <div style="font-family: sans-serif; min-width: 170px; padding: 2px;">
              <div style="font-size: 11px; font-weight: 700; color: #30AFFF; margin-bottom: 2px;">🛡️ TITIK TEMU AMAN</div>
              <div style="font-size: 13px; font-weight: bold; color: #1e293b;">${pt.nama_lokasi}</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${pt.alamat_lengkap}</div>
              <div style="font-size: 10px; color: #059669; font-weight: 600; margin-top: 4px;">
                🕒 ${pt.jam_buka} - ${pt.jam_tutup} WIB ${pt.ada_satpam ? '• 👮 Satpam 24 Jam' : ''}
              </div>
            </div>
          `;
          marker.bindPopup(popupContent);

          if (isSelected) {
            marker.openPopup();
          }

          marker.on('click', () => {
            if (onSelectPoint) onSelectPoint(pt);
          });

          markersRef.current.push(marker);
        });
      } else {
        // Single Point View / Picker Mode
        const marker = L.marker([lat, lng], {
          icon: safeIcon,
          draggable: isPicker,
        }).addTo(map);
        markersRef.current = [marker]; // Store single marker

        if (locationName || address) {
          const popupContent = `
            <div style="font-family: sans-serif; min-width: 170px; padding: 2px;">
              <div style="font-size: 11px; font-weight: 700; color: #30AFFF; margin-bottom: 2px;">🛡️ TITIK TEMU AMAN</div>
              <div style="font-size: 13px; font-weight: bold; color: #1e293b;">${locationName || 'Lokasi Kampus'}</div>
              ${address ? `<div style="font-size: 11px; color: #64748b; margin-top: 2px;">${address}</div>` : ''}
            </div>
          `;
          marker.bindPopup(popupContent).openPopup();
        }

        if (isPicker && onCoordinatesChange) {
          marker.on('dragend', () => {
            const pos = marker.getLatLng();
            onCoordinatesChange(Number(pos.lat.toFixed(6)), Number(pos.lng.toFixed(6)));
          });

          map.on('click', (e: any) => {
            marker.setLatLng(e.latlng);
            onCoordinatesChange(Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6)));
          });
        }
      }

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 250);
    });

    return () => {
      isMounted = false;
      // We don't destroy the map on unmount of this effect anymore, 
      // only on component unmount if needed, but Next.js hot reload might need it.
      // Actually let's keep the map alive.
    };
  }, []); // Run ONCE on mount

  // Effect to update map view and marker when lat/lng change externally
  useEffect(() => {
    if (mapInstanceRef.current && markersRef.current.length > 0 && isPicker) {
      const map = mapInstanceRef.current;
      const marker = markersRef.current[0];
      
      const currentPos = marker.getLatLng();
      if (currentPos.lat !== lat || currentPos.lng !== lng) {
        marker.setLatLng([lat, lng]);
        map.flyTo([lat, lng], 17, { animate: true, duration: 1.5 });
      }
    }
  }, [lat, lng, isPicker]);

  return (
    <div className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-gray-200/80 shadow-xs z-0`}>
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
