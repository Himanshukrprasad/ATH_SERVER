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
  const { itemName } = req.body;


  if (!itemName) {
    return res.status(400).json({ error: "itemName is required" });
  }

  const query = "SELECT unit FROM grp_items_tb WHERE raw_material = ?";

  pool.query(query, [itemName], (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.status(200).json(results[0].unit);
  
  });
});

module.exports = router;
