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
    const { jobberName } = req.body;
    pool.getConnection((err, connection) => {
      if (err) {
        console.error("Error getting database connection:", err);
        res.status(500).send("Error fetching data");
        return;
      }
  
      // Query to fetch data 
      const embIssSourceQuery = `
        SELECT design_no, lot_no, vch_no,design_id
        FROM Refinishing_iss_header
        WHERE jobber_name = ?
      `;
  
      connection.query(embIssSourceQuery, [jobberName], (err, embIssSourceResults) => {
        if (err) {
          console.error("Error executing emb_iss_source query:", err);
          connection.release();
          res.status(500).send("Error fetching data");
          return;
        }

        
  
        if (embIssSourceResults.length === 0) {
          // If no data found, send an empty array as the response
          connection.release();
          res.json([]);
        } else {
         
          res.json(embIssSourceResults);
        }
      });
    });
  });
  

module.exports = router;
