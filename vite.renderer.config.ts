import react from '@vitejs/plugin-react';
import type { ConfigEnv, UserConfig } from 'vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

import { pluginExposeRenderer } from './vite.base.config.js';

// https://vitejs.dev/config
export default defineConfig((env) => {
    const forgeEnv = env as ConfigEnv<'renderer'>;
    const { root, mode, forgeConfigSelf, command } = forgeEnv;
    const name = forgeConfigSelf.name ?? '';

    const userConfig: UserConfig = {
        root,
        mode,
        base: './',
        build: {
            outDir: `.vite/renderer/${name}`,
            chunkSizeWarningLimit: Infinity, //Suppress Warning: Some chunks are larger than 500 kB after minification.
            rollupOptions: {
                // https://stackoverflow.com/questions/76694615/module-level-directives-cause-errors-when-bundled-use-client-was-ignored-caus
                onwarn(warning, warn) {
                    if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
                    warn(warning);
                },
            },
        },
        plugins: [tsconfigPaths(), pluginExposeRenderer(name), react()],
        resolve: {
            preserveSymlinks: true,
        },
        clearScreen: false,
        esbuild:
            command === 'build'
                ? {
                      drop: ['console', 'debugger'],
                  }
                : {},
    };

    return userConfig;
});
