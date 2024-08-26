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
  const { jobberName } = req.body;
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting database connection:", err);
      res.status(500).send("Error fetching data");
      return;
    }

    // Query to fetch data from emb_iss_header
    const embIssSourceQuery = `
      SELECT design_no, lot_no, vch_no, design_id
      FROM washing_iss_header
      WHERE jobber_name = ? AND is_delete != 1
    `;

    connection.query(embIssSourceQuery, [jobberName], (err, embIssSourceResults) => {
      if (err) {
        console.error("Error executing emb_iss_source query:", err);
        connection.release();
        res.status(500).send("Error fetching data");
        return;
      }

      if (embIssSourceResults.length === 0) {
        // If no data found, send an empty array as the response
        connection.release();
        res.json([]);
      } else {
        // Get all design_no values from embIssSourceResults
        const designNos = embIssSourceResults.map(result => result.design_no);

        // Query to check for matching design_no in emb_rec_header
        const checkDesignNoQuery = `
          SELECT design_no
          FROM washing_rec_header
          WHERE design_no IN (?) AND jobber_name = ? AND is_delete != 1
        `;

        connection.query(checkDesignNoQuery, [designNos, jobberName], (err, checkResults) => {
          if (err) {
            console.error("Error executing checkDesignNoQuery:", err);
            connection.release();
            res.status(500).send("Error fetching data");
            return;
          }

          // Create a set of design_no values that exist in emb_rec_header
          const existingDesignNos = new Set(checkResults.map(result => result.design_no));

          // Add is_done key to each embIssSourceResult object
          const updatedResults = embIssSourceResults.map(result => ({
            ...result,
            is_done: existingDesignNos.has(result.design_no) ? 0 : 0
          }));

          // Release the connection and send the updated results
          connection.release();
          console.log('res', updatedResults)
          res.json(updatedResults);
        });
      }
    });
  });
});
  

module.exports = router;
