module.exports = {
    providers: {
        aws: {
            accessKey: 'acckey',
            secretKey: 'seckey',
            region: 'eu-central-1'
        },
        softlayer: {
            user: 'usr',
            apiKey: 'apikey'
        },
        vbox: {

        }
    },
    machines: [
        {
            name: 'superb-docker-machine',
            provider: 'aws',
            instanceType: 't2.nano'
        },
        {
            name: 'superb-docker-machine-2',
            provider: 'aws',
            instanceType: 't2.micro'
        }

    ],
    services: [
        {
            name: 'supervisor',
            image: 'blostic/supervisor',
            destinationMachine: 'superb-docker-machine'
        },
        {
            name: 'slave1',
            image: 'blostic/slave',
            destinationMachine: 'superb-docker-machine-2'
        },
        {
            name: 'slave2',
            image: 'blostic/slave',
            destinationMachine: 'superb-docker-machine-2'
        }
    ]
}