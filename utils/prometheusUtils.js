const fs = require('fs');

module.exports = {
    customizePrometheusConfigFile: function (ipCAdvisorList) {
        return new Promise((resolve, reject) => {
            fs.readFile("./monitoring/prometheus.yml.dist", 'utf8', (err, data) => {
                if (err) return console.log(err);
                fs.writeFile('./monitoring/prometheus.yml', data + ipCAdvisorList, function (err) {
                    if (err) return console.log(err);
                    console.log('saved');
                    resolve();
                });
            });
        });
    }
};
