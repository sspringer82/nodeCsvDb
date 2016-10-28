# CSV based Database

I was looking for a lightweight replacement for a database in one of my node.js workshops.
This is the result: the data is stored in files. The rows are separated by new line characters
and the fields are separated by semicolons.
The first version of the database implementation was completely synchronous whereas the current version
heavily relies on promises.

# Installation
`npm install csv-db`

# API
## CsvDb(filename, columns)
Create a file handle to access the database
## get(id)
Read either all data of a certain file or just one data set. The output is an array containing
one or more objects, depending on what was fetched.
## insert(newData)
Insert a new row to the database. Data is an object with column names as keys and the values to be inserted as - the values.
## update(data, id)
Update an existing row. Data is an object containing ALL the values excluding the id. id is the identifier of the row to be updated.
## delete(id)
Delete an existing row. id is the identifier of the row to be deleted.