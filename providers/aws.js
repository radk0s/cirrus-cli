const dockerMachine = require('../programs/dockerMachine');
const genericProvider = require('./generic');

module.exports = function(config) {
    const queue = [];
    return Object.assign(
        genericProvider(),
        {
            create(machineName, instanceType) {
                return dockerMachine('create', machineName, {
                    'driver': 'amazonec2',
                    'amazonec2-access-key': config.accessKey,
                    'amazonec2-secret-key': config.secretKey,
                    'amazonec2-region': config.region || 'eu-central-1',
                    'amazonec2-instance-type': instanceType || config.instanceType ||'t2.micro'
                })
            }
        });

}