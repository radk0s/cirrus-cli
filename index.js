const config = require('./config');
const provider = require('./Provider')(config.providers);
const docker = require('./programs/docker');
const dockerMachine = require('./programs/dockerMachine');

provider(config.networkDiscovery.provider)
    //create machine with docker for consul
    .create(config.networkDiscovery.name)
    //run consul container
    .then(() => dockerMachine('config', config.networkDiscovery.name))
    .then(rawConfiguration => Promise.resolve(rawConfiguration.slice(0,-1).split('\n')))
    .then((config) => docker(config.concat(['run', '-d', '-p', '8500:8500', '-h', 'consul',
            'progrium/consul', '-server', '-bootstrap'])))
    .catch(err => Promise.resolve()) //try process
    //create machine with swarm master
    .then(() => dockerMachine('ip', config.networkDiscovery.name))
    .then(discoveryServiceIp => provider(config.swarmMaster.provider)
        .create(config.swarmMaster.name, {
            'swarm-master': '',
            'swarm': '',
            'swarm-discovery': `consul://${discoveryServiceIp.slice(0,-1)}:8500`,
            'engine-opt': [`cluster-advertise=${config.providers[config.swarmMaster.provider].publicNetworkInterface}:2376`,
                `cluster-store=consul://${discoveryServiceIp.slice(0,-1)}:8500`]
        })
    )
    .catch(errorCode => Promise.resolve()) //try process
    //create machines with swarm agents
    .then(() => dockerMachine('ip', config.networkDiscovery.name))
    .then((discoveryServiceIp) => Promise.all(
        config.agents.map(machine => provider(machine.provider)
                .create(machine.name, {
                    'swarm': '',
                    'swarm-discovery': `consul://${discoveryServiceIp.slice(0,-1)}:8500`,
                    'engine-opt': [`cluster-advertise=${config.providers[machine.provider].publicNetworkInterface}:2376`,
                        `cluster-store=consul://${discoveryServiceIp.slice(0,-1)}:8500`]
                })
        ))
    )
    ////create overlay network on swarm master
    .catch(errorCode => Promise.resolve()) //try process
    .then(() => dockerMachine('config', config.swarmMaster.name))
    .then(rawConfiguration => Promise.resolve(rawConfiguration.slice(0,-1).split('\n')))
    .then((config) => docker(config.concat(['network', 'create', '--driver', 'overlay', '--subnet', '12.0.9.0/24',
        'nodewrapper_default'])));






