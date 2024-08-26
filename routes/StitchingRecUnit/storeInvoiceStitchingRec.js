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
    const { stitchingRecContextUnitData, authKeyValue } = req.body;
    let embRecNoText = `SR/U${stitchingRecContextUnitData.embRecUnitData[0].embRecUnitVal}/${stitchingRecContextUnitData.lastEmbRecNo}/${stitchingRecContextUnitData.financialYear}`;
    let unitNO = `STITCHING REC -${stitchingRecContextUnitData.embRecUnitData[0].embRecUnitVal}`
    
    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      //Fetch the last master_id value
      const getLastMasterIdheaderQuery =
        "SELECT master_id FROM stitching_rec_header ORDER BY master_id DESC LIMIT 1";
      const [lastMasterIdheaderResult] = await connection.query(
        getLastMasterIdheaderQuery
      );
      const lastMasterIdheader = lastMasterIdheaderResult[0]?.master_id || 0;

      

      const getLastMasterIddestinationQuery =
        "SELECT master_id FROM stitching_rec_destination ORDER BY master_id DESC LIMIT 1";
      const [lastMasterIddestinationResult] = await connection.query(
        getLastMasterIddestinationQuery
      );
      const lastMasterIddestination =
        lastMasterIddestinationResult[0]?.master_id || 0;

      const getLastMasterIdsourceQuery =
        "SELECT master_id FROM stitching_rec_source ORDER BY master_id DESC LIMIT 1";
      const [lastMasterIdsourceResult] = await connection.query(
        getLastMasterIdsourceQuery
      );
      const lastMasterIdsource = lastMasterIdsourceResult[0]?.master_id || 0;


      const getLastalterIdheaderQuery =
        "SELECT alter_id FROM stitching_rec_header ORDER BY master_id DESC LIMIT 1";
      const [lastalterIdheaderResult] = await connection.query(
        getLastalterIdheaderQuery
      );
      const lastalterIdheader = lastalterIdheaderResult[0]?.alter_id || 0;


      const getLastalterIdDestinationQuery =
        "SELECT alter_id FROM stitching_rec_destination ORDER BY master_id DESC LIMIT 1";
      const [lastalterIdDestinationResult] = await connection.query(
        getLastalterIdDestinationQuery
      );
      const lastalterIdDestination =
        lastalterIdDestinationResult[0]?.alter_id || 0;

      const getLastalterIdSourceQuery =
        "SELECT alter_id FROM stitching_rec_source ORDER BY master_id DESC LIMIT 1";
      const [lastalterIdSourceResult] = await connection.query(
        getLastalterIdSourceQuery
      );
      const lastalterIdSource = lastalterIdSourceResult[0]?.alter_id || 0;

      // Insert header data
      const insertHeaderQuery =
        "INSERT INTO stitching_rec_header (master_id, alter_id, vch_no, vch_date, jobber_id, jobber_name, design_no,design_id, unit_no, narration, is_designNo_recived,estimate_cs_vch_no) VALUES (?,?,?, ?,?, ?, ?, ?, ?, ?, ?, ?)";
     
      await connection.query(insertHeaderQuery, [
        lastMasterIdheader + 1 || 0,
        lastalterIdheader + 1 || 0,
        embRecNoText || "NA",
        stitchingRecContextUnitData.originalDate || "NA",
        stitchingRecContextUnitData.jobberAddress.jobber_id || 'NA',
        stitchingRecContextUnitData.embRecUnitData[0].jobberName || 'NA',
        (Array.isArray(stitchingRecContextUnitData.designNoVal) ? stitchingRecContextUnitData.designNoVal.join(',') : 'NA'),
       
        (Array.isArray(stitchingRecContextUnitData.designIdVal) ? stitchingRecContextUnitData.designIdVal.join(',') : 'NA'),
        unitNO || 'NA',
        stitchingRecContextUnitData.embRecUnitData[0].narration || 'NA',
        stitchingRecContextUnitData.embRecUnitData[0].jobWorkStatus || 'NA',
        stitchingRecContextUnitData.esVchNoVal || 'NA'
      ]);

      
      // Insert destination data
      const insertDestinationQuery =
        "INSERT INTO stitching_rec_source(master_id, alter_id, vch_no, vch_date, item_name, design_no, design_id, godown, size,lot_no,quantity,rate, amt) VALUES (?,?, ?,?, ?, ?,?, ?, ?, ?,?,?,?)";
      if (
        stitchingRecContextUnitData.destinationTableData &&
        stitchingRecContextUnitData.destinationTableData.length
      ) {
        for (let i = 0; i < stitchingRecContextUnitData.destinationTableData.length; i++) {
          await connection.query(insertDestinationQuery, [
            // lastMasterIddestination + 1 + i || 0,
            lastMasterIdheader + 1 || 0,
            lastalterIdDestination + 1 + i || 0,
            embRecNoText || 'NA',
            stitchingRecContextUnitData.originalDate,
            stitchingRecContextUnitData.destinationTableData[i].itemName || 'NA',
            stitchingRecContextUnitData.destinationTableData[i].designNo || 'NA',
            stitchingRecContextUnitData.destinationTableData[i].designId || 'NA',
            stitchingRecContextUnitData.destinationTableData[i].godown || 'NA',
            stitchingRecContextUnitData.destinationTableData[i].size || 'NA',
            stitchingRecContextUnitData.destinationTableData[i].lotNo || 'NA',
            stitchingRecContextUnitData.destinationTableData[i].qty || 0,
            stitchingRecContextUnitData.destinationTableData[i].rate || 0,
            stitchingRecContextUnitData.destinationTableData[i].rate * stitchingRecContextUnitData.destinationTableData[i].qty || 0,

          ]);
        }
      } else {
        console.error("Data is undefined or has an invalid length");
      }

      // Insert source data
      const insertSourceQuery =
        "INSERT INTO stitching_rec_destination  (master_id, alter_id, vch_no, vch_date, item_name, design_no, design_id, godown,type, size,lot_no,quantity,rate, amt,jw_rate, jw_amt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        if (
          stitchingRecContextUnitData.sourceTableData &&
          stitchingRecContextUnitData.sourceTableData.length
        ) {
          for (let i = 0; i < stitchingRecContextUnitData.sourceTableData.length; i++) {
            await connection.query(insertSourceQuery, [
              // lastMasterIdsource + 1 + i || 0,
              lastMasterIdheader + 1 || 0,
              lastalterIdSource + 1 + i || 0,
              embRecNoText || 'NA',
              stitchingRecContextUnitData.originalDate,
              stitchingRecContextUnitData.sourceTableData[i].itemName || 'NA',
              stitchingRecContextUnitData.sourceTableData[i].designNo || 'NA',
              stitchingRecContextUnitData.sourceTableData[i].designId || 'NA',
              stitchingRecContextUnitData.sourceTableData[i].godown || 'NA',
              stitchingRecContextUnitData.sourceTableData[i].type || 'NA',
              stitchingRecContextUnitData.sourceTableData[i].size || 'NA',
              stitchingRecContextUnitData.sourceTableData[i].lotNo || 'NA',
              stitchingRecContextUnitData.sourceTableData[i].qty || 0,
              stitchingRecContextUnitData.sourceTableData[i].rate +  stitchingRecContextUnitData.sourceTableData[i].jwRate || 0,
              (stitchingRecContextUnitData.sourceTableData[i].rate +  stitchingRecContextUnitData.sourceTableData[i].jwRate) * stitchingRecContextUnitData.sourceTableData[i].qty || 0,
              stitchingRecContextUnitData.sourceTableData[i].jwRate || 0,
              stitchingRecContextUnitData.sourceTableData[i].jwRate * stitchingRecContextUnitData.sourceTableData[i].qty || 0

  
            ]);
          }
        } else {
          console.error("Data is undefined or has an invalid length");
        }

        const insertLog_tb =
        "INSERT INTO log_tb (issue_date_time, item_name, design_no, design_id, process_name, type, user_id, user_name) VALUES (?,?,?,?,?,?,?,?)";
      if (
        stitchingRecContextUnitData.sourceTableData &&
        stitchingRecContextUnitData.sourceTableData.length
      ) {
        for (let i = 0; i < stitchingRecContextUnitData.sourceTableData.length; i++) {
          await connection.query(insertLog_tb, [
            
            stitchingRecContextUnitData.originalDate,
            stitchingRecContextUnitData.sourceTableData[i].itemName || 'NA',
            stitchingRecContextUnitData.sourceTableData[i].designNo || 'NA',
            stitchingRecContextUnitData.sourceTableData[i].designId || 'NA',
            "STICH REC",
            stitchingRecContextUnitData.sourceTableData[i].type || 'NA',
            authKeyValue.user_id || 'NA',
            authKeyValue.username || 'NA',
          ]);
        }
      } else {
        console.error("Data is undefined or has an invalid length");
      }

        const updateSplitngHeaderQuery = `
        UPDATE stitching_iss_source 
        SET is_rec = 1
        WHERE design_no = ? AND type = ?
        `;


      if (stitchingRecContextUnitData.sourceTableData && stitchingRecContextUnitData.sourceTableData.length) {
        for (let i = 0; i < stitchingRecContextUnitData.sourceTableData.length; i++) {
          const { designNo, type } = stitchingRecContextUnitData.sourceTableData[i];

          console.log('Processing designNo:', designNo, 'type:', type);

          for (let j = 0; j < stitchingRecContextUnitData.sourceTableData.length; j++) {

            const designNoVal = stitchingRecContextUnitData.sourceTableData[j].designNo;

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
