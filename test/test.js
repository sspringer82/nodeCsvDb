var CsvDb = require('../lib/csvDb');
var expect = require('expect.js');
var fs = require('fs');

var file = {
    source: 'test/data/source.txt',
    create: 'test/data/create.txt',
    read: 'test/data/source.txt',
    write: 'test/data/write.txt',
    update: 'test/data/update.txt',
    delete: 'test/data/delete.txt'
};

var columns = ['id', 'name', 'password'];


var copyFile = function (src, dest) {
    fs.createReadStream(src).pipe(fs.createWriteStream(dest));
};

var deleteFile = function (fileName) {
    if (fs.exists(fileName)) {
        fs.unlinkSync(fileName);
    }
};

describe('CsvDb', function () {
    var csvDb;

    describe("instanciate", function () {

        beforeEach(function () {
            csvDb = new CsvDb(file.source, columns);
        });

        it ("should instanciate with a filename as argument", function () {
            expect(csvDb.file).to.be(file.source);
        });

        it ("should instanciate with a filename and field names as arguments", function () {
            var csvDb = new CsvDb(file.source, ['column']);
            expect(csvDb.file).to.be(file.source);
            expect(csvDb.fields).to.eql(['column']);
        });
    });

    describe ("read", function () {

        beforeEach(function () {
            csvDb = new CsvDb(file.read, columns);
        });

        it ("should read the contents of the file", function (done) {
            var promise = csvDb.getFileContent();

            promise.then(function (data) {
                try {
                    expect(data).to.equal('1;lala;lulu;\n2;mumu;meme;');
                    done();
                } catch (e) {
                    done(e);
                }
            }, function (err) {
                done(err);
            });
        });

        it ("should make an object out of a text block", function () {
            var input = '1;lala;lulu;\n2;mumu;meme;';
            var expected = [{
                id: 1,
                name: 'lala',
                password: 'lulu'
            },{
                id: 2,
                name: 'mumu',
                password: 'meme'
            }];

            expect(csvDb.transform(input)).to.eql(expected);
        });

        it ("should transform an empty input", function () {
            var input = '';
            var expected = [];

            expect(csvDb.transform(input)).to.eql(expected);
        });

        it ("should get all contents of the specified file and return an object structure", function (done) {
            var expected = [{
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
                try {
                    expect(data).to.eql(expected);
                    done();
                } catch (e) {
                    done(e);
                }
            }, function (err) {
                done(err);
            });
        });

        it ("should get a specified set of data", function (done) {
            var expected = {
                id: 2,
                name: 'mumu',
                password: 'meme'
            };

            var promise = csvDb.get(2);

            promise.then(function (data) {
                try {
                    expect(data).to.eql(expected);
                    done();
                } catch (e) {
                    done(e);
                }
            }, function (err) {
                done(err);
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
            deleteFile(file.create);

            csvDb = new CsvDb(file.create, columns);
        });

        it ("should get the next id of an empty file", function (done) {
            fs.writeFileSync(file.create, '');

            var promise = csvDb.getNextId();

            promise.then(function (id) {
                try {
                    expect(id).to.eql(1);
                    done();
                } catch (e) {
                    done(e);
                }
            }, function (err) {
                done(err);
            });
        });

        it ("should get the next id of a file with content", function (done) {
            copyFile(file.source, file.create);

            var promise = csvDb.getNextId();

            promise.then(function (id) {
                try {
                    expect(id).to.eql(3);
                    done();
                } catch (e) {
                    done(e);
                }
            }, function (err) {
                done(err);
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
            fs.writeFileSync(file.create, '');
            var data = {
                name: 'foo',
                password: 'bar'
            };
            var expectedFileContent = '1;foo;bar;';

            var promise = csvDb.insert(data);

            promise.then(function () {
                try {
                    var fileContent = fs.readFileSync(file.create, 'utf-8');

                    expect(fileContent).to.eql(expectedFileContent);
                    done();
                } catch (e) {
                    done(e);
                }
            }, function (err) {
                done(err);
            });
        });

        it ("should append a new data set to an existing file", function (done) {
            copyFile(file.source, file.create);

            var data = {
                name: 'foo',
                password: 'bar'
            };
            var expectedFileContent = '1;lala;lulu;\n2;mumu;meme;\n3;foo;bar;';

            var promise = csvDb.insert(data);

            promise.then(function () {
                try {
                    var fileContent = fs.readFileSync(file.create, 'utf-8');

                    expect(fileContent).to.eql(expectedFileContent);
                    done();
                } catch (e) {
                    done(e);
                }
            }, function (err) {
                done(err);
            });
        });
    });

    describe("write", function () {

        beforeEach(function () {
            deleteFile(file.write);

            csvDb = new CsvDb(file.write, columns);
        });

        it ("should write the content of a new file", function (done) {
            var expected = '1;lala;lulu;\n2;foo;meme;';

            var promise = csvDb.write(expected);

            promise.then(function () {
                try {
                    var content = fs.readFileSync(file.write, 'utf-8');
                    expect(content).to.eql(expected);
                    done();
                } catch (e) {
                    done(e);
                }
            }, function (err) {
                done(err);
            });
        });
    });

    describe("update", function () {

        beforeEach(function () {
            copyFile(file.source, file.update);

            csvDb = new CsvDb(file.update, columns);
        });

        it ("should update a certain data set in an existing file", function (done) {
            var expectedFileContent = '1;lala;lulu;\n2;foo;meme;';

            var data = {
                name: 'foo',
                password: 'meme'
            };
            var id = 2;


            var promise = csvDb.update(data, id);
            promise.then(function () {
                try {
                    var fileContent = fs.readFileSync(file.update, 'utf-8');

                    expect(fileContent).to.eql(expectedFileContent);

                    done();
                } catch (e) {
                    done(e);
                }
            }, function (err) {
                done(err);
            });
        });
    });

    describe("delete", function () {

        beforeEach(function () {
            copyFile(file.source, file.delete);

            csvDb = new CsvDb(file.delete, columns);
        });

        it ("should delete a certain dataset", function (done) {
            var expected = '1;lala;lulu;';

            csvDb.delete(2).then(function () {
                try {
                    var fileContent = fs.readFileSync(file.delete, 'utf-8');

                    expect(fileContent).to.eql(expected);
                    done();
                } catch (e) {
                    done(e);
                }
            }, function (err) {
                done(err);
            });

        });
    });
});