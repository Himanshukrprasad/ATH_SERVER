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
  
    if (!jobberName) {
      res.status(400).send("jobberName is required");
      return;
    }
  
    pool.getConnection((err, connection) => {
      if (err) {
        console.error("Error getting database connection:", err);
        res.status(500).send("Error connecting to the database");
        return;
      }
  
      const fetchDataQuery = `
        WITH JobberCTE AS (
            SELECT ? AS jobber_name
        )
        SELECT 
            'emb_rec_header' AS table_name, 
            hdr.design_no, 
            hdr.design_id,
            hdr.vch_no,
            dst.jw_amt,
            hdr.estimate_cs_vch_no
        FROM 
            emb_rec_header hdr
        JOIN 
            emb_rec_destination dst ON hdr.vch_no = dst.vch_no
        WHERE 
            hdr.jobber_name = (SELECT jobber_name FROM JobberCTE)
        UNION ALL
        SELECT 
            'fus_rec_header' AS table_name, 
            hdr.design_no, 
            hdr.design_id,
            hdr.vch_no,
            dst.jw_amt,
            hdr.estimate_cs_vch_no
        FROM 
            fus_rec_header hdr
        JOIN 
            fus_rec_destination dst ON hdr.vch_no = dst.vch_no
        WHERE 
            hdr.jobber_name = (SELECT jobber_name FROM JobberCTE)
        UNION ALL
        SELECT 
            'handwork_rec_header' AS table_name, 
            hdr.design_no, 
             hdr.design_id,
            hdr.vch_no,
            src.jw_amt,
            hdr.estimate_cs_vch_no
        FROM 
            handwork_rec_header hdr
        JOIN 
            handwork_rec_source src ON hdr.vch_no = src.vch_no
        WHERE 
            hdr.jobber_name = (SELECT jobber_name FROM JobberCTE)
        UNION ALL
        SELECT 
            'washing_rec_header' AS table_name, 
            hdr.design_no, 
             hdr.design_id,
            hdr.vch_no,
            dst.jw_amt,
            hdr.estimate_cs_vch_no
        FROM 
            washing_rec_header hdr
        JOIN 
            washing_rec_destination dst ON hdr.vch_no = dst.vch_no
        WHERE 
            hdr.jobber_name = (SELECT jobber_name FROM JobberCTE)
        UNION ALL
        SELECT 
            'Refinishing_rec_header' AS table_name, 
            hdr.design_no, 
             hdr.design_id,
            hdr.vch_no,
            dst.jw_amt,
            hdr.estimate_cs_vch_no
        FROM 
            Refinishing_rec_header hdr
        JOIN 
            Refinishing_rec_destination dst ON hdr.vch_no = dst.vch_no
        WHERE 
            hdr.jobber_name = (SELECT jobber_name FROM JobberCTE)
        UNION ALL
        SELECT 
            'printing_rec_header' AS table_name, 
            hdr.design_no, 
             hdr.design_id,
            hdr.vch_no,
            dst.jw_amt,
            hdr.estimate_cs_vch_no
        FROM 
            printing_rec_header hdr
        JOIN 
            printing_rec_destination dst ON hdr.vch_no = dst.vch_no
        WHERE 
            hdr.jobber_name = (SELECT jobber_name FROM JobberCTE)
        UNION ALL
        SELECT 
            'pleating_rec_header' AS table_name, 
            hdr.design_no, 
             hdr.design_id,
            hdr.vch_no,
            dst.jw_amt,
            hdr.estimate_cs_vch_no
        FROM 
            pleating_rec_header hdr
        JOIN 
            pleating_rec_destination dst ON hdr.vch_no = dst.vch_no
        WHERE 
            hdr.jobber_name = (SELECT jobber_name FROM JobberCTE)
        UNION ALL
        SELECT 
            'iron_rec_header' AS table_name, 
            hdr.design_no, 
             hdr.design_id,
            hdr.vch_no,
            dst.jw_amt,
            hdr.estimate_cs_vch_no
        FROM 
            iron_rec_header hdr
        JOIN 
            iron_rec_destination dst ON hdr.vch_no = dst.vch_no
        WHERE 
            hdr.jobber_name = (SELECT jobber_name FROM JobberCTE)
        UNION ALL
        SELECT 
            'stitching_rec_header' AS table_name, 
            hdr.design_no,
             hdr.design_id, 
            hdr.vch_no,
            dst.jw_amt,
            hdr.estimate_cs_vch_no
        FROM 
            stitching_rec_header hdr
        JOIN 
            stitching_rec_destination dst ON hdr.vch_no = dst.vch_no
        WHERE 
            hdr.jobber_name = (SELECT jobber_name FROM JobberCTE)
        UNION ALL
        SELECT 
            'smoking_rec_header' AS table_name, 
            hdr.design_no,
             hdr.design_id, 
            hdr.vch_no,
            dst.jw_amt,
            hdr.estimate_cs_vch_no
        FROM 
            smoking_rec_header hdr
        JOIN 
            smoking_rec_destination dst ON hdr.vch_no = dst.vch_no
        WHERE 
            hdr.jobber_name = (SELECT jobber_name FROM JobberCTE)
        UNION ALL
        SELECT 
            'cutting_header' AS table_name, 
            hdr.design_no,
             hdr.design_id, 
            hdr.vch_no,
            itm.amt AS jw_amt,
            hdr.estimate_cs_vch_no
        FROM 
            cutting_header hdr
        JOIN 
            cutting_item_detail itm ON hdr.vch_no = itm.vch_no
        WHERE 
            hdr.jobber_name = (SELECT jobber_name FROM JobberCTE)
      `;
  
      connection.query(fetchDataQuery, [jobberName], (error, results) => {
        if (error) {
          connection.release();
          console.error("Error executing query:", error);
          res.status(500).send("Error fetching data");
          return;
        }
  
        const estimateCsVchNos = results.map(row => row.estimate_cs_vch_no);
  
        if (estimateCsVchNos.length === 0) {
          connection.release();
          res.json(results);
          return;
        }
  
        const fetchJobworkNameQuery = `
        SELECT vch_no, jobwork_name
        FROM Estimated_CS_JW_Detail
        WHERE vch_no IN (?) AND jobber_name = ?
      `;
      
      connection.query(fetchJobworkNameQuery, [estimateCsVchNos, jobberName], (jobworkError, jobworkResults) => {
        if (jobworkError) {
          connection.release();
          console.error("Error fetching jobwork names:", jobworkError);
          res.status(500).send("Error fetching jobwork names");
          return;
        }
      
        const jobworkMap = jobworkResults.reduce((acc, row) => {
          acc[row.vch_no] = row.jobwork_name;
          return acc;
        }, {});
  
        const combinedResults = results.map(row => ({
            vch_no: row.vch_no,
            design_no: row.design_no,
            design_id: row.design_id,
            jw_amt: row.jw_amt,
            jobwork_name: jobworkMap[row.estimate_cs_vch_no] || ''
          }));
        
          connection.release();
          res.json(combinedResults);
         
        });
      });
    });
  });
  






module.exports = router;
