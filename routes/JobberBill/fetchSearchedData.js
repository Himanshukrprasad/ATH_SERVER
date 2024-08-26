const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const cors = require('cors');

const router = express.Router();

require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});


router.post('/', async (req, res) => {
   
    try {
      const { vchSearchValue } = req.body;
      
      const searchResults = [];
  
      // Get a connection from the pool
      const connection = await pool.getConnection();
  
      try {
        // Define the tables to search
        const tables = ['purchase_bill_header', 'purchase_bill_detail', 'purchase_bill_tax_detail'];
  
        // Loop through tables to perform search
        for (const table of tables) {
          // Query to search for the value in the current table
          const query = `SELECT * FROM ${connection.escapeId(table)} WHERE vch_no = ?`;
  
          // Execute the query
          const [results] = await connection.execute(query, [vchSearchValue]);
  
          // Add results along with table name to searchResults array
          searchResults.push({
            tableName: table,
            data: results
          });
        }
      } finally {
        // Ensure the connection is released even if an error occurs
        connection.release();
      }
  
      // Send the collected results as the response
      res.json(searchResults);
    } catch (error) {
      console.error('Error searching:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  

module.exports = router;


