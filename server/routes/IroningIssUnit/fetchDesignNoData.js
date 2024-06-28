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
  const { vchNo } = req.body;

  if (!vchNo) {
    return res.status(400).json({ error: "vchNo is required" });
  }

  const quotedVchNo = `["${vchNo}"]`;

  const query = `
    SELECT design_no, design_id, vch_no, estimate_cs_vch_no, lot_no
    FROM sfg_header
    WHERE estimate_cs_vch_no = ?
  `;

  pool.query(query, [quotedVchNo], (error, results) => {
    if (error) {
      console.error("Database query error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (results.length === 0) {
      console.log('No records found');
      return res.status(404).json({ message: "No records found" });
    }

    // Remove [""] from the results
    const cleanedResults = results.map(result => {
      return {
        ...result,
        design_no: result.design_no.replace(/^\["|"\]$/g, '').replace(/"\]$/, ''),
        estimate_cs_vch_no: result.estimate_cs_vch_no.replace(/^\["|"\]$/g, '').replace(/"\]$/, ''),
        lot_no: result.lot_no.replace(/^\["|"\]$/g, '').replace(/"\]$/, ''),
      };
    });

    res.json(cleanedResults);

  });
});

module.exports = router;
