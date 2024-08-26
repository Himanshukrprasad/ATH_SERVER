const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");
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

router.post("/", async (req, res) => {
    const { process } = req.body;
  
    try {
      // Fetch types from the database where jobber_name is 'N/A', jobwork_name includes process, and is_other_charge is 0
      const query = `
        SELECT type
        FROM Estimated_CS_JW_Detail
        WHERE jobber_name = 'N/A' 
          AND jobwork_name LIKE ?
          AND is_other_charge = 0
      `;
      const values = [`%${process}%`];
  
      const [rows] = await pool.query(query, values);
  
      // Extract types into a single array
      const typesArray = rows.map(row => row.type);
  
      // Send the types as a single object with an array of types
      res.json(typesArray);
    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
    }
  });
  
  

module.exports = router;
