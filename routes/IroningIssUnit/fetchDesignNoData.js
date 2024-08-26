const express = require('express');
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

// Middleware to parse JSON bodies
router.use(express.json());

router.post("/", async (req, res) => {
  const { vchNo } = req.body;

  if (!vchNo || !Array.isArray(vchNo)) {
    return res.status(400).json({ error: "vchNo must be an array" });
  }

  try {
    // Get a connection from the pool
    const connection = await pool.getConnection();

    // Create a dynamic SQL query to match any value from the vchNo array
    const placeholders = vchNo.map(() => "FIND_IN_SET(?, estimate_cs_vch_no)").join(" OR ");
    const querySfgHeader = `
      SELECT design_no, design_id, vch_no, estimate_cs_vch_no, lot_no
      FROM sfg_header
      WHERE ${placeholders}
    `;
    const [sfgHeaderResults] = await connection.query(querySfgHeader, vchNo);

    // Fetch design_no from iron_iss_destination
    const designNos = sfgHeaderResults.map(item => item.design_no);
    console.log('uf', designNos)
    if (designNos.length === 0) {
      connection.release();
      return res.status(404).json({ message: "No records found" });
    }

    

    const queryIronIssDestination = `
      SELECT DISTINCT design_no
      FROM iron_iss_header
      WHERE design_no IN (?)
    `;
    const [ironIssResults] = await connection.query(queryIronIssDestination, [designNos]);

    console.log('iron iss res', ironIssResults)

    // Release the connection back to the pool
    connection.release();

    // Create a Set of design_no from iron_iss_destination for quick lookup
    const ironIssDesignNos = new Set(ironIssResults.map(item => item.design_no));

    // Update sfgHeaderResults to add iss_done if design_no exists in iron_iss_destination
    const updatedResults = sfgHeaderResults.map(item => {
      const issDone = ironIssDesignNos.has(item.design_no) ? 1 : 0;
      return { ...item, is_done: issDone };
    });

    res.json(updatedResults);
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
