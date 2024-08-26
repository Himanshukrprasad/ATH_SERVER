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

    const sql = `
      SELECT h.*, 
             j.jobwork_name, 
             j.amt, 
             j.is_other_charge,
             j.type,
             j.jobber_name,
             j.jobber_id
      FROM Estimated_CS_header h 
      LEFT JOIN Estimated_CS_JW_Detail j 
        ON h.vch_no = j.vch_no 
      WHERE h.vch_no IN (
          SELECT vch_no 
          FROM Estimated_CS_JW_Detail 
          WHERE jobber_name = ?
      )
      AND (LOWER(j.jobwork_name) LIKE '%cutting%' 
           OR LOWER(j.jobwork_name) = 'freight cost' 
           OR LOWER(j.jobwork_name) = 'freight cost two' 
           OR LOWER(j.jobwork_name) = 'other cost');
    `;

    connection.query(sql, [jobberName], (err, results) => {
      if (err) {
        connection.release();
        console.error("Error executing query:", err);
        res.status(500).send("Error fetching data");
        return;
      }

      const groupedResults = results.reduce((acc, curr) => {
        const {
          jobwork_name,
          amt,
          is_other_charge,
          type,
          jobber_name,
          jobber_id,
          ...rest
        } = curr;

        if (!acc[curr.vch_no]) {
          acc[curr.vch_no] = {
            ...rest,
            jobwork_details: [],
            jobber_bill_done: 1 // Initialize jobber_bill_done to 0
          };
        }

        if (jobwork_name) {
          acc[curr.vch_no].jobwork_details.push({
            jobwork_name,
            amt,
            is_other_charge,
            type,
            jobber_name,
            jobber_id,
          });
        }

        return acc;
      }, {});

      const vchNos = Object.keys(groupedResults);

      if (vchNos.length === 0) {
        res.json(Object.values(groupedResults));
      } else {
        const fetchJobWorkDoneQuery = `
          SELECT estimate_cs_vch_no, jobwork_bill_made 
          FROM cutting_component 
          WHERE estimate_cs_vch_no IN (?) AND is_delete = 0
        `;
        
        connection.query(fetchJobWorkDoneQuery, [vchNos], (err, rows) => {
          if (err) {
            connection.release();
            console.error("Error fetching job work done:", err);
            res.status(500).send("Error fetching data");
            return;
          }

          rows.forEach(row => {
            const { estimate_cs_vch_no, jobwork_bill_made } = row;
            if (groupedResults[estimate_cs_vch_no]) {
              groupedResults[estimate_cs_vch_no].job_work_done = jobwork_bill_made;
            }
          });

          // Fetch vch_no from purchase_bill_header where party_name matches jobberName
          const fetchVchNoQuery = `
            SELECT vch_no 
            FROM purchase_bill_header 
            WHERE party_name = ? AND is_delete = 0
          `;

          connection.query(fetchVchNoQuery, [jobberName], (vchNoError, vchNoResults) => {
            if (vchNoError) {
              connection.release();
              console.error("Error fetching vch_no:", vchNoError);
              res.status(500).send("Error fetching vch_no");
              return;
            }

            const purchaseVchNos = vchNoResults.map(row => row.vch_no);

            if (purchaseVchNos.length === 0) {
              connection.release();
              return res.json(Object.values(groupedResults));
            }

            // Fetch design_no from purchase_bill_detail where vch_no is in purchaseVchNos
            const fetchDesignNoQuery = `
              SELECT vch_no, design_no 
              FROM purchase_bill_detail 
              WHERE vch_no IN (?)
            `;

            connection.query(fetchDesignNoQuery, [purchaseVchNos], (designNoError, designNoResults) => {
              connection.release();

              if (designNoError) {
                console.error("Error fetching design_no:", designNoError);
                res.status(500).send("Error fetching design_no");
                return;
              }

              const designNoMap = designNoResults.reduce((acc, row) => {
                acc[row.design_no] = true;
                return acc;
              }, {});

              // Update jobber_bill_done to 1 where design_no matches
              Object.values(groupedResults).forEach(result => {
                if (designNoMap[result.design_no]) {
                  result.jobber_bill_done = 0;
                }
              });

              console.log('Final groupedResults:', groupedResults);
              res.json(Object.values(groupedResults));
            });
          });
        });
      }
    });
  });
});


module.exports = router;
