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
  fs.copyFileSync(src, dest);
}

function deleteFile(fileName) {
  if (fs.existsSync(fileName)) {
    fs.unlinkSync(fileName);
  }
}

describe('CsvDb', () => {
  let csvDb;

  after(() => {
    Object.keys(file)
      .filter(
        key =>
          key !== 'source' && key !== 'sourceWithHeaders' && key !== 'read',
      )
      .forEach(fileKey => {
        deleteFile(file[fileKey]);
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

    it('should read the contents of the file', async () => {
      const data = await csvDb.getFileContent();
      expect(data).to.equal('1;lala;lulu;\n2;mumu;meme;');
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

    it('should get all contents of the specified file and return an object structure', async () => {
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

      const data = await csvDb.get();

      expect(data).to.eql(expected);
    });

    it('should get a specified set of data', async () => {
      const expected = {
        id: '2',
        name: 'mumu',
        password: 'meme',
      };

      const data = await csvDb.get(2);

      expect(data).to.eql(expected);
    });

    it('should read data and take column names from first line', async () => {
      const expected = [
        { id: '1', firstname: 'Donald', lastname: 'Duck' },
        { id: '2', firstname: 'Mickey', lastname: 'Mouse' },
      ];

      const csvDb = new CsvDb(file.sourceWithHeaders);
      const data = await csvDb.get();

      expect(data).to.eql(expected);
    });
  });

  describe('create', () => {
    beforeEach(() => {
      deleteFile(file.create);
      csvDb = new CsvDb(file.create, columns);
    });

    it('should get the next id of an empty file', async () => {
      fs.writeFileSync(file.create, '');

      const id = await csvDb.getNextId();

      expect(id).to.eql(1);
    });

    it('should get the next id of a file with content', async () => {
      await copyFile(file.source, file.create);

      const id = await csvDb.getNextId();

      expect(id).to.eql(3);
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

    it('should insert a new data set in an empty file', async () => {
      fs.writeFileSync(file.create, '');
      const data = {
        name: 'foo',
        password: 'bar',
      };
      const expectedFileContent = 'name;password;id;\nfoo;bar;1;';

      const id = await csvDb.insert(data);

      expect(id).to.be(1);

      const fileContent = fs.readFileSync(file.create, 'utf-8');

      expect(fileContent).to.eql(expectedFileContent);
    });

    it('should append a new data set to an existing file', async () => {
      await copyFile(file.source, file.create);

      const data = {
        name: 'foo',
        password: 'bar',
      };
      const expectedFileContent =
        'id;name;password;\n1;lala;lulu;\n2;mumu;meme;\n3;foo;bar;';

      const id = await csvDb.insert(data);
      const fileContent = fs.readFileSync(file.create, 'utf-8');

      expect(id).to.be(3);
      expect(fileContent).to.eql(expectedFileContent);
    });
  });

  describe('update', () => {
    beforeEach(async () => {
      csvDb = new CsvDb(file.update, columns);
      await copyFile(file.source, file.update);
    });

    afterEach(() => {
      deleteFile(file.update);
    });

    it('should update a certain data set in an existing file', async () => {
      const expectedFileContent =
        'id;name;password;\n1;lala;lulu;\n2;foo;meme;';

      const data = {
        id: '2',
        name: 'foo',
        password: 'meme',
      };

      await csvDb.update(data);
      const fileContent = fs.readFileSync(file.update, 'utf-8');

      expect(fileContent).to.eql(expectedFileContent);
    });

    it('should update multiple datasets at once', async () => {
      const expectedFileContent = 'id;name;password;\n1;abc;abc;\n2;def;def;';
      const data = [
        { id: '1', name: 'abc', password: 'abc' },
        { id: '2', name: 'def', password: 'def' },
      ];

      await csvDb.update(data);
      const fileContent = fs.readFileSync(file.update, 'utf-8');

      expect(fileContent).to.eql(expectedFileContent);
    });
  });

  describe('delete', () => {
    beforeEach(async () => {
      await copyFile(file.source, file.delete);

      csvDb = new CsvDb(file.delete, columns);
    });

    it('should delete a certain dataset', async () => {
      const expected = 'id;name;password;\n1;lala;lulu;';

      await csvDb.delete(2);
      const fileContent = fs.readFileSync(file.delete, 'utf-8');

      expect(fileContent).to.eql(expected);
    });
  });

  describe('write file', () => {
    it('should write an existing file', async () => {
      await copyFile(file.source, file.write);
      csvDb = new CsvDb(file.write, columns);
      await csvDb.writeFile(file.write, 'test');
      const expected = 'test';
      const fileContent = fs.readFileSync(file.write, 'utf-8');
      expect(fileContent).to.eql(expected);
    });
    it('should create a new file', async () => {
      deleteFile(file.write);
      csvDb = new CsvDb(file.write, columns);
      await csvDb.writeFile(file.write, 'test');
      const expected = 'test';
      const fileContent = fs.readFileSync(file.write, 'utf-8');
      expect(fileContent).to.eql(expected);
    });
    it('should fail if configured to fail and file does not exist', done => {
      deleteFile(file.write);
      csvDb = new CsvDb(file.write, columns, { failIfNotExists: true });

      csvDb.writeFile(file.write, 'test').then(
        () => done(false),
        e => {
          expect(e instanceof Error).to.eql(true);
          done();
        },
      );
    });
    it('should not fail if configured to fail and file does exist', () => {});
  });

  describe('file exists', () => {
    it.skip('should create a new file, if it does not exist', async () => {
      const tempName = 'test/data/temp.csv';
      const csvDb = new CsvDb(tempName, columns);

      const data = {
        name: 'foo',
        password: 'bar',
      };
      const expectedFileContent = 'name;password;id;\nfoo;bar;1;';

      const id = await csvDb.insert(data);

      expect(id).to.be(1);

      const fileContent = fs.readFileSync(tempName, 'utf-8');

      expect(fileContent).to.eql(expectedFileContent);
      deleteFile(tempName);
    });
  });
});
