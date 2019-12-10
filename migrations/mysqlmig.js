const mysql = require('mysql');
const migration = require('mysql-migrations');

const connection = mysql.createPool({
  connectionLimit : 10,
  host     : process.env.NODE_DB_HOST,
  user     : process.env.NODE_DB_USER,
  password : process.env.NODE_DB_PASSWORD,
  database : process.env.NODE_DB_NAME
});

migration.init(connection, __dirname + '/files');