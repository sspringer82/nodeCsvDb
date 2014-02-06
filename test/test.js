var CsvDb = require('../lib/csvDb');
var expect = require('expect.js');
var fs = require('fs');


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

    describe ("read", function () {

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

        it ("should transform an empty input", function () {
            var input = '';
            var output = [];

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

        it ("should get a specified set of data", function (done) {
            var output = {
                id: 2,
                name: 'mumu',
                password: 'meme'
            };

            var promise = csvDb.get(2);

            promise.then(function (data) {
                expect(data).to.eql(output);
                done();
            }, function (err) {
                done();
            });
        });

        it ("should fetch a single row out of a rowset", function () {
            var input = [{
                id: 1,
                name: 'lala',
                password: 'lulu'
            },{
                id: 2,
                name: 'mumu',
                password: 'meme'
            }];

            var expected = {
                id: 2,
                name: 'mumu',
                password: 'meme'
            };

            var output = csvDb.fetchRow(input, 2);

            expect(output).to.eql(expected);
        });
    });

    describe("create", function () {

        beforeEach(function () {
            if (fs.exists('test/data/create.txt')) {
                fs.unlinkSync('test/data/create.txt');
            }
            csvDb = new CsvDb('test/data/create.txt', ['id', 'name', 'password']);
        });

        it ("should get the next id of an empty file", function (done) {
            fs.writeFileSync('test/data/create.txt', '');

            var promise = csvDb.getNextId();

            promise.then(function (id) {
                expect(id).to.eql(1);
                done();
            }, function () {
                done();
            });
        });

        it ("should get the next id of a file with content", function (done) {
            var inputFile = 'test/data/test.txt';
            var outputFile = 'test/data/create.txt';

            fs.createReadStream(inputFile).pipe(fs.createWriteStream(outputFile));

            var promise = csvDb.getNextId();

            promise.then(function (id) {
                expect(id).to.eql(3);
                done();
            }, function () {
                done();
            });
        });

        it ("should transform an array-object structure to a valid string", function () {
            var input = [{
                id: 1,
                name: 'lala',
                password: 'lulu'
            },{
                id: 2,
                name: 'mumu',
                password: 'meme'
            }];
            var expected = '1;lala;lulu;\n2;mumu;meme;';

            var output = csvDb.flatten(input);

            expect(output).to.eql(expected);
        });

        it ("should insert a new data set in an empty file", function (done) {
            fs.writeFileSync('test/data/create.txt', '');
            var data = {
                name: 'foo',
                password: 'bar'
            };
            var expectedFileContent = '1;foo;bar;';

            var promise = csvDb.insert(data);

            promise.then(function () {
                var fileContent = fs.readFileSync('test/data/create.txt', 'utf-8');

                expect(fileContent).to.eql(expectedFileContent);
                done();
            }, function () {
                done();
            });
        });

        it ("should append a new data set to an existing file", function (done) {
            var inputFile = 'test/data/test.txt';
            var outputFile = 'test/data/create.txt';

            fs.createReadStream(inputFile).pipe(fs.createWriteStream(outputFile));

            var data = {
                name: 'foo',
                password: 'bar'
            };
            var expectedFileContent = '1;lala;lulu;\n2;mumu;meme;\n3;foo;bar;';

            var promise = csvDb.insert(data);

            promise.then(function () {
                var fileContent = fs.readFileSync('test/data/create.txt', 'utf-8');

                expect(fileContent).to.eql(expectedFileContent);
                done();
            }, function () {
                done();
            });
        });
    });

    describe("update", function () {
        it ("should update a certain data set in an existing file", function () {
            var inputFile = 'test/data/test.txt';
            var outputFile = 'test/data/create.txt';

            fs.createReadStream(inputFile).pipe(fs.createWriteStream(outputFile));

            var expectedFileContent = '1;lala;lulu;\n2;foo;meme;';

            var data = {
                name: 'foo',
                password: 'meme'
            };
            var id = 2;

            var promise = csvDb.update(data, id);

            promise.then(function () {
                var fileContent = fs.readFileSync('test/data/create.txt', 'utf-8');

                expect(fileContent).to.eql(expectedFileContent);
                done();
            }, function () {
                done();
            });
        });
    });

    describe("delete", function () {

    });
});