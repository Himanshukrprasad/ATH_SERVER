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

// router.post("/", (req, res) => {
//   const { vchNo } = req.body;

//   console.log('called', vchNo)

//   pool.getConnection((err, connection) => {
//     if (err) {
//       console.error("Error getting database connection:", err);
//       res.status(500).send("Error fetching data");
//       return;
//     }

//     // Query to fetch design_no for the list of vch_no values
//     const cuttingHeaderQuery = `
//       SELECT design_no, vch_no, design_id
//       FROM Estimated_CS_header
//       WHERE vch_no IN (?)
//     `;

//     // Execute the SQL query
//     connection.query(cuttingHeaderQuery, [vchNo], (error, results) => {
//       if (error) {
//         connection.release();
//         console.error("Error executing query:", error);
//         res.status(500).send("Error fetching data");
//         return;
//       }

//       let completedQueries = 0;
//       const totalQueries = results.length;

//       // Loop through the results to update 'is_done' based on 'lot_no' values
//       results.forEach((row, index) => {
//         const lotNoQuery = `
//           SELECT lot_no
//           FROM stitching_iss_header
//           WHERE estimate_cs_vch_no = ?
//         `;

//         connection.query(lotNoQuery, [row.vch_no], (lotError, lotResults) => {
//           if (lotError) {
//             console.error("Error executing lot_no query:", lotError);
//             return;
//           }

          

//           if (lotResults.length === 0) {
//             // No lot_no found, set is_done to 0
//             results[index].is_done = 0;
//             completedQueries++;
//             if (completedQueries === totalQueries) {
//               // Release the connection after all queries are executed
//               connection.release();
//               // Send the fetched data back to the frontend
//               res.json(results);
//             }
//           } else {
//             // Check if the lot_no exists in spliting_source table
//             const lotNo = lotResults[0].lot_no;
//             const splitingSourceQuery = `
//               SELECT COUNT(*) AS count
//               FROM stitching_rec_source
//               WHERE lot_no = ?
//             `;
//             connection.query(splitingSourceQuery, [lotNo], (sourceError, sourceResults) => {
//               if (sourceError) {
//                 console.error("Error executing spliting_source query:", sourceError);
//                 return;
//               }
//               // Set is_done based on the result
//               results[index].is_done = sourceResults[0].count > 0 ? 1 : 0;
//               completedQueries++;
//               if (completedQueries === totalQueries) {
//                 // Release the connection after all queries are executed
//                 connection.release();
//                 // Send the fetched data back to the frontend
//                 res.json(results);
                
//               }
//             });
//           }
//         });
//       });
//     });
//   });
// });

router.post("/", async (req, res) => {
  const { jobberName } = req.body;

  try {
    // Fetch vch_no from Estimated_CS_JW_Detail where jobber_name equals jobberName
    const jwDetailQuery = `
      SELECT vch_no
      FROM Estimated_CS_JW_Detail
      WHERE jobber_name = ?
    `;
    const [jwDetailResults] = await pool.query(jwDetailQuery, [jobberName]);

    if (jwDetailResults.length === 0) {
      return res.status(404).json({ message: "No matching records found" });
    }

    // Extract vch_no values
    const vchNos = jwDetailResults.map(row => row.vch_no);

    // Fetch design_id, vch_no, and design_no from Estimated_CS_header where vch_no is in the fetched vch_no array
    const headerQuery = `
      SELECT design_id, vch_no, design_no
      FROM Estimated_CS_header
      WHERE vch_no IN (?)
    `;
    const [headerResults] = await pool.query(headerQuery, [vchNos]);

    // Send the results back to the client
    res.json(headerResults);

  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


module.exports = router;
