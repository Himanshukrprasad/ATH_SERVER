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

router.get('/', (req, res) => {
  const query = `SELECT vch_no FROM purchase_bill_header ORDER BY sl_no DESC LIMIT 1`;

  pool.query(query, (error, results) => {
    if (error) {
      console.error("Error executing query:", error);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    let lastVchNumber = results.length > 0 ? results[0].vch_no : null;

    // If no previous vch_no exists, initialize with '1'
    if (!lastVchNumber) {
      res.json('1');
      return;
    }

    // Convert the last vch_no to an integer and increment it
    const newVchNo = (parseInt(lastVchNumber) + 1).toString();

    res.json(newVchNo);
  });
});

module.exports = router;
