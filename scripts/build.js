const { spawnSync } = require('child_process');
const spawnOptions = { detached: false, shell: true, stdio: 'inherit' };

/**
 * @namespace Builder
 * @description - Builds React & Python builds of project so Electron can be used.
 */
class Builder {
    /**
     * @description - Creates React and Python production builds.
     * @memberof Builder
     */
    buildAll = () => {
        const { buildPython, buildReact } = this;

        buildPython();
        buildReact();
    };

    /**
     * @description - Creates production build of Python back end.
     * @memberof Builder
     */
    buildPython = () => {
        console.log('Creating Python distribution files...');

        const app = 'backend/LiSA.py';
        const icon = './public/favicon.ico';

        const options = [
            '--noconfirm', // Don't confirm overwrite
            '--distpath ./resources', // Dist (out) path
            `--icon ${icon}`, // Icon to use
        ].join(' ');

        switch (process.platform) {
            case 'win32':
                spawnSync(`pyinstaller spec/windows.spec --clean`, spawnOptions);
                break;
            case 'linux':
                spawnSync(`pyinstaller spec/linux.spec --clean`, spawnOptions);
                break;
            case 'darwin':
                spawnSync(`pyinstaller spec/darwin.spec --clean`, spawnOptions);
                break;
            default:
                throw Error('Unsupported Platform');
        }
    };

    /**
     * @description - Creates production build of React front end.
     * @memberof Builder
     */
    buildReact = () => {
        console.log('Creating React distribution files...');
        spawnSync(`tsc && vite build`, spawnOptions);
    };
}

module.exports.Builder = Builder;
