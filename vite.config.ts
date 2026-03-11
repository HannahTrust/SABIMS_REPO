import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
            valetTls: false,
        }),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
    ],
    server: {
        host: '192.168.1.181',
        port: 5173,
        strictPort: true,
        https: false,
        origin: 'http://192.168.1.181:5173',
        cors: true,
        hmr: {
            host: '192.168.1.181',
            protocol: 'ws',
        },
    },
    esbuild: {
        jsx: 'automatic',
    },
});
