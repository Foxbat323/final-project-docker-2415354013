const express = require('express');
const mysql = require('mysql2');
const app = express();
app.use(express.json());
require('dotenv').config();
console.log(process.env.DB_HOST);

const connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

const initDatabase = () => {
  connection.query('SELECT 1', (err) => {
    if (err) {
      console.log('Database belum ready, retry 3 detik lagi...', err.message);
      setTimeout(initDatabase, 3000);
      return;
    }
    console.log('Database connected');
    connection.query(`CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL
    )`);
  });
}

initDatabase();

app.get('/', (req, res) => {
  res.send('Backend Docker Running');
});

app.get('/users', (req, res) => {
  connection.query('SELECT id, name FROM users', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

app.post('/users', (req, res) => {
  const { name } = req.body;
  connection.query(
    'INSERT INTO users (name) VALUES (?)',
    [name],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: results.insertId, name });
    }
  );
});

app.listen(process.env.APP_PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${process.env.APP_PORT}`);
});