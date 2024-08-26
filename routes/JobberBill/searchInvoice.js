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
        console.error("Error getting database connection:", err);
        res.status(500).send("Error fetching data");
        return;
      }
  
      // Query to fetch party_name, vch_no, and vch_date from purchase_bill_header
      const query = `
        SELECT party_name, vch_no, vch_date
        FROM purchase_bill_header
      `;
  
      // Execute the SQL query
      connection.query(query, (error, results) => {
        // Release the connection back to the pool
        connection.release();
  
        if (error) {
          console.error("Error executing query:", error);
          res.status(500).send("Error fetching data");
          return;
        }
  
        // Send the fetched data back to the frontend
        res.json(results);
      });
    });
  });
  

module.exports = router;

