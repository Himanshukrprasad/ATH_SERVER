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
    
    const query = 'SELECT raw_material, gdwn_id, godown, cl_bal, itm_cl FROM Item_detail';
  
    
    pool.query(query, (error, results) => {
      if (error) {
        console.error("Error executing query:", error);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
  
     
      if (results.length === 0) {
        res.status(404).json({ message: "No data found in Item_detail table" });
        return;
      }
      res.json(results);

      
    });
  });
  
  module.exports = router;
  
