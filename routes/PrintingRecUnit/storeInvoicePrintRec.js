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
    const { printingRecContextUnitData, authKeyValue } = req.body;
    let embRecNoText = `PR/R/U${printingRecContextUnitData.embRecUnitData[0].embRecUnitVal}/${printingRecContextUnitData.lastEmbRecNo}/${printingRecContextUnitData.financialYear}`;
    let unitNO = `PRINTING REC-${printingRecContextUnitData.embRecUnitData[0].embRecUnitVal}`;
    
    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      //Fetch the last master_id value
      const getLastMasterIdheaderQuery =
        "SELECT master_id FROM printing_rec_header ORDER BY master_id DESC LIMIT 1";
      const [lastMasterIdheaderResult] = await connection.query(
        getLastMasterIdheaderQuery
      );
      const lastMasterIdheader = lastMasterIdheaderResult[0]?.master_id || 0;

      

      const getLastMasterIddestinationQuery =
        "SELECT master_id FROM printing_rec_destination ORDER BY master_id DESC LIMIT 1";
      const [lastMasterIddestinationResult] = await connection.query(
        getLastMasterIddestinationQuery
      );
      const lastMasterIddestination =
        lastMasterIddestinationResult[0]?.master_id || 0;

      const getLastMasterIdsourceQuery =
        "SELECT master_id FROM printing_rec_source ORDER BY master_id DESC LIMIT 1";
      const [lastMasterIdsourceResult] = await connection.query(
        getLastMasterIdsourceQuery
      );
      const lastMasterIdsource = lastMasterIdsourceResult[0]?.master_id || 0;


      const getLastalterIdheaderQuery =
        "SELECT alter_id FROM printing_rec_header ORDER BY master_id DESC LIMIT 1";
      const [lastalterIdheaderResult] = await connection.query(
        getLastalterIdheaderQuery
      );
      const lastalterIdheader = lastalterIdheaderResult[0]?.alter_id || 0;


      const getLastalterIdDestinationQuery =
        "SELECT alter_id FROM printing_rec_destination ORDER BY master_id DESC LIMIT 1";
      const [lastalterIdDestinationResult] = await connection.query(
        getLastalterIdDestinationQuery
      );
      const lastalterIdDestination =
        lastalterIdDestinationResult[0]?.alter_id || 0;

      const getLastalterIdSourceQuery =
        "SELECT alter_id FROM printing_rec_source ORDER BY master_id DESC LIMIT 1";
      const [lastalterIdSourceResult] = await connection.query(
        getLastalterIdSourceQuery
      );
      const lastalterIdSource = lastalterIdSourceResult[0]?.alter_id || 0;

      // Insert header data
      const insertHeaderQuery =
        "INSERT INTO printing_rec_header (master_id, alter_id, vch_no, vch_date, jobber_id, jobber_name, design_no,design_id, unit_no, narration, is_designNo_recived,estimate_cs_vch_no) VALUES (?,?,?, ?,?, ?, ?, ?, ?, ?, ?, ?)";
     
      await connection.query(insertHeaderQuery, [
        lastMasterIdheader + 1 || 0,
        lastalterIdheader + 1 || 0,
        embRecNoText || "NA",
        printingRecContextUnitData.originalDate || "NA",
        printingRecContextUnitData.jobberAddress.jobber_id || 'NA',
        printingRecContextUnitData.embRecUnitData[0].jobberName || 'NA',
        (Array.isArray(printingRecContextUnitData.designNoVal) ? printingRecContextUnitData.designNoVal.join(',') : 'NA'),
       
        (Array.isArray(printingRecContextUnitData.designIdVal) ? printingRecContextUnitData.designIdVal.join(',') : 'NA'),
        unitNO || 'NA',
        printingRecContextUnitData.embRecUnitData[0].narration || 'NA',
        printingRecContextUnitData.embRecUnitData[0].jobWorkStatus || 'NA',
        printingRecContextUnitData.esVchNoVal || 'NA'
      ]);

      
      // Insert destination data
      const insertDestinationQuery =
        "INSERT INTO printing_rec_source(master_id, alter_id, vch_no, vch_date, item_name, design_no,design_id, godown, size,lot_no,quantity,rate, amt) VALUES (?,?, ?,?, ?, ?, ?,?, ?, ?,?,?,?)";
      if (
        printingRecContextUnitData.destinationTableData &&
        printingRecContextUnitData.destinationTableData.length
      ) {
        for (let i = 0; i < printingRecContextUnitData.destinationTableData.length; i++) {
          await connection.query(insertDestinationQuery, [
            // lastMasterIddestination + 1 + i || 0,
            lastMasterIdheader + 1 || 0,
            lastalterIdDestination + 1 + i || 0,
            embRecNoText || 'NA',
           printingRecContextUnitData.originalDate,
            printingRecContextUnitData.destinationTableData[i].itemName || 'NA',
            printingRecContextUnitData.destinationTableData[i].designNo || 'NA',
            printingRecContextUnitData.destinationTableData[i].designId || 'NA',
            printingRecContextUnitData.destinationTableData[i].godown || 'NA',
            printingRecContextUnitData.destinationTableData[i].size || 'NA',
            printingRecContextUnitData.destinationTableData[i].lotNo || 'NA',
            printingRecContextUnitData.destinationTableData[i].qty || 0,
            printingRecContextUnitData.destinationTableData[i].rate || 0,
            printingRecContextUnitData.destinationTableData[i].rate * printingRecContextUnitData.destinationTableData[i].qty || 0,
          ]);
        }
      } else {
        console.error("Data is undefined or has an invalid length");
      }

      // Insert source data
      const insertSourceQuery =
        "INSERT INTO printing_rec_destination  (master_id, alter_id, vch_no, vch_date, item_name, design_no,design_id, godown,type, size,lot_no,quantity,rate, amt,jw_rate, jw_amt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        if (
          printingRecContextUnitData.sourceTableData &&
          printingRecContextUnitData.sourceTableData.length
        ) {
          for (let i = 0; i < printingRecContextUnitData.sourceTableData.length; i++) {
            await connection.query(insertSourceQuery, [
              // lastMasterIdsource + 1 + i || 0,
              lastMasterIdheader + 1 || 0,
              lastalterIdSource + 1 + i || 0,
              embRecNoText || 'NA',
             printingRecContextUnitData.originalDate,
             printingRecContextUnitData.sourceTableData[i].itemName || 'NA',
               printingRecContextUnitData.sourceTableData[i].designNo || 'NA',
               printingRecContextUnitData.sourceTableData[i].designId || 'NA',
               printingRecContextUnitData.sourceTableData[i].godown || 'NA',
               printingRecContextUnitData.sourceTableData[i].type || 'NA',
               printingRecContextUnitData.sourceTableData[i].size || 'NA',
               printingRecContextUnitData.sourceTableData[i].lotNo || 'NA',
               printingRecContextUnitData.sourceTableData[i].qty || 0,
               printingRecContextUnitData.sourceTableData[i].rate +   printingRecContextUnitData.sourceTableData[i].jwRate || 0,
              (printingRecContextUnitData.sourceTableData[i].rate +   printingRecContextUnitData.sourceTableData[i].jwRate) *  printingRecContextUnitData.sourceTableData[i].qty || 0,
               printingRecContextUnitData.sourceTableData[i].jwRate || 0,
               printingRecContextUnitData.sourceTableData[i].jwRate *  printingRecContextUnitData.sourceTableData[i].qty || 0


  
            ]);
          }
        } else {
          console.error("Data is undefined or has an invalid length");
        }

        const insertLog_tb =
        "INSERT INTO log_tb (issue_date_time, item_name, design_no, design_id, process_name, type, user_id, user_name) VALUES (?,?,?,?,?,?,?,?)";
      if (
        printingRecContextUnitData.sourceTableData &&
        printingRecContextUnitData.sourceTableData.length
      ) {
        for (let i = 0; i < printingRecContextUnitData.sourceTableData.length; i++) {
          await connection.query(insertLog_tb, [
            
            printingRecContextUnitData.originalDate,
            printingRecContextUnitData.sourceTableData[i].itemName || 'NA',
            printingRecContextUnitData.sourceTableData[i].designNo || 'NA',
            printingRecContextUnitData.sourceTableData[i].designId || 'NA',
            "PRT REC",
            printingRecContextUnitData.sourceTableData[i].type || 'NA',
            authKeyValue.user_id || 'NA',
            authKeyValue.username || 'NA',
          ]);
        }
      } else {
        console.error("Data is undefined or has an invalid length");
      }

        const updateSplitngHeaderQuery = `
        UPDATE printing_iss_source 
        SET is_rec = 1
        WHERE design_no = ? AND type = ?
        `;


      if (printingRecContextUnitData.sourceTableData && printingRecContextUnitData.sourceTableData.length) {
        for (let i = 0; i < printingRecContextUnitData.sourceTableData.length; i++) {
          const { designNo, type } = printingRecContextUnitData.sourceTableData[i];

          console.log('Processing designNo:', designNo, 'type:', type);

          for (let j = 0; j < printingRecContextUnitData.sourceTableData.length; j++) {

            const designNoVal = printingRecContextUnitData.sourceTableData[j].designNo;

            console.log('Updating designNoVal:', designNoVal, 'with type:', type);

            await connection.query(updateSplitngHeaderQuery, [
              designNo,
              type
            ]);
          }
        }
      } else {
        console.error("sourceTableData is undefined or has an invalid length");
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
