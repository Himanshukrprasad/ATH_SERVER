const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const cors = require('cors');

const router = express.Router();

// Create a connection pool to MySQL database
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

// Helper function to format numbers
const formatNumbers = (obj) => {
    if (obj.rate !== undefined) obj.rate = parseFloat(obj.rate).toFixed(2);
    if (obj.qty !== undefined) obj.qty = parseFloat(obj.qty).toFixed(3);
    if (obj.tolorance !== undefined) obj.tolorance = parseFloat(obj.tolorance).toFixed(3);
    if (obj.amt !== undefined) obj.amt = parseFloat(obj.amt).toFixed(2);
    if (obj.overhead_cost !== undefined) obj.overhead_cost = parseFloat(obj.overhead_cost).toFixed(2);
    
    return obj;
  }
  

router.post('/', async (req, res) => {
    try {
        // Trim whitespace from the search value
        const { vchSearchValue } = req.body;
        let trimmedVchSearchValue = 'NA';
        
        if(vchSearchValue){
            trimmedVchSearchValue = vchSearchValue.trim();
        }

        // Array to hold the results from different tables
        const searchResults = [];

        // Database connection
        const connection = await pool.getConnection();

        try {
            // First, fetch the vch_no from Estimated_CS_header where design_no matches vchSearchValue
            const headerQuery = `SELECT vch_no FROM Estimated_CS_header WHERE design_no = ?`;
            const [headerResults] = await connection.execute(headerQuery, [trimmedVchSearchValue]);

            if (headerResults.length === 0) {
                // No matching vch_no found, return empty results
                return res.json(searchResults);
            }

            // Extract the vch_no from the result
            const vchNo = headerResults[0].vch_no;

            // Array of tables to search in
            const tables = ['Estimated_CS_header', 'Estimated_CS_Item_Detail', 'Estimated_CS_JW_Detail'];

            // Loop through tables to perform search
            for (const table of tables) {
                // Query to search for the value in the current table
                const query = `SELECT * FROM ${table} WHERE vch_no = ?`;

                // Execute the query
                const [results] = await connection.execute(query, [vchNo]);

                // Add results along with table and column names to searchResults array
                results.forEach((row) => {
                    if (table === 'Estimated_CS_Item_Detail' || table === 'Estimated_CS_JW_Detail' || table === 'Estimated_CS_header') {
                        row = formatNumbers(row); // Format numbers for this table
                    }
                    searchResults.push({
                        tableName: table,
                        data: row
                    });
                });
            }
            res.json(searchResults);
        } finally {
            // Ensure the connection is released even if an error occurs
            connection.release();
        }
    } catch (error) {
        console.error('Error searching:', error);
        res.status(500).send('Internal Server Error');
    }
});



module.exports = router;