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

router.post("/", async (req, res) => {
  const { unitNo, process } = req.body;

  let unitNoVal;

  if(process === 'ESTIMATED_CS'){
     unitNoVal = unitNo;
  }
  
  else if(process === 'CUTTING'){
    let unitPref = '';

    const match = unitNo.match(/U-(\d+)/);  // Extracting the number after U-

    if (match) {
        unitPref = match[1];  // Store the extracted number in unitPref
    }

    unitNoVal = `UNIT-0${unitPref}`;
  }
  else{
    unitNoVal = `UNIT-0${unitNo}`
  }
  
  try {
    const [rows] = await pool.execute(
      "SELECT address FROM mis_tb WHERE unit_no = ?",
      [unitNoVal]
    );

    if (rows.length > 0) {
      res.json({ address: rows[0].address });
    } else {
      res.status(404).json({ error: "No address found for the given unit number." });
    }
  } catch (error) {
    console.error("Error fetching address:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
