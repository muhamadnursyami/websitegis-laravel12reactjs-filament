import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
// --- [PENTING] Perbaikan untuk ikon default Leaflet ---
// Ini memperbaiki masalah di mana ikon marker tidak muncul dengan benar di React.
// @ts-expect-error: Leaflet types tidak mendefinisikan _getIconUrl sehingga perlu dihapus manual
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});
// --- Akhir dari perbaikan ikon ---

// Interface untuk props komponen Map
interface MapProps {
  setCoordinates: (lat: number, lon: number) => void;
}

// Koordinat pusat Pulau Bintan, Kepulauan Riau
const bintanCenter: L.LatLngExpression = [1.0456, 104.4445];

// Komponen untuk menangani event klik pada peta
function LocationMarker({ onPositionChange }: { onPositionChange: (pos: L.LatLng) => void }) {
  const [position, setPosition] = useState<L.LatLng | null>(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onPositionChange(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Anda memilih lokasi ini.</Popup>
    </Marker>
  );
}

// Komponen untuk mengubah view peta secara dinamis
function ChangeView({ center, zoom }: { center: L.LatLngExpression, zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

const MapComponent: React.FC<MapProps> = ({ setCoordinates }) => {
  const [currentPosition, setCurrentPosition] = useState<L.LatLngExpression>(bintanCenter);
  const [zoomLevel, setZoomLevel] = useState(10); // Zoom level untuk menampilkan Pulau Bintan

  const handlePositionChange = (pos: L.LatLng) => {
    setCoordinates(pos.lat, pos.lng);
  };

  // Fungsi untuk mendapatkan lokasi pengguna
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newPos: L.LatLngExpression = [latitude, longitude];
          setCurrentPosition(newPos);
          setZoomLevel(15); // Perbesar zoom saat lokasi ditemukan
          setCoordinates(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Tidak dapat mengakses lokasi. Pastikan Anda mengizinkan akses lokasi di browser Anda.');
        }
      );
    } else {
      alert('Geolocation tidak didukung oleh browser ini.');
    }
  };

  const resetLocation = () => {
    setCurrentPosition(bintanCenter);
    setZoomLevel(10);
    setCoordinates(0, 0); // Reset koordinat di form induk
  };

  return (
    <div className="space-y-4">
      {/* Tombol Aksi */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={getCurrentLocation}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none text-sm"
        >
          📍 Gunakan Lokasi Saya
        </button>
        <button
          type="button"
          onClick={resetLocation}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none text-sm"
        >
          🗑️ Reset ke Bintan
        </button>
      </div>

      {/* Kontainer Peta */}
      <div className="h-96 w-full rounded-lg shadow-md overflow-hidden z-0">
        <MapContainer center={currentPosition} zoom={zoomLevel} style={{ height: '100%', width: '100%' }}>
          <ChangeView center={currentPosition} zoom={zoomLevel} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker onPositionChange={handlePositionChange} />
        </MapContainer>
      </div>
       <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded-lg">
        <p>
          Klik pada peta untuk menandai lokasi penampakan dugong secara manual.
        </p>
      </div>
    </div>
  );
};

export default MapComponent;