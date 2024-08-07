const { spawnSync } = require('child_process');

console.log('Python Server - Build Starting...\n');

function getPythonServerSpecFilePath() {
    switch (process.platform) {
        case 'win32':
            return 'spec/windows.spec';
        case 'linux':
            return 'spec/linux.spec';
        case 'darwin':
            return 'spec/darwin.spec';
        default:
            throw Error('Unsupported Platform');
    }
}

const pythonServerSpecFilePath = getPythonServerSpecFilePath();

spawnSync(`pyinstaller ${pythonServerSpecFilePath} --distpath resources --clean -y`, {
    shell: true,
    stdio: 'inherit',
});

const { Cleaner } = require('./clean');
const cleaner = new Cleaner();

const removePaths = ['./build'];
removePaths.forEach(cleaner.removePath);

console.log('\nPython Server - Build Completed\n');
