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

const headerTables = [
  { header: 'emb_rec_header', destination: 'emb_rec_destination' },
  { header: 'fus_rec_header', destination: 'fus_rec_destination' },
  { header: 'cutting_header', destination: 'cutting_component', isCutting: true },
  { header: 'handwork_rec_header', destination: 'handwork_rec_source' },
  { header: 'printing_rec_header', destination: 'printing_rec_destination' },
  { header: 'pleating_rec_header', destination: 'pleating_rec_destination' },
  { header: 'stitching_rec_header', destination: 'stitching_rec_destination' },
  { header: 'smoking_rec_header', destination: 'smoking_rec_destination' },
  { header: 'washing_rec_header', destination: 'washing_rec_destination' },
  { header: 'Refinishing_rec_header', destination: 'Refinishing_rec_destination' },
  { header: 'iron_rec_header', destination: 'iron_rec_destination' },
];

router.post("/", (req, res) => {
  const { vchNo } = req.body;

  if (!vchNo) {
    return res.status(400).json({ error: "vchNo is required" });
  }

  let completed = 0;
  const results = [];

  headerTables.forEach(({ header, destination, isCutting }) => {
    const headerQuery = isCutting ? `
      SELECT vch_no, jobber_id, jobber_name, actual_qty
      FROM ${header}
      WHERE estimate_cs_vch_no = ?
    ` : `
      SELECT vch_no, jobber_id, jobber_name
      FROM ${header}
      WHERE estimate_cs_vch_no = ?
    `;

    pool.query(headerQuery, [vchNo], (headerError, headerResults) => {
      if (headerError) {
        console.error(`Error fetching from ${header}:`, headerError);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (headerResults.length > 0) {
        const { vch_no, jobber_id, jobber_name, actual_qty } = headerResults[0];

        if (isCutting) {
          const cuttingQuery = `
            SELECT cutting_charges
            FROM ${destination}
            WHERE vch_no = ?
          `;

          pool.query(cuttingQuery, [vch_no], (cuttingError, cuttingResults) => {
            if (cuttingError) {
              console.error(`Error fetching from ${destination}:`, cuttingError);
              return res.status(500).json({ error: "Internal Server Error" });
            }

            if (cuttingResults.length > 0) {
              const { cutting_charges } = cuttingResults[0];
              const total_jw_rate =  cutting_charges;

              results.push({
                table: header,
                vch_no,
                jobber_id,
                jobber_name,
                total_jw_rate,
                types: null
              });
            }

            if (++completed === headerTables.length) {
              res.json(results);
            }
          });
        } else {
          const destinationQuery = `
            SELECT SUM(jw_rate) AS total_jw_rate, GROUP_CONCAT(type) AS types
            FROM ${destination}
            WHERE vch_no = ?
          `;

          pool.query(destinationQuery, [vch_no], (destinationError, destinationResults) => {
            if (destinationError) {
              console.error(`Error fetching from ${destination}:`, destinationError);
              return res.status(500).json({ error: "Internal Server Error" });
            }

            if (destinationResults.length > 0) {
              const { total_jw_rate, types } = destinationResults[0];

              results.push({
                table: header,
                vch_no,
                jobber_id,
                jobber_name,
                total_jw_rate,
                types: types ? types.split(',') : []
              });
            }

            if (++completed === headerTables.length) {
              res.json(results);
            }
          });
        }
      } else {
        if (++completed === headerTables.length) {
          res.json(results);
       
        }
      }
    });
  });
});

module.exports = router;
