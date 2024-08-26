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
   const {designNoData} = req.body;
  
   const {originalDate,cuttingUnitNo,cuttingUnitVal, temChalanNo,temVchNo, financialYear} = req.body.cuttingUnitData;
   const {jobberName,jobberId,godown,unitNo,cuttingCharge, estimatedQty, actualQty, lotNo, estimated_vch_no, size, otherCost,otherCostType, freightCostType, freightCost,freightCostTwoType, freightCostTwo} = req.body.manufactureCalData;
   const { consumptionUnitData } = req.body;
   const {jobWork, naration} = req.body.narationData
   const {allocationToPri, cuttingCharges, effectiveCost, effectiveRate, freightCharges, totalAdlCost,componentCost} = req.body.billingUnitData;
   const {designNo} = req.body.manufactureCalData;

    // Step 1: Retrieve vch_no and master_id
    const [headerRows] = await connection.query(
      "SELECT vch_no, estimate_cs_vch_no, master_id , jobber_id FROM cutting_header WHERE design_no = ?",
      [designNo]
    );
    if (headerRows.length === 0) {
      res.status(404).send('Design number not found');
      return;
    }
    const { vch_no, master_id , estimate_cs_vch_no, jobber_id} = headerRows[0];

    let cuttingVchNo =  `C/U${cuttingUnitNo || 1}/${temVchNo}/${financialYear}`


    // Step 2: Delete rows from Estimated_CS_Item_Detail
    await connection.query(
      "DELETE FROM cutting_item_detail WHERE vch_no = ?",
      [vch_no]
    );


    // Step 3: Update Estimated_CS_header
    const sqlUpdate = `
      UPDATE cutting_header
      SET vch_no = ? , vch_date = ? , unit_no = ?, jobber_id = ? ,actual_qty = ?, lot_no = ?, freight_one_val = ? , freight_two_val = ? , godown = ? , narration = ? 
      WHERE design_no = ?
    `;
    const updateValues = [
      cuttingVchNo,
      originalDate,
      cuttingUnitVal,
      jobber_id,
      actualQty,
      lotNo,
      freightCost || 0,
      freightCostTwo,
      godown,
      naration,
      designNo
    ];
    await connection.query(sqlUpdate, updateValues);


    // Step 3: Update Estimated_CS_header
    const sqlUpdateItem = `
      UPDATE cutting_component
      SET vch_no = ? , vch_date = ? , cost_of_components = ? , freight_on_purchse = ? , additnal_cost_val = ? , total_additnal_cost = ? , effective_cost = ? , rate_per_item = ? , jobwork_bill_made = ? 
      WHERE vch_no = ?
    `;
    const updateValuesItem = [
      cuttingVchNo,
      originalDate,
      componentCost, 
      freightCost + freightCostTwo,
      totalAdlCost,
      totalAdlCost,
      effectiveCost,
      effectiveRate,
      jobWork,
      vch_no,
    ];
    await connection.query(sqlUpdateItem, updateValuesItem);

    

    const insertRowItem = "INSERT INTO cutting_item_detail (master_id, alter_id, vch_no, estimate_cs_vch_no, vch_date,item_id,item_name, godown, type, size, lot_no, tolerance, item_qty, qty, rate,uom, amt) VALUES (?,?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    if (consumptionUnitData && consumptionUnitData.length) { 
        for (let i = 0; i < consumptionUnitData.length; i++) {
            await connection.query(insertRowItem, [ 
                master_id || 0,
                1,
                cuttingVchNo,
                estimate_cs_vch_no || 'N/A',
                originalDate || "N/A",
                consumptionUnitData[i].item_id || 'N/A',
                consumptionUnitData[i].raw_material || 'N/A',
                consumptionUnitData[i].godown || "N/A",
                consumptionUnitData[i].type || "N/A",
                consumptionUnitData[i].width || 'N/A',
                lotNo || "N/A",
                consumptionUnitData[i].tolorance || 'N/A',
                (consumptionUnitData[i].Quantity / actualQty) || 'N/A',
                (consumptionUnitData[i].Quantity) || 'N/A',
                consumptionUnitData[i].rate|| 'N/A',
                consumptionUnitData[i].item_unit || 'N/A',
                (consumptionUnitData[i].Quantity * consumptionUnitData[i].rate) || 'N/A',     
            ]);
        }
    } else {
        console.error("consumptionUnitData is undefined or has an invalid length");
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
