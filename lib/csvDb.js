var fs = require('fs');
var util = require('util');

class CsvDB {
    constructor (file, fields = null) {
        this.file = file;
        this.fields = fields;
    }

    getFileContent() {
        return new Promise((resolve, reject) => {
            fs.readFile(this.file, 'utf-8', (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(data);
            });
        });
    }

    transform(input) {
        if (input === '') {
            return [];
        }

        var lines = input.split('\n');
        let fields;
        if (this.fields === null) {
            fields = lines.shift().split(';');
            if (fields[fields.length -1] === '') {
                fields.pop();
            }
        } else {
            fields = this.fields;
        }
        var result = [];
        if (Array.isArray(lines) && lines.length > 0) {
            for (var i = 0; i < lines.length; i++) {
                result[i] = {};
                var cols = lines[i].split(';');

                for (var j = 0; j < fields.length; j++) {
                    result[i][fields[j]] = cols[j];
                }
            }
        }
        return result;
    }

    get(id) {
        return new Promise((resolve, reject) => {
            this.getFileContent().then((data) => {

                var result = this.transform(data);

                if (id) {
                    result = result.filter((row) => {
                        return row['id'] == id;
                    }).pop();
                }

                resolve(result);
            }, err => reject(err));
        });
    }

    getNextId() {
        return new Promise((resolve, reject) => {
            this.get().then(data => {
                if (Array.isArray(data) && data.length === 0) {
                    resolve(1);
                    return;
                }

                const lastIndex = data.reduce((prev, curr) => {
                    const itemId = parseInt(curr['id'], 10);
                    return (prev < itemId) ?
                        itemId :
                        prev;
                }, 0);

                resolve(lastIndex + 1);
            }, err => deferred.reject(err));
        });
    }

    insert(newData) {
        return new Promise((resolve, reject) => {
            this.get().then(data => {
                this.getNextId().then((id) => {
                    newData.id = id;
                    data.push(newData);

                    data = this.flatten(data);

                    fs.writeFile(this.file, data, err => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(id);
                    });
                }, () => reject());
            }, () => reject());
        });
    }

    flatten(input) {
        var result = [];
        var row = [];

        if (Array.isArray(input) && input.length > 0) {

            let fields = Object.keys(input[0]);
            result.push(fields.join(';') + ';');

            for (var i = 0; i < input.length; i++) {
                row = [];
                for (var j = 0; j < fields.length; j++) {
                    row.push(input[i][fields[j]]);
                }
                result.push(row.join(';') + ';');
            }
        }
        return result.join('\n');
    }

    update(data) {
        return new Promise((resolve, reject) => { 
            this.get().then((existingContent) => {
                if (!Array.isArray(data)) {
                    data = [data];
                }
                for (let i = 0; i < data.length; i++) {
                    existingContent = existingContent.map(item => {
                        if (item.id === data[i].id.toString) {
                            return Object.assign(item, data[i]);
                        }
                        return item;
                    });
                }

                return this.write(this.flatten(existingContent));
            }, () => reject()).then(() => resolve(), err => reject(err));
        });
    }

    write(data) {
        return new Promise((resolve, reject) => {
            fs.writeFile(this.file, data, err => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });

        });
    }

    delete(id) {
        return new Promise((resolve, reject) => {
            this.get().then(data => {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].id == id) {
                        data.splice(i, 1)
                        break;
                    }
                }
                return this.write(this.flatten(data));
            }, () => reject()).then(()  => resolve(), err => reject(err));
        });
    }
}

module.exports = CsvDB;
