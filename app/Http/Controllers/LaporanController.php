<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Laporan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
class LaporanController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validasi input
        $validator = Validator::make($request->all(), [
            'category_id' => 'required|exists:categories,id',
            'nama' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'telepon' => 'required|string|max:20',
            'tanggal' => 'required|date',
            'waktu' => 'required|date_format:H:i',
            'kondisi' => 'required|in:Hidup,Mati,Terluka',
            'detail_lokasi' => 'required|string|max:1000',
            'deskripsi_laporan' => 'required|string|max:2000',
            'gambar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB max
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ], [
            'category_id.required' => 'Kategori laporan harus dipilih',
            'category_id.exists' => 'Kategori laporan tidak valid',
            'nama.required' => 'Nama pelapor harus diisi',
            'email.required' => 'Email harus diisi',
            'email.email' => 'Format email tidak valid',
            'telepon.required' => 'Nomor telepon harus diisi',
            'tanggal.required' => 'Tanggal penampakan harus diisi',
            'tanggal.date' => 'Format tanggal tidak valid',
            'waktu.required' => 'Waktu penampakan harus diisi',
            'waktu.date_format' => 'Format waktu tidak valid',
            'kondisi.required' => 'Kondisi dugong harus dipilih',
            'kondisi.in' => 'Kondisi dugong harus salah satu: Hidup, Mati, atau Terluka',
            'detail_lokasi.required' => 'Detail lokasi harus diisi',
            'detail_lokasi.max' => 'Detail lokasi maksimal 1000 karakter',
            'deskripsi_laporan.required' => 'Deskripsi laporan harus diisi',
            'deskripsi_laporan.max' => 'Deskripsi laporan maksimal 2000 karakter',
            'gambar.image' => 'File harus berupa gambar',
            'gambar.mimes' => 'Format gambar harus: jpeg, png, jpg, atau gif',
            'gambar.max' => 'Ukuran gambar maksimal 5MB',
            'latitude.required' => 'Koordinat latitude harus diisi',
            'latitude.numeric' => 'Koordinat latitude harus berupa angka',
            'latitude.between' => 'Koordinat latitude harus antara -90 sampai 90',
            'longitude.required' => 'Koordinat longitude harus diisi',
            'longitude.numeric' => 'Koordinat longitude harus berupa angka',
            'longitude.between' => 'Koordinat longitude harus antara -180 sampai 180',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $validator->validated();

            // Handle file upload
            if ($request->hasFile('gambar')) {
                $gambar = $request->file('gambar');
                $filename = time() . '_' . uniqid() . '.' . $gambar->getClientOriginalExtension();
                $path = $gambar->storeAs('laporan-images', $filename, 'public');
                $data['gambar'] = $path;
            }

            // Create laporan
            $laporan = Laporan::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Laporan berhasil disimpan',
                'data' => $laporan->load('category')
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menyimpan laporan: ' . $e->getMessage(),
                'errors' => ['submit' => 'Terjadi kesalahan sistem. Silakan coba lagi.']
            ], 500);
        }
    }

    /**
     * Get categories for form dropdown
     */
    public function getCategories()
    {
        try {
            $categories = Category::select('id', 'name', 'icon')->get();
            return response()->json([
                'success' => true,
                'data' => $categories
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data kategori'
            ], 500);
        }
    }

    public function getAll(Request $request)
{
    try {
        // Ambil hanya yang TERVERIFIKASI + punya koordinat valid
        $query = Laporan::with('category')
            ->verified() // pakai scope di atas; kalau tidak pakai scope => ->where('status', true)
            ->whereNotNull('latitude')
            ->whereNotNull('longitude');

        // Filter kategori via query ?categories=1,2,3 (comma separated)
        if ($request->filled('categories')) {
            $ids = collect(explode(',', $request->query('categories')))
                ->map(fn($v) => (int) trim($v))
                ->filter()
                ->values()
                ->all();

            if (!empty($ids)) {
                $query->whereIn('category_id', $ids);
            }
        }

        // (Opsional) urut paling baru dulu
        $laporans = $query->orderByDesc('created_at')->get();

        return response()->json([
            'success' => true,
            'data' => $laporans,
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Gagal mengambil data laporan',
        ], 500);
    }
}
}
