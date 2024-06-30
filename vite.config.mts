import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: [{ find: 'src', replacement: '/src' }],
    },
    base: './',
    build: {
        outDir: 'build',
        rollupOptions: {
            output: {
                format: 'cjs',
            },
        },
        chunkSizeWarningLimit: Infinity, //Suppress Warning: Some chunks are larger than 500 kB after minification.
    },
    esbuild: {
        drop: ['console', 'debugger'],
    },
});
