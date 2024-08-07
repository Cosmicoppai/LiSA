import type { ConfigEnv, UserConfig } from 'vite';
import { defineConfig, mergeConfig } from 'vite';
import { getBuildConfig, getBuildDefine, external, pluginHotRestart } from './vite.base.config.js';

// https://vitejs.dev/config
export default defineConfig((env) => {
    const forgeEnv = env as ConfigEnv<'build'>;
    const { forgeConfigSelf, command } = forgeEnv;

    const define = getBuildDefine(forgeEnv);

    const config: UserConfig = {
        publicDir: command === 'build' ? false : undefined,
        build: {
            lib: {
                entry: forgeConfigSelf.entry!,
                fileName: () => '[name].js',
                formats: ['cjs'],
            },
            rollupOptions: {
                external,
            },
        },
        plugins: [pluginHotRestart('restart')],
        define,
        resolve: {
            // Load the Node.js entry.
            mainFields: ['module', 'jsnext:main', 'jsnext'],
        },
    };

    return mergeConfig(getBuildConfig(forgeEnv), config);
});
