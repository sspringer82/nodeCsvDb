const CsvDb = require('../lib/csvDb');
const expect = require('expect.js');
const fs = require('fs');

const file = {
  source: 'test/data/source.txt',
  sourceWithHeaders: 'test/data/source-with-header.csv',
  create: 'test/data/create.txt',
  read: 'test/data/source.txt',
  write: 'test/data/write.txt',
  update: 'test/data/update.txt',
  delete: 'test/data/delete.txt',
};

const columns = ['id', 'name', 'password'];

function copyFile(src, dest) {
  deleteFile(dest);
  fs.createReadStream(src).pipe(fs.createWriteStream(dest));
}

function deleteFile(fileName) {
  if (fs.exists(fileName)) {
    fs.unlinkSync(fileName);
  }
}

describe('CsvDb', () => {
  let csvDb;

  after(() => {
    Object.values(file).forEach(filename => {
      deleteFile(filename);
    });
  });

  describe('instanciate', () => {
    beforeEach(() => {
      csvDb = new CsvDb(file.source, columns);
    });

    it('should instanciate with a filename as argument', () => {
      expect(csvDb.file).to.be(file.source);
    });

    it('should instanciate with a filename and field names as arguments', () => {
      const csvDb = new CsvDb(file.source, ['column']);
      expect(csvDb.file).to.be(file.source);
      expect(csvDb.fields).to.eql(['column']);
    });
  });

  describe('read', () => {
    beforeEach(() => {
      csvDb = new CsvDb(file.read, columns);
    });

    it('should read the contents of the file', done => {
      const promise = csvDb.getFileContent();

      promise.then(
        data => {
          try {
            expect(data).to.equal('1;lala;lulu;\n2;mumu;meme;');
            done();
          } catch (e) {
            done(e);
          }
        },
        err => {
          done(err);
        },
      );
    });

    it('should make an object out of a text block', () => {
      const input = '1;lala;lulu;\n2;mumu;meme;';
      const expected = [
        {
          id: 1,
          name: 'lala',
          password: 'lulu',
        },
        {
          id: 2,
          name: 'mumu',
          password: 'meme',
        },
      ];

      expect(csvDb.transform(input)).to.eql(expected);
    });

    it('should transform an empty input', () => {
      const input = '';
      const expected = [];

      expect(csvDb.transform(input)).to.eql(expected);
    });

    it('should get all contents of the specified file and return an object structure', done => {
      const expected = [
        {
          id: 1,
          name: 'lala',
          password: 'lulu',
        },
        {
          id: 2,
          name: 'mumu',
          password: 'meme',
        },
      ];

      const promise = csvDb.get();

      promise.then(
        data => {
          try {
            expect(data).to.eql(expected);
            done();
          } catch (e) {
            done(e);
          }
        },
        err => {
          done(err);
        },
      );
    });

    it('should get a specified set of data', done => {
      const expected = {
        id: '2',
        name: 'mumu',
        password: 'meme',
      };

      const promise = csvDb.get(2);

      promise.then(
        data => {
          try {
            expect(data).to.eql(expected);
            done();
          } catch (e) {
            done(e);
          }
        },
        err => {
          done(err);
        },
      );
    });

    it('should read data and take column names from first line', function(done) {
      const expected = [
        { id: '1', firstname: 'Donald', lastname: 'Duck' },
        { id: '2', firstname: 'Mickey', lastname: 'Mouse' },
      ];

      const csvDb = new CsvDb(file.sourceWithHeaders);
      const promise = csvDb.get();
      promise.then(
        function(data) {
          try {
            expect(data).to.eql(expected);
            done();
          } catch (e) {
            done(e);
          }
        },
        function(err) {
          done(err);
        },
      );
    });
  });

  describe('create', () => {
    beforeEach(() => {
      deleteFile(file.create);

      csvDb = new CsvDb(file.create, columns);
    });

    it('should get the next id of an empty file', done => {
      fs.writeFileSync(file.create, '');

      const promise = csvDb.getNextId();

      promise.then(
        id => {
          try {
            expect(id).to.eql(1);
            done();
          } catch (e) {
            done(e);
          }
        },
        err => {
          done(err);
        },
      );
    });

    it('should get the next id of a file with content', done => {
      copyFile(file.source, file.create);

      const promise = csvDb.getNextId();

      promise.then(
        id => {
          try {
            expect(id).to.eql(3);
            done();
          } catch (e) {
            done(e);
          }
        },
        err => {
          done(err);
        },
      );
    });

    it('should transform an array-object structure to a valid string', () => {
      const input = [
        {
          id: 1,
          name: 'lala',
          password: 'lulu',
        },
        {
          id: 2,
          name: 'mumu',
          password: 'meme',
        },
      ];
      const expected = 'id;name;password;\n1;lala;lulu;\n2;mumu;meme;';

      const output = csvDb.flatten(input);

      expect(output).to.eql(expected);
    });

    it('should insert a new data set in an empty file', done => {
      fs.writeFileSync(file.create, '');
      const data = {
        name: 'foo',
        password: 'bar',
      };
      const expectedFileContent = 'name;password;id;\nfoo;bar;1;';

      const promise = csvDb.insert(data);

      promise.then(
        id => {
          try {
            expect(id).to.be(1);

            const fileContent = fs.readFileSync(file.create, 'utf-8');

            expect(fileContent).to.eql(expectedFileContent);
            done();
          } catch (e) {
            done(e);
          }
        },
        err => {
          done(err);
        },
      );
    });

    it('should append a new data set to an existing file', done => {
      copyFile(file.source, file.create);

      const data = {
        name: 'foo',
        password: 'bar',
      };
      const expectedFileContent =
        'id;name;password;\n1;lala;lulu;\n2;mumu;meme;\n3;foo;bar;';

      const promise = csvDb.insert(data);

      promise.then(
        id => {
          try {
            expect(id).to.be(3);

            const fileContent = fs.readFileSync(file.create, 'utf-8');

            expect(fileContent).to.eql(expectedFileContent);
            done();
          } catch (e) {
            done(e);
          }
        },
        err => {
          done(err);
        },
      );
    });
  });

  describe('update', () => {
    beforeEach(() => {
      copyFile(file.source, file.update);

      csvDb = new CsvDb(file.update, columns);
    });

    it('should update a certain data set in an existing file', done => {
      const expectedFileContent =
        'id;name;password;\n1;lala;lulu;\n2;foo;meme;';

      const data = {
        id: '2',
        name: 'foo',
        password: 'meme',
      };

      const promise = csvDb.update(data);
      promise.then(
        () => {
          try {
            const fileContent = fs.readFileSync(file.update, 'utf-8');

            expect(fileContent).to.eql(expectedFileContent);

            done();
          } catch (e) {
            done(e);
          }
        },
        err => {
          done(err);
        },
      );
    });

    it('should update multiple datasets at once', done => {
      const expectedFileContent = 'id;name;password;\n1;abc;abc;\n2;def;def;';
      const data = [
        { id: '1', name: 'abc', password: 'abc' },
        { id: '2', name: 'def', password: 'def' },
      ];
      csvDb.update(data).then(
        () => {
          try {
            const fileContent = fs.readFileSync(file.update, 'utf-8');

            expect(fileContent).to.eql(expectedFileContent);

            done();
          } catch (e) {
            done(e);
          }
        },
        () => {
          done();
        },
      );
    });
  });

  describe('delete', () => {
    beforeEach(() => {
      copyFile(file.source, file.delete);

      csvDb = new CsvDb(file.delete, columns);
    });

    it('should delete a certain dataset', done => {
      const expected = 'id;name;password;\n1;lala;lulu;';

      csvDb.delete(2).then(
        () => {
          try {
            const fileContent = fs.readFileSync(file.delete, 'utf-8');

            expect(fileContent).to.eql(expected);
            done();
          } catch (e) {
            done(e);
          }
        },
        err => {
          done(err);
        },
      );
    });
  });
});
