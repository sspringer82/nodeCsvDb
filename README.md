# CSV based Database

[![Build Status](https://secure.travis-ci.org/sspringer82/nodeCsvDb.png?branch=master)](http://travis-ci.org/sspringer82/nodeCsvDb)

I was looking for a lightweight replacement for a database in one of my node.js workshops.
This is the result: the data is stored in files. The rows are separated by new line characters
and the fields are separated by semicolons.
The first version of the database implementation was completely synchronous whereas the current version
heavily relies on promises.

# Installation

`npm install csv-db`

# Usage

Given a file named input.csv of the following format (columns ID, username and password):

```
1;admin;secret;
```

## Initialization:

```
const CsvDb = require('csv-db');
const csvDb = new CsvDb('input.csv', ['id', 'username', 'password']);
```

If you omit the second argument of the constructor, the property names will be read from the first line

## Usage:

```
csvDb.get().then((data) => {
  console.log(data);
}, (err) => {
  console.log(err);
});
```

# API

## CsvDb(filename, columns)

Create a file handle to access the database

## get(id)

Read either all data of a certain file or just one data set. The output is an array containing
one or more objects, depending on what was fetched.

```
csvDb.get().then((data) => {
  console.log(data);
}, (err) => {
  console.log(err);
});
```

## insert(newData)

Insert a new row to the database. Data is an object with column names as keys and the values to be inserted as - the values.

```
const user = {
  name: 'basti',
  secret: 'topSecret'
};
csvDb.insert(user).then((data) => {
  console.log(data);
}, (err) => {
  console.log(err);
});
```

## update(data, id)

Update an existing row. Data is an object containing ALL the values excluding the id. id is the identifier of the row to be updated.

```
const user = {
  id: 2,
  name: 'basti',
  secret: 'topSecret'
};
csvDb.update(user, 2).then((data) => {
  console.log(data);
}, (err) => {
  console.log(err);
});
```

## delete(id)

Delete an existing row. id is the identifier of the row to be deleted.

```
csvDb.delete(2).then((data) => {
  console.log(data);
}, (err) => {
  console.log(err);
});
```
