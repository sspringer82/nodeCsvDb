var CsvDb = require('../lib/csvDb');
var expect = require('expect.js');


describe('CsvDb', function () {
    it ("should instanciate with a filename as argument", function () {
        var csvDb = new CsvDb('./data/input.txt');
        expect(csvDb.file).to.be('./data/input.txt');
    });

    it ("should read the contents of the file", function () {
        var csvDb = new CsvDb('./data/input.txt');
        expect(csvDb.getAll()).to.be();
    })
});