<?php

namespace App\Http\Controllers;

use App\Models\Laporan;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class TrenController extends Controller
{
    public function index()
    {
        // 1. Ambil category dugong (sesuaikan dengan nama category dugong di database)
        $dugongCategory = Category::where('name', 'Dugong')->first();
        
        if (!$dugongCategory) {
            // Jika category dugong tidak ditemukan, kembalikan data kosong
            return Inertia::render('tren', [
                'chartData' => [
                    'Hidup' => [],
                    'Mati' => [],
                    'Terluka' => [],
                ]
            ]);
        }

        // 2. Ambil laporan dugong yang sudah terverifikasi dan memiliki koordinat
        $laporansDugong = Laporan::verified()
            ->where('category_id', $dugongCategory->id)
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->orderBy('tanggal', 'desc')
            ->get();

        // 3. Siapkan struktur data untuk dikirim ke frontend
        $dataByKondisi = [
            'Hidup' => [],
            'Mati' => [],
            'Terluka' => [],
        ];

        // 4. Proses setiap laporan untuk mendapatkan alamat dari koordinat (Reverse Geocoding)
        foreach ($laporansDugong as $laporan) {
            $alamat = $this->getAlamatFromCoords($laporan->latitude, $laporan->longitude);

            // Buat objek data yang akan digunakan di chart
            $detailLaporan = [
                'id' => $laporan->id,
                'tanggal' => $laporan->tanggal->format('d M Y'),
                'alamat' => $alamat, // Alamat hasil geocoding
                'detail_lokasi' => $laporan->detail_lokasi,
                'latitude' => $laporan->latitude,
                'longitude' => $laporan->longitude,
            ];

            // Masukkan ke dalam grup berdasarkan kondisi
            if (isset($dataByKondisi[$laporan->kondisi])) {
                $dataByKondisi[$laporan->kondisi][] = $detailLaporan;
            }
        }

        // 5. Hitung statistik lokasi untuk setiap kondisi
        $chartDataWithStats = [];
        foreach ($dataByKondisi as $kondisi => $laporans) {
            // Kelompokkan berdasarkan alamat dan hitung jumlahnya
            $lokasiStats = [];
            foreach ($laporans as $laporan) {
                $alamatKey = $laporan['alamat'];
                if (!isset($lokasiStats[$alamatKey])) {
                    $lokasiStats[$alamatKey] = [
                        'alamat' => $alamatKey,
                        'count' => 0,
                        'laporans' => []
                    ];
                }
                $lokasiStats[$alamatKey]['count']++;
                $lokasiStats[$alamatKey]['laporans'][] = $laporan;
            }
            
            // Urutkan berdasarkan jumlah terbanyak
            uasort($lokasiStats, function($a, $b) {
                return $b['count'] - $a['count'];
            });

            $chartDataWithStats[$kondisi] = [
                'total' => count($laporans),
                'lokasi' => array_values($lokasiStats),
                'rawData' => $laporans
            ];
        }
        
        // 6. Kirim data yang sudah diolah ke komponen React 'tren'
        return Inertia::render('tren', [
            'chartData' => $chartDataWithStats
        ]);
    }

    /**
     * Fungsi untuk melakukan Reverse Geocoding menggunakan API Nominatim OpenStreetMap.
     *
     * @param float $latitude
     * @param float $longitude
     * @return string
     */
    private function getAlamatFromCoords($latitude, $longitude)
    {
        // URL API Nominatim
        $url = "https://nominatim.openstreetmap.org/reverse?format=json&lat={$latitude}&lon={$longitude}&zoom=14&addressdetails=1";

        try {
            // Panggil API dengan User-Agent (wajib untuk kebijakan Nominatim)
            $response = Http::withHeaders([
                'User-Agent' => 'AplikasiDugong/1.0 (emailanda@example.com)' // Ganti dengan info aplikasi Anda
            ])->timeout(10)->get($url);

            if ($response->successful()) {
                $data = $response->json();
                
                if (isset($data['display_name'])) {
                    // Ambil bagian penting dari display_name
                    $parts = explode(', ', $data['display_name']);
                    // Ambil maksimal 3 bagian pertama untuk menghindari alamat yang terlalu panjang
                    return implode(', ', array_slice($parts, 0, 3));
                } else if (isset($data['address'])) {
                    $address = $data['address'];
                    // Gabungkan beberapa bagian alamat untuk membuatnya lebih informatif
                    $lokasi = $address['village'] ?? $address['suburb'] ?? $address['town'] ?? '';
                    $kecamatan = $address['city_district'] ?? $address['county'] ?? '';
                    $kota = $address['city'] ?? $address['state'] ?? '';
                    
                    return implode(', ', array_filter([$lokasi, $kecamatan, $kota]));
                }
            }
        } catch (\Exception $e) {
            // Jika API gagal, kembalikan koordinat sebagai fallback
            return "Lat: {$latitude}, Lng: {$longitude}";
        }
        
        // Jika tidak ada hasil
        return "Lokasi tidak teridentifikasi";
    }
}