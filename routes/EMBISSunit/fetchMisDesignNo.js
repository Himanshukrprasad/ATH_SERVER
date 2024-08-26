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


router.post("/", async (req, res) => {
  const { process } = req.body;
  try {
    // Fetch vch_no and type from the database where jobber_name is 'N/A' and is_other_charge is 0
    const query = `
      SELECT vch_no, type, jobwork_name
      FROM Estimated_CS_JW_Detail
      WHERE jobber_name = 'N/A' AND is_other_charge = 0
    `;

    const result = await pool.query(query);
    const rows = result.rows;

    // Process the data to group by vch_no
    const groupedData = rows.reduce((acc, row) => {
      const { vch_no, type, jobwork_name } = row;
      if (!acc[vch_no]) {
        acc[vch_no] = { vch_no, types: [], jobwork_names: [] };
      }
      acc[vch_no].types.push(type);
      acc[vch_no].jobwork_names.push(jobwork_name);
      return acc;
    }, {});

    // Filter and format the grouped data
    const formattedData = Object.values(groupedData).map(group => {
      const includesProcess = group.jobwork_names.some(name =>
        name.includes(process)
      );
      if (includesProcess) {
        return { vch_no: group.vch_no, types: group.types };
      }
      return null;
    }).filter(item => item !== null);
    res.json(formattedData);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

module.exports = router;

