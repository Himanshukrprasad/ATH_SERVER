const express = require("express");
const router = express.Router();
const mysql2 = require("mysql2/promise");
require('dotenv').config();

// Create a connection pool to the MySQL database
const pool = mysql2.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Route to fetch all users (username and user_id)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT user_id, username FROM user_tb");
    res.json(rows); // Send the fetched data as JSON to the frontend
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Server error");
  }
});

module.exports = router;
