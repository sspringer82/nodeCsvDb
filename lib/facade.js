var CsvDb = require('./csvDb');

var Facade = function (file, fields) {
    this.csvDb = new CsvDb(file, fields);
};

Facade.prototype.get = function (id) {
    return this.csvDb.get(id);
};

Facade.prototype.insert = function (newData) {
    return this.csvDb.insert(newData);
};

Facade.prototype.update = function (data, id) {
    return this.csvDb.update(data, id);
};

Facade.prototype.delete = function (id) {
    return this.csvDb.delete(id);
};

module.exports = Facade;