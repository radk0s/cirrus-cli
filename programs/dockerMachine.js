'use strict';
const spawn = require('./../utils/promisifiedSpawn');

module.exports = function dockerMachine(action, machine, options) {
    let args = [action];
    for (let key in options) {
        args.push(`--${key}`);
        args.push(options[key])
    }
    args.push(machine);

    return spawn('docker-machine', args, {
        stdio: [
            0, // Use parents stdin for child
            'pipe', // Pipe child's stdout to parent
            'pipe'
        ]
    }, machine)




}