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

router.post("/", async (req, res) => {
  let { jobberName, designNo, process, vchText } = req.body;

  console.log('all data', jobberName, designNo, process, vchText);

  let billDone = 0;

  try {
      // Split designNo string into an array
      const designNoArray = designNo.split(',');

      // Fetch vch_no from purchase_bill_detail table where design_no matches any of the values in the designNoArray and process_vch_no contains vchText
      const [vchResult] = await pool.query(
          `SELECT vch_no 
           FROM purchase_bill_detail 
           WHERE design_no IN (?) 
           AND process_vch_no LIKE ?`,
          [designNoArray, `%${vchText}%`]
      );

      console.log('vch', vchResult);

      if (vchResult.length > 0) {
          const vchNo = vchResult[0].vch_no;

          // Check if ledger_name includes process in purchase_bill_tax_detail table where vch_no === vchNo
          const [taxDetailResult] = await pool.query(
              "SELECT * FROM purchase_bill_tax_detail WHERE vch_no = ? AND ledger_name LIKE ?",
              [vchNo, `%${process}%`]
          );

          if (taxDetailResult.length > 0) {
              // Check if party_name column === jobberName && is_payment_done === 1 in purchase_bill_header table where vch_no === vchNo
              const [headerResult] = await pool.query(
                  "SELECT * FROM purchase_bill_header WHERE vch_no = ? AND party_name = ? AND is_payment_done = 1",
                  [vchNo, jobberName]
              );

              if (headerResult.length > 0) {
                  billDone = 1;
              }
          }
      }
      res.send({ billDone }); // send an object with billDone

  } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Server error");
  }
});


module.exports = router;
