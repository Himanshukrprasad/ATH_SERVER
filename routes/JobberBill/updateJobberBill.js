const express = require('express');
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


router.use(express.json());

router.post("/", async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const {  jobberBillContextUnitData, updateVchNo } = req.body;
    
    const vchText = `${jobberBillContextUnitData.lastVchNo}/${jobberBillContextUnitData.financialYear}`
    // Step 1: Retrieve vch_no and master_id
    const [headerRows] = await connection.query(
      "SELECT vch_no, master_id FROM purchase_bill_header WHERE vch_no = ?",
      [updateVchNo]
    );
    if (headerRows.length === 0) {
      res.status(404).send('Design number not found');
      return;
    }
    const { vch_no, master_id } = headerRows[0];

    // Step 2: Delete rows from Estimated_CS_Item_Detail
    await connection.query(
      "DELETE FROM purchase_bill_detail WHERE vch_no = ?",
      [vch_no]
    );

    await connection.query(
        "DELETE FROM purchase_bill_tax_detail WHERE vch_no = ?",
        [vch_no]
      );


    // Step 3: Update Estimated_CS_header
    const sqlUpdate = `
      UPDATE purchase_bill_header
      SET vch_date = ?, ref_date = ? , sup_inv_no = ? , party_id = ? , party_name = ? , bill_total = ?  , narration = ? ,  tally_posted = ? , is_altered = ?, is_payment_done = ? , is_approved = ? 
      WHERE vch_no = ?
    `;
    const updateValues = [
        jobberBillContextUnitData.originalDate || "NA",
        jobberBillContextUnitData.refDate || "NA",
        jobberBillContextUnitData.invoiceNo || 'NA',
        jobberBillContextUnitData.jobberIdVal || 'NA',
        jobberBillContextUnitData.jobberBillData[0].PartyAcName || 'NA',
        (Number(jobberBillContextUnitData.jobWorkAmt) + Number(jobberBillContextUnitData.totalTaxAmt)).toFixed(2) || 'NA',
        jobberBillContextUnitData.narration || 'NA',
        0,0,0,1,
        vch_no

    ];
    await connection.query(sqlUpdate, updateValues);


  
    const insertDetailQuery =
    "INSERT INTO purchase_bill_detail(master_id, vch_no, process_vch_no, design_no, design_id, jw_amt) VALUES (?,?,?,?,?,?)";
  if (
    jobberBillContextUnitData.jobberBillTableData &&
    jobberBillContextUnitData.jobberBillTableData.length
  ) {
    for (let i = 0; i < jobberBillContextUnitData.jobberBillTableData.length; i++) {
      await connection.query(insertDetailQuery, [
       
        master_id ||  0,
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
    master_id || 0,
    vchText || "NA",
    jobberBillContextUnitData.jobWorkId || 'NA',
    jobberBillContextUnitData.jobWorkVal || "NA",
    jobberBillContextUnitData.jobWorkAmt || "NA",
    jobberBillContextUnitData.jobWorkTax || 0, 
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
      master_id  || 0,
      vchText || "NA",
      item.led_id || 'NA',
      item.val || 'NA',
      Number(item.amt).toFixed(2) || 'NA',

      taxPercent || 0,
    ]);
  }
} else {
  console.error("Data is undefined or has an invalid length");
}




    res.status(200).send('Data updated successfully');
  } catch (error) {
    console.error('Error processing data:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    connection.release();
  }
});

module.exports = router;
