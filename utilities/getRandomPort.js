const net = require('net');

module.exports.getRandomPort = async (callback) => {
    return new Promise((resolve, reject) => {
        const server = net.createServer();

        server.on('error', (err) => {
            callback({ err });
            resolve({ err })
        });

        server.on('listening', () => {
            const port = server.address().port;
            server.close(() => {
                // console.log(port);
                // callback({ port });
                resolve({ port })
            });
        });

        server.listen();
    })
}

// getRandomPort((err, port) => {
//     if (err) {
//         console.error('Error finding available port:', err);
//     } else {
//         console.log('Available port:', port);
//     }
// });