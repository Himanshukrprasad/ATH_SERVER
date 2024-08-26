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
    const { semiFinishedGoodsContextUnitData, authKeyValue } = req.body;
    const designNo = semiFinishedGoodsContextUnitData.designNoVal;

    console.log('sfg design', semiFinishedGoodsContextUnitData)

    // Step 1: Retrieve vch_no and master_id
    const [headerRows] = await connection.query(
      "SELECT vch_no, master_id FROM sfg_header WHERE design_no = ?",
      [designNo]
    );
    if (headerRows.length === 0) {
      res.status(404).send('Design number not found');
      return;
    }
    const { vch_no, master_id } = headerRows[0];

    // Step 2: Delete rows from Estimated_CS_Item_Detail
    await connection.query(
      "DELETE FROM sfg_destination WHERE vch_no = ?",
      [vch_no]
    );

    await connection.query(
        "DELETE FROM sfg_source WHERE vch_no = ?",
        [vch_no]
      );


    // Step 3: Update Estimated_CS_header
    const sqlUpdate = `
      UPDATE sfg_header
      SET vch_date = ?, unit_no = ?, narration = ?  
      WHERE design_no = ?
    `;
    const updateValues = [
        semiFinishedGoodsContextUnitData.originalDate || "NA",
        semiFinishedGoodsContextUnitData.embUnitData[0].embUnitVal || 'NA',
        semiFinishedGoodsContextUnitData.embUnitData[0].narration || 'NA',
        designNo
    ];
    await connection.query(sqlUpdate, updateValues);


  
    const insertDestinationQuery =
        "INSERT INTO sfg_destination (master_id, alter_id, vch_no, vch_date, item_name,  design_id, design_no, godown, size,lot_no,quantity,rate, amt) VALUES (?,?,?, ?,?, ?, ?, ?, ?, ?,?,?,?)";
      if (
        semiFinishedGoodsContextUnitData.destinationTableData2 &&
        semiFinishedGoodsContextUnitData.destinationTableData2.length
      ) {
        for (let i = 0; i < semiFinishedGoodsContextUnitData.destinationTableData2.length; i++) {
          await connection.query(insertDestinationQuery, [
            // lastMasterIddestination + 1 + i || 0,
            master_id,
            0,
            vch_no,
            semiFinishedGoodsContextUnitData.originalDate,
            semiFinishedGoodsContextUnitData.destinationTableData2[i].design_no || 'NA',
            semiFinishedGoodsContextUnitData.destinationTableData2[i].design_id || 'NA',
            semiFinishedGoodsContextUnitData.destinationTableData2[i].design_no || 'NA',
            semiFinishedGoodsContextUnitData.destinationTableData2[i].godownName || 'NA',
            semiFinishedGoodsContextUnitData.destinationTableData2[i].size || 'NA',
            semiFinishedGoodsContextUnitData.destinationTableData2[i].lot_no || 'NA',
            semiFinishedGoodsContextUnitData.destinationTableData2[i].quantity || 0,
            semiFinishedGoodsContextUnitData.destinationTableData2[i].rate || 0,
            semiFinishedGoodsContextUnitData.destinationTableData2[i].rate * semiFinishedGoodsContextUnitData.destinationTableData2[i].quantity || 0,
          ]);
        }
      } else {
        console.error("Data is undefined or has an invalid length");
      }

         // Insert source data
         const insertSourceQuery =
         "INSERT INTO sfg_source  (master_id, alter_id, vch_no, vch_date, item_name, design_no, design_id, godown,size,lot_no,quantity,rate, amt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)";
       if (
         semiFinishedGoodsContextUnitData.sourceTableData &&
         semiFinishedGoodsContextUnitData.sourceTableData.length
       ) {
         for (let i = 0; i < semiFinishedGoodsContextUnitData.sourceTableData.length; i++) {
           await connection.query(insertSourceQuery, [
             // lastMasterIdsource + 1 + i || 0,
             master_id,
             0,
             vch_no,
             semiFinishedGoodsContextUnitData.originalDate,
             semiFinishedGoodsContextUnitData.sourceTableData[i].item_name || 'NA',
             semiFinishedGoodsContextUnitData.sourceTableData[i].design_no || 'NA',
             semiFinishedGoodsContextUnitData.sourceTableData[i].design_id || 'NA',
             semiFinishedGoodsContextUnitData.sourceTableData[i].godown || 'NA',
             semiFinishedGoodsContextUnitData.sourceTableData[i].size || 'NA',
             semiFinishedGoodsContextUnitData.sourceTableData[i].lot_no || 'NA',
             semiFinishedGoodsContextUnitData.sourceTableData[i].quantity || 0,
             semiFinishedGoodsContextUnitData.sourceTableData[i].rate || 0,
             semiFinishedGoodsContextUnitData.sourceTableData[i].rate * semiFinishedGoodsContextUnitData.sourceTableData[i].quantity || 0,
 
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
