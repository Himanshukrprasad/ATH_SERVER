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
    const [rows] = await pool.query('SELECT DISTINCT jobber_name FROM jobber_tb');
    const jobberNames = rows.map(row => row.jobber_name);
  
    res.json(jobberNames);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});

module.exports = router;
