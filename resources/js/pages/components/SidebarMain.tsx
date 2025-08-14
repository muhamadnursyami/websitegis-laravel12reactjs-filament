import { FC } from 'react';
import { Link, usePage } from '@inertiajs/react';

interface SidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const SidebarMain: FC<SidebarProps> = ({ isSidebarOpen, toggleSidebar }) => {
  const { url } = usePage();

  const isActive = (path: string) => url === path;

  const menuItems = [
    {
      path: '/',
      name: 'Beranda',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      path: '/laporan',
      name: 'Laporan Dugong',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      path: '/peta',
      name: 'Peta Penampakan',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      path: '/tren',
      name: 'Tren Dugong',
      icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2 2 4-4 6 6 8-8" />
    </svg>
      )
    }
  ];

  return (
    <aside 
      className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 lg:w-64
        bg-gradient-to-b from-blue-600 to-blue-700
        text-white
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        shadow-xl lg:shadow-none
      `}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-6 border-b border-blue-500/30">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold">Dugong Watch</h2>
            <p className="text-blue-200 text-sm">Monitoring System</p>
          </div>
        </div>
        
        {/* Close button untuk mobile */}
        <button
          className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
          onClick={toggleSidebar}
          aria-label="Close sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 flex-1">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link
                href={item.path}
                className={`
                  group flex items-center px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive(item.path) 
                    ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/10' 
                    : 'hover:bg-white/10 text-blue-100 hover:text-white'
                  }
                `}
                onClick={() => {
                  // Auto close sidebar pada mobile setelah navigasi
                  if (window.innerWidth < 1024) {
                    toggleSidebar();
                  }
                }}
              >
                <span className={`
                  mr-3 transition-colors duration-200
                  ${isActive(item.path) ? 'text-white' : 'text-blue-200 group-hover:text-white'}
                `}>
                  {item.icon}
                </span>
                <span className="font-medium text-sm lg:text-base">
                  {item.name}
                </span>
                
                {/* Active indicator */}
                {isActive(item.path) && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      
    </aside>
  );
};

export default SidebarMain;