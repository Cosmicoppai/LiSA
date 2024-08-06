const { spawnSync } = require('child_process');
const spawnOptions = { detached: false, shell: true, stdio: 'inherit' };

console.log('Creating Python distribution files...');

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
