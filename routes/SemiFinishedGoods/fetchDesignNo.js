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



router.get('/', async (req, res) => {
  try {
    const connection = await pool.promise().getConnection();

    // Fetch design_no, lot_no, vch_no, and last_operation from spliting_destination table
    const [splitingResults] = await connection.query('SELECT design_no, lot_no, vch_no, last_operation FROM spliting_destination WHERE design_no != "N/A"');

    const results = await Promise.all(splitingResults.map(async row => {
      let additionalData = [];
      let estimated_cs_vch_no = null;
      let design_no_query = '';
      let destination_query = '';

      // Fetch estimated_cs_vch_no from spliting_header table where design_no matches
      const [headerResult] = await connection.query('SELECT estimated_cs_vch_no FROM spliting_header WHERE design_no = ?', [row.design_no]);
      if (headerResult.length > 0) {
        estimated_cs_vch_no = headerResult[0].estimated_cs_vch_no;
      }

      switch (row.last_operation) {
        case null:
          design_no_query = 'SELECT vch_no FROM spliting_header WHERE design_no LIKE ?';
          destination_query = 'SELECT * FROM spliting_destination WHERE vch_no = ?';
          break;
        case 'EMB':
          design_no_query = 'SELECT vch_no FROM emb_rec_header WHERE design_no LIKE ?';
          destination_query = 'SELECT * FROM emb_rec_destination WHERE vch_no = ?';
          break;
        case 'FUS':
          design_no_query = 'SELECT vch_no FROM fus_rec_header WHERE design_no LIKE ?';
          destination_query = 'SELECT * FROM fus_rec_destination WHERE vch_no = ?';
          break;
        case 'HND':
          design_no_query = 'SELECT vch_no FROM handwork_rec_header WHERE design_no LIKE ?';
          destination_query = 'SELECT * FROM handwork_rec_source WHERE vch_no = ?';
          break;
        case 'PRT':
          design_no_query = 'SELECT vch_no FROM printing_rec_header WHERE design_no LIKE ?';
          destination_query = 'SELECT * FROM printing_rec_destination WHERE vch_no = ?';
          break;
        case 'STICH':
          design_no_query = 'SELECT vch_no FROM stitching_rec_header WHERE design_no LIKE ?';
          destination_query = 'SELECT * FROM stitching_rec_destination WHERE vch_no = ?';
          break;
        case 'SMOKING':
          design_no_query = 'SELECT vch_no FROM smoking_rec_header WHERE design_no LIKE ?';
          destination_query = 'SELECT * FROM smoking_rec_destination WHERE vch_no = ?';
          break;
        case 'REFINISH':
          design_no_query = 'SELECT vch_no FROM Refinishing_rec_header WHERE design_no LIKE ?';
          destination_query = 'SELECT * FROM Refinishing_rec_destination WHERE vch_no = ?';
          break;
        case 'PLE':
          design_no_query = 'SELECT vch_no FROM pleating_rec_header WHERE design_no LIKE ?';
          destination_query = 'SELECT * FROM pleating_rec_destination WHERE vch_no = ?';
          break;
        case 'WASH':
          design_no_query = 'SELECT vch_no FROM washing_rec_header WHERE design_no LIKE ?';
          destination_query = 'SELECT * FROM washing_rec_destination WHERE vch_no = ?';
          break;
        case 'IRON':
          design_no_query = 'SELECT vch_no FROM iron_rec_header WHERE design_no LIKE ?';
          destination_query = 'SELECT * FROM iron_rec_destination WHERE vch_no = ?';
          break;
        case 'SFG':
          // Do nothing for SFG
          break;
      }

      if (design_no_query && destination_query && row.last_operation !== 'SFG') {
        const [vch_no_result] = await connection.query(design_no_query, [`%${row.design_no}%`]);
        if (vch_no_result.length > 0) {
          const vch_no = vch_no_result[0].vch_no;
          const [destination_result] = await connection.query(destination_query, [vch_no]);
          additionalData = destination_result;
        }
      }

      return {
        design_no: row.design_no,
        lot_no: row.lot_no,
        vch_no: row.vch_no,
        last_operation: row.last_operation,
        estimated_cs_vch_no,
        additionalData
      };
    }));

    // Filter out objects with last_operation === 'SFG'
    const filteredResults = results.filter(row => row.last_operation !== 'SFG');

    connection.release();

    res.json(filteredResults);
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).send('Error fetching data');
  }
});



module.exports = router;
