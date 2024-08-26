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
  const query = "SELECT jobber_name, vch_no, type FROM Estimated_CS_JW_Detail WHERE jobwork_name LIKE '%emb%'";

  pool.query(query, (error, results) => {
    if (error) {
      console.error("Error executing query:", error);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    // Create an object to store jobber_name, type, and vch_no mapping
    const jobberVchMap = results.reduce((acc, row) => {
      if (!acc[row.jobber_name]) {
        acc[row.jobber_name] = {
          type: row.type,
          vch_no: []
        };
      }
      acc[row.jobber_name].vch_no.push(row.vch_no);
      return acc;
    }, {});

    // Convert the jobberVchMap to an array of objects
    const resultArray = Object.keys(jobberVchMap).map((jobberName) => ({
      jobber_name: jobberName,
      type: jobberVchMap[jobberName].type,
      vch_no: jobberVchMap[jobberName].vch_no
    }));

    res.json(resultArray);
  });
});

module.exports = router;
