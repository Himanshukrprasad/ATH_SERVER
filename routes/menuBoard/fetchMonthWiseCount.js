const express = require('express');
const router = express.Router();
const mysql2 = require('mysql2');
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

const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

router.post("/", async (req, res) => {
  const { process, unitVal } = req.body;
  
  try {
    // Initialize the monthData object with empty arrays for all 12 months
    const monthData = monthNames.reduce((acc, month) => {
      acc[month] = [];
      return acc;
    }, {});

    let query = `SELECT * FROM ${process}`;
    let params = [];

    if (process !== 'fc_header') {
      query += ` WHERE unit_no LIKE ?`;
      params.push(`%${unitVal}%`);
    }

    pool.query(query, params, (error, results) => {
      if (error) {
        console.error('Database query error:', error); // Log error for debugging
        return res.status(500).json({ error: error.message });
      }

      results.forEach(row => {
        const month = new Date(row.vch_date).getMonth();
        const key = monthNames[month];
        monthData[key].push(row);
      });

      res.json(monthData);
      console.log('Fetched data:', monthData); // Consider removing this in production
    });

  } catch (error) {
    console.error('Server error:', error); // Log error for debugging
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
