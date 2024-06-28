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
}).promise();

router.post("/", async (req, res) => {
  const { jobberName } = req.body;

  try {
    // Fetch data from the database
    const [rows] = await pool.query(
      "SELECT state_name, gst_type FROM jobber_tb WHERE jobber_name = ?",
      [jobberName]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Jobber not found" });
    }

    const jobber = rows[0];

    res.json({ state_name: jobber.state_name, gst_type: jobber.gst_type });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
