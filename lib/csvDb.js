var Q = require('q');
var fs = require('fs');
var util = require('util');

var CsvDB = function (file, fields) {
    this.file = file;
    this.fields = fields;
};

CsvDB.prototype.getFileContent = function () {
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
    if (input === '') {
        return [];
    }

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

CsvDB.prototype.get = function (id) {
    var deferred = Q.defer();

    var fileContents = this.getFileContent();

    fileContents.then(function (data) {

        var result = this.transform(data);

        if (id) {
            result = this.fetchRow(result, id);
        }

        deferred.resolve(result);
    }.bind(this), function (err) {
        deferred.reject(err);
    });

    return deferred.promise;
};

CsvDB.prototype.fetchRow = function (input, id) {
    for (var i = 0; i < input.length; i++) {
        if (input[i]['id'] == id) {
            return input[i];
        }
    }
};

CsvDB.prototype.getNextId = function () {
    var deferred = Q.defer();

    var promise = this.get();

    promise.then(function (data) {
        if (util.isArray(data) && data.length === 0) {
            deferred.resolve(1);
            return;
        }

        var lastIndex = 0;

        for (var i = 0; i < data.length; i++) {
            if (parseInt(lastIndex) < parseInt(data[i]['id'])) {
                lastIndex = data[i]['id'];
            }
        }

        deferred.resolve(parseInt(lastIndex) + 1);
    }.bind(this), function (err) {
        deferred.reject(err);
    });

    return deferred.promise;
};

CsvDB.prototype.insert = function (newData) {
    var deferred = Q.defer();

    this.get().then(function (data) {

        var nextIdPromise = this.getNextId();

        nextIdPromise.then(function (id) {
            newData.id = id;
            data.push(newData);

            data = this.flatten(data);

            fs.writeFile(this.file, data, function (err) {
                if (err) {
                    deferred.reject(err);
                    return;
                }
                deferred.resolve(id);
            });
        }.bind(this));
    }.bind(this));

    return deferred.promise;
};

CsvDB.prototype.flatten = function (input) {

    var result = [];
    var row = [];

    if (util.isArray(input) && input.length > 0) {
        for (var i = 0; i < input.length; i++) {
            row = [];
            for (var j = 0; j < this.fields.length; j++) {
                row.push(input[i][this.fields[j]]);
            }
            result.push(row.join(';') + ';');
        }
    }
    return result.join('\n');
};

CsvDB.prototype.update = function (data, id) {
    var deferred = Q.defer();
    this.get().then(function (existingContent) {
        for (var i = 0; i < existingContent.length; i++) {
            if (existingContent[i].id == id) {
                data.id = id;
                existingContent[i] = data;
            }
        }

        return this.write(this.flatten(existingContent));
    }.bind(this)).then(function () {
        deferred.resolve();
    }, function (err) {
        deferred.reject(err);
    });
    return deferred.promise;
};

CsvDB.prototype.write = function (data) {
    var deferred = Q.defer();

    fs.writeFile(this.file, data, function (err) {
        if (err) {
            deferred.reject(err);
            return;
        }
        deferred.resolve();
    });

    return deferred.promise;
};

CsvDB.prototype.delete = function (id) {
    var deferred = Q.defer();

    this.get().then(function (data) {
        for (var i = 0; i < data.length; i++) {
            if (data[i].id == id) {
                data.splice(i, 1)
                break;
            }
        }
        return this.write(this.flatten(data));
    }.bind(this)).then(function () {
        deferred.resolve();
    }, function (err) {
        deferred.reject(err);
    })

    return deferred.promise;
};

module.exports = CsvDB;