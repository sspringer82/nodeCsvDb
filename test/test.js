var CsvDb = require('../lib/csvDb');
var expect = require('expect.js');


describe('CsvDb', function () {
    var csvDb;

    beforeEach(function () {
        csvDb = new CsvDb('test/data/test.txt', ['id', 'name', 'password']);
    });


    it ("should instanciate with a filename as argument", function () {
        expect(csvDb.file).to.be('test/data/test.txt');
    });

    it ("should instanciate with a filename and field names as arguments", function () {
        var csvDb = new CsvDb('dummy', ['column']);
        expect(csvDb.file).to.be('dummy');
        expect(csvDb.fields).to.eql(['column']);
    });

    it ("should read the contents of the file", function (done) {
        var promise = csvDb.getFileContent();

        promise.then(function (data) {
            expect(data).to.equal('1;lala;lulu;\n2;mumu;meme;');
            done();
        });
    });

    it ("should make an object out of a text block", function () {
        var input = '1;lala;lulu;\n2;mumu;meme;';
        var output = [{
            id: 1,
            name: 'lala',
            password: 'lulu'
        },{
            id: 2,
            name: 'mumu',
            password: 'meme'
        }];

        expect(csvDb.transform(input)).to.eql(output);
    });

    it ("should get all contents of the specified file and return an object structure", function (done) {
        var output = [{
            id: 1,
            name: 'lala',
            password: 'lulu'
        },{
            id: 2,
            name: 'mumu',
            password: 'meme'
        }];

        var promise = csvDb.get();

        promise.then(function (data) {
            expect(data).to.eql(output);
            done();
        }, function (err) {
            done();
        });
    });
});