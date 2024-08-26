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
  try {
    const { jobberBillContextUnitData } = req.body;


// Extract the design_id values
const designIds = jobberBillContextUnitData.jobberBillTableData.map(item => item.design_id);
const designNos = jobberBillContextUnitData.jobberBillTableData.map(item => item.design_no);
const processVchNos = jobberBillContextUnitData.jobberBillTableData.map(item => item.vch_no);
const vchText = `${jobberBillContextUnitData.lastVchNo}/${jobberBillContextUnitData.financialYear}`

console.log('vchTezt', vchText)
// Convert the array to a JSON string
const designIdsJson = JSON.stringify(designIds);
const designNosJson = JSON.stringify(designNos);
const processVchNosJson = JSON.stringify(processVchNos);

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      //Fetch the last master_id value
      const getLastMasterIdheaderQuery =
        "SELECT master_id FROM purchase_bill_header ORDER BY master_id DESC LIMIT 1";
      const [lastMasterIdheaderResult] = await connection.query(
        getLastMasterIdheaderQuery
      );
      const lastMasterIdheader = lastMasterIdheaderResult[0]?.master_id || 0;

      

      const getLastMasterIddetailQuery =
        "SELECT master_id FROM purchase_bill_detail ORDER BY master_id DESC LIMIT 1";
      const [lastMasterIddetailResult] = await connection.query(
        getLastMasterIddetailQuery
      );
      const lastMasterIddestination =
        lastMasterIddetailResult[0]?.master_id || 0;

      const getLastMasterIdtaxDetailQuery =
        "SELECT master_id FROM purchase_bill_tax_detail ORDER BY master_id DESC LIMIT 1";
      const [lastMasterIdtaxDetailResult] = await connection.query(
        getLastMasterIdtaxDetailQuery
      );
      const lastMasterIdtaxDetail = lastMasterIdtaxDetailResult[0]?.master_id || 0;




      // Insert header data
      const insertHeaderQuery =
        "INSERT INTO purchase_bill_header ( master_id, vch_no, vch_date, ref_date, sup_inv_no, party_id, party_name,bill_total, narration, tally_posted, is_altered, is_payment_done, is_approved ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)";
     
      await connection.query(insertHeaderQuery, [
        lastMasterIdheader + 1 || 0,
        vchText || "NA",
        jobberBillContextUnitData.originalDate || "NA",
        jobberBillContextUnitData.refDate || "NA",
        jobberBillContextUnitData.invoiceNo || 'NA',
        jobberBillContextUnitData.jobberIdVal || 'NA',
        jobberBillContextUnitData.jobberBillData[0].PartyAcName || 'NA',
        (Number(jobberBillContextUnitData.jobWorkAmt) + Number(jobberBillContextUnitData.totalTaxAmt)).toFixed(2) || 'NA',
        jobberBillContextUnitData.narration || 'NA',
        0,0,0,1
      ]);


      
      // Insert bill detail data
      const insertDetailQuery =
        "INSERT INTO purchase_bill_detail(master_id, vch_no, process_vch_no, design_no, design_id, jw_amt) VALUES (?,?,?,?,?,?)";
      if (
        jobberBillContextUnitData.jobberBillTableData &&
        jobberBillContextUnitData.jobberBillTableData.length
      ) {
        for (let i = 0; i < jobberBillContextUnitData.jobberBillTableData.length; i++) {
          await connection.query(insertDetailQuery, [
            // lastMasterIdheader + 1  || 0,
            lastMasterIdheader + 1 || 0,
            vchText || "NA",
            jobberBillContextUnitData.jobberBillTableData[i].vch_no || 'NA',
            jobberBillContextUnitData.jobberBillTableData[i].destination_design_no || 'NA',
            jobberBillContextUnitData.jobberBillTableData[i].design_id || 'NA',
            Number(jobberBillContextUnitData.jobberBillTableData[i].jw_amt).toFixed(2) || 'NA',
          ]);
        }
      } else {
        console.error("Data is undefined or has an invalid length");
      }



      const insertTaxDetailQuery = `
      INSERT INTO purchase_bill_tax_detail(
        master_id, vch_no, ledger_id, ledger_name, ledger_amt, tax_percent
      ) VALUES (?,?,?,?,?,?)
    `;
    
    if (jobberBillContextUnitData.taxTableData && jobberBillContextUnitData.taxTableData.length) {
      // Insert the first row with specific values
      await connection.query(insertTaxDetailQuery, [
        // lastMasterIdheader + 1 || 0,
        lastMasterIdheader + 1 || 0,
        vchText || "NA",
        jobberBillContextUnitData.jobWorkId || 'NA',
        jobberBillContextUnitData.jobWorkVal || "NA",
        jobberBillContextUnitData.jobWorkAmt || "NA",

        jobberBillContextUnitData.jobWorkTax || 0, // tax_percent
      ]);
    
      // Insert the subsequent rows with values from taxTableData
      for (let i = 0; i < jobberBillContextUnitData.taxTableData.length; i++) {
        const item = jobberBillContextUnitData.taxTableData[i];
    
        // Determine the tax_percent based on the presence of 'cgst', 'sgst', 'igst'
        let taxPercent = 0;
        if (item.val.toLowerCase().includes("cgst") || item.val.toLowerCase().includes("sgst")) {
          taxPercent = item.tax_prcnt / 2;
        } else if (item.val.toLowerCase().includes("igst")) {
          taxPercent = item.tax_prcnt;
        }
    
        await connection.query(insertTaxDetailQuery, [
          lastMasterIdheader + 1 || 0,
          vchText || "NA",
          item.led_id || 'NA',
          item.val || 'NA',
          Number(item.amt).toFixed(2) || 'NA',

         //  item.led_id || 'NA',
          // item.val || 'NA',
          //Number(item.amt).toFixed(2) || 'NA',
          taxPercent || 0,
        ]);
      }
    } else {
      console.error("Data is undefined or has an invalid length");
    }
    
    
      // Commit transaction
      await connection.commit();

      // Release connection
      connection.release();

      res.status(200).send("Data stored successfully");
    } catch (error) {
      // Rollback transaction in case of error
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Error storing data:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

module.exports = router;
