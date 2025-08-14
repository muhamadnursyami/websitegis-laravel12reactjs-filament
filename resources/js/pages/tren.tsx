import React from 'react';
import { Head } from '@inertiajs/react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Registrasi komponen-komponen Chart.js yang akan digunakan
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Tipe data untuk properti yang diterima dari Laravel
interface LaporanDetail {
  id: number;
  tanggal: string;
  alamat: string;
  detail_lokasi: string;
  latitude: number;
  longitude: number;
}

interface LokasiStats {
  alamat: string;
  count: number;
  laporans: LaporanDetail[];
}

interface KondisiData {
  total: number;
  lokasi: LokasiStats[];
  rawData: LaporanDetail[];
}

interface ChartDataProps {
  Hidup: KondisiData;
  Mati: KondisiData;
  Terluka: KondisiData;
}

// Komponen untuk chart individual
const IndividualChart = ({ 
  kondisi, 
  data, 
  color 
}: { 
  kondisi: string; 
  data: KondisiData; 
  color: { bg: string; border: string; hover: string } 
}) => {
  // Ambil top 10 lokasi
  const topLokasi = data.lokasi.slice(0, 10);

  const chartData = {
    labels: topLokasi.map(item => {
      // Potong nama lokasi jika terlalu panjang
      const shortName = item.alamat.length > 25 
        ? item.alamat.substring(0, 25) + '...' 
        : item.alamat;
      return shortName;
    }),
    datasets: [
      {
        label: `Dugong ${kondisi}`,
        data: topLokasi.map(item => item.count),
        backgroundColor: color.bg,
        borderColor: color.border,
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: color.hover,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 12,
        },
        padding: 12,
        callbacks: {
          title: function(context) {
            const index = context[0].dataIndex;
            const lokasi = topLokasi[index];
            return lokasi.alamat;
          },
          label: function(context) {
            const count = context.parsed.y;
            return `Total Laporan: ${count}`;
          },
          afterLabel: function(context) {
            const index = context.dataIndex;
            const lokasi = topLokasi[index];
            const dates = lokasi.laporans.slice(0, 3).map(l => l.tanggal);
            const result = ['', 'Tanggal Laporan Terbaru:'];
            dates.forEach(date => result.push(`• ${date}`));
            
            if (lokasi.laporans.length > 3) {
              result.push(`...dan ${lokasi.laporans.length - 3} laporan lainnya`);
            }
            
            return result;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#475569',
          precision: 0,
        },
        grid: {
          color: '#e2e8f0',
        },
      },
      x: {
        ticks: {
          color: '#475569',
          font: {
            size: 11,
          },
          maxRotation: 45,
          minRotation: 0,
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg ring-1 ring-slate-900/5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Dugong {kondisi}
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Total: {data.total} laporan dari {data.lokasi.length} lokasi
          </p>
        </div>
        <div 
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: color.border }}
        />
      </div>

      {data.total > 0 ? (
        <>
          <div style={{ height: '300px' }}>
            <Bar options={options} data={chartData} />
          </div>
          
          {data.lokasi.length > 10 && (
            <p className="text-xs text-slate-500 mt-3 text-center">
              Menampilkan 10 lokasi teratas dari total {data.lokasi.length} lokasi
            </p>
          )}

          {/* Daftar lokasi lengkap */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Semua Lokasi Laporan:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {data.lokasi.map((item, index) => (
                <div 
                  key={index}
                  className="flex justify-between items-center p-2 bg-slate-50 rounded-lg text-xs"
                >
                  <span className="text-slate-700 truncate flex-1 mr-2">
                    {item.alamat}
                  </span>
                  <span 
                    className="px-2 py-1 rounded-full text-white font-semibold"
                    style={{ backgroundColor: color.border }}
                  >
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <div 
            className="w-12 h-12 rounded-full mx-auto mb-4 opacity-20"
            style={{ backgroundColor: color.border }}
          />
          <h3 className="text-lg font-semibold text-slate-700">
            Belum Ada Laporan
          </h3>
          <p className="text-slate-500 text-sm mt-1">
            Saat ini belum ada laporan dugong {kondisi.toLowerCase()} yang terverifikasi.
          </p>
        </div>
      )}
    </div>
  );
};

export default function Tren({ chartData }: { chartData: ChartDataProps }) {
  const colors = {
    Hidup: {
      bg: 'rgba(34, 197, 94, 0.7)',
      border: 'rgb(34, 197, 94)',
      hover: 'rgba(34, 197, 94, 0.9)',
    },
    Mati: {
      bg: 'rgba(239, 68, 68, 0.7)',
      border: 'rgb(239, 68, 68)',
      hover: 'rgba(239, 68, 68, 0.9)',
    },
    Terluka: {
      bg: 'rgba(245, 158, 11, 0.7)',
      border: 'rgb(245, 158, 11)',
      hover: 'rgba(245, 158, 11, 0.9)',
    },
  };

  const totalLaporan = chartData.Hidup.total + chartData.Mati.total + chartData.Terluka.total;
  const totalLokasi = new Set([
    ...chartData.Hidup.lokasi.map(l => l.alamat),
    ...chartData.Mati.lokasi.map(l => l.alamat),
    ...chartData.Terluka.lokasi.map(l => l.alamat),
  ]).size;

  return (
    <>
      <Head title="Tren Laporan Dugong" />
      <main className="min-h-screen w-full font-sans p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800">
              Tren Laporan Kondisi Dugong
            </h1>
            <p className="text-slate-600 mt-2">
              Visualisasi data laporan dugong yang telah diverifikasi berdasarkan kondisi dan lokasi.
            </p>
            
            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
              <div className="bg-white p-4 rounded-lg shadow ring-1 ring-slate-900/5">
                <div className="text-2xl font-bold text-slate-800">{totalLaporan}</div>
                <div className="text-sm text-slate-600">Total Laporan</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow ring-1 ring-slate-900/5">
                <div className="text-2xl font-bold text-green-600">{chartData.Hidup.total}</div>
                <div className="text-sm text-slate-600">Dugong Hidup</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow ring-1 ring-slate-900/5">
                <div className="text-2xl font-bold text-amber-600">{chartData.Terluka.total}</div>
                <div className="text-sm text-slate-600">Dugong Terluka</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow ring-1 ring-slate-900/5">
                <div className="text-2xl font-bold text-red-600">{chartData.Mati.total}</div>
                <div className="text-sm text-slate-600">Dugong Mati</div>
              </div>
            </div>
          </div>

          {totalLaporan > 0 ? (
            <div className="grid grid-cols-1  gap-8">
              <IndividualChart 
                kondisi="Hidup" 
                data={chartData.Hidup} 
                color={colors.Hidup} 
              />
              <IndividualChart 
                kondisi="Terluka" 
                data={chartData.Terluka} 
                color={colors.Terluka} 
              />
              <IndividualChart 
                kondisi="Mati" 
                data={chartData.Mati} 
                color={colors.Mati} 
              />
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl shadow-lg ring-1 ring-slate-900/5 text-center">
              <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-700">Data Belum Tersedia</h3>
              <p className="text-slate-500 mt-2">
                Saat ini belum ada data laporan dugong terverifikasi yang dapat ditampilkan.
                <br />
                Pastikan sudah ada category "Dugong" dan laporan dengan category tersebut.
              </p>
            </div>
          )}

          {/* Footer Info */}
          {totalLaporan > 0 && (
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-blue-800">
                  Data menampilkan laporan dugong dari <strong>{totalLokasi}</strong> lokasi berbeda. 
                  Lokasi ditentukan berdasarkan koordinat GPS yang telah diverifikasi.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}