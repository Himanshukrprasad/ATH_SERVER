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

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting database connection:", err);
      res.status(500).send("Error fetching data");
      return;
    }

    // Query to fetch type and vch_no from Estimated_CS_JW_Detail
    const jwDetailQuery = `
      SELECT type, vch_no
      FROM Estimated_CS_JW_Detail
      WHERE jobber_name = 'N/A'
        AND jobwork_name LIKE ?
        AND is_other_charge = 0
    `;

    connection.query(jwDetailQuery, [`%${process}%`], (error, jwDetailResults) => {
      if (error) {
        connection.release();
        console.error("Error executing JW Detail query:", error);
        res.status(500).send("Error fetching data");
        return;
      }

      let completedQueries = 0;
      const totalQueries = jwDetailResults.length;
     

      if (totalQueries === 0) {
        connection.release();
        res.json([]);
        return;
      }

      // Loop through the results to fetch design_no for each vch_no
      jwDetailResults.forEach((row, index) => {
        const headerQuery = `
          SELECT design_no
          FROM Estimated_CS_header
          WHERE vch_no = ?
        `;

        connection.query(headerQuery, [row.vch_no], (headerError, headerResults) => {
          if (headerError) {
            console.error("Error executing header query:", headerError);
            return;
          }

          // Add design_no to the result row
          if (headerResults.length > 0) {
            jwDetailResults[index].design_no = headerResults[0].design_no;
          } else {
            jwDetailResults[index].design_no = null; // or any default value
          }

          completedQueries++;
          if (completedQueries === totalQueries) {
            // Release the connection after all queries are executed
            connection.release();
            // Send the fetched data back to the frontend
            res.json(jwDetailResults);
        
          }
        });
      });
    });
  });
});


module.exports = router;
