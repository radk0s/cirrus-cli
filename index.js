const config = require('./config');
const provider = require('./Provider')(config.providers);
const docker = require('./programs/docker');
const dockerMachine = require('./programs/dockerMachine');
const phabricatorUtils = require('./utils/phabricatorUtils');

provider(config.networkDiscovery.provider)
    //create machine with docker for consul
    .create(config.networkDiscovery.name)
    //run consul container
    .then(() => dockerMachine('config', config.networkDiscovery.name))
    .then(rawConfiguration => Promise.resolve(rawConfiguration.slice(0,-1).split('\n')))
    .then((config) => docker(config.concat(['run', '-d', '-p', '8500:8500', '-h', 'consul',
            'progrium/consul', '-server', '-bootstrap'])))
    .then((config) => docker(config.concat(['run', '-d', '-p', '9093:9093',
        "-v", "$PWD/monitoring:/alertmanager", 'prom/alertmanager', '-config=/alertmanager/alertmanager.conf'])))
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
                //run monitoring cAdvisor on each node
                .then(() => dockerMachine('config', machine.name))
                .then(rawConfiguration => Promise.resolve(rawConfiguration.slice(0,-1).split('\n')))
                .then((config) => docker(config.concat(['run', '-d', '-p', '1111:1111',
                    "-v", "/var/run:/var/run:rw", "-v", "/sys:/sys:ro", "-v", "/var/lib/docker/:/var/lib/docker:ro",
                    'google/cadvisor:latest', '--name=cadvisor_' + machine.name])))
        ))
    )
    ////create overlay network on swarm master
    .catch(errorCode => Promise.resolve()) //try process
    .then(() => dockerMachine('config', config.swarmMaster.name))
    .then(rawConfiguration => Promise.resolve(rawConfiguration.slice(0,-1).split('\n')))
    .then((config) => docker(config.concat(['network', 'create', '--driver', 'overlay', '--subnet', '12.0.9.0/24',
        'nodewrapper_default'])))
    //append phabricator config file
    .then( () => Promise.resolve(
        Promise.resolve(config.agents.map(machine => '\'' + dockerMachine('ip', machine.name) + ':1111' + '\' ' ))
        .then((cAdvistorIPs) => Promise.resolve(phabricatorUtils.customizePrometheusConfigFile( '[' + cAdvistorIPs + ']'))
    )))
    //run prometheus
    .then(() => dockerMachine('config', config.networkDiscovery.name))
    .then(rawConfiguration => Promise.resolve(rawConfiguration.slice(0,-1).split('\n')))
    .then((config) => docker(config.concat(['run', '-d', '-p', '1111:1111', '-v', '$PWD/monitoring:/etc/prometheus',
        'prom/prometheus', '-config.file=/etc/prometheus/prometheus.yml',
        '-alertmanager.url=http://' + dockerMachine('ip', config.networkDiscovery.name) +':9093'])));