module.exports = {
    providers: {
        aws: {
            accessKey: '',
            secretKey: '',
            region: 'eu-central-1'
        },
        softlayer: {
            user: '',
            apiKey: ''
        },
        digitalocean: {
            apiToken: ''
        }
    },
    networkDiscovery: {
        name: 'consul-server',
        provider: 'softlayer'
    },
    swarmMaster: {
        name: 'swarm-master',
        provider: 'softlayer'
    },
    agents: [
        {
            name: 'swarm-agent-01',
            provider: 'softlayer'
        },
        {
            name: 'swarm-agent-02',
            provider: 'digitalocean'
        },
        {
            name: 'swarm-agent-03',
            provider: 'aws'
        }
    ]
}