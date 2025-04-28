const mysql = require('mysql2');

const pool = mysql.createPool({
    connectionLimit:10,
    host:'10.89.240.99',
    user:'yasmin',
    password:'yasmin1234',
    database:'banco_salas'
})

module.exports = pool;