import type { ConfigEnv, UserConfig } from 'vite';
import { defineConfig } from 'vite';
import { pluginExposeRenderer } from './vite.base.config';

import tsconfigPaths from 'vite-tsconfig-paths';
// https://vitejs.dev/config
export default defineConfig((env) => {
    const forgeEnv = env as ConfigEnv<'renderer'>;
    const { root, mode, forgeConfigSelf } = forgeEnv;
    const name = forgeConfigSelf.name ?? '';

    return {
        root,
        mode,
        base: './',
        build: {
            outDir: `.vite/renderer/${name}`,
            chunkSizeWarningLimit: Infinity, //Suppress Warning: Some chunks are larger than 500 kB after minification.
        },
        rollupOptions: {
            output: {
                format: 'cjs',
            },
        },
        plugins: [tsconfigPaths(), pluginExposeRenderer(name)],
        resolve: {
            preserveSymlinks: true,
            alias: [{ find: 'src', replacement: '/src' }],
        },
        clearScreen: false,
    } as UserConfig;
});
