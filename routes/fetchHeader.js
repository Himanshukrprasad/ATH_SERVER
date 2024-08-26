const express = require('express');
const router = express.Router();
const mysql2 = require('mysql2');

require('dotenv').config();

const pool = mysql2.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

router.get('/', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting database connection:', err);
            res.status(500).send('Error fetching data');
            return;
        }
        connection.query('SELECT vch_no FROM Estimated_CS_header ORDER BY master_id DESC LIMIT 1', (err, results) => {
            connection.release();

            if (err) {
                console.error('Error executing query:', err);
                res.status(500).send('Error fetching data');
                return;
            }

            const lastVchNo = results[0]?.vch_no || 'EC/000/24-25';
const parts = lastVchNo.split('/');
const prefix = parts[0] + '/'; // 'EC/'
const lastDigits = parseInt(parts[1]); // '001'
const yearRange = parts[2]; // '24-25'
const newLastDigits = (lastDigits + 1).toString().padStart(parts[1].length, '0'); // Incremented and padded last digits
const newVchNo = `${prefix}${newLastDigits}/${yearRange}`;

console.log(newVchNo); // This should log 'EC/002/24-25' if lastVchNo was 'EC/001/24-25'

            console.log("values",lastVchNo,parts,prefix,lastDigits,newLastDigits,newVchNo);

            res.json( newVchNo);
        });
    })
});

module.exports = router;
