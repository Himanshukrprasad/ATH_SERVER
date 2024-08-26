const express = require("express");
const router = express.Router();
const mysql2 = require("mysql2/promise");
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

router.post("/", async (req, res) => {
  const { jobberName } = req.body;
 
  try {
    // Fetch vch_no and type from Estimated_CS_JW_Detail where jobber_name equals jobberName
    const jwDetailQuery = `
      SELECT vch_no, type
      FROM Estimated_CS_JW_Detail
      WHERE jobber_name = ?
    `;
    const [jwDetailResults] = await pool.query(jwDetailQuery, [jobberName]);

    if (jwDetailResults.length === 0) {
      return res.status(404).json({ message: "No matching records found" });
    }

    // Extract vch_no and type values
    const vchNos = jwDetailResults.map(row => row.vch_no);
    const vchTypeMap = new Map(jwDetailResults.map(row => [row.vch_no, row.type]));

    // Fetch design_id, vch_no, and design_no from Estimated_CS_header where vch_no is in the fetched vch_no array
    const headerQuery = `
      SELECT design_id, vch_no, design_no
      FROM Estimated_CS_header
      WHERE vch_no IN (?)
    `;
    const [headerResults] = await pool.query(headerQuery, [vchNos]);

    // Add the type to the headerResults
    const headerResultsWithType = headerResults.map(row => ({
      ...row,
      type: vchTypeMap.get(row.vch_no)
    }));

    // Send the results back to the client
    res.json(headerResultsWithType);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});



module.exports = router;
