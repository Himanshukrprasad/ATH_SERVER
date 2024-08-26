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
  let { jobberName, processName, designNo } = req.body;

  console.log('ir',jobberName, processName, designNo  )

  if (jobberName === "Miscellaneous") {
    jobberName = "N/A";
  }

  let esVchVal = [];
  let masterId;
  let masterIdResults = [];

  try {
    // Fetch master_id from Estimated_CS_header where design_no equals designNo
    if (processName === 'iron') {
      [masterIdResults] = await pool.query(
        "SELECT master_id FROM Estimated_CS_header WHERE design_no IN (?)",
        [designNo]
      );
    } else {
      [masterIdResults] = await pool.query(
        "SELECT master_id FROM Estimated_CS_header WHERE design_no = ?",
        [designNo]
      );
    }

    if (masterIdResults.length > 0) {
      masterId = masterIdResults[0].master_id;
    } else {
      res.status(404).json({ error: "No matching master_id found for the given design_no" });
      return;
    }

    const con = await pool.getConnection();

    const [estimatedCsJwDetailResult] = await con.query(
      `SELECT type, amt 
       FROM Estimated_CS_JW_Detail 
       WHERE jobber_name = ? 
       AND is_other_charge = 0 
       AND jobwork_name LIKE ? 
       AND master_id = ?`,
      [jobberName, `%${processName}%`, masterId]
    );


    const jwDetails = estimatedCsJwDetailResult.map((row) => ({
      type: row.type,
      amt: row.amt,
    }));

    con.release();

    res.json(jwDetails);
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ error: "An error occurred while processing the request." });
  }
});

module.exports = router;
