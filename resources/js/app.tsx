import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import MainLayout from './layouts/MainLayout';



createInertiaApp({
    title: (title) => {
    // Menambahkan prefix "Dugong Watch" untuk semua halaman
    const appName = import.meta.env.VITE_APP_NAME || 'Dugong Watch';
    return title ;
  },
    resolve: async (name) => {
        const pages = import.meta.glob('./pages/**/*.tsx');
        const page = (await resolvePageComponent(
            `./pages/${name}.tsx`,
            pages
        )) as { default: React.ComponentType & { layout?: (page: React.ReactNode) => React.ReactNode } };

        // Kalau page belum punya layout, bungkus dengan MainLayout
        page.default.layout ??= (pageComponent) => (
            <MainLayout>{pageComponent}</MainLayout>
        );

        return page;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});

initializeTheme();
