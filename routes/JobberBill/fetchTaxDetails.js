const express = require("express");
const router = express.Router();
const mysql2 = require('mysql2/promise');
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

router.post("/", async (req, res) => {
  const { ledgerName } = req.body;

  if (!ledgerName) {
      return res.status(400).send("ledgerName is required");
  }

  try {
      // Get a connection from the pool
      const connection = await pool.getConnection();

      // Query to fetch the tax_prcnt value
      const query = 'SELECT tax_prcnt FROM jobwork_tb WHERE jobwork_name = ?';
      const [rows] = await connection.execute(query, [ledgerName]);

      // Release the connection back to the pool
      connection.release();

      // Check if any rows were returned
      if (rows.length > 0) {
          res.json(rows[0].tax_prcnt);
      } else {
          res.status(404).send("No data found for the provided ledger name");
      }
  } catch (err) {
      console.error("Error executing query:", err);
      res.status(500).send("Error fetching data from the database");
  }
});



module.exports = router;
