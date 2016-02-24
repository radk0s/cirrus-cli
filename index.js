const config = require('./config');
const provider = require('./Provider')(config.providers);

config.machines.forEach(machine => {
        provider(machine.provider)
            .showStatus(machine.name, machine.instanceType);
});
//.then(result => console.log(result))
//.catch(errCode => console.log(errCode));


