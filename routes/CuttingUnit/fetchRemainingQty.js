const express = require("express");
const router = express.Router();
const mysql2 = require("mysql2");
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

router.post("/", (req, res) => {
    const { designNo } = req.body;
  
    // Check if designNo is provided
    if (!designNo) {
      return res.status(400).json({ error: "Design No is required" });
    }
  
    // Query to get the last remaining_qty and the sum of actual_qty for the given designNo
    const query = `
      SELECT 
        remaining_qty,
        (SELECT SUM(actual_qty) FROM cutting_header WHERE design_no = ?) AS total_actual_qty
      FROM cutting_header 
      WHERE design_no = ?
      ORDER BY sl_no DESC 
      LIMIT 1
    `;
  
    // Execute the query
    pool.query(query, [designNo, designNo], (error, results) => {
      if (error) {
        // Handle SQL errors
        return res.status(500).json({ error: error.message });
      }
  
      // Check if results are found
      if (results.length === 0) {
        return res.status(200).json({ remaining_qty: -1, total_actual_qty: 0 });
      }
  
      // Return the remaining_qty and total_actual_qty
      res.status(200).json({
        remaining_qty: results[0].remaining_qty,
        total_actual_qty: results[0].total_actual_qty
      });
    });
});

module.exports = router;
