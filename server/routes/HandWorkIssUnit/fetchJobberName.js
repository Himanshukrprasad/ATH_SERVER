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
    
  const query = "SELECT jobber_name, vch_no, type FROM Estimated_CS_JW_Detail WHERE jobwork_name LIKE '%hand%'";

  pool.query(query, (error, results) => {
    if (error) {
      console.error("Error executing query:", error);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    // Create an object to store jobber_name, vch_no, and type mapping
    const jobberVchTypeMap = results.reduce((acc, row) => {
      const key = `${row.jobber_name}_${row.vch_no}`;
      if (!acc[key]) {
        acc[key] = {
          jobber_name: row.jobber_name,
          vch_no: row.vch_no,
          type: row.type
        };
      }
      return acc;
    }, {});

    // Convert the jobberVchTypeMap to an array of objects
    const resultArray = Object.values(jobberVchTypeMap);

    // Send the transformed result as JSON response
    res.json(resultArray);
  });
});

module.exports = router;
