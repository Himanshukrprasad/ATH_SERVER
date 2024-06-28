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

  const query = `
    SELECT item_name, type, size, rate, qty, amt, item_id
    FROM cutting_item_detail
    WHERE vch_no = ?
  `;

  pool.query(query, [vchNo], (error, results) => {
    if (error) {
      console.error("Error fetching item details:", error);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.json(results);
    }
  });
});

module.exports = router;
