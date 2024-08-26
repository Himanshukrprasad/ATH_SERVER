const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

router.post("/", async (req, res) => {
  const { process } = req.body;

  try {
    // Step 1: Fetch type and vch_no from Estimated_CS_JW_Detail
    const jwDetailQuery = `
      SELECT type, vch_no 
      FROM Estimated_CS_JW_Detail 
      WHERE jobber_name = 'N/A' 
        AND jobwork_name LIKE ? 
        AND is_other_charge = 0
    `;
    const [jwDetailResults] = await pool.query(jwDetailQuery, [`%${process}%`]);

    if (jwDetailResults.length === 0) {
      return res.status(404).json({ message: "No matching records found" });
    }

    // Extract vch_no values
    const vchNos = jwDetailResults.map(row => row.vch_no);

    // Step 2: Fetch design_no and design_id from Estimated_CS_header using the vch_no values
    const headerQuery = `
      SELECT vch_no, design_no, design_id
      FROM Estimated_CS_header 
      WHERE vch_no IN (?)
    `;
    const [headerResults] = await pool.query(headerQuery, [vchNos]);

    // Step 3: Combine and merge results
    const combinedResults = jwDetailResults.reduce((acc, detailRow) => {
      const headerRow = headerResults.find(headerRow => headerRow.vch_no === detailRow.vch_no);
      if (headerRow) {
        const key = `${headerRow.vch_no}_${headerRow.design_no}`;
        if (!acc[key]) {
          acc[key] = {
            type: [],
            vch_no: headerRow.vch_no,
            design_no: headerRow.design_no,
            design_id: headerRow.design_id,
          };
        }
        acc[key].type.push(detailRow.type);
      }
      return acc;
    }, {});

    // Convert merged object to array
    const mergedArray = Object.values(combinedResults).map(item => ({
      ...item,
      type: item.type.join('/'), // Convert type array to string if needed
    }));

    // Step 4: Send response
    res.json(mergedArray);
   
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});



module.exports = router;
