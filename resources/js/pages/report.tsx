import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import MapComponent from './components/Map';

// Interface untuk data form
interface FormData {
    category_id: string;
    nama: string;
    email: string;
    telepon: string;
    tanggal: string;
    waktu: string;
    kondisi: string;
    detail_lokasi: string;
    deskripsi_laporan: string;
    gambar: File | null;
    latitude: number;
    longitude: number;
}

// Interface untuk errors
interface FormErrors {
    [key: string]: string;
}

// Interface untuk category
interface Category {
    id: number;
    name: string;
}

const Report = () => {
    
    // State untuk data form
    const [formData, setFormData] = useState<FormData>({
        category_id: '',
        nama: '',
        email: '',
        telepon: '',
        tanggal: '',
        waktu: '',
        kondisi: 'Hidup',
        detail_lokasi: '',
        deskripsi_laporan: '',
        gambar: null,
        latitude: 0,
        longitude: 0,
    });
    
    // State untuk categories, loading, errors, dan success
    const [categories, setCategories] = useState<Category[]>([]);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSuccess, setIsSuccess] = useState<boolean>(false);

    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

    // Fungsi untuk mendapatkan opsi kondisi berdasarkan kategori
    const getKondisiOptions = () => {
        const selectedCategory = categories.find(cat => cat.id.toString() === formData.category_id);
        const categoryName = selectedCategory?.name.toLowerCase() || '';
        
        // Jika kategori adalah dugong, tampilkan semua opsi
        if (categoryName.includes('dugong')) {
            return [
                { value: 'Hidup', label: 'Hidup' },
                { value: 'Mati', label: 'Mati' },
                { value: 'Terluka', label: 'Terluka' }
            ];
        }
        
        // Jika kategori mangrove, lamun, atau lainnya, hanya hidup dan mati
        return [
            { value: 'Hidup', label: 'Hidup' },
            { value: 'Mati', label: 'Mati' }
        ];
    };

    // Fetch categories on component mount
    useEffect(() => {
        fetchCategories();
    }, []);

    // Effect untuk reset kondisi ketika kategori berubah
    useEffect(() => {
        if (formData.category_id) {
            const availableOptions = getKondisiOptions();
            const currentKondisiExists = availableOptions.some(option => option.value === formData.kondisi);
            
            // Jika kondisi saat ini tidak tersedia untuk kategori yang dipilih, reset ke default
            if (!currentKondisiExists) {
                setFormData(prev => ({
                    ...prev,
                    kondisi: 'Hidup' // Reset ke default
                }));
            }
        }
    }, [formData.category_id, categories]);

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories');
            if (response.ok) {
                const data = await response.json();
                setCategories(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error untuk field ini jika ada
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        setFormData(prev => ({
            ...prev,
            gambar: file
        }));
    };

    const setCoordinates = (lat: number, lon: number) => {
        setFormData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lon
        }));
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.category_id) newErrors.category_id = 'Kategori laporan harus dipilih';
        if (!formData.nama.trim()) newErrors.nama = 'Nama pelapor harus diisi';
        if (!formData.email.trim()) newErrors.email = 'Email harus diisi';
        else if (!formData.email.includes('@')) newErrors.email = 'Format email tidak valid';
        if (!formData.telepon.trim()) newErrors.telepon = 'Nomor telepon harus diisi';
        if (!formData.tanggal) newErrors.tanggal = 'Tanggal penampakan harus diisi';
        if (!formData.waktu) newErrors.waktu = 'Waktu penampakan harus diisi';
        if (!formData.detail_lokasi.trim()) newErrors.detail_lokasi = 'Detail lokasi harus diisi';
        if (!formData.deskripsi_laporan.trim()) newErrors.deskripsi_laporan = 'Deskripsi laporan harus diisi';
        if (formData.latitude === 0 && formData.longitude === 0) {
            newErrors.koordinat = 'Silakan tandai lokasi di peta';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsSubmitting(true);
        setIsSuccess(false);

        try {
            const submitData = new FormData();
            
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    if (key === 'gambar' && value instanceof File) {
                        submitData.append(key, value);
                    } else if (typeof value === 'string' || typeof value === 'number') {
                        submitData.append(key, value.toString());
                    }
                }
            });

            const response = await fetch('/laporan', {
                method: 'POST',
                body: submitData,
                headers: {
                    'X-CSRF-TOKEN': token,
                    'Accept': 'application/json'
                }
            });
          
            if (response.ok) {
                setIsSuccess(true);
                
                // Reset form
                setFormData({
                    category_id: '',
                    nama: '',
                    email: '',
                    telepon: '',
                    tanggal: '',
                    waktu: '',
                    kondisi: 'Hidup',
                    detail_lokasi: '',
                    deskripsi_laporan: '',
                    gambar: null,
                    latitude: 0,
                    longitude: 0,
                });
                
                // Hide success message after 5 seconds
                setTimeout(() => {
                    setIsSuccess(false);
                }, 5000);
            } else {
                const errorData = await response.json();
                setErrors(errorData.errors || { submit: 'Terjadi kesalahan saat mengirim laporan' });
            }
        } catch (error) {
            setErrors({ submit: `Terjadi kesalahan koneksi. Silakan coba lagi.`});
        } finally {
            setIsSubmitting(false);
        }
    };

    // Mendapatkan nama kategori untuk label kondisi
    const getKondisiLabel = () => {
        const selectedCategory = categories.find(cat => cat.id.toString() === formData.category_id);
        const categoryName = selectedCategory?.name.toLowerCase() || '';
        
        if (categoryName.includes('dugong')) {
            return 'Kondisi Dugong';
        } else if (categoryName.includes('mangrove')) {
            return 'Kondisi Mangrove';
        } else if (categoryName.includes('lamun')) {
            return 'Kondisi Lamun';
        }
        
        return 'Kondisi';
    };

    return (
        <>
            <Head title="Laporan Dugong" />
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                        Laporan Penampakan Dugong
                    </h2>
                    <p className="text-base lg:text-lg text-gray-600">
                        Laporkan dugong yang Anda temukan untuk membantu upaya konservasi
                        dan menjaga keberlangsungan habitat laut kita.
                    </p>
                </div>

                {/* Alert Messages */}
                {isSuccess && (
                    <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-xl mb-6 shadow-sm">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <strong className="font-semibold">Berhasil!</strong>
                                <span className="ml-2">Laporan Anda telah berhasil dikirim dan akan segera diverifikasi.</span>
                            </div>
                        </div>
                    </div>
                )}

                {errors.submit && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl mb-6 shadow-sm">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <strong className="font-semibold">Error!</strong>
                                <span className="ml-2">{errors.submit}</span>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 lg:p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Kategori Laporan */}
                            <div>
                                <label htmlFor="category_id" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Kategori Laporan <span className="text-red-500">*</span>
                                </label>
                                <select 
                                    name="category_id" 
                                    id="category_id" 
                                    value={formData.category_id} 
                                    onChange={handleInputChange} 
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                                    required
                                >
                                    <option value="">Pilih kategori laporan</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.category_id && <p className="text-red-500 text-sm mt-2">{errors.category_id}</p>}
                            </div>

                            {/* Data Pelapor */}
                            <div className="border-t border-gray-100 pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Pelapor</h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="nama" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Nama Lengkap <span className="text-red-500">*</span>
                                        </label>
                                        <input 
                                            type="text" 
                                            name="nama" 
                                            id="nama" 
                                            value={formData.nama} 
                                            onChange={handleInputChange} 
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors" 
                                            required 
                                            placeholder="Masukkan nama lengkap"
                                        />
                                        {errors.nama && <p className="text-red-500 text-sm mt-2">{errors.nama}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="telepon" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Nomor Telepon <span className="text-red-500">*</span>
                                        </label>
                                        <input 
                                            type="tel" 
                                            name="telepon" 
                                            id="telepon" 
                                            value={formData.telepon} 
                                            onChange={handleInputChange} 
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors" 
                                            required 
                                            placeholder="08xxxxxxxxxx"
                                        />
                                        {errors.telepon && <p className="text-red-500 text-sm mt-2">{errors.telepon}</p>}
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="email" 
                                        name="email" 
                                        id="email" 
                                        value={formData.email} 
                                        onChange={handleInputChange} 
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors" 
                                        required 
                                        placeholder="contoh@email.com"
                                    />
                                    {errors.email && <p className="text-red-500 text-sm mt-2">{errors.email}</p>}
                                </div>
                            </div>
                            
                            {/* Detail Penampakan */}
                            <div className="border-t border-gray-100 pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detail Penampakan</h3>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                                    <div>
                                        <label htmlFor="tanggal" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Tanggal <span className="text-red-500">*</span>
                                        </label>
                                        <input 
                                            type="date" 
                                            name="tanggal" 
                                            id="tanggal" 
                                            value={formData.tanggal} 
                                            onChange={handleInputChange} 
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors" 
                                            required 
                                        />
                                        {errors.tanggal && <p className="text-red-500 text-sm mt-2">{errors.tanggal}</p>}
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="waktu" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Waktu <span className="text-red-500">*</span>
                                        </label>
                                        <input 
                                            type="time" 
                                            name="waktu" 
                                            id="waktu" 
                                            value={formData.waktu} 
                                            onChange={handleInputChange} 
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors" 
                                            required 
                                        />
                                        {errors.waktu && <p className="text-red-500 text-sm mt-2">{errors.waktu}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="kondisi" className="block text-sm font-semibold text-gray-700 mb-2">
                                            {getKondisiLabel()} <span className="text-red-500">*</span>
                                        </label>
                                        <select 
                                            name="kondisi" 
                                            id="kondisi" 
                                            value={formData.kondisi} 
                                            onChange={handleInputChange} 
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                                            required
                                        >
                                            {getKondisiOptions().map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.kondisi && <p className="text-red-500 text-sm mt-2">{errors.kondisi}</p>}
                                    </div>
                                </div>
                                
                                <div className="mb-6">
                                    <label htmlFor="deskripsi_laporan" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Deskripsi Penampakan <span className="text-red-500">*</span>
                                    </label>
                                    <textarea 
                                        name="deskripsi_laporan" 
                                        id="deskripsi_laporan" 
                                        rows={4} 
                                        value={formData.deskripsi_laporan} 
                                        onChange={handleInputChange} 
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors" 
                                        placeholder="Jelaskan detail penampakan dugong yang Anda lihat (ukuran, perilaku, kondisi lingkungan, dll)..."
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-2">Maksimal 2000 karakter</p>
                                    {errors.deskripsi_laporan && <p className="text-red-500 text-sm mt-2">{errors.deskripsi_laporan}</p>}
                                </div>

                                <div>
                                    <label htmlFor="gambar" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Foto/Gambar (Opsional)
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                                        <input 
                                            type="file" 
                                            name="gambar" 
                                            id="gambar" 
                                            accept="image/*"
                                            onChange={handleFileChange} 
                                            className="hidden"
                                        />
                                        <label htmlFor="gambar" className="cursor-pointer">
                                            <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                            <p className="text-gray-600">
                                                {formData.gambar ? (
                                                    <span className="text-green-600 font-medium">✅ File dipilih: {formData.gambar.name}</span>
                                                ) : (
                                                    <>
                                                        <span className="text-blue-600 font-medium">Klik untuk upload gambar</span>
                                                        <span className="block text-sm text-gray-500 mt-1">atau drag & drop file di sini</span>
                                                    </>
                                                )}
                                            </p>
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">Format yang didukung: JPG, PNG, GIF (maksimal 5MB)</p>
                                    {errors.gambar && <p className="text-red-500 text-sm mt-2">{errors.gambar}</p>}
                                </div>
                            </div>

                            {/* Lokasi */}
                            <div className="border-t border-gray-100 pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Lokasi</h3>
                                
                                <div className="mb-6">
                                    <label htmlFor="detail_lokasi" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Detail Lokasi <span className="text-red-500">*</span>
                                    </label>
                                    <textarea 
                                        name="detail_lokasi" 
                                        id="detail_lokasi" 
                                        rows={3} 
                                        value={formData.detail_lokasi} 
                                        onChange={handleInputChange} 
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors" 
                                        placeholder="Contoh: Pantai Tanjung Benoa, dekat dermaga nelayan, sekitar 200 meter dari bibir pantai..."
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-2">Jelaskan lokasi secara detail (nama tempat, landmark terdekat, kedalaman air, dll.) - Maksimal 1000 karakter</p>
                                    {errors.detail_lokasi && <p className="text-red-500 text-sm mt-2">{errors.detail_lokasi}</p>}
                                </div>

                                {/* Peta Lokasi */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Tandai Lokasi di Peta <span className="text-red-500">*</span>
                                    </label>
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                        <MapComponent setCoordinates={setCoordinates} />
                                        <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-700">Koordinat:</span>
                                                <span className={`text-sm font-mono ${formData.latitude !== 0 || formData.longitude !== 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                    {formData.latitude !== 0 || formData.longitude !== 0 ? '✅' : '❌'} 
                                                    {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {formData.latitude === 0 && formData.longitude === 0 
                                                    ? 'Klik pada peta untuk menandai lokasi penampakan dugong'
                                                    : 'Lokasi berhasil ditandai pada peta'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    {errors.koordinat && <p className="text-red-500 text-sm mt-2">{errors.koordinat}</p>}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="border-t border-gray-100 pt-6">
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting} 
                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100"
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Mengirim Laporan...
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                            Kirim Laporan
                                        </div>
                                    )}
                                </button>
                                
                                <p className="text-center text-sm text-gray-500 mt-3">
                                    Dengan mengirim laporan ini, Anda membantu upaya konservasi dugong di Indonesia
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Report;