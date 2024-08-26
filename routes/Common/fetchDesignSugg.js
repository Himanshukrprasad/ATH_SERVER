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
    const { tableName } = req.query;

    console.log('appolo', tableName)
    
    if (!tableName) {
      return res.status(400).send('Missing tableName parameter');
    }
  
    // Ensure that tableName is safe to use in SQL queries to avoid SQL injection.
    const allowedTables = [
      'Estimated_CS_header', 'cutting_header', 'emb_iss_header', 'emb_rec_header', 'fus_iss_header',
      'fus_rec_header', 'handwork_iss_header', 'handwork_rec_header', 'printing_iss_header', 
      'printing_rec_header', 'pleating_iss_header', 'pleating_rec_header', 'washing_iss_header', 
      'washing_rec_header', 'Refinishing_iss_header', 'Refinishing_rec_header', 'smoking_iss_header', 
      'stitching_iss_header', 'stitching_rec_header', 'smoking_rec_header', 'iron_rec_header', 
      'iron_iss_header', 'spliting_header', 'fc_header', 'sfg_header'
    ];
    
    if (!allowedTables.includes(tableName)) {
      return res.status(400).send('Invalid tableName parameter');
    }
  
    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Error getting database connection:', err);
        res.status(500).send('Error fetching data');
        return;
      }

    
      const query = `SELECT design_no, vch_date, vch_no FROM ?? WHERE is_delete != 1`;
      connection.query(query, [tableName], (err, results) => {
        connection.release();
  
        if (err) {
          console.error('Error executing query:', err);
          res.status(500).send('Error fetching data');
          return;
        }
  
        res.json(results);
      });
    });
  });
  

module.exports = router;

