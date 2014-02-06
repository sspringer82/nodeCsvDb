var Q = require('q');
var fs = require('fs');
var util = require('util');

var CsvDB = function (file, fields) {
    this.file = file;
    this.fields = fields;
};

CsvDB.prototype.getFileContent = function () {
    debugger;

    var deferred = Q.defer();

    fs.readFile(this.file, 'utf-8', function (err, data) {
        if (err) {
            deferred.reject(err);
            return;
        }
        deferred.resolve(data);
    });

    return deferred.promise;
};

CsvDB.prototype.transform = function (input) {
    var lines = input.split('\n');
    var result = [];
    if (util.isArray(lines) && lines.length > 0) {
        for (var i = 0; i < lines.length; i++) {
            result[i] = {};
            var cols = lines[i].split(';');
            for (var j = 0; j < this.fields.length; j++) {
                result[i][this.fields[j]] = cols[j];
            }
        }
    }
    return result;
};

CsvDB.prototype.get = function () {
    var deferred = Q.defer();

    var fileContents = this.getFileContent();

    fileContents.then(function (data) {
        deferred.resolve(this.transform(data));
    }.bind(this), function (err) {
        deferred.reject(err);
    }.bind(this));

    return deferred.promise;
};


module.exports = CsvDB;