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

router.get("/", async (req, res) => {
  try {
    const connection = await pool.promise().getConnection();

    // Fetch all columns from spliting_destination table
    const [splitingResults] = await connection.query(
      'SELECT * FROM spliting_destination WHERE design_no != "N/A" AND is_delete != 1'
    );

    // Fetch all design_no from sfg_header table
    const [sfgHeaderResults] = await connection.query(
      'SELECT design_no FROM sfg_destination'
    );

    // Fetch estimated_cs_vch_no from spliting_header table
    const [splitingHeaderResults] = await connection.query(
      'SELECT design_no, estimated_cs_vch_no FROM spliting_header'
    );

    // Release the connection back to the pool
    connection.release();

    // Create a Set of design_no from sfg_header for quick lookup
    const sfgHeaderDesignNos = new Set(sfgHeaderResults.map(item => item.design_no));

    // Create a Map of design_no to estimated_cs_vch_no from spliting_header
    const designNoToEsVchNo = new Map(splitingHeaderResults.map(item => [item.design_no, item.estimated_cs_vch_no]));

    // Update splitingResults to set is_done = 1 if design_no exists in sfg_header
    // and add estimated_cs_vch_no to each object
    const updatedResults = splitingResults.map(item => {
      const isDone = sfgHeaderDesignNos.has(item.design_no) ? 1 : 0;
      const esVchNo = designNoToEsVchNo.get(item.design_no) || null;
      return { ...item, is_done: isDone, es_vch_no: esVchNo };
    });

    // Send the updated data to the frontend
    res.json(updatedResults);
  } catch (error) {
    console.error("Error fetching data from spliting_destination:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


module.exports = router;
