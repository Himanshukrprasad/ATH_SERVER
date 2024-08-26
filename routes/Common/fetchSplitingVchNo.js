const express = require('express');
const router = express.Router();
const mysql2 = require('mysql2/promise'); // Use the promise wrapper
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

router.post('/', async (req, res) => {

  const { esVch } = req.body;

  try {
    // Fetch vch_no from the spliting_header table
    const [headerRows] = await pool.query(
      `SELECT vch_no FROM spliting_header WHERE estimated_cs_vch_no = ?`,
      [esVch]
    );

    if (headerRows.length === 0) {
      return res.status(404).send("No matching vch_no found in spliting_header");
    }

    const vch_no = headerRows[0].vch_no;
    res.json(vch_no);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
