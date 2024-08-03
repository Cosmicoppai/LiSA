import type { ConfigEnv, UserConfig } from 'vite';
import { defineConfig, mergeConfig } from 'vite';
import { getBuildConfig, getBuildDefine, external, pluginHotRestart } from './vite.base.config';

// https://vitejs.dev/config
export default defineConfig((env) => {
    const forgeEnv = env as ConfigEnv<'build'>;
    const { forgeConfigSelf } = forgeEnv;
    const define = getBuildDefine(forgeEnv);
    const config: UserConfig = {
        publicDir: false,
        build: {
            lib: {
                entry: forgeConfigSelf.entry!,
                fileName: () => '[name].js',
                formats: ['cjs'],
            },
            rollupOptions: {
                external,
                output: {
                    format: 'cjs',
                },
            },
        },

        plugins: [pluginHotRestart('restart')],
        define,
        resolve: {
            alias: [{ find: 'src', replacement: '/src' }],
            // Load the Node.js entry.
            mainFields: ['module', 'jsnext:main', 'jsnext'],
        },
    };

    return mergeConfig(getBuildConfig(forgeEnv), config);
});
