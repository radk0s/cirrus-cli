const spawn = require('child_process').spawn;
require('colors');

module.exports = function promisifiedSpawn(exec, args, options, customName) {
    return new Promise((resolve, reject) => {
        const process = spawn(exec, args, options);

        process.stdout.on('data', (data) => {
            console.log(`${customName || exec}: `.green.bold + data.slice(0, -1).toString().white);
        });

        process.stderr.on('data', (data) => {
            console.log(`${customName || exec}: `.red.bold + data.slice(0, -1).toString().red);
        });

        process.on('close', (code) => {
            if (code === 0) {
                resolve(code)
            } else {
                reject(code)
            }
        });
    })
};