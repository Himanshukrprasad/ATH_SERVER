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
  // { header: 'iron_rec_header', destination: 'iron_rec_destination' },
];

router.post("/", (req, res) => {
  const { vchNo, designNo } = req.body;


  if (!vchNo) {
    return res.status(400).json({ error: "vchNo is required" });
  }

  const results = [];

  const headerQueries = headerTables.map(({ header, destination, isCutting }) => {
    return new Promise((resolve, reject) => {
      const headerQuery = isCutting ? `
        SELECT vch_no, jobber_id, jobber_name, actual_qty
        FROM ${header}
        WHERE estimate_cs_vch_no LIKE ?
      ` : `
        SELECT vch_no, jobber_id, jobber_name
        FROM ${header}
        WHERE design_no LIKE ?
      `;

      const queryParam = isCutting ? `%${vchNo}%` : `%${designNo}%`;

      pool.query(headerQuery, [queryParam], (headerError, headerResults) => {
        if (headerError) {
          console.error(`Error fetching from ${header}:`, headerError);
          return reject(headerError);
        }

        if (headerResults.length > 0) {
          const destinationQueries = headerResults.map(headerRow => {
            return new Promise((resolveDestination, rejectDestination) => {
              const { vch_no, jobber_id, jobber_name, actual_qty } = headerRow;

              if (isCutting) {
                const cuttingQuery = `
                  SELECT cutting_charges
                  FROM ${destination}
                  WHERE vch_no = ?
                `;

                pool.query(cuttingQuery, [vch_no], (cuttingError, cuttingResults) => {
                  if (cuttingError) {
                    console.error(`Error fetching from ${destination}:`, cuttingError);
                    return rejectDestination(cuttingError);
                  }

                  cuttingResults.forEach(cuttingRow => {
                    const { cutting_charges } = cuttingRow;
                    const total_jw_rate = cutting_charges;

                    results.push({
                      table: header,
                      vch_no,
                      jobber_id,
                      jobber_name,
                      total_jw_rate,
                      types: null
                    });
                  });

                  resolveDestination();
                });
              } else {
                const destinationQuery = `
                  SELECT jw_rate, type, design_no
                  FROM ${destination}
                  WHERE vch_no = ? AND design_no = ?
                `;

                pool.query(destinationQuery, [vch_no, designNo], (destinationError, destinationResults) => {
                  if (destinationError) {
                    console.error(`Error fetching from ${destination}:`, destinationError);
                    return rejectDestination(destinationError);
                  }

                  destinationResults.forEach(destinationRow => {
                    const { jw_rate, type, design_no } = destinationRow;

                    results.push({
                      table: header,
                      vch_no,
                      jobber_id,
                      jobber_name,
                      total_jw_rate: jw_rate,
                      types: type,
                      design_no
                    });
                  });

                  resolveDestination();
                });
              }
            });
          });

          Promise.all(destinationQueries)
            .then(() => resolve())
            .catch(err => reject(err));
        } else {
          resolve();
        }
      });
    });
  });

  const estimatedCSJWDetailQuery = new Promise((resolve, reject) => {
    const query = `
      SELECT vch_no, jobber_id, jobber_name, amt
      FROM Estimated_CS_JW_Detail
      WHERE vch_no = ? AND jobwork_name LIKE ?
    `;
// Define the wildcard pattern for 'iron'
const jobworkNamePattern = '%iron%';

pool.query(query, [vchNo, jobworkNamePattern], (error, resultsFromEstimated) => {
      if (error) {
        console.error("Error fetching from Estimated_CS_JW_Detail:", error);
        return reject(error);
      }

      resultsFromEstimated.forEach(row => {
        const { vch_no, jobber_id, jobber_name, amt } = row;

       
        results.push({
          table: 'iron_details',
          vch_no,
          jobber_id,
          jobber_name,
          total_jw_rate: amt,
          types: 'NA',
          design_no: designNo
        });
      });

      resolve();
    });
  });

  Promise.all([...headerQueries, estimatedCSJWDetailQuery])
    .then(() => {
      res.json(results);
    })
    .catch(err => {
      console.error("Error processing queries:", err);
      res.status(500).json({ error: "Internal Server Error" });
    });
});

module.exports = router;
