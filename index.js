var CsvDb = require('./lib/csvDb.js');

var csvDb = new CsvDb('./data/test.txt', ['id', 'name', 'password']);

var lala = csvDb.getAll();


lala.then(function (data) {
    console.log(data);
});