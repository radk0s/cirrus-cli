module.exports = function Provider(config) {
    return providerName => {
        switch (providerName) {
            case 'aws': return require('./providers/aws')(config.aws);
            case 'softlayer': return require('./providers/aws')(config.softlayer)

        }
    }
};