import { spawn } from 'child_process';
import { app } from 'electron';
import fs from 'fs';
import path from 'path';

import { isViteDEV } from '../constants/env';

function getPythonServerCMD() {
    if (isViteDEV) return 'python backend/LiSA.py';

    switch (process.platform) {
        case 'win32':
            return `powershell -Command Start-Process -WindowStyle Hidden "${path.join(process.resourcesPath, 'resources/lisa', 'LiSA.exe')}"`;
        case 'linux':
        case 'darwin':
            return path.join(process.resourcesPath, 'resources/lisa', 'LiSA');
        default:
            // Unknown Platform.
            return null;
    }
}

export function startPythonServer() {
    const cmd = getPythonServerCMD();
    if (!cmd) {
        console.error('Unsupported platform or failed to get the command to run python server.');
        return;
    }

    const logPath = path.join(
        isViteDEV ? app.getAppPath() : path.dirname(process.execPath),
        'LiSA.log',
    );

    fs.writeFileSync(logPath, '', { encoding: 'utf8' }); // clear logs

    const pythonServer = spawn(cmd, {
        shell: true,
        detached: false,
        stdio: ['ignore', 'pipe', 'pipe'],
    });

    const logStream = fs.createWriteStream(logPath, { flags: 'a' });
    pythonServer.stdout.pipe(logStream);
    pythonServer.stderr.pipe(logStream);

    pythonServer.on('close', (_) => {
        logStream.end();
    });
}

export function killPythonServer() {
    if (process.platform === 'win32') {
        const killCmd = `tskill LiSA`;
        spawn('cmd.exe', ['/c', killCmd]);
    } else {
        const killCmd = 'pkill -f LiSA';
        spawn('sh', ['-c', killCmd]);
    }
}
