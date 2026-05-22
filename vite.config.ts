import { execSync } from 'node:child_process';
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

/**
 * Resolve PHP for Wayfinder generation. Node (Vite) on Windows often lacks `php` in PATH
 * even when your terminal has it — use PHP_BINARY or detect via `where` / `which`.
 */
function resolveWayfinderCommand(): string {
    if (process.env.WAYFINDER_COMMAND) {
        return process.env.WAYFINDER_COMMAND;
    }

    const phpBinary = process.env.PHP_BINARY?.trim();
    if (phpBinary) {
        return `"${phpBinary}" artisan wayfinder:generate`;
    }

    try {
        const lookup = process.platform === 'win32' ? 'where php' : 'which php';
        const php = execSync(lookup, { encoding: 'utf8' })
            .trim()
            .split(/\r?\n/)[0]
            ?.trim();

        if (php) {
            return `"${php}" artisan wayfinder:generate`;
        }
    } catch {
        // fall through
    }

    return 'php artisan wayfinder:generate';
}

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
            command: resolveWayfinderCommand(),
        }),
    ],
    esbuild: {
        jsx: 'automatic',
    },
});
