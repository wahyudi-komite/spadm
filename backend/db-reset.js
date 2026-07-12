const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'wahyudi',
  password: 'Astra123'
});

connection.query('DROP DATABASE IF EXISTS spadm_20261207', (err) => {
  if (err) throw err;
  connection.query('CREATE DATABASE spadm_20261207', (err) => {
    if (err) throw err;
    console.log('Database spadm_20261207 recreated');
    process.exit(0);
  });
});
