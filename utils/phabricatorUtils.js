const fs = require('fs');

module.exports = {
    customizePrometheusConfigFile: function (ipCAdvisorList) {
        return new Promise((resolve, reject) => {
            fs.appendFile("./monitoring/prometheus.yml", ipCAdvisorList, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
};
