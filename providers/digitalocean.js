const dockerMachine = require('../programs/dockerMachine');
const genericProvider = require('./generic');

module.exports = function(config) {
    const queue = [];
    return Object.assign(
        genericProvider(),
        {
            create(machineName, additionalOptions) {
                return dockerMachine('create', machineName, Object.assign({
                        'driver': 'digitalocean',
                        'digitalocean-access-token': config.apiToken
                    },
                    additionalOptions)
                )
            }
        });

}