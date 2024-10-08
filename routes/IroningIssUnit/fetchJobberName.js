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
  const query = `
      SELECT 
          d.jobber_name, 
          d.vch_no,
          h.design_no
      FROM 
          Estimated_CS_JW_Detail d
      LEFT JOIN 
          Estimated_CS_header h
      ON 
          d.vch_no = h.vch_no
      WHERE 
          d.jobwork_name LIKE '%iron%'
  `;

  pool.query(query, (error, results) => {
    if (error) {
      console.error("Error executing query:", error);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    // Create an object to store jobber_name, vch_no, and design_no mapping
    const jobberVchMap = results.reduce((acc, row) => {
      if (!acc[row.jobber_name]) {
        acc[row.jobber_name] = [];
      }
      acc[row.jobber_name].push({
        vch_no: row.vch_no,
        design_no: row.design_no
      });
      return acc;
    }, {});

    // Convert the jobberVchMap to an array of objects
    const resultArray = Object.keys(jobberVchMap).map((jobberName) => ({
      jobber_name: jobberName,
      vch_details: jobberVchMap[jobberName]
    }));
    res.json(resultArray);
    console.log('resss', resultArray)
  });
});

module.exports = router;
