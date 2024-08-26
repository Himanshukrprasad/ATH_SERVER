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
    const { ironingRecContextUnitData, authKeyValue } = req.body;

   
    let embRecNoText = `I/R/U${ironingRecContextUnitData.embRecUnitData[0].embRecUnitVal}/${ironingRecContextUnitData.lastEmbRecNo}/${ironingRecContextUnitData.financialYear}`;
    let unitNO = `IRONING REC-${ironingRecContextUnitData.embRecUnitData[0].embRecUnitVal}`
    
    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      //Fetch the last master_id value
      const getLastMasterIdheaderQuery =
        "SELECT master_id FROM iron_rec_header ORDER BY master_id DESC LIMIT 1";
      const [lastMasterIdheaderResult] = await connection.query(
        getLastMasterIdheaderQuery
      );
      const lastMasterIdheader = lastMasterIdheaderResult[0]?.master_id || 0;

      

      const getLastMasterIddestinationQuery =
        "SELECT master_id FROM iron_rec_destination ORDER BY master_id DESC LIMIT 1";
      const [lastMasterIddestinationResult] = await connection.query(
        getLastMasterIddestinationQuery
      );
      const lastMasterIddestination =
        lastMasterIddestinationResult[0]?.master_id || 0;

      const getLastMasterIdsourceQuery =
        "SELECT master_id FROM iron_rec_source ORDER BY master_id DESC LIMIT 1";
      const [lastMasterIdsourceResult] = await connection.query(
        getLastMasterIdsourceQuery
      );
      const lastMasterIdsource = lastMasterIdsourceResult[0]?.master_id || 0;


      const getLastalterIdheaderQuery =
        "SELECT alter_id FROM iron_rec_header ORDER BY master_id DESC LIMIT 1";
      const [lastalterIdheaderResult] = await connection.query(
        getLastalterIdheaderQuery
      );
      const lastalterIdheader = lastalterIdheaderResult[0]?.alter_id || 0;


      const getLastalterIdDestinationQuery =
        "SELECT alter_id FROM iron_rec_destination ORDER BY master_id DESC LIMIT 1";
      const [lastalterIdDestinationResult] = await connection.query(
        getLastalterIdDestinationQuery
      );
      const lastalterIdDestination =
        lastalterIdDestinationResult[0]?.alter_id || 0;

      const getLastalterIdSourceQuery =
        "SELECT alter_id FROM iron_rec_source ORDER BY master_id DESC LIMIT 1";
      const [lastalterIdSourceResult] = await connection.query(
        getLastalterIdSourceQuery
      );
      const lastalterIdSource = lastalterIdSourceResult[0]?.alter_id || 0;

      // Insert header data
      const insertHeaderQuery =
        "INSERT INTO iron_rec_header (master_id, alter_id, vch_no, vch_date, jobber_id, jobber_name, design_no,design_id, unit_no, narration, is_designNo_recived,estimate_cs_vch_no) VALUES (?,?,?, ?,?, ?, ?, ?, ?, ?, ?, ?)";
     
      await connection.query(insertHeaderQuery, [
        lastMasterIdheader + 1 || 0,
        lastalterIdheader + 1 || 0,
        embRecNoText || "NA",
        ironingRecContextUnitData.originalDate || "NA",
        ironingRecContextUnitData.jobberAddress.jobber_id || 'NA',
        ironingRecContextUnitData.embRecUnitData[0].jobberName || 'NA',
        ironingRecContextUnitData.embRecUnitData[0].designNo || 'NA',
        ironingRecContextUnitData.designIdVal || 'NA',
        unitNO || 'NA',
        ironingRecContextUnitData.embRecUnitData[0].narration || 'NA',
        ironingRecContextUnitData.embRecUnitData[0].jobWorkStatus || 'NA',
        ironingRecContextUnitData.esVchNoVal || 'NA'
      ]);

      
      // Insert destination data
      const insertDestinationQuery =
        "INSERT INTO iron_rec_source(master_id, alter_id, vch_no, vch_date, item_name, design_no,design_id, godown, size,lot_no,quantity,rate, amt) VALUES (?,?,?, ?,?, ?, ?, ?, ?, ?,?,?,?)";
      if (
        ironingRecContextUnitData.destinationTableData &&
        ironingRecContextUnitData.destinationTableData.length
      ) {
        for (let i = 0; i < ironingRecContextUnitData.destinationTableData.length; i++) {
          await connection.query(insertDestinationQuery, [
            // lastMasterIddestination + 1 + i || 0,
            lastMasterIdheader + 1 || 0,
            lastalterIdDestination + 1 + i || 0,
            embRecNoText || 'NA',
            ironingRecContextUnitData.originalDate,
            ironingRecContextUnitData.destinationTableData[i].itemName || 'NA',
            ironingRecContextUnitData.destinationTableData[i].itemName || 'NA',
            ironingRecContextUnitData.destinationTableData[i].designId || 'NA',
            ironingRecContextUnitData.destinationTableData[i].godown || 'NA',
            ironingRecContextUnitData.destinationTableData[i].size || 'NA',
            ironingRecContextUnitData.destinationTableData[i].lotNo || 'NA',
            ironingRecContextUnitData.destinationTableData[i].qty || 0,
            ironingRecContextUnitData.destinationTableData[i].rate || 0,
            ironingRecContextUnitData.destinationTableData[i].rate * ironingRecContextUnitData.destinationTableData[i].qty || 0,

          ]);
        }
      } else {
        console.error("Data is undefined or has an invalid length");
      }

      // Insert source data
      const insertSourceQuery =
        "INSERT INTO iron_rec_destination  (master_id, alter_id, vch_no, vch_date, item_name, design_no,design_id, godown,type, size,lot_no,quantity,rate, amt,jw_rate, jw_amt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        if (
          ironingRecContextUnitData.sourceTableData &&
          ironingRecContextUnitData.sourceTableData.length
        ) {
          for (let i = 0; i < ironingRecContextUnitData.sourceTableData.length; i++) {
            await connection.query(insertSourceQuery, [
              // lastMasterIdsource + 1 + i || 0,
              lastMasterIdheader + 1 || 0,
              lastalterIdSource + 1 + i || 0,
              embRecNoText || 'NA',
              ironingRecContextUnitData.originalDate,
              ironingRecContextUnitData.sourceTableData[i].itemName || 'NA',
              ironingRecContextUnitData.sourceTableData[i].itemName || 'NA',
              ironingRecContextUnitData.sourceTableData[i].designId || 'NA',
              ironingRecContextUnitData.sourceTableData[i].godown || 'NA',
              ironingRecContextUnitData.sourceTableData[i].type || 'NA',
              ironingRecContextUnitData.sourceTableData[i].size || 'NA',
              ironingRecContextUnitData.sourceTableData[i].lotNo || 'NA',
              ironingRecContextUnitData.sourceTableData[i].qty || 0,
              ironingRecContextUnitData.sourceTableData[i].rate + ironingRecContextUnitData.sourceTableData[i].jwRate || 0,
              (ironingRecContextUnitData.sourceTableData[i].rate + ironingRecContextUnitData.sourceTableData[i].jwRate) * ironingRecContextUnitData.sourceTableData[i].qty || 0,
              ironingRecContextUnitData.sourceTableData[i].jwRate || 0,
              ironingRecContextUnitData.sourceTableData[i].jwRate * ironingRecContextUnitData.sourceTableData[i].qty || 0

  
            ]);
          }
        } else {
          console.error("Data is undefined or has an invalid length");
        }

        const insertLog_tb =
        "INSERT INTO log_tb (issue_date_time, item_name, design_no, design_id, process_name, type, user_id, user_name) VALUES (?,?,?,?,?,?,?,?)";
      if (
        ironingRecContextUnitData.sourceTableData &&
        ironingRecContextUnitData.sourceTableData.length
      ) {
        for (let i = 0; i < ironingRecContextUnitData.sourceTableData.length; i++) {
          await connection.query(insertLog_tb, [
            
            ironingRecContextUnitData.originalDate,
            ironingRecContextUnitData.sourceTableData[i].itemName || 'NA',
            ironingRecContextUnitData.sourceTableData[i].itemName || 'NA',
            ironingRecContextUnitData.sourceTableData[i].designId || 'NA',
            "IRON REC",
            ironingRecContextUnitData.sourceTableData[i].type || 'NA',
            authKeyValue.user_id || 'NA',
            authKeyValue.username || 'NA',
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
