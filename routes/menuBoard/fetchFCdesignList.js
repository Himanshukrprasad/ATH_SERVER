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

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT DISTINCT design_no FROM fc_header');
    const designNo = rows.map(row => row.design_no);
    console.log('result', designNo);
    res.json(designNo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});

module.exports = router;
