import { useState, ReactNode } from "react";
import SidebarMain from "../pages/components/SidebarMain";
import { usePage } from "@inertiajs/react";

type MainLayoutProps = {
  children: ReactNode;
  pageTitle?: string; 
};

export default function MainLayout({ children, pageTitle }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { url, component } = usePage(); // Dapatkan info halaman

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Mapping path atau nama komponen ke judul
  const titleMap: Record<string, string> = {
    "/": "Beranda",
    "/laporan": "Laporan Dugong",
    "/peta": "Peta Penampakan",
    "/tren": "Tren Penampakan",
  };

  // Tentukan judul otomatis
  const dynamicTitle =
    pageTitle || titleMap[url] || titleMap[component] || "Dashboard";

  return (
    <div className="flex min-h-screen relative">
      {/* Overlay mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <SidebarMain
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 text-gray-800 transition-all duration-300">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 lg:px-6 lg:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Burger Menu */}
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                onClick={toggleSidebar}
              >
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isSidebarOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>

              {/* Judul Dinamis */}
              <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">
                {dynamicTitle}
              </h1>
            </div>
          </div>
        </div>

        {/* Children content */}
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}
