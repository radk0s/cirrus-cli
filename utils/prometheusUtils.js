const fs = require('fs');

function readFile(filename, enc){
    return new Promise(function (resolve, reject){
        fs.readFile(filename, enc, function (err, res){
            if (err) reject(err);
            else resolve(res);
        });
    });
}

function writeFile(filename, data){
    return new Promise(function (resolve, reject){
        fs.writeFile(filename, data, function (err) {
            if (err) return reject();
            return resolve("Saved");
        });
    });
}

module.exports = {
    customizePrometheusConfigFile: function (ipCAdvisorList) {
        return readFile("./monitoring/prometheus.yml.dist", 'utf8')
            .then((res) => writeFile("./monitoring/prometheus.yml", res + ipCAdvisorList))
    }
};
