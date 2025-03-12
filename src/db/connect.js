const mysql = require('mysql2');

const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'db', // IP ou localhost
  user: 'localhost', // alunods
  password: 'senai@604', // 
  database: 'test'
});

module.exports = pool;
