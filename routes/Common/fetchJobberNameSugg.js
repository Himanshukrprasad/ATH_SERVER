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
    let { process } = req.body;
  
    try {
      // Fetch the data from the database
      const [rows] = await pool.query(
        `SELECT d.vch_no, d.jobber_name, d.jobber_id, d.type, h.design_no
         FROM Estimated_CS_JW_Detail d
         JOIN Estimated_CS_header h ON d.vch_no = h.vch_no
         WHERE d.jobwork_name LIKE ?`,
        [`%${process}%`]
      );
  
      // Process the fetched data
      const groupedData = {};
  
      rows.forEach(row => {
        const { vch_no, jobber_name, type, design_no } = row;
  
        // If this vch_no and jobber_name combination does not exist, create it
        if (!groupedData[vch_no]) {
          groupedData[vch_no] = {};
        }
        if (!groupedData[vch_no][jobber_name]) {
          groupedData[vch_no][jobber_name] = { vch_no, jobber_name, design_no, types: [] };
        }
  
        // Add the type to the types array
        groupedData[vch_no][jobber_name].types.push(type);
      });
  
      // Convert the grouped data back to an array format
      const resultArray = [];
      for (let vch_no in groupedData) {
        for (let jobber_name in groupedData[vch_no]) {
          resultArray.push(groupedData[vch_no][jobber_name]);
        }
      }
  

      res.json(resultArray);
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  });

  module.exports = router;