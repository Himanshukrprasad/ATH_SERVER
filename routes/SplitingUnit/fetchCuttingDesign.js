const express = require('express')
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
  
      // Updated SQL query to filter out rows where is_delete is 1
      connection.query('SELECT * FROM cutting_header WHERE is_delete != 1', (err, cuttingResults) => {
        if (err) {
          connection.release();
          console.error('Error executing query:', err);
          res.status(500).send('Error fetching data');
          return;
        }
  
        connection.query('SELECT lot_no FROM spliting_header WHERE is_delete = 0', (err, splitingResults) => {
          connection.release();
  
          if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Error fetching data');
            return;
          }
  
          const splitingLotNos = splitingResults.map(row => row.lot_no);
          
          const updatedResults = cuttingResults.map(item => {
            if (splitingLotNos.includes(item.lot_no)) {
              return { ...item, is_done: 1 };
            } else {
              return { ...item };
            }
          });
  
          res.json(updatedResults);
        });
      });
    });
  });
  


module.exports = router;