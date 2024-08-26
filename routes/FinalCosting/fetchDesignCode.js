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
  const { designNo } = req.body;

  if (!designNo) {
    return res.status(400).json({ error: "designNo is required" });
  }

  const query = "SELECT code FROM Estimated_CS_header WHERE design_no = ?";
  pool.execute(query, [designNo], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ error: "Database query failed" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "No matching record found" });
    }

    const code = results[0].code;
    res.json( code );
  });
});

module.exports = router;
