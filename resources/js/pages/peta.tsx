// resources/js/Pages/peta.tsx
import { useEffect, useMemo, useState } from "react";
import { Head } from "@inertiajs/react";

import { Menu , Home as HomeIcon} from "lucide-react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  LayersControl,
  LayerGroup,
  useMap,
  useMapEvents,
  ScaleControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

/** ---------- FIX ICON LEAFLET (untuk bundler modern) ---------- */
// @ts-expect-error: Leaflet types tidak mendefinisikan _getIconUrl sehingga perlu dihapus manual
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});
/** ------------------------------------------------------------- */

type Category = { id: number; name: string };
type Laporan = {
  id: number;
  category_id: number;
  category?: Category;
  nama?: string;
  detail_lokasi?: string;
  deskripsi_laporan?: string;
  gambar?: string | null;
  latitude: number | string;
  longitude: number | string;
  tanggal?: string;
  waktu?: string;
};

/** Warna default per kategori agar konsisten di legend/marker */
const COLOR_BY_NAME: Record<string, string> = {
  Mangrove: "#2ecc71",
  Lamun: "#27ae60",
  Dugong: "#f1c40f",
};
const FALLBACK_COLORS = [
  "#f39c12", 
  "#3498db", 
  "#9b59b6", 
  "#16a085", 
  "#e74c3c", 
  "#1abc9c", 
  "#2ecc71", 
  "#e67e22", 
  "#34495e", 
  "#d35400",
  "#8e44ad", 
  "#27ae60", 
  "#c0392b", 
  "#2980b9", 
  "#f1c40f", 
  "#7f8c8d", 
];

function getCategoryColor(cat: Category, index: number) {
  return COLOR_BY_NAME[cat.name] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

/** Icon titik kecil berwarna (mirip dot/POI) */
function dotIcon(color: string) {
  return L.divIcon({
    className: "category-dot",
    html: `<span style="
      display:inline-block;width:14px;height:14px;border-radius:50%;
      background:${color};border:2px solid #fff;box-shadow:0 0 2px rgba(0,0,0,.6)
    "></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -6],
  });
}

/** Koordinat mouse di overlay kiri bawah */
function MouseCoordinates({ setText }: { setText: (t: string) => void }) {
  useMapEvents({
    mousemove(e) {
      setText(
        `Lat: ${e.latlng.lat.toFixed(6)}  |  Lng: ${e.latlng.lng.toFixed(6)}`
      );
    },
    mouseout() {
      setText("");
    },
  });
  return null;
}

/** Tombol reset ke “home view” (center + zoom awal) */
function HomeButton({
  center,
  zoom,
}: {
  center: L.LatLngExpression;
  zoom: number;
}) {
  const map = useMap();
  return (
    <div className="absolute top-[80px] left-2 z-[1000]">
      <button
        onClick={() => map.setView(center, zoom, { animate: true })}
        className=" rounded-[3px] bg-white border border-gray-400 shadow px-2 py-1 text-xs hover:bg-gray-50"
        title="Kembali ke tampilan awal"
        type="button"
        aria-label="Home view"
      >
        <HomeIcon size={18} />
      </button>
    </div>
  );
}

{/* Legend (responsif) */}
function Legend({ categories }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop: Legend selalu tampil */}
      <div
        className="
          absolute top-1/2 right-2 -translate-y-1/2
          bg-white/95 shadow-lg border rounded
          p-2 sm:p-3
          text-xs sm:text-sm
          w-[90px] sm:min-w-[130px] max-w-[50vw]
          z-[1000]
          hidden sm:block
        "
      >
        <div className="font-semibold mb-1 sm:mb-2">Legenda</div>
        <ul className="space-y-1">
          {categories.map((c, idx) => (
            <li key={c.id} className="flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border"
                style={{
                  background: getCategoryColor(c, idx),
                  borderColor: "#e5e7eb",
                }}
              />
              <span className="truncate">{c.name}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Mobile: Tombol hamburger */}
      <div className="absolute top-1/2 right-2 -translate-y-1/2 z-[1000] block sm:hidden">
        <button
          onClick={() => setOpen(!open)}
          className="bg-white/95 border rounded p-2 shadow-lg hover:bg-gray-100"
        >
          <Menu size={18} />
        </button>

        {open && (
          <div className="mt-2 bg-white/95 shadow-lg border rounded p-2 text-xs w-[140px] max-w-[80vw]">
            <div className="font-semibold mb-1">Legenda</div>
            <ul className="space-y-1">
              {categories.map((c, idx) => (
                <li key={c.id} className="flex items-center gap-2">
                  <span
                    className="inline-block w-3 h-3 rounded-full border"
                    style={{
                      background: getCategoryColor(c, idx),
                      borderColor: "#e5e7eb",
                    }}
                  />
                  <span className="truncate">{c.name}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
export default function Peta() {

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCatIds, setSelectedCatIds] = useState<number[]>([]); // awalnya KOSONG -> tidak ada marker
  const [laporans, setLaporans] = useState<Laporan[]>([]);
  const [loading, setLoading] = useState(false);
  const [mouseText, setMouseText] = useState("");

  // Pusat peta Bintan
  const mapCenter: L.LatLngExpression = [1.0456, 104.4445];
  const zoomLevel = 10;

  /** Ambil daftar kategori saat mount (tidak otomatis memilih!) */
  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/categories");
        const json = await res.json();
        setCategories(json?.data ?? []);
      } catch (e) {
        console.error("Gagal ambil kategori:", e);
      }
    };
    run();
  }, []);

  /** Ambil laporan hanya kalau ada kategori yang dipilih */
  const fetchLaporans = async (catIds: number[]) => {
    if (!catIds.length) {
      setLaporans([]);
      return;
    }
    setLoading(true);
    try {
      const q = `?categories=${encodeURIComponent(catIds.join(","))}`;
      const res = await fetch(`/api/laporans${q}`);
      const json = await res.json();
      setLaporans(json?.success ? (json.data as Laporan[]) : []);
    } catch (e) {
      console.error("Gagal ambil laporans:", e);
      setLaporans([]);
    } finally {
      setLoading(false);
    }
  };

  /** Refetch saat pilihan berubah */
  useEffect(() => {
    fetchLaporans(selectedCatIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCatIds]);

  /** Toggle satu kategori */
  const onToggleCategory = (id: number) => {
    setSelectedCatIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  /** Info ringkas */
  const summary = useMemo(() => {
    if (!selectedCatIds.length) return "Aktifkan layer untuk menampilkan titik.";
    if (loading) return "Memuat titik…";
    return `Menampilkan ${laporans.length} titik terverifikasi.`;
  }, [loading, laporans.length, selectedCatIds.length]);

  return (
    <>
      <Head title="Peta Penampakan">
        <link rel="preconnect" href="https://fonts.bunny.net" />
        <link
          href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
          rel="stylesheet"
        />
      </Head>
          {/* Konten utama */}
         
            <div className="max-w-7xl mx-auto space-y-4">
              {/* Panel Filter/Layer */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Katalog Layer
                  </h2>
                  <div className="text-sm text-gray-500">{summary}</div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {categories.map((cat, idx) => (
                    <label
                      key={cat.id}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer select-none ${
                        selectedCatIds.includes(cat.id)
                          ? "bg-blue-50 border-blue-300 text-blue-700"
                          : "bg-white border-gray-300 text-gray-700"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCatIds.includes(cat.id)}
                        onChange={() => onToggleCategory(cat.id)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      {/* dot warna kecil biar konsisten sama legend/marker */}
                      <span
                        className="inline-block w-3 h-3 rounded-full border"
                        style={{
                          background: getCategoryColor(cat, idx),
                          borderColor: "#e5e7eb",
                        }}
                      />
                      <span className="font-medium">{cat.name}</span>
                    </label>
                  ))}

                  {/* Tombol bantu */}
                  <div className="ml-auto flex gap-2">
                    <button
                      onClick={() => setSelectedCatIds(categories.map((c) => c.id))}
                      className="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-100"
                    >
                      Pilih Semua
                    </button>
                    <button
                      onClick={() => setSelectedCatIds([])}
                      className="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-100"
                    >
                      Hapus Semua
                    </button>
                  </div>
                </div>
              </div>

              {/* Peta (BUKAN full-screen) */}
              <div className="h-[90vh] w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative">
                <MapContainer
                  center={mapCenter}
                  zoom={zoomLevel}
                  style={{ height: "100%", width: "100%" }}
                  attributionControl={true}
                >
                  {/* Base map switcher */}
                  <LayersControl position="topright">
                    <LayersControl.BaseLayer checked name="OpenStreetMap">
                      <TileLayer
                        attribution="&copy; OpenStreetMap contributors"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                    </LayersControl.BaseLayer>

                    <LayersControl.BaseLayer name="Satelit (ESRI)">
                      <TileLayer
                        attribution="&copy; Esri — World Imagery"
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                      />
                    </LayersControl.BaseLayer>

                    <LayersControl.BaseLayer name="Dark Mode (Carto)">
                      <TileLayer
                        attribution="&copy; Carto"
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                      />
                    </LayersControl.BaseLayer>
                  </LayersControl>

                  {/* Overlay: Titik per kategori
                      Catatan penting:
                      - Tidak render marker apapun kalau selectedCatIds.length === 0
                      - Data sudah difilter di sisi klien berdasar category_id
                  */}
                  {selectedCatIds.length > 0 &&
                    categories.map((cat, idx) => {
                      const color = getCategoryColor(cat, idx);
                      return (
                        <LayerGroup key={cat.id}>
                          {laporans
                            .filter((lap) => lap.category_id === cat.id)
                            .map((lap) => {
                              const lat =
                                typeof lap.latitude === "string"
                                  ? parseFloat(lap.latitude)
                                  : lap.latitude;
                              const lng =
                                typeof lap.longitude === "string"
                                  ? parseFloat(lap.longitude)
                                  : lap.longitude;
                              if (isNaN(lat as number) || isNaN(lng as number)) return null;

                              return (
                                <Marker
                                  key={lap.id}
                                  position={[lat as number, lng as number]}
                                  icon={dotIcon(color)}
                                >
                                  <Popup>
                                    <div className="space-y-1">
                                      <div className="font-semibold">
                                        {lap.category?.name ?? "Tanpa Kategori"}
                                      </div>
                                      {lap.nama && (
                                        <div className="text-sm text-gray-700">
                                          Pelapor: {lap.nama}
                                        </div>
                                      )}
                                      {lap.tanggal && lap.waktu && (
                                        <div className="text-xs text-gray-500">
                                          {lap.tanggal} • {lap.waktu}
                                        </div>
                                      )}
                                      {lap.detail_lokasi && (
                                        <div className="text-sm text-gray-700">
                                          <span className="font-medium">Lokasi:</span>{" "}
                                          {lap.detail_lokasi}
                                        </div>
                                      )}
                                      {lap.deskripsi_laporan && (
                                        <div className="text-sm text-gray-700">
                                          <span className="font-medium">Deskripsi:</span>{" "}
                                          {lap.deskripsi_laporan}
                                        </div>
                                      )}
                                      {lap.gambar && (
                                        <img
                                          src={`/storage/${lap.gambar}`}
                                          alt="Gambar laporan"
                                          className="mt-2 rounded-md max-w-[180px] max-h-[120px] object-cover border"
                                        />
                                      )}
                                    </div>
                                  </Popup>
                                </Marker>
                              );
                            })}
                        </LayerGroup>
                      );
                    })}

                  {/* scale bar & koordinat pointer */}
                  <ScaleControl position="bottomleft" />
                  <MouseCoordinates setText={setMouseText} />

                  {/* tombol home/reset view */}
                  <HomeButton center={mapCenter} zoom={zoomLevel} />
                </MapContainer>

               
              <Legend categories={categories} />

               
                <div
                className="
                  absolute bottom-2 left-1/2 -translate-x-1/2
                  bg-white/95 px-2 py-1
                  rounded shadow
                  text-[10px] sm:text-xs
                  border
                  max-w-[85vw]
                  truncate
                  z-[1000]
                "
              >
                {mouseText }
              </div>

              </div>

              {/* Info ketika kosong */}
              {!loading && selectedCatIds.length > 0 && laporans.length === 0 && (
                <div className="text-center text-gray-600 text-sm">
                  Tidak ada titik terverifikasi untuk filter yang dipilih.
                </div>
              )}
            </div>
          
      
      
    </>
  );
}
