
import { Head } from '@inertiajs/react';


export default function Landing() {


  return (
    <>
      <Head title="Landing">
        <link rel="preconnect" href="https://fonts.bunny.net" />
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
      </Head>

            <div className="max-w-7xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  Welcome to Dugong Watch
                </h2>
                <p className="text-base lg:text-lg text-gray-600">
                  Monitor dan kelola data dugong dengan mudah melalui dashboard ini.
                </p>
              </div>
              
              {/* Content cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 ml-3">Total Laporan</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-2">124</p>
                  <p className="text-sm text-gray-500">+12 dari minggu lalu</p>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 ml-3">Lokasi Aktif</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-2">8</p>
                  <p className="text-sm text-gray-500">Area pemantauan</p>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 md:col-span-2 lg:col-span-1">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 ml-3">Status Sehat</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-2">95%</p>
                  <p className="text-sm text-gray-500">Tingkat kesehatan populasi</p>
                </div>
              </div>
              
              {/* Additional content area */}
              <div className="mt-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Aktivitas Terbaru</h3>
                  <p className="text-gray-600">
                    Konten dashboard lainnya dapat ditambahkan di sini. Area ini responsif dan akan menyesuaikan dengan ukuran layar.
                  </p>
                </div>
              </div>
            </div>
         
      
    </>
  );
}